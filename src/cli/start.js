const chalk = require('chalk');
const { startServer } = require('../server');

async function start(options) {
  console.log(chalk.cyan('\n🚀 Visual Agent - Starting...\n'));

  try {
    await startServer({
      port: parseInt(options.port) || 3001,
      target: options.target
    });
  } catch (error) {
    console.error(chalk.red('\n✖ Failed to start Visual Agent:'));
    console.error(chalk.red(`  ${error.message}\n`));
    process.exit(1);
  }
}

module.exports = start;
