const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function status() {
  console.log(chalk.cyan('\n📊 Visual Agent Status\n'));

  const configPath = path.join(process.cwd(), 'visual-agent.config.json');

  if (fs.existsSync(configPath)) {
    console.log(chalk.green('  ✓ Configured'));
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(chalk.gray(`    Port: ${config.server.port}`));
    console.log(chalk.gray(`    Agent: ${config.ai.agent}`));
  } else {
    console.log(chalk.yellow('  ⚠ Not configured'));
    console.log(chalk.gray('    Run "visual-agent init" to set up'));
  }

  console.log('');
}

module.exports = status;
