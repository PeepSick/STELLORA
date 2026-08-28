# Stellora

[![CI](https://github.com/PeepSick/STELLORA/actions/workflows/ci.yml/badge.svg)](https://github.com/PeepSick/STELLORA/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2019-61DAFB.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D-Three.js-000000.svg)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](https://www.typescriptlang.org)

![Stellora hero](docs/hero.svg)

**Every memory is a star. Every story is a constellation.**

Stellora is a 3D "living galaxy" that renders your knowledge base, your personal
photo memories, and more as an explorable procedural galaxy in the browser —
built with **React 19**, **Three.js** (`@react-three/fiber` + `drei` +
`postprocessing`), **Zustand**, **Tailwind CSS v4**, and **Vite**.

It is a **client-side only** application: there is no backend, no server, and no
phone-home. Everything runs in your browser; AI keys live only in your
`localStorage`.

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
  and its commits are fetched and rendered as a chained commit graph.
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
  uses the browser's built-in Web Speech API.
- **Free forever. Bring your own AI key.** 🔑 No paid tier, no metered API on our
  side, no cost to self-host — you only pay your chosen provider for the tokens
  you use.
- **Internationalization** — **English is the base language**; Turkish is
  included and auto-selected when the browser locale starts with `tr`. Switch
  manually from Settings.
- **Performance-aware** — an R3F `PerformanceMonitor` adapts render quality, and
  large corpora stay search-only until you opt in.

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
| `src/data/galery` | Personal photos → Stellora memory nodes |
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
```

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
