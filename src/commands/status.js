const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function statusCommand() {
  const pendingDir = path.join(process.cwd(), '.visual-agent', 'pending');
  const appliedDir = path.join(process.cwd(), '.visual-agent', 'applied');
  
  if (!fs.existsSync(pendingDir)) {
    console.log(chalk.yellow('\nNo .visual-agent folder found.\n'));
    return;
  }
  
  const pendingFiles = fs.readdirSync(pendingDir).filter(f => f.endsWith('.json'));
  
  console.log(chalk.cyan('\n=== Visual Agent Status ===\n'));
  console.log(chalk.white(`  Pending changes: ${pendingFiles.length}`));
  
  if (pendingFiles.length > 0) {
    console.log(chalk.gray('\n  Pending changes:'));
    
    for (const file of pendingFiles) {
      try {
        const filePath = path.join(pendingDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const change = JSON.parse(content);
        
        const time = change.timestamp ? new Date(change.timestamp).toLocaleTimeString() : 'Unknown';
        console.log(chalk.white(`    • ${change.description || change.property || 'Edit'} (${time})`));
      } catch (e) {
        console.error(chalk.red(`    • Error reading ${file}`));
      }
    }
    
    console.log(chalk.gray('\n  Run /view-apply to apply changes'));
    console.log(chalk.gray('  Run /view-discard to discard changes'));
  }
  
  if (fs.existsSync(appliedDir)) {
    const appliedFiles = fs.readdirSync(appliedDir).filter(f => f.endsWith('.json'));
    console.log(chalk.white(`\n  Applied history: ${appliedFiles.length} entries`));
  }
  
  console.log('');
}

module.exports = { statusCommand };
