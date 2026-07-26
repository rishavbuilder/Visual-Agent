<div align="center">

# 🎨 Visual Agent

### Local-First Visual Editing System for AI Coding Agents

**Browser me edit karo → AI agent code update kare**

[![npm version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/rishavbuilder/Visual-Agent)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/rishavbuilder)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rishavbuilder)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)]()

---

**Visual Agent** ek intelligent middleware hai jo developers aur AI coding agents ke beech kaam karta hai. Ye aapko browser me website visually edit karne deta hai, aur AI agent automatically source code update karta hai.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Auto-Injection** | Koi manual HTML editing nahi. Overlay automatically inject hota hai |
| 🖱️ **Click-to-Edit** | Koi bhi element pe click karo, edit karo |
| 📦 **Multi-Select** | `Shift + Click` se multiple elements select karo |
| ✅ **Approval Mode** | Changes apply karne se pehle review karo |
| 📁 **File-Based Storage** | Changes JSON files me save hoti hain - easy to inspect |
| 🤖 **Universal AI Support** | Works with Claude, Cursor, Codex, Gemini, OpenCode - koi bhi agent |
| 🔄 **Live Preview** | Changes instantly browser me dikhte hain |
| 📜 **Edit History** | Saari edits ka history rakho |

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
      │  3. Edit karo visually    │                           │
      │<──────────────────────────┤                           │
      │                           │                           │
      │  4. Apply to Code         │                           │
      │──────────────────────────>│                           │
      │                           │  5. /view-apply           │
      │                           ├──────────────────────────>│
      │                           │                           │
      │  6. Code updated!         │  7. Read JSON files       │
      │<──────────────────────────│<──────────────────────────┤
      │                           │                           │
      │  8. Hot Reload            │  9. Update source code    │
      │──────────────────────────>│                           │
      │                           │                           │
```

---

## 📦 Installation

### Option 1: Git Clone (Recommended)

```bash
# Repository clone karo
git clone https://github.com/rishavbuilder/Visual-Agent.git

# Folder me jao
cd Visual-Agent

# Install karo
npm install

# Global link karo
npm link
```

### Option 2: npx (Bina install ke)

```bash
npx visual-agent start --target 3000
```

### Option 3: npm install -g

```bash
npm install -g visual-agent
```

---

## 🎯 Quick Start

### Step 1: Project Initialize

```bash
cd your-project
visual-agent init
```

Ye create karega:
- `visual-agent.config.json`
- `.opencode/commands/view-*.md` (OpenCode ke liye)
- `.claude/skills/view-*/SKILL.md` (Claude Code ke liye)
- `AGENTS.md` (AI agent instructions)

### Step 2: Dev Server Start

```bash
npm run dev
```

### Step 3: Visual Agent Start

```bash
visual-agent start --target 3000
```

### Step 4: Browser Me Kholo

```
http://localhost:3001
```

### Step 5: Edit Karo!

1. Koi bhi element pe click karo
2. Color, font, size - kuch bhi change karo
3. "Apply to Code" button dabao
4. AI agent me bolo: `/view-apply`

---

## 🛠️ Commands

### CLI Commands

| Command | Description |
|---------|-------------|
| `visual-agent init` | Project me initialize karo |
| `visual-agent start --target <port>` | Proxy server start karo |
| `visual-agent apply` | Pending changes apply karo |
| `visual-agent status` | Pending changes dikhao |
| `visual-agent discard` | Changes discard karo |
| `visual-agent history` | Applied history dikhao |

### AI Agent Commands (Autocomplete)

| Command | Description |
|---------|-------------|
| `/view-start` | Visual Agent start karo |
| `/view-apply` | Changes code me apply karo |
| `/view-status` | Pending changes count dikhao |
| `/view-discard` | Changes delete karo |
| `/view-history` | History dikhao |

---

## 📁 Folder Structure

```
your-project/
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
├── index.html
└── styles.css
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
# Terminal 1: Dev server
npm run dev

# Terminal 2: Visual Agent
visual-agent start --target 3000

# Browser: http://localhost:3001
# - h1 pe click karo
# - Color red karo
# - "Apply to Code" click karo

# AI Agent me:
/view-apply

# Agent:
# 1. .visual-agent/pending/ folder padhega
# 2. index.html me CSS update karega
# 3. JSON file delete karega
# 4. "✅ 1 change applied!"

# Browser refresh karo - changes persist hain!
```

---

## ⚙️ Configuration

### visual-agent.config.json

```json
{
  "version": "2.0.0",
  "server": {
    "port": 3001
  },
  "proxy": {
    "autoDetect": true,
    "targetPort": null
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
│              │                    │  (Express)       │
│  - Click     │                    │                  │
│  - Edit      │                    │  - Proxy         │
│  - Approve   │                    │  - API           │
└──────────────┘                    │  - WebSocket     │
                                    └────────┬─────────┘
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

## 🤝 Contributing

Contributions welcome hain! Steps:

1. Fork karo
2. Branch banao (`git checkout -b feature/amazing-feature`)
3. Commit karo (`git commit -m 'Add amazing feature'`)
4. Push karo (`git push origin feature/amazing-feature`)
5. PR create karo

---

## 📝 License

MIT License - [LICENSE](LICENSE) file dekho.

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

Agar ye project useful laga toh:

1. ⭐ **Star** do GitHub pe
2. 🐦 **Share** karo Twitter pe
3. 🤝 **Contribute** karo

---

## 📊 Tags

`visual-editor` `ai-agent` `code-generation` `web-development` `frontend` `css` `editing` `mcp` `claude` `cursor` `opencode` `developer-tools` `productivity`

---

<div align="center">

**Made with ❤️ by Rishav Builder**

[⬆ Back to Top](#-visual-agent)

</div>
