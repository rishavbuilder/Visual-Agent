const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { findRunningLocalhost, proxyRequest } = require('./proxy');
const { detectFramework } = require('./frameworks/detector');
const { startWatcher } = require('./watcher');
const { setupWebSocket } = require('./websocket');
const { addPendingChange, getPendingChanges, clearPendingChanges, addToHistory, deletePendingChange } = require('./state');

let io = null;
let servedFiles = {};

function findHTMLFile(targetPort) {
  for (const [file, port] of Object.entries(servedFiles)) {
    if (port === targetPort) return file;
  }
  return null;
}

function trackServedFile(file, targetPort) {
  servedFiles[file] = targetPort;
}

function applyChangesToFiles(changes, targetPort) {
  const htmlFile = findHTMLFile(targetPort);
  if (!htmlFile || !fs.existsSync(htmlFile)) {
    console.log(chalk.yellow('  HTML file not found, changes not applied'));
    return changes.map(c => ({ ...c, file: 'unknown', applied: false }));
  }

  let html = fs.readFileSync(htmlFile, 'utf8');
  const applied = [];

  const cssStyleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let cssContent = '';
  let styleMatch;
  while ((styleMatch = cssStyleBlockRegex.exec(html)) !== null) {
    cssContent = styleMatch[1];
    break;
  }

  changes.forEach(change => {
    if (change.property && change.newValue !== undefined) {
      const selector = change.selector || 'body';
      const property = change.property;
      const value = change.newValue;

      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      const newRule = `${selector} { ${cssProperty}: ${value} !important; }`;

      if (cssContent) {
        const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'gi');
        if (selectorRegex.test(cssContent)) {
          cssContent = cssContent.replace(selectorRegex, (match) => {
            return match.replace(/\}(\s*)$/, ` ${cssProperty}: ${value} !important; }$1`);
          });
          html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/i, `<style>${cssContent}</style>`);
        } else {
          const insertPoint = html.indexOf('</style>');
          if (insertPoint !== -1) {
            html = html.substring(0, insertPoint) + `\n${newRule}\n` + html.substring(insertPoint);
          }
        }
      } else {
        const insertPoint = html.indexOf('</head>');
        if (insertPoint !== -1) {
          html = html.substring(0, insertPoint) + `<style>\n${newRule}\n</style>\n` + html.substring(insertPoint);
        }
      }

      applied.push({ ...change, file: htmlFile, applied: true });
      console.log(chalk.green(`  Applied: ${property} = ${value} on ${selector}`));
    }
  });

  if (applied.length > 0) {
    fs.writeFileSync(htmlFile, html, 'utf8');
    console.log(chalk.green(`  Updated ${htmlFile}`));
  }

  return applied;
}

async function startServer(options = {}) {
  const { port = 3001, target } = options;

  process.env.VA_PORT = port;

  const targetPort = target ? parseInt(target) : await findRunningLocalhost();

  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  app.use('/__visual-agent', express.static(path.join(__dirname, '../overlay')));

  app.get('/__visual-agent/status', (req, res) => {
    res.json({ status: 'running', targetPort });
  });

  app.get('/__visual-agent/pending', (req, res) => {
    res.json(getPendingChanges());
  });

  app.post('/__visual-agent/approve', (req, res) => {
    const { changeIds } = req.body;
    const allChanges = getPendingChanges();
    const changes = allChanges.filter(c => changeIds.includes(c.id));
    
    const applied = applyChangesToFiles(changes, targetPort);
    
    applied.forEach(change => {
      addToHistory(change);
      deletePendingChange(change.id);
    });
    
    if (io) io.broadcast({ type: 'changes_approved', changes: applied });
    res.json({ success: true, applied: applied.length, files: applied.map(c => c.file) });
  });

  app.post('/__visual-agent/reject', (req, res) => {
    clearPendingChanges();
    if (io) io.broadcast({ type: 'changes_rejected' });
    res.json({ success: true });
  });

  app.post('/__visual-agent/change', (req, res) => {
    const change = addPendingChange(req.body);
    res.json({ success: true, id: change.id });
  });

  io = setupWebSocket(server);

  const framework = await detectFramework(process.cwd());
  console.log(chalk.gray(`  Framework: ${framework.name}`));

  startWatcher(process.cwd(), io);

  if (targetPort) {
    app.use((req, res, next) => {
      proxyRequest(req, res, targetPort, trackServedFile);
    });

    server.listen(port, () => {
      console.log(chalk.green(`✓ Visual Agent running on http://localhost:${port}`));
      console.log(chalk.gray(`  Proxying: http://localhost:${targetPort} → http://localhost:${port}`));
      console.log(chalk.gray(`  Overlay: Auto-injected via proxy\n`));
    });
  } else {
    server.listen(port, () => {
      console.log(chalk.green(`✓ Visual Agent running on http://localhost:${port}`));
      console.log(chalk.yellow(`  No target detected. Add overlay manually:`));
      console.log(chalk.white(`  <script src="http://localhost:${port}/__visual-agent/inject.js"></script>\n`));
    });
  }

  return { server, io };
}

module.exports = { startServer };
