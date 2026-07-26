const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function init() {
  console.log(chalk.cyan('\n🔍 Visual Agent - Initializing...\n'));

  const configPath = path.join(process.cwd(), 'visual-agent.config.json');

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('⚠ visual-agent.config.json already exists.'));
    console.log(chalk.gray('  Use "visual-agent start" to begin editing.\n'));
    return;
  }

  const config = {
    version: '2.0.0',
    server: {
      port: 3001
    },
    proxy: {
      autoDetect: true,
      targetPort: null
    },
    overlay: {
      enabled: true,
      position: 'bottom-right'
    },
    storage: {
      pendingDir: '.visual-agent/pending',
      appliedDir: '.visual-agent/applied'
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✓ Created visual-agent.config.json'));

  createOpenCodeCommands();
  createClaudeCodeSkills();
  createAgentsMd();

  console.log(chalk.gray('\n  Next steps:'));
  console.log(chalk.gray('  1. Start your dev server: npm run dev'));
  console.log(chalk.gray('  2. Start Visual Agent: visual-agent start --target 3000'));
  console.log(chalk.gray('  3. Open http://localhost:3001 in browser'));
  console.log(chalk.gray('  4. Use /view-apply in your AI agent to apply changes\n'));
}

function createOpenCodeCommands() {
  const commandsDir = path.join(process.cwd(), '.opencode', 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });

  const commands = {
    'view-start.md': `---
description: Start visual editing session with proxy server
---

Start the Visual Agent server by running this command in the terminal:

\`\`\`bash
visual-agent start --target 3000
\`\`\`

Replace 3000 with your dev server port. The visual overlay will be available at http://localhost:3001
`,
    'view-apply.md': `---
description: Apply all pending visual changes to source code
---

Read all JSON files in the \`.visual-agent/pending/\` folder. For each file:

1. Get the \`selector\`, \`property\`, and \`newValue\` from the JSON
2. Find the source file mentioned in the \`file\` field (usually \`index.html\`)
3. Update the CSS/styles in that file:
   - If a \`<style>\` block exists, add or update the CSS rule for the selector
   - If no \`<style>\` block exists, create one before \`</head>\`
4. Delete the JSON file after applying

After applying all changes, report how many changes were applied successfully.

Example change format:
\`\`\`json
{
  "id": "abc123",
  "selector": "h1",
  "property": "color",
  "newValue": "#e94560",
  "file": "index.html"
}
\`\`\`
`,
    'view-status.md': `---
description: Show pending visual changes count and details
---

Check the \`.visual-agent/pending/\` folder for any JSON files.

Report:
- How many pending changes exist
- For each change: the selector, property, newValue, and timestamp
- Suggest running /view-apply to apply changes or /view-discard to discard them

If no folder or files exist, report that there are no pending changes.
`,
    'view-discard.md': `---
description: Discard all pending visual changes
---

Delete all JSON files in the \`.visual-agent/pending/\` folder.

After deleting, report how many changes were discarded.

If no folder or files exist, report that there are no pending changes to discard.
`,
    'view-history.md': `---
description: Show applied changes history
---

Check the \`.visual-agent/applied/\` folder for any JSON files.

Report:
- How many applied changes exist in history
- For each change (most recent first): the description, selector, property, newValue, and timestamp
- Show at most 10 entries

If no folder or files exist, report that there is no history yet.
`
  };

  for (const [filename, content] of Object.entries(commands)) {
    fs.writeFileSync(path.join(commandsDir, filename), content);
  }

  console.log(chalk.green('✓ Created .opencode/commands/view-*.md'));
}

function createClaudeCodeSkills() {
  const skillsDir = path.join(process.cwd(), '.claude', 'skills');

  const skills = {
    'view-apply': `---
name: view-apply
description: Apply all pending visual changes to source code
user-invocable: true
argument-hint: ""
---

Read all JSON files in the \`.visual-agent/pending/\` folder. For each file:

1. Get the \`selector\`, \`property\`, and \`newValue\` from the JSON
2. Find the source file mentioned in the \`file\` field (usually \`index.html\`)
3. Update the CSS/styles in that file:
   - If a \`<style>\` block exists, add or update the CSS rule for the selector
   - If no \`<style>\` block exists, create one before \`</head>\`
4. Delete the JSON file after applying

After applying all changes, report how many changes were applied successfully.
`,
    'view-status': `---
name: view-status
description: Show pending visual changes count and details
user-invocable: true
argument-hint: ""
---

Check the \`.visual-agent/pending/\` folder for any JSON files.

Report:
- How many pending changes exist
- For each change: the selector, property, newValue, and timestamp
- Suggest running /view-apply to apply changes or /view-discard to discard them

If no folder or files exist, report that there are no pending changes.
`,
    'view-discard': `---
name: view-discard
description: Discard all pending visual changes
user-invocable: true
argument-hint: ""
---

Delete all JSON files in the \`.visual-agent/pending/\` folder.

After deleting, report how many changes were discarded.

If no folder or files exist, report that there are no pending changes to discard.
`,
    'view-history': `---
name: view-history
description: Show applied changes history
user-invocable: true
argument-hint: ""
---

Check the \`.visual-agent/applied/\` folder for any JSON files.

Report:
- How many applied changes exist in history
- For each change (most recent first): the description, selector, property, newValue, and timestamp
- Show at most 10 entries

If no folder or files exist, report that there is no history yet.
`
  };

  for (const [skillName, content] of Object.entries(skills)) {
    const skillDir = path.join(skillsDir, skillName);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
  }

  console.log(chalk.green('✓ Created .claude/skills/view-*/SKILL.md'));
}

function createAgentsMd() {
  const agentsPath = path.join(process.cwd(), 'AGENTS.md');
  
  if (fs.existsSync(agentsPath)) {
    console.log(chalk.yellow('⚠ AGENTS.md already exists, skipping.'));
    return;
  }

  const content = `# Visual Agent Commands

## /view-apply
When user runs /view-apply:
1. Read all JSON files in \`.visual-agent/pending/\` folder
2. For each file, get the selector, property, and newValue
3. Find the source file (usually index.html)
4. Update the CSS/styles in that file
5. Delete the JSON file after applying
6. Report how many changes were applied

## /view-status
Check \`.visual-agent/pending/\` folder and report:
- How many pending changes exist
- Details of each change

## /view-discard
Delete all files in \`.visual-agent/pending/\` folder

## /view-history
Check \`.visual-agent/applied/\` folder and show history
`;

  fs.writeFileSync(agentsPath, content);
  console.log(chalk.green('✓ Created AGENTS.md'));
}

module.exports = init;
