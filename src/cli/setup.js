const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function setup() {
  console.log(chalk.cyan('\n🔧 Visual Agent - AI Agent Setup\n'));

  const configs = [
    {
      name: 'Claude Code',
      file: '~/.claude/settings.json',
      config: {
        mcpServers: {
          "visual-agent": {
            command: "visual-agent",
            args: ["mcp"]
          }
        }
      }
    },
    {
      name: 'Cursor',
      file: '.cursor/mcp.json',
      config: {
        mcpServers: {
          "visual-agent": {
            command: "visual-agent",
            args: ["mcp"]
          }
        }
      }
    },
    {
      name: 'Codex CLI',
      file: '~/.codex/config.toml',
      toml: `[mcpServers]
visual-agent = { command = "visual-agent", args = ["mcp"] }`
    },
    {
      name: 'Gemini CLI',
      file: '~/.gemini/settings.json',
      config: {
        mcpServers: {
          "visual-agent": {
            command: "visual-agent",
            args: ["mcp"]
          }
        }
      }
    }
  ];

  configs.forEach(config => {
    console.log(chalk.bold(`  ${config.name}:`));
    console.log(chalk.gray(`  Add to ${config.file}:\n`));

    if (config.toml) {
      console.log(chalk.white(`  ${config.toml}\n`));
    } else {
      console.log(chalk.white(`  ${JSON.stringify(config.config, null, 2).split('\n').join('\n  ')}\n`));
    }
  });

  console.log(chalk.cyan('  Or run: visual-agent setup --install'));
  console.log(chalk.gray('  (Auto-detects your agent and writes config)\n'));
}

module.exports = setup;
