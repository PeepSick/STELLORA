# Stellora

[![CI](https://github.com/PeepSick/STELLORA/actions/workflows/ci.yml/badge.svg)](https://github.com/PeepSick/STELLORA/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2019-61DAFB.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D-Three.js-000000.svg)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org)
[![MCP](https://img.shields.io/badge/MCP-Server-blue.svg)](https://modelcontextprotocol.io)

![Stellora hero](docs/hero.svg)

**Every memory is a star. Every story is a constellation.**

Stellora is a 3D "living galaxy" that renders your knowledge base, your personal
photo memories, and more as an explorable procedural galaxy in the browser —
built with **React 19**, **Three.js** (`@react-three/fiber` + `drei` +
`postprocessing`), **Zustand**, **Tailwind CSS v4**, and **Vite**.

No Stellora backend. Your data stays local unless you explicitly connect to an
external provider or service (GitHub, Nominatim, or your chosen AI provider).
The optional MCP server runs locally and exposes your data over stdio — no
network traffic, no cloud.

**At a glance**

- 📜 MIT-licensed code
- ™️ *Stellora* name & logo trademark-protected
- 🆓 Free forever
- 🖥️ Self-hostable
- 🚫 No backend
- 📡 No telemetry
- 🔑 Bring-your-own-key AI
- 🔌 MCP Server (Claude / OpenCode / Cursor)
- 🍴 Fork freely — just rename your fork

![Stellora walkthrough](docs/demo.gif)

---

## ✨ Features

- **Knowledge Galaxy** — Markdown notes rendered as a 3D knowledge graph. Each
  note is a star; wikilinks (`[[Note Title]]`) become visible connections.
- **Stellora (Photo Memory) Galaxy** — your personal photo library, grouped
  **one node per calendar day** (a 30-photo day is one browsable node, not 30
  orbs). Real EXIF/GPS extraction via [`exifr`](https://github.com/mattiaasta/exifr),
  reverse-geocoded place names (OpenStreetMap/Nominatim — no API key), and a
  per-day story field with manual Favorite / Important / Archived marks that feed
  a **Memory Score** driving how prominently each day's star renders.
- **Finance Corpus in 3D** *(toggle)* — the 1,661-file economy/finance reference
  archive is searchable by default and can be promoted to a full 3D node field
  from Settings (sized down so thousands of glow sprites don't white out the
  scene).
- **Music Galaxy** *(toggle)* — drop audio files into `src/data/music/` and they
  appear automatically as nodes (same auto-discovery pattern as the gallery).
  No external API key required.
- **Git Galaxy** *(toggle)* — paste any public GitHub repository URL in Settings
  and its commits are fetched and rendered as a chained commit graph. GitHub API
  availability and rate limits may apply.
- **Timeline View** *(toggle)* — overlays a temporal reference axis with year
  tick marks on the galactic plane.
- **Collaborative Mode** *(toggle)* — sync the galaxy across browser tabs on the
  same origin via the `BroadcastChannel` API. No server needed.
- **Export / Import** *(toggle)* — save or load the whole galaxy (nodes,
  connections, settings, AI config, marks) as a JSON file.
- **Theme Engine** — Dark / Light / Aurora / Custom presets applied live via CSS
  variables.
- **AI Chat** — click the core orb to open a chat panel that browses your node
  graph and can create connections on request. **Bring-your-own-key**: Claude,
  OpenAI, DeepSeek, Z.AI, or any OpenAI-compatible endpoint. Voice input/output
  uses the browser's built-in Web Speech API. API keys are stored in browser
  `localStorage` — use a browser profile/device you trust.
- **Free forever. Bring your own AI key.** 🔑 No paid tier, no metered API on our
  side, no cost to self-host — you only pay your chosen provider for the tokens
  you use.
- **Internationalization** — **English is the base language**; Turkish is
  included and auto-selected when the browser locale starts with `tr`. Switch
  manually from Settings.
- **Performance-aware** — an R3F `PerformanceMonitor` adapts render quality, and
  large corpora stay search-only until you opt in.
- **MCP Server** — connect Claude Desktop, OpenCode, Cursor, or any
  MCP-compatible AI tool to your galaxy. Access your notes, photo memories,
  and finance corpus directly from your AI assistant. Ships as
  `@stellora/mcp` with stdio transport.

> **Privacy note:** No automated face or identity recognition is performed.
> Stellora can count how many people appear in a photo (a number you supply),
> but it does not identify, name, or cluster people across photos.

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Use the **left control panel** to switch galaxy
sources, the **bottom dock** to open Dashboard / Systems / Orbs / Analytics /
Archive / **Settings**, and click the **core orb** to chat with your graph.

### Optional data folders

Stellora auto-discovers content dropped into these folders (no code changes
needed):

| Folder | What it does |
|---|---|
| `src/data/business`, `ops`, `product`, `sourcing` | Markdown notes → Knowledge graph |
| `src/data/economy/finance` | Reference corpus → searchable (and 3D when enabled) |
| `src/data/gallery` | Personal photos → Stellora memory nodes |
| `src/data/music` | Audio files → Music Galaxy nodes |

### AI chat setup

Go to **SETTINGS → AI PROVIDER**, pick a provider, and paste your own API key.
Everything stays local to your browser (`localStorage`).

---

## 🧪 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run build:lib` | Build as a reusable ES module (`dist/stellaris.js`) |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run mcp:build` | Build the MCP server |
| `npm run mcp:start` | Start the MCP server (stdio) |

---

## ⚙️ Feature flags

Every optional galaxy feature is gated behind a flag in **Settings** (stored in
`localStorage`). Defaults keep the app lean — only the Knowledge and Stellora
graphs are active out of the box:

- Finance Corpus in 3D
- Timeline View
- Music Galaxy
- Git Galaxy
- Collaborative Mode
- Export / Import
- Theme preset (Dark / Light / Aurora / Custom)
- Language (Auto / English / Turkish)

---

## 🗂️ Project structure

```
src/
  galaxy/        Three.js scene, node & connection rendering, post-processing
  ui/            Control panel, context/detail panels, dock, chat, settings
  data/          Markdown/photo/music loaders (auto-discovery via import.meta.glob)
  services/      AI chat client, GitHub fetcher, export/import
  hooks/         localStorage-backed edits, audio engine, collab sync
  store/         Zustand store (single source of truth)
  i18n/          English (base) + Turkish dictionaries and t()
  utils/         Galaxy math, theme presets, fuzzy search, memory score
  shaders/       Custom GLSL (orbs, connections, nebula, starfield)

packages/
  mcp/           MCP server — connect Claude/OpenCode/Cursor to your galaxy
```

---

## 🔌 MCP Server

Stellora ships with a [Model Context Protocol](https://modelcontextprotocol.io)
server (`@stellora/mcp`) so AI assistants can browse your knowledge base, photo
memories, and finance corpus directly.

### Available tools

| Tool | Description |
|------|-------------|
| `notes_search` | Search knowledge galaxy by query |
| `notes_read` | Read full note content by ID |
| `notes_list` | List all notes with metadata |
| `gallery_search` | Search photo memories |
| `gallery_get` | Get a specific day's memory |
| `gallery_list` | List all memory days |
| `finance_search` | Search finance corpus (1,661 Turkish economy articles) |
| `git_get` | Fetch recent commits from a GitHub repo |
| `galaxy_stats` | Get galaxy statistics |
| `galaxy_sources` | List available data sources |

### Setup

```bash
cd packages/mcp
npm install
npm run build
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/absolute/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/absolute/path/to/stellora/src/data"
      }
    }
  }
}
```

### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/absolute/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/absolute/path/to/stellora/src/data"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/absolute/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/absolute/path/to/stellora/src/data"
      }
    }
  }
}
```

See [`packages/mcp/README.md`](packages/mcp/README.md) for full documentation.

---

## 🔒 Privacy & philosophy

- **Client-side only.** No backend, no analytics, no telemetry.
- **Bring-your-own-key AI.** Keys never leave your browser and go straight to
  the provider you chose.
- **No face recognition.** People counts only; no identity claims.

---

## 📄 License

Stellora is released under the **MIT License** (see [LICENSE](LICENSE)) for the
code. The **"Stellora" name, logo, and official visual identity are reserved**
to the original project — see the [Trademark & Brand Policy](TRADEMARK.md).

> Stellora is free to use, modify and self-host. The Stellora name, logo and
> official visual identity remain reserved to the original project.

Forking, modifying, and self-hosting is welcome — just publish your fork under a
**different name** (e.g. GalaxyCore, MyGalaxy, Stellar Explorer), not as
"Stellora".
