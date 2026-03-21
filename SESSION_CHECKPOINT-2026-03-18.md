# Achievement Tracker — Session Checkpoint (2026-03-18)

## What was completed

### App features added
- **Steam sync support** added:
  - per-game **Sync Steam achievements** button
  - library-wide **Sync all Steam games** button
- **Hamburger menu → Browse all games** added:
  - browse full catalog without adding games first
  - open a catalog game's detail page
  - add the game to library from that page if wanted
- **Home screen shelves can be collapsed/minimised**:
  - Currently Playing / Backlog / To Play / Won’t Revisit
- **Grid size setting fixed**:
  - `Compact / Default / Large` now actually changes tile size by applying `data-grid` to the DOM
- **No Man’s Sky fixed** to **27 achievements**

## Catalog/data architecture changes
- Catalog was refactored from one huge file into split platform files:
  - `src/lib/catalog.ts` → loader only
  - `src/lib/catalog-helpers.ts`
  - `src/lib/catalog-psn.ts`
  - `src/lib/catalog-xbox.ts`
  - `src/lib/catalog-steam.ts`
- Providers and catalog-browser routes were updated to use the new loader functions.
- Expansion script was updated to write into the split per-platform catalog files instead of the old monolithic catalog.

## Batch ingestion / scraping status

### Steam
- Multiple 20-game batches were run successfully.
- A longer Steam run was also run for a while, then stopped on request.
- Current catalog count at push time was **about 96 Steam games**.
- Some Steam items can still fail because their public achievement pages are missing / parse oddly.
  - Examples seen: `Sea of Thieves`, `ULTRAKILL`

### PlayStation
- PS long run was executed and then stopped/finished.
- **15 PS games** from the long-run manifest were inserted successfully.
- Some PS entries failed because of **bad/outdated PowerPyx URLs** or page-format mismatch.
- Known PS problem cases from this session:
  - Spider-Man Remastered → URL bad / 404
  - Bloodborne → older PowerPyx page format, likely needs fallback parser or different source
  - Dark Souls 3 → URL issue
  - Dark Souls Remastered → URL issue
  - Resident Evil 7 → URL variant found that looks fixable

## Background jobs
- Long-running Steam and PS expansion jobs were **stopped** before final push.
- No catalog expansion jobs should currently be running.

## Repo / push status
- Latest pushed commit from this session:
  - **`4219ab1`** — `Split catalog by platform and add latest Steam/PS batches`
- Repo:
  - `https://github.com/Wayner84/achievement-garden`

## Important scripts/files
- Long-run manifests created:
  - `data/expansion-batch-2026-03-17-steam-longrun.json`
  - `data/expansion-batch-2026-03-17-psn-longrun.json`
- Utility / ingestion scripts:
  - `scripts/expand-catalog-batch.mjs`
  - `scripts/split-catalog-by-platform.mjs`

## Next recommended steps
1. **Fix PlayStation ingestion issues**
   - correct broken PowerPyx URLs
   - add fallback parser/source for older guide pages (especially Bloodborne-style pages)
2. **Continue catalog growth**
   - get Steam well past 100
   - rerun PS long-run once sources are fixed
3. **Further optimize Steam catalog size**
   - Steam is still the largest chunk even after platform split
   - next improvement: split Steam catalog further into shards/batches rather than one large `catalog-steam.ts`
4. **Optional**: push another batch once PS fixes are in place

## Notes for next session
- User wanted context condensed because weekly usage was very low.
- Best continuation path: read this checkpoint first, then inspect repo status and continue from here rather than relying on old chat context.
