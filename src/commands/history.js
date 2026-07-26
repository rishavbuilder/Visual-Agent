const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function historyCommand() {
  const appliedDir = path.join(process.cwd(), '.visual-agent', 'applied');
  
  if (!fs.existsSync(appliedDir)) {
    console.log(chalk.yellow('\nNo history found.\n'));
    return;
  }
  
  const files = fs.readdirSync(appliedDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log(chalk.yellow('\nNo history found.\n'));
    return;
  }
  
  console.log(chalk.cyan(`\n=== Applied Changes History (${files.length} entries) ===\n`));
  
  const sortedFiles = files.sort().reverse().slice(0, 20);
  
  for (const file of sortedFiles) {
    try {
      const filePath = path.join(appliedDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const change = JSON.parse(content);
      
      const time = change.timestamp ? new Date(change.timestamp).toLocaleString() : 'Unknown';
      console.log(chalk.white(`  • ${change.description || change.property || 'Edit'}`));
      console.log(chalk.gray(`    Time: ${time}`));
      if (change.selector) {
        console.log(chalk.gray(`    Selector: ${change.selector}`));
      }
      console.log('');
    } catch (e) {
      console.error(chalk.red(`  • Error reading ${file}`));
    }
  }
  
  if (files.length > 20) {
    console.log(chalk.gray(`  ... and ${files.length - 20} more entries`));
  }
  
  console.log('');
}

module.exports = { historyCommand };
