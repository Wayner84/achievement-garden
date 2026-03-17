# Achievement Tracker Session Checkpoint — 2026-03-16

## Where we are
The app has moved from a small seeded catalog into a tracked expansion workflow.

### Current catalog counts
- PSN: **16**
- Xbox: **10**
- Steam: **32**
- Total catalogued: **58**

### Recently pushed commits
- `3d21bdb` — Fill Xbox achievements from MyGamerProfile
- `7b2f9cc` — Add library total progress and expansion tracking
- `4a7ca8c` — Expand PSN and Steam catalog batch

---

## What was done this session

### 1) Xbox source path proved and used
- Public Xbox achievement sites like TrueAchievements/XboxAchievements were unreliable from this environment due to bot protection.
- **MyGamerProfile** became the first reliable fetchable+parseable Xbox source.
- All 10 seeded Xbox games were expanded to full achievement lists.

### 2) App UI improved
- Added a **library-wide total progress block** at the top of the app.
- This shows total unlocked achievements, total achievements, percentage, and completed games.

### 3) Expansion tracking added
Created durable tracking files:
- `data/catalog-expansion-status.json`
- `EXPANSION_PLAN.md`

Purpose:
- keep target = 100 games per platform
- record what is already catalogued
- avoid duplicate/partial expansion work

### 4) Real batch-expansion tooling added
Created scripts:
- `scripts/expand-catalog-batch.mjs`
- `scripts/dedupe-catalog.mjs`

Created manifest:
- `data/expansion-batch-2026-03-16.json`

Purpose:
- run manifest-driven catalog expansion
- avoid ad hoc manual edits
- keep expansion repeatable
- dedupe when insertion mistakes happen

### 5) PSN + Steam expansion wave started
Successfully added a first new batch of PSN + Steam games.

#### New PSN additions
- Final Fantasy VII Rebirth
- Resident Evil 4
- Elden Ring
- ASTRO BOT
- Silent Hill 2
- Black Myth: Wukong

#### New Steam additions
- Portal
- Terraria
- Dead Cells
- The Binding of Isaac: Rebirth
- Brotato
- Outer Wilds
- Oxygen Not Included
- Cuphead
- Fallout 4
- Skyrim Special Edition
- Sekiro: Shadows Die Twice
- Palworld
- HoloCure - Save the Fans!
- Just Shapes & Beats
- Deep Rock Galactic

### 6) Specific achievement count fixes
Corrected catalog entries that were short:
- **Stardew Valley** → fixed to **49** achievements
- **Balatro** → fixed to **31** achievements

### 7) Steam verification completed properly
- Replaced the brittle Steam regex parser with a row-based parser that reads each achievement row block from Steam Community pages.
- Ran a full Steam refresh across all Steam catalog entries.
- Verified the final Steam catalog against the live Steam Community achievement row counts.
- Final verification result: **0 Steam mismatches remaining**.
- Notable corrected totals include:
  - Hades → 49
  - Portal 2 → 51
  - Celeste → 32
  - Hollow Knight → 63
  - Vampire Survivors → 243
  - Dave the Diver → 43
  - Terraria → 137
  - Dead Cells → 121
  - The Binding of Isaac: Rebirth → 641
  - Deep Rock Galactic → 69

### 8) UI polish / usability changes completed
- Fixed the long-page background/gradient issue so the app no longer looks broken on long achievement lists / large library pages.
- Added collapsible library sections for the shelf groups.
- Added Settings options for:
  - game grid size (Compact / Default / Large)
  - resetting shelf drawer collapse state

---

## Problems encountered

### Duplicate insertion bug
- The first batch-expansion script version did not correctly skip already-added generated IDs because inserted IDs used double quotes while the skip-check only looked for single quotes.
- Result: some entries were inserted twice.
- Fix:
  - patched skip logic
  - added `scripts/dedupe-catalog.mjs`
  - deduped both catalog file and expansion status

### Steam parser edge cases
Some Steam games did not fit the parser pattern used so far.
Observed failures included:
- RimWorld
- UNDERTALE
- ULTRAKILL

These were not forced into the catalog. Better to swap in compatible candidates than add broken entries.

### Bundle growth warning
- Vite warns the main JS bundle is now >500 KB minified.
- This is **not yet a blocker**, but it will matter as the catalog grows.
- Long-term fix: move catalog data out of the main JS bundle and load it separately.

---

## Recommended next steps

### Immediate
1. Continue the PSN + Steam batch expansion toward the agreed short-term target.
2. Replace problematic Steam candidates with parser-compatible games.
3. Rebuild and push after each coherent chunk.

### Next architecture cleanup
4. Move catalog data out of `src/lib/catalog.ts` and into external JSON/data files.
   - This will keep the frontend bundle from growing too large.
   - The current warning is early notice, not a crisis.

### After PSN/Steam expansion stabilises
5. Start broader scraping/catalog expansion in larger controlled batches.
6. Keep updating `data/catalog-expansion-status.json` as the canonical expansion tracker.

---

## Notes on other background work this same day

### Printables Lego sync
- Verified actual source count: **2492 unique models**.
- The larger `seen` number in state was resume/iteration noise.
- Script state was paused/saved cleanly.

### MachineBlocks scraper
- Script exists at `projects/printables-lego-sync/download_machineblocks.py`.
- Normalized GitHub `blob/` links to `raw.githubusercontent.com`.
- Small retest succeeded without 429s.
- Still needs refinement to better distinguish useful source files vs archives.
