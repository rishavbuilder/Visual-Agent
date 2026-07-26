const { execSync } = require('child_process');
const chalk = require('chalk');

function detectRunningServers() {
  console.log(chalk.gray('  Detecting running dev servers...'));

  const servers = [];

  try {
    const output = execSync('ps aux 2>/dev/null || tasklist 2>/dev/null', { encoding: 'utf8' });

    const patterns = [
      { name: 'Vite', regex: /vite/i },
      { name: 'Next.js', regex: /next.*dev|next-server/i },
      { name: 'Webpack Dev Server', regex: /webpack.*serve/i },
      { name: 'Vue CLI', regex: /vue-cli-service.*serve/i },
      { name: 'Angular CLI', regex: /ng.*serve/i },
      { name: 'SvelteKit', regex: /svelte-kit|vite.*svelte/i },
      { name: 'React (CRA)', regex: /react-scripts.*start/i },
      { name: 'Node.js', regex: /node.*server|node.*app|node.*index/i },
      { name: 'Python (Flask/Django)', regex: /python.*app|python.*manage|flask|django/i }
    ];

    const lines = output.split('\n');

    for (const line of lines) {
      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          const portMatch = line.match(/:(\d{4,5})/);
          if (portMatch) {
            servers.push({
              name: pattern.name,
              port: parseInt(portMatch[1]),
              process: line.trim().substring(0, 80)
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(chalk.gray('  Process detection limited'));
  }

  if (servers.length > 0) {
    console.log(chalk.green(`  ✓ Found ${servers.length} running server(s):`));
    servers.forEach(s => {
      console.log(chalk.gray(`    - ${s.name} on port ${s.port}`));
    });
  }

  return servers;
}

function getRecommendedPort(existingPorts = []) {
  const preferred = [3001, 3002, 3003, 4000, 4001, 5001, 8081, 8889];

  for (const port of preferred) {
    if (!existingPorts.includes(port)) {
      return port;
    }
  }

  return 9000;
}

module.exports = { detectRunningServers, getRecommendedPort };
