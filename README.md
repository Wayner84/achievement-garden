# Achievement Garden

Mobile-first achievement tracker web app (GitHub Pages friendly). Loud pink UI, offline-first storage, and a pluggable "data gateway" if you want to pull achievements from public trophy sites.

## What you can do now
- **Add games** (multi-select) via the **+** button
- Track achievement progress per game (**tap an achievement to toggle locked/unlocked**)
- Works **offline** (localStorage)
- **Export/Import** your library (menu)
- **Settings**: reduce motion, pink intensity, optional data gateway URL

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
