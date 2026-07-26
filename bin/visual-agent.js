#!/usr/bin/env node

const { Command } = require('commander');
const pkg = require('../package.json');

const program = new Command();

program
  .name('visual-agent')
  .description('Local-first visual editing system for AI coding agents')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize Visual Agent in current project')
  .action(() => {
    require('../src/cli/init')();
  });

program
  .command('start')
  .description('Start the Visual Agent server')
  .option('-p, --port <port>', 'Server port', '3001')
  .action((options) => {
    require('../src/cli/start')(options);
  });

program
  .command('apply')
  .description('Apply all pending visual changes to source code')
  .action(() => {
    require('../src/commands/apply')();
  });

program
  .command('status')
  .description('Show pending visual changes')
  .action(() => {
    require('../src/commands/status')();
  });

program
  .command('discard')
  .description('Discard all pending visual changes')
  .action(() => {
    require('../src/commands/discard')();
  });

program
  .command('history')
  .description('Show applied changes history')
  .action(() => {
    require('../src/commands/history')();
  });

program.parse();
