<div align="center">

# 🎨 Visual Agent

### Local-First Visual Editing System for AI Coding Agents

**Edit in browser → AI agent updates source code**

[![npm version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/rishavbuilder/Visual-Agent)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/rishavbuilder)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rishavbuilder)

---

**Visual Agent** is an intelligent middleware that enables developers to visually edit running websites directly in the browser while AI coding agents automatically update the source code.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **React Component** | Embedded as a React component - no proxy, no streaming issues |
| 🖱️ **Click-to-Edit** | Click any element to select and edit it |
| 📦 **Multi-Select** | Hold `Shift + Click` to select and edit multiple elements at once |
| ✅ **Approval Mode** | Review all changes before applying them to source code |
| 📁 **File-Based Storage** | Changes are saved as JSON files - easy to inspect, edit, or delete |
| 🤖 **Universal AI Support** | Works with Claude, Cursor, Codex, Gemini, OpenCode - any AI agent |
| 🔄 **Live Preview** | See changes instantly in the browser |
| 📜 **Edit History** | Track all edits with timestamps |
| ⚡ **Next.js Compatible** | Works with App Router, React Server Components, Streaming SSR |

---

## 🚀 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Visual Agent Flow                        │
└─────────────────────────────────────────────────────────────────┘

  Developer                    Browser                    AI Agent
      │                           │                           │
      │  1. npm run dev           │                           │
      ├──────────────────────────>│                           │
      │                           │                           │
      │  2. visual-agent start    │                           │
      ├──────────────────────────>│                           │
      │                           │                           │
      │  3. React mounts overlay  │                           │
      │<──────────────────────────┤                           │
      │                           │                           │
      │  4. Edit visually         │                           │
      │<──────────────────────────┤                           │
      │                           │                           │
      │  5. Click "Apply"         │                           │
      │──────────────────────────>│                           │
      │                           │  6. /view-apply           │
      │                           ├──────────────────────────>│
      │                           │                           │
      │  7. Code updated!         │  8. Read JSON files       │
      │<──────────────────────────│<──────────────────────────┤
      │                           │                           │
      │  9. Hot Reload            │  10. Update source code   │
      │──────────────────────────>│                           │
      │                           │                           │
```

---

## ⚡ Why v4.0.0? (No More Proxy!)

### The Problem with Proxy Approach

```
❌ Proxy buffers entire HTML response
❌ Breaks Next.js streaming SSR
❌ React hydration fails
❌ Loading screens freeze
❌ Content Encoding errors
```

### The Solution: React Component

```
✅ Embedded as React component
✅ Runs AFTER hydration
✅ Preserves streaming SSR
✅ Works with React Server Components
✅ No encoding issues
```

---

## 📦 Installation

### Option 1: Git Clone (Recommended)

```bash
# Clone the repository
git clone https://github.com/rishavbuilder/Visual-Agent.git

# Navigate to folder
cd Visual-Agent

# Install dependencies
npm install

# Link globally (makes 'visual-agent' command available)
npm link
```

### Option 2: npx (No Install Required)

```bash
npx visual-agent start
```

### Option 3: npm install -g

```bash
npm install -g visual-agent
```

---

## 🎯 Quick Start (Next.js)

### Step 1: Initialize Project

```bash
cd your-nextjs-project
visual-agent init
```

This creates:
- `visual-agent.config.json`
- `src/components/VisualAgentOverlay.tsx`
- `.opencode/commands/view-*.md` (for OpenCode)
- `.claude/skills/view-*/SKILL.md` (for Claude Code)
- `AGENTS.md` (AI agent instructions)

### Step 2: Add Component to Layout

```tsx
// src/app/layout.tsx
import VisualAgentOverlay from '../components/VisualAgentOverlay';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <VisualAgentOverlay />
      </body>
    </html>
  );
}
```

### Step 3: Add Rewrites to next.config.ts

```typescript
// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__visual-agent/:path*',
        destination: 'http://localhost:3001/__visual-agent/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Step 4: Start Dev Server

```bash
npm run dev
```

### Step 5: Start Visual Agent

```bash
visual-agent start
```

### Step 6: Open in Browser

```
http://localhost:3000
```

### Step 7: Start Editing!

1. Click any element on the page
2. Change color, font, size - anything
3. Click "Apply to Code" button
4. Tell your AI agent: `/view-apply`

---

## 🛠️ Commands

### CLI Commands

| Command | Description |
|---------|-------------|
| `visual-agent init` | Initialize in current project |
| `visual-agent start` | Start Visual Agent server |
| `visual-agent apply` | Apply pending changes |
| `visual-agent status` | Show pending changes |
| `visual-agent discard` | Discard pending changes |
| `visual-agent history` | Show applied history |

### AI Agent Commands (Autocomplete)

| Command | Description |
|---------|-------------|
| `/view-start` | Start Visual Agent |
| `/view-apply` | Apply changes to source code |
| `/view-status` | Show pending changes count |
| `/view-discard` | Delete pending changes |
| `/view-history` | Show edit history |

---

## 📁 Folder Structure

```
your-project/
├── src/
│   ├── app/
│   │   └── layout.tsx          # Add <VisualAgentOverlay />
│   └── components/
│       └── VisualAgentOverlay.tsx  # Auto-created by init
├── .visual-agent/
│   ├── pending/              # Changes waiting to be applied
│   │   ├── abc123.json
│   │   └── def456.json
│   └── applied/              # History of applied changes
│       └── abc123.json
├── .opencode/commands/       # OpenCode commands
│   ├── view-start.md
│   ├── view-apply.md
│   ├── view-status.md
│   ├── view-discard.md
│   └── view-history.md
├── .claude/skills/           # Claude Code skills
│   ├── view-apply/SKILL.md
│   ├── view-status/SKILL.md
│   ├── view-discard/SKILL.md
│   └── view-history/SKILL.md
├── AGENTS.md                 # AI agent instructions
├── visual-agent.config.json  # Configuration
└── next.config.ts            # Add rewrites here
```

---

## 📄 Change File Format

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

---

## 🎨 Example Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Visual Agent
visual-agent start

# Browser: http://localhost:3000
# - Click on h1
# - Change color to red
# - Click "Apply to Code"

# AI Agent:
/view-apply

# Agent will:
# 1. Read .visual-agent/pending/ folder
# 2. Update CSS in index.html
# 3. Delete the JSON file
# 4. Report: "✅ 1 change applied!"

# Refresh browser - changes persist!
```

---

## ⚙️ Configuration

### visual-agent.config.json

```json
{
  "version": "4.0.0",
  "server": {
    "port": 3001
  },
  "overlay": {
    "enabled": true,
    "position": "bottom-right"
  },
  "storage": {
    "pendingDir": ".visual-agent/pending",
    "appliedDir": ".visual-agent/applied"
  }
}
```

---

## 🔧 Supported AI Agents

| Agent | Status | Autocomplete |
|-------|--------|--------------|
| **OpenCode** | ✅ Supported | `/view-apply` etc. |
| **Claude Code** | ✅ Supported | `/view-apply` etc. |
| **Cursor** | ✅ Supported | Via AGENTS.md |
| **Codex CLI** | ✅ Supported | Via AGENTS.md |
| **Gemini CLI** | ✅ Supported | Via AGENTS.md |
| **Any Agent** | ✅ Works | File-based (universal) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Architecture                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     WebSocket      ┌──────────────────┐
│   Browser    │◄──────────────────►│  Visual Agent    │
│   Overlay    │                    │  Server          │
│   (React)    │                    │  (Express)       │
│              │                    │                  │
│  - Click     │                    │  - API           │
│  - Edit      │                    │  - WebSocket     │
│  - Approve   │                    │  - File Watcher  │
└──────────────┘                    └────────┬─────────┘
                                             │
                                             │ File System
                                             ▼
                                    ┌──────────────────┐
                                    │  .visual-agent/  │
                                    │  ├── pending/    │
                                    │  └── applied/    │
                                    └────────┬─────────┘
                                             │
                                             │ /view-apply
                                             ▼
                                    ┌──────────────────┐
                                    │  AI Agent        │
                                    │  (Claude/Cursor) │
                                    │                  │
                                    │  - Read JSON     │
                                    │  - Update Code   │
                                    │  - Delete Files  │
                                    └──────────────────┘
```

---

## 🔧 Troubleshooting

### Overlay Not Loading?

1. Check Visual Agent is running: `visual-agent start`
2. Check rewrites in `next.config.ts`
3. Check browser console for errors

### Changes Not Saving?

1. Check `.visual-agent/pending/` folder exists
2. Check file permissions
3. Check Visual Agent server logs

### Next.js Specific Issues?

- Ensure `VisualAgentOverlay` is a client component (`'use client'`)
- Ensure rewrites are configured correctly
- Check that port 3001 is available

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Rishav Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Rishav Builder**

- GitHub: [@rishavbuilder](https://github.com/rishavbuilder)
- Twitter: [@rishavbuilder](https://twitter.com/rishavbuilder)

---

## 🙏 Support

If you find this project useful, please:

1. ⭐ **Star** it on GitHub
2. 🐦 **Share** it on Twitter
3. 🤝 **Contribute** to the project

---

## 📊 Tags

`visual-editor` `ai-agent` `code-generation` `web-development` `frontend` `css` `editing` `claude` `cursor` `opencode` `developer-tools` `productivity` `nextjs` `react` `streaming`

---

<div align="center">

**Made with ❤️ by Rishav Builder**

[⬆ Back to Top](#-visual-agent)

</div>
