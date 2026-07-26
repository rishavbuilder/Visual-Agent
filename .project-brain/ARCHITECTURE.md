# Visual Agent - Architecture

## Overview

Visual Agent is a local-first visual editing system that lets developers edit websites visually while an AI coding agent automatically updates the source code.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Overlay Engine                     │   │
│  │  ┌──────────┐ ┌──────────────┐ ┌───────────────┐   │   │
│  │  │ Element  │ │   Property   │ │    Change      │   │   │
│  │  │Inspector │ │   Editor     │ │   Tracker      │   │   │
│  │  └──────────┘ └──────────────┘ └───────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │              WebSocket Client                 │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                         WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Local Server (Node.js)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 WebSocket Server                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Instruction Generator                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AI Agent Bridge                         │   │
│  │  ┌──────────┐ ┌──────────────┐ ┌───────────────┐   │   │
│  │  │ Claude   │ │   Cursor     │ │   Custom       │   │   │
│  │  │ Adapter  │ │   Adapter    │ │   Adapter      │   │   │
│  │  └──────────┘ └──────────────┘ └───────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Framework Detectors                       │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │   │
│  │  │ React  │ │  Vue   │ │ Svelte │ │  HTML  │      │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              File Watcher (Chokidar)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    File System (Project)
```

## Components

### 1. CLI (`bin/visual-agent`)

Entry point for the tool.

Commands:
- `visual-agent init` - Initialize Visual Agent in current project
- `visual-agent start` - Start the visual editing session
- `visual-agent status` - Show current status

### 2. Local Server (`src/server/`)

Node.js server that:
- Detects running localhost projects
- Serves the overlay script
- Manages WebSocket connections
- Processes edit instructions
- Bridges to AI coding agents

### 3. Overlay Engine (`src/overlay/`)

Browser-injected JavaScript that:
- Creates a floating UI panel
- Enables element selection (click to select)
- Highlights selected elements
- Shows editable properties
- Captures all visual changes
- Sends changes via WebSocket

### 4. Element Inspector (`src/overlay/inspector.js`)

- DOM element selection
- XPath/CSS selector generation
- Component boundary detection
- Element tree visualization

### 5. Property Editor (`src/overlay/editor.js`)

Edits these CSS/HTML properties:
- Text content
- Colors (text, background, border)
- Typography (font, size, weight, line-height)
- Spacing (margin, padding)
- Layout (display, flex, grid)
- Sizing (width, height, min/max)
- Borders (radius, style, width)
- Shadows
- Opacity
- Transforms

### 6. Change Tracker (`src/overlay/tracker.js`)

Records every edit as a structured object:

```javascript
{
  type: "property_change",
  selector: ".hero-title",
  property: "color",
  oldValue: "#000000",
  newValue: "#3b82f6",
  timestamp: 1234567890
}
```

### 7. Instruction Generator (`src/server/instructions.js`)

Converts tracked changes into AI instructions:

```
Change the color of the element with class "hero-title" from #000000 to #3b82f6
```

### 8. AI Agent Bridge (`src/server/bridge.js`)

Connects to AI coding agents via:
- File system (write instructions to a file the agent watches)
- API integration (direct agent API calls)
- CLI integration (spawn agent commands)

### 9. Framework Detectors (`src/server/frameworks/`)

Detect project frameworks by:
- package.json dependencies
- Config file detection (vite.config, next.config, etc.)
- File structure analysis
- Import patterns

Supported:
- React (CRA, Vite, Next.js)
- Vue (Vite, Nuxt)
- Svelte (SvelteKit)
- Plain HTML/CSS/JS

## Data Flow

```
User clicks element in browser
         │
         ▼
Overlay captures selection
         │
         ▼
User edits property in panel
         │
         ▼
Change Tracker records change
         │
         ▼
WebSocket sends to server
         │
         ▼
Instruction Generator creates instruction
         │
         ▼
AI Agent Bridge sends to agent
         │
         ▼
Agent modifies source files
         │
         ▼
File Watcher detects change
         │
         ▼
Hot Reload refreshes browser
         │
         ▼
Overlay remains active
```

## File Structure

```
visual-agent/
├── bin/
│   └── visual-agent.js          # CLI entry point
├── src/
│   ├── cli/
│   │   ├── init.js              # Init command
│   │   └── start.js             # Start command
│   ├── server/
│   │   ├── index.js             # Server main
│   │   ├── websocket.js         # WebSocket handler
│   │   ├── instructions.js      # Instruction generator
│   │   ├── watcher.js           # File watcher
│   │   ├── bridge.js            # AI agent bridge
│   │   └── frameworks/
│   │       ├── detector.js      # Framework detection
│   │       ├── react.js         # React adapter
│   │       ├── vue.js           # Vue adapter
│   │       ├── svelte.js        # Svelte adapter
│   │       └── html.js          # HTML/CSS/JS adapter
│   └── overlay/
│       ├── index.js             # Overlay main
│       ├── ui.js                # UI components
│       ├── inspector.js         # Element inspector
│       ├── editor.js            # Property editor
│       ├── tracker.js           # Change tracker
│       ├── websocket.js         # WebSocket client
│       └── styles.css           # Overlay styles
├── package.json
├── README.md
└── .gitignore
```

## Technology Stack

- **Runtime**: Node.js
- **Server**: Express + ws (WebSocket)
- **Overlay**: Vanilla JavaScript (no dependencies)
- **File Watching**: Chokidar
- **CLI**: Commander.js
- **Colors**: Chalk
- **Port Detection**: portfinder
