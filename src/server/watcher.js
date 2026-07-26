const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');

function startWatcher(projectPath, io, bridge) {
  const watchPatterns = [
    'src/**/*.{js,jsx,ts,tsx,vue,svelte}',
    'app/**/*.{js,jsx,ts,tsx,vue,svelte}',
    'pages/**/*.{js,jsx,ts,tsx,vue,svelte}',
    'components/**/*.{js,jsx,ts,tsx,vue,svelte}',
    '**/*.{html,css,scss,less}',
    '!node_modules/**',
    '!.next/**',
    '!.nuxt/**',
    '!.output/**',
    '!.svelte-kit/**'
  ];

  const watcher = chokidar.watch(watchPatterns, {
    cwd: projectPath,
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });

  const pendingChanges = new Map();

  watcher.on('change', (filePath) => {
    const fullPath = path.join(projectPath, filePath);

    if (isSourceFile(filePath)) {
      pendingChanges.set(filePath, {
        path: fullPath,
        relativePath: filePath,
        timestamp: Date.now()
      });

      processPendingChanges(io, bridge, pendingChanges);
    }
  });

  watcher.on('add', (filePath) => {
    if (isSourceFile(filePath)) {
      console.log(chalk.gray(`  File added: ${filePath}`));
    }
  });

  watcher.on('unlink', (filePath) => {
    if (isSourceFile(filePath)) {
      console.log(chalk.gray(`  File removed: ${filePath}`));
    }
  });

  console.log(chalk.gray('  File watcher started'));

  return watcher;
}

function processPendingChanges(io, bridge, pendingChanges) {
  if (pendingChanges.size === 0) return;

  const changes = Array.from(pendingChanges.values());
  pendingChanges.clear();

  setTimeout(() => {
    if (io) {
      io.broadcast({
        type: 'source_changed',
        files: changes.map(c => c.relativePath),
        timestamp: Date.now()
      });
    }

    if (bridge) {
      bridge.onFilesChanged(changes);
    }
  }, 100);
}

function isSourceFile(filePath) {
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.html', '.css', '.scss', '.less'];
  return extensions.some(ext => filePath.endsWith(ext));
}

module.exports = { startWatcher };
