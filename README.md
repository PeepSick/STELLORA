# Stellora

**Every memory is a star. Every story is a constellation.**
*Photos capture moments. Memories capture lives. Stellora connects them.*

Stellora is a 3D "living galaxy" that renders your knowledge base and your
personal photo memories as an explorable procedural galaxy — built with
React, Three.js (`@react-three/fiber`), and Zustand.

<!-- TODO: add a real screenshot or demo GIF of the app here before publishing.
     Capture the KNOWLEDGE view (glowing node galaxy) and the STELLORA view
     (photo memory day-nodes) side by side. -->

## What it does

Stellora runs in three interchangeable modes, switchable from the left
control panel:

- **Knowledge** — markdown notes rendered as a 3D knowledge graph. Each note
  is a star; wikilinks (`[[Note Title]]`) become connections. Large
  reference corpora (e.g. a finance/economy archive) stay searchable without
  being rendered as 3D nodes, so the graph doesn't collapse under thousands
  of files.
- **Stellora** — your personal photo library, grouped one node per calendar
  day (not per photo — a 30-photo day is one browsable node, not 30 orbs).
  Real EXIF/GPS extraction (`exifr`), reverse-geocoded place names
  (OpenStreetMap/Nominatim, no API key needed), a markdown+wikilink story
  field per day, and manual Favorite/Important/Archived marking that feeds
  into a "Memory Score" driving how prominently each day's star renders.
- **All** — both graphs rendered together in one galaxy.

An AI chat panel (click the core orb) can browse your node graph and create
connections between nodes on request. It's **bring-your-own-key**: this is a
static client app with no backend, so whatever API key you enter in
Settings is stored only in your own browser and sent straight to the
provider you chose — Claude, OpenAI, DeepSeek, Z.AI, or any OpenAI-compatible
custom endpoint. Nothing is bundled into the app and nothing passes through
a third-party server. Voice input/output uses the browser's built-in Web
Speech API (no key required, quality varies by browser).

**No automated face or identity recognition.** Stellora can count how many
people appear in a photo (a number, from a one-time manual pass or your own
notes) — it does not identify, name, or cluster people across photos. That
line is intentional; if you want that capability, it needs a separate,
explicit decision.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. To use the AI chat panel, go to
**SETTINGS** in the bottom dock, pick a provider, and paste in your own API
key — everything stays local to your browser (`localStorage`).

## Project structure

- `src/galaxy/` — Three.js scene, node rendering, connection lines
- `src/ui/` — control panel, context/detail panels, dock, chat
- `src/data/` — markdown/photo loaders (`loadRealData.ts`, `loadGalleryData.ts`)
- `src/store/` — Zustand store (single source of truth for nodes, UI state, AI config)
- `src/services/aiChat.ts` — unified Anthropic + OpenAI-compatible chat client
- `src/hooks/` — localStorage-backed user edits (story, marks, per-photo notes)

## License

MIT, plus a light attribution clause — see [LICENSE](LICENSE). Forking,
rebranding, and building commercial products on top of this project is fine;
just keep a visible credit back to the original project.
