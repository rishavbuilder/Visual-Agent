# Visual Agent

Local-first visual editing system for AI coding agents.

## What is this?

Visual Agent lets you visually edit a running website in the browser. Changes are saved as JSON files. Your AI agent reads those files and updates the source code when you run `/view-apply`.

**Browser me edit karo → AI agent code update kare**

## How it works

1. Developer starts dev server (`npm run dev`)
2. Developer starts Visual Agent (`visual-agent start`)
3. Visual Agent proxies the dev server and injects overlay
4. Developer edits website visually in browser
5. Changes saved to `.visual-agent/pending/*.json`
6. Developer tells AI agent: `/view-apply`
7. AI agent reads files and updates source code

## Installation

### Option 1: Git Clone + npm link (Recommended)

```bash
# Clone the repo
git clone https://github.com/username/visual-agent.git

# Go to folder
cd visual-agent

# Install dependencies
npm install

# Link globally (makes 'visual-agent' command available)
npm link
```

### Option 2: Download ZIP

```bash
# Download ZIP from GitHub and extract

# Go to folder
cd visual-agent

# Install dependencies
npm install

# Link globally
npm link
```

### Option 3: npx (No install)

```bash
npx visual-agent start --target 3000
```

## Quick Start

```bash
# 1. Go to your project
cd my-website

# 2. Initialize Visual Agent
visual-agent init

# 3. Start your dev server
npm run dev

# 4. Start Visual Agent (in new terminal)
visual-agent start --target 3000

# 5. Open browser: http://localhost:3001
```

## Commands

### CLI Commands

| Command | Description |
|---------|-------------|
| `visual-agent init` | Initialize in current project |
| `visual-agent start --target <port>` | Start proxy server |
| `visual-agent apply` | Apply pending changes |
| `visual-agent status` | Show pending changes |
| `visual-agent discard` | Discard pending changes |
| `visual-agent history` | Show applied history |

### AI Agent Commands (Autocomplete)

When you type `/` in your AI agent, these commands appear:

| Command | Description |
|---------|-------------|
| `/view-start` | Start Visual Agent |
| `/view-apply` | Apply pending changes to code |
| `/view-status` | Show pending changes |
| `/view-discard` | Discard pending changes |
| `/view-history` | Show history |

## How AI Agent Knows About Commands

When you run `visual-agent init`, it creates:

```
your-project/
├── .opencode/commands/
│   ├── view-start.md
│   ├── view-apply.md
│   ├── view-status.md
│   ├── view-discard.md
│   └── view-history.md
├── .claude/skills/
│   ├── view-apply/SKILL.md
│   ├── view-status/SKILL.md
│   ├── view-discard/SKILL.md
│   └── view-history/SKILL.md
└── visual-agent.config.json
```

These files tell your AI agent what each command does.

## Folder Structure

```
your-project/
├── .visual-agent/
│   ├── pending/           # Changes waiting to be applied
│   │   ├── abc123.json
│   │   └── def456.json
│   └── applied/           # History of applied changes
│       └── abc123.json
├── index.html
└── styles.css
```

## Change File Format

```json
{
  "id": "abc123",
  "timestamp": "2026-07-26T10:30:00Z",
  "type": "style",
  "selector": "h1",
  "property": "color",
  "oldValue": "#000000",
  "newValue": "#e94560",
  "file": "index.html",
  "description": "Change color on h1"
}
```

## Features

### Auto-Injection
No manual HTML editing. Overlay is automatically injected into HTML.

### Multi-Select
Hold `Shift` + Click to select multiple elements.

### Approval Mode
Review changes before applying. Click "Apply to Code" to approve.

### File-Based Storage
Changes saved as JSON files. Easy to inspect, edit, or delete.

### Works With All AI Agents
No MCP required. Works with Claude Code, Cursor, Codex, Gemini, OpenCode, and any AI agent that can read files.

## Example Workflow

```bash
# Terminal 1: Your dev server
npm run dev

# Terminal 2: Visual Agent
visual-agent start --target 3000

# Browser: http://localhost:3001
# - Click on h1
# - Change color to red
# - Click "Apply to Code"

# AI Agent: /view-apply
# Agent reads .visual-agent/pending/*.json
# Agent updates index.html
# Agent deletes the JSON files

# Browser: Refresh - changes persist!
```

## License

MIT
