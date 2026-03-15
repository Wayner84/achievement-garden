# Ingestion notes

## What exists now
- `src/lib/catalog.ts` still remains the app's source of truth for seeded games.
- `scripts/ingest-current-catalog.mjs` upgrades the **existing current catalog entries** from starter subsets to fuller upstream lists.
- The script is source-aware and currently supports:
  - `steamcommunity.com/stats/.../achievements`
  - `powerpyx.com/...trophy-guide...`
  - Eurogamer's Astro's Playroom trophy table
- Progress is checkpointed after each game in `.ingest-state/current-catalog-achievements.json`.

## Why this shape
This is a better first unattended path than trying to do everything live in-browser:
- the catalog is already repo-backed
- fetch/parse failures can be resumed cleanly
- source-specific parsers can evolve independently
- the operator can batch large refreshes before deployment

## Gaps
- Xbox current URLs point at TrueAchievements, which is returning a bot-protection page here.
- Two PSN entries currently have stale source URLs in the catalog:
  - The Last of Us Part I
  - Helldivers 2

## Recommended next step
Create a proper source manifest separate from `catalog.ts`, then move ingestion output to a generated data file so the app seed and the ingestion pipeline are no longer coupled to one handwritten TS file.
