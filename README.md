# Achievement Garden

Mobile-first achievement tracker web app (GitHub Pages friendly). Loud pink UI, offline-first storage, and a pluggable "data gateway" if you want to pull achievements from public trophy sites.

## What you can do now
- **Add games** (multi-select) via the **+** button
- Search a built-in **starter catalog with real achievement/trophy data** for PlayStation, Xbox, and Steam
- Track achievement progress per game (**tap an achievement to toggle locked/unlocked**)
- Works **offline** (localStorage)
- **Export/Import** your library (menu)
- **Settings**: reduce motion, pink intensity, optional data gateway URL

## Starter catalog (real seeded data)
Current built-in catalog includes:
- **PlayStation:** Astro's Playroom
- **Xbox:** Halo Infinite
- **Steam:** Hades

These entries are seeded with real achievement/trophy names and descriptions from public sources stored in-repo as a starter dataset. The optional gateway can expand this later.

## Deploy (GitHub Pages)
This repo includes a GitHub Actions workflow that builds to `dist/` and publishes to the `gh-pages` branch.

1. Push to `main`
2. In GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → gh-pages**

## Data gateway (optional)
Browser-only scraping of PSN trophy sites / Xbox achievement sites is usually blocked by CORS and bot protection.

If you want the app to fetch real data, set a **gateway URL** in Settings. A starter Cloudflare Worker lives in `worker/`.

> You mentioned Cloudflare's new game-data approach. I couldn’t open the tweet link from this environment, so I shipped the app with an *optional gateway* abstraction: you can plug in whichever Cloudflare feature you want (Workers + Browser Rendering + AI, etc.) behind a stable `/search` and `/achievements` API.

### Gateway API contract
- `GET /search?q=<query>&platforms=psn,xbox,steam`
  - returns `{ results: SearchResult[] }`
- `GET /achievements?platform=<psn|xbox|steam>&title=<...>&externalId=<...>&url=<...>`
  - returns `{ achievements: Achievement[] }`

## Dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Current-catalog ingestion
The repo now includes a local ingestion script aimed at the **games already in `src/lib/catalog.ts`**.

```bash
npm run ingest:current-catalog
```

Useful flags:
- `--platforms=psn,steam` — only run supported source types
- `--resume` — skip games already marked successful in the local checkpoint file
- `--limit=2` — test a small subset first
- `--dry-run` — fetch and parse without rewriting `src/lib/catalog.ts`
- `--delayMs=1500` — polite per-game delay for long unattended runs

Checkpoint state is written to `.ingest-state/current-catalog-achievements.json` and ignored by git.

### Source status
- **Steam**: implemented via public Steam Community achievement pages
- **PSN**: implemented for current catalog entries backed by PowerPyx and Eurogamer pages
- **Xbox**: not automated yet; current TrueAchievements URLs are returning bot-protection responses from this environment, so Xbox needs a different source or a browser-rendered fetch path
