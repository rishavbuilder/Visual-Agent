const http = require('http');
const chalk = require('chalk');
const net = require('net');

const COMMON_PORTS = [3000, 3001, 5173, 5174, 8080, 8000, 4200, 3002, 3003, 4000, 5000, 8888];

async function findRunningLocalhost(preferredPort) {
  console.log(chalk.gray('  Scanning for running localhost servers...'));

  const portsToScan = preferredPort
    ? [preferredPort, ...COMMON_PORTS.filter(p => p !== preferredPort)]
    : COMMON_PORTS;

  for (const port of portsToScan) {
    const isRunning = await checkPort(port);
    if (isRunning) {
      console.log(chalk.green(`  ✓ Found server on port ${port}`));
      return port;
    }
  }

  console.log(chalk.yellow('  ⚠ No running localhost detected'));
  return null;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, '127.0.0.1');
  });
}

function proxyRequest(req, res, targetPort, onFileServed) {
  let headersSent = false;

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${targetPort}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || '';

    if (contentType.includes('text/html')) {
      let body = [];
      proxyRes.on('data', (chunk) => body.push(chunk));
      proxyRes.on('end', () => {
        if (headersSent) return;
        headersSent = true;

        let html = Buffer.concat(body).toString();
        html = injectOverlay(html, parseInt(process.env.VA_PORT || '3001'));

        if (onFileServed && req.url === '/') {
          const filePath = guessFilePath(targetPort);
          if (filePath) onFileServed(filePath, targetPort);
        }

        try {
          const newHeaders = { ...proxyRes.headers };
          delete newHeaders['content-length'];
          res.writeHead(proxyRes.statusCode, newHeaders);
          res.end(html);
        } catch (e) { /* already sent */ }
      });
    } else {
      if (headersSent) return;
      headersSent = true;
      try {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      } catch (e) { /* already sent */ }
    }
  });

  proxyReq.on('error', (err) => {
    console.error(chalk.red(`  Proxy error: ${err.message}`));
    if (!headersSent) {
      try {
        res.writeHead(502);
        res.end('Bad Gateway');
      } catch (e) { /* headers already sent */ }
    }
    headersSent = true;
  });

  req.pipe(proxyReq);
}

function injectOverlay(html, agentPort) {
  const script = `<script>(function(){var p=${agentPort};var s=document.createElement('script');s.src='http://localhost:'+p+'/__visual-agent/index.js';s.onload=function(){window.__VISUAL_AGENT_INIT__({port:p})};document.head.appendChild(s);var l=document.createElement('link');l.rel='stylesheet';l.href='http://localhost:'+p+'/__visual-agent/styles.css';document.head.appendChild(l)})();</script>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>');
  }
  if (html.includes('</html>')) {
    return html.replace('</html>', script + '</html>');
  }
  return html + script;
}

function guessFilePath(targetPort) {
  const fs = require('fs');
  const path = require('path');
  const commonPaths = [
    'index.html',
    'public/index.html',
    'src/index.html',
    'dist/index.html',
    'build/index.html',
    'app/index.html',
    'pages/index.html',
    'static/index.html'
  ];
  
  for (const p of commonPaths) {
    const fullPath = path.resolve(p);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

module.exports = { findRunningLocalhost, checkPort, proxyRequest, injectOverlay, guessFilePath };
