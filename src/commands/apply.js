const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function applyCommand() {
  const pendingDir = path.join(process.cwd(), '.visual-agent', 'pending');
  
  if (!fs.existsSync(pendingDir)) {
    console.log(chalk.yellow('No pending changes found.'));
    return;
  }
  
  const files = fs.readdirSync(pendingDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log(chalk.yellow('No pending changes found.'));
    return;
  }
  
  console.log(chalk.cyan(`\nFound ${files.length} pending change(s):\n`));
  
  const changes = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(pendingDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const change = JSON.parse(content);
      changes.push({ ...change, filePath });
      
      console.log(chalk.white(`  • ${change.description || change.property || 'Edit'}`));
      console.log(chalk.gray(`    Selector: ${change.selector}`));
      if (change.property) {
        console.log(chalk.gray(`    Property: ${change.property} = ${change.newValue}`));
      }
      if (change.file) {
        console.log(chalk.gray(`    File: ${change.file}`));
      }
      console.log('');
    } catch (e) {
      console.error(chalk.red(`  Error reading ${file}: ${e.message}`));
    }
  }
  
  console.log(chalk.cyan('Apply these changes to source code? (y/n): '));
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (data) => {
    const input = data.toString().trim().toLowerCase();
    process.stdin.setRawMode(false);
    process.stdin.pause();
    
    if (input === 'y' || input === 'yes') {
      applyChanges(changes);
    } else {
      console.log(chalk.yellow('Changes cancelled.'));
    }
  });
}

function applyChanges(changes) {
  let appliedCount = 0;
  
  for (const change of changes) {
    try {
      if (change.file && fs.existsSync(change.file)) {
        let content = fs.readFileSync(change.file, 'utf8');
        
        if (change.property && change.newValue !== undefined) {
          const selector = change.selector || 'body';
          const property = change.property;
          const value = change.newValue;
          const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
          const newRule = `${selector} { ${cssProperty}: ${value} !important; }`;
          
          const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
          const styleMatch = content.match(styleRegex);
          
          if (styleMatch) {
            let cssContent = styleMatch[1];
            const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*\\}`, 'gi');
            
            if (selectorRegex.test(cssContent)) {
              cssContent = cssContent.replace(selectorRegex, (match) => {
                return match.replace(/\}(\s*)$/, ` ${cssProperty}: ${value} !important; }$1`);
              });
            } else {
              cssContent += `\n${newRule}`;
            }
            
            content = content.replace(styleRegex, `<style>${cssContent}</style>`);
          } else {
            const insertPoint = content.indexOf('</head>');
            if (insertPoint !== -1) {
              content = content.substring(0, insertPoint) + `<style>\n${newRule}\n</style>\n` + content.substring(insertPoint);
            }
          }
          
          fs.writeFileSync(change.file, content, 'utf8');
          fs.unlinkSync(change.filePath);
          appliedCount++;
          console.log(chalk.green(`  ✓ Applied: ${property} = ${value} on ${selector}`));
        }
      } else {
        console.log(chalk.yellow(`  ⚠ File not found: ${change.file}`));
      }
    } catch (e) {
      console.error(chalk.red(`  Error applying change: ${e.message}`));
    }
  }
  
  console.log(chalk.green(`\n✓ ${appliedCount} change(s) applied successfully!\n`));
}

module.exports = { applyCommand };
