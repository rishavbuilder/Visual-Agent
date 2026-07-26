const express = require('express');
const http = require('http');
const path = require('path');
const chalk = require('chalk');
const { detectFramework } = require('./frameworks/detector');
const { startWatcher } = require('./watcher');
const { setupWebSocket } = require('./websocket');
const { addPendingChange, getPendingChanges, clearPendingChanges, addToHistory, deletePendingChange } = require('./state');

let io = null;

async function startServer(options = {}) {
  const { port = 3001 } = options;

  process.env.VA_PORT = port;

  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  app.use('/__visual-agent', express.static(path.join(__dirname, '../overlay')));

  app.get('/__visual-agent/status', (req, res) => {
    res.json({ status: 'running', port });
  });

  app.get('/__visual-agent/pending', (req, res) => {
    res.json(getPendingChanges());
  });

  app.post('/__visual-agent/approve', (req, res) => {
    const { changeIds } = req.body;
    const allChanges = getPendingChanges();
    const changes = allChanges.filter(c => changeIds.includes(c.id));
    
    const applied = [];
    changes.forEach(change => {
      addToHistory(change);
      deletePendingChange(change.id);
      applied.push(change);
    });
    
    if (io) io.broadcast({ type: 'changes_approved', changes: applied });
    res.json({ success: true, applied: applied.length });
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

  server.listen(port, () => {
    console.log(chalk.green(`✓ Visual Agent running on http://localhost:${port}`));
    console.log(chalk.gray(`  WebSocket: ws://localhost:${port}`));
    console.log(chalk.gray(`  API: http://localhost:${port}/__visual-agent/*\n`));
    console.log(chalk.cyan('  Next steps:'));
    console.log(chalk.white('  1. Add to your layout.tsx:'));
    console.log(chalk.white('     import VisualAgentOverlay from "../components/VisualAgentOverlay";'));
    console.log(chalk.white('     <VisualAgentOverlay />'));
    console.log(chalk.white('  2. Add rewrites to next.config.ts:'));
    console.log(chalk.white('     { source: "/__visual-agent/:path*", destination: "http://localhost:3001/__visual-agent/:path*" }\n'));
  });

  return { server, io };
}

module.exports = { startServer };
