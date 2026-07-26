const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function discardCommand() {
  const pendingDir = path.join(process.cwd(), '.visual-agent', 'pending');
  
  if (!fs.existsSync(pendingDir)) {
    console.log(chalk.yellow('\nNo pending changes found.\n'));
    return;
  }
  
  const files = fs.readdirSync(pendingDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log(chalk.yellow('\nNo pending changes found.\n'));
    return;
  }
  
  console.log(chalk.cyan(`\nFound ${files.length} pending change(s):\n`));
  
  for (const file of files) {
    try {
      const filePath = path.join(pendingDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const change = JSON.parse(content);
      
      console.log(chalk.white(`  • ${change.description || change.property || 'Edit'}`));
    } catch (e) {
      console.error(chalk.red(`  • Error reading ${file}`));
    }
  }
  
  console.log(chalk.cyan('\nDiscard all changes? (y/n): '));
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (data) => {
    const input = data.toString().trim().toLowerCase();
    process.stdin.setRawMode(false);
    process.stdin.pause();
    
    if (input === 'y' || input === 'yes') {
      for (const file of files) {
        fs.unlinkSync(path.join(pendingDir, file));
      }
      console.log(chalk.green(`\n✓ ${files.length} change(s) discarded.\n`));
    } else {
      console.log(chalk.yellow('\nDiscard cancelled.\n'));
    }
  });
}

module.exports = { discardCommand };
