# Achievement Tracker — Session Checkpoint (2026-03-21)

## What was completed
- Continued catalog expansion after the earlier Steam push.
- Added **41 new PSN games** from a first clean PowerPyx-compatible batch.
- Added **15 more PSN games** from a second clean batch.
- Kept additions to **complete, parseable trophy lists only**; no partial PS trophy imports were inserted.
- Updated `data/catalog-expansion-status.json` to match the actual catalog and set the PS target to **150**.
- Ran a full production build successfully after the PS expansion.

## Current catalog counts
- **PSN:** 79 games
- **Steam:** 150 games
- **Xbox:** 10 games

## Newly added PSN games this session
- Cyberpunk 2077
- Devil May Cry 5
- Remnant 2
- Dead Island 2
- Alan Wake 2
- Stellar Blade
- Dragon's Dogma 2
- Final Fantasy XVI
- Demon's Souls
- Ratchet & Clank: Rift Apart
- Returnal
- Sifu
- The Callisto Protocol
- Mortal Kombat 1
- Street Fighter 6
- Like a Dragon: Infinite Wealth
- Persona 3 Reload
- Yakuza: Like a Dragon
- Ghost of Tsushima
- Lost Judgment
- Rise of the Ronin
- Metaphor: ReFantazio
- Like a Dragon: Pirate Yakuza in Hawaii
- Assassin's Creed Shadows
- Horizon Forbidden West
- God of War Ragnarök
- Marvel's Spider-Man 2
- Forspoken
- RoboCop: Rogue City
- Warhammer 40,000: Space Marine 2
- Prince of Persia: The Lost Crown
- Tekken 8
- Dragon Ball: Sparking! ZERO
- Call of Duty: Black Ops 6
- Clair Obscur: Expedition 33
- Death Stranding 2: On the Beach
- DOOM: The Dark Ages
- Kingdom Come: Deliverance II
- Monster Hunter Wilds
- Split Fiction
- Mafia: The Old Country
- Lords of the Fallen
- Avatar: Frontiers of Pandora
- Granblue Fantasy: Relink
- Star Wars Outlaws
- Astro's Playroom
- Uncharted: Legacy of Thieves Collection
- Uncharted: The Lost Legacy
- Crash Bandicoot 4: It's About Time
- Dragon Age: The Veilguard
- Silent Hill f
- The Outer Worlds 2
- Marathon
- Borderlands 4
- The First Berserker: Khazan
- ELDEN RING NIGHTREIGN

## PS source / parsing notes
### Straightforward wins
- Modern PowerPyx trophy-guide pages with the standard trophy table continue to parse reliably with the existing batch script.
- This was enough to move PS from **23 → 79** in one pass without touching the parser.

### Still broken / intentionally skipped
These were probed and **not** added in this pass:
- `Marvel's Spider-Man Remastered` — prior known bad/outdated URL still unresolved here
- `Bloodborne` — older PowerPyx page format; existing parser still does not handle it
- `Dark Souls 3` — prior known URL issue remains
- `Dark Souls Remastered` — prior known URL issue remains
- `Resident Evil 7` — prior checkpoint said a fixable URL variant likely exists, but it was not completed in this pass
- `Final Fantasy VII Remake` — guessed PowerPyx URL 404
- `Persona 5 Royal` — guessed PowerPyx URL 404
- `NieR: Automata` — guessed PowerPyx URL 404
- `Judgment` — guessed PowerPyx URL 404
- `Like a Dragon Gaiden: The Man Who Erased His Name` — guessed PowerPyx URL 404
- `Immortals of Aveum` — guessed PowerPyx URL 404
- `Skull and Bones` — guessed PowerPyx URL 404
- `Horizon Zero Dawn` — page responded, but current parser found no modern trophy table (likely older layout)
- `Uncharted 4: A Thief's End` — guessed PowerPyx URL 404
- `Dying Light 2 Stay Human` — guessed PowerPyx URL 404

## Validation / repo state at checkpoint time
- Earlier in the session, `npm run build` succeeded.
- Build warning at that point remained about very large chunks, especially `catalog-steam` and now `catalog-psn`.
- That warning is now addressed by the catalog asset refactor below.

## Catalog loading architecture refactor (completed later in this session)
- Replaced runtime dynamic imports of giant TS catalog modules with a **generated JSON shard pipeline**.
- Added `scripts/generate-catalog-assets.mjs`.
  - It treats `src/lib/catalog-psn.ts`, `src/lib/catalog-xbox.ts`, and `src/lib/catalog-steam.ts` as the current authoring/ingest source of truth.
  - It transpiles/imports those TS files in Node, then emits:
    - `public/catalog/*.json` shard files
    - `src/generated/catalog-manifest.json`
- Updated `src/lib/catalog.ts` into a lightweight manifest-driven loader.
  - It now fetches only the shard files for the requested platform(s).
  - Shards are cached in-memory per file.
  - Runtime behavior for callers stays the same: `loadCatalogGames`, `loadCatalogById`, and `cloneCatalogGameToLibrary` still expose the same contract.
- Wired asset generation into npm scripts so normal workflows stay compatible:
  - `npm run catalog:generate`
  - `npm run build` now regenerates shards before TypeScript/Vite build
  - `npm run lint` now regenerates shards before typecheck
  - `npm run dev` now regenerates shards before starting Vite
- Existing ingest/expansion scripts were **left compatible on purpose**.
  - They can continue appending/editing the TS catalog source files.
  - The generated JSON assets are rebuilt from those TS sources during normal build/dev/lint runs.

## Post-refactor validation
- `npm run build` succeeded after the refactor.
- The old large Vite platform chunk warnings are gone.
- Current production output is roughly:
  - `dist/assets/catalog-*.js` loader chunk: ~2.5 kB
  - main app chunk: ~38.1 kB
  - catalog data now ships as static JSON shards under `public/catalog/` instead of huge JS chunks.

## Follow-up guidance for future catalog work
1. Keep using the TS platform catalog files as the editable source until/unless the ingest scripts are moved fully to JSON writing.
2. After adding or changing catalog entries, run `npm run catalog:generate` (or just `npm run build` / `npm run dev`).
3. If catalogs grow sharply, tune shard size via `CATALOG_SHARD_SIZE` for regeneration without changing runtime loader logic.
4. A future cleanup could move ingestion scripts to write JSON-first source data directly, but this is no longer required to avoid bundle-size growth.

## Files added/updated this session
- `src/lib/catalog-psn.ts`
- `data/catalog-expansion-status.json`
- `data/expansion-batch-2026-03-21-psn-37.json`
- `data/expansion-batch-2026-03-21-psn-17.json`
- `SESSION_CHECKPOINT-2026-03-21.md`

## Best continuation path
1. Probe/fix the older blocked PS entries first:
   - Spider-Man Remastered
   - Bloodborne
   - Dark Souls 3
   - Dark Souls Remastered
   - Resident Evil 7
2. Add a fallback parser/source for older PowerPyx layouts.
3. Then run another modern PS batch to continue climbing toward **150**.
