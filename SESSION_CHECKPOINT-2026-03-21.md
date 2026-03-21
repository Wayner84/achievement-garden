# Achievement Tracker — Session Checkpoint (2026-03-21)

## What was completed
- Continued Steam catalog expansion beyond the previous 100-game milestone.
- Added **50 new Steam games** with full achievement lists scraped from public Steam Community pages.
- Kept the additions to complete/parseable sets only; no partial achievement imports were added.
- Reconciled `data/catalog-expansion-status.json` so the Steam status list and target now match the actual catalog contents.

## Newly added Steam games
- Elden Ring
- Geometry Dash
- Factorio
- The Binding of Isaac
- Enter the Gungeon
- Disco Elysium - The Final Cut
- OMORI
- Dishonored
- Dishonored 2
- DOOM
- DOOM Eternal
- Titanfall 2
- BioShock Remastered
- BioShock 2 Remastered
- BioShock Infinite
- Prey
- Deus Ex: Human Revolution - Director's Cut
- Deus Ex: Mankind Divided
- Metro Exodus
- Metro 2033 Redux
- Metro: Last Light Redux
- Control Ultimate Edition
- Ghostrunner
- Sifu
- Remnant: From the Ashes
- Remnant II
- Ori and the Blind Forest: Definitive Edition
- Ori and the Will of the Wisps
- Cult of the Lamb
- A Hat in Time
- Ghost of Tsushima DIRECTOR'S CUT
- ELDEN RING NIGHTREIGN
- Blasphemous
- Blasphemous 2
- Hi‑Fi RUSH
- Yakuza 0
- Yakuza Kiwami
- Yakuza Kiwami 2
- Yakuza 3 Remastered
- Yakuza 4 Remastered
- Yakuza 5 Remastered
- Judgment
- Lost Judgment
- Dragon's Dogma 2
- NieR:Automata
- FINAL FANTASY VII REMAKE INTERGRADE
- FINAL FANTASY XVI
- Shin Megami Tensei V: Vengeance
- Little Nightmares
- Little Nightmares II

## Current catalog counts
- **Steam:** 150 games
- **PSN:** 23 games
- **Xbox:** 10 games

## Skipped / broken candidates found during probing
These were tested and intentionally **not** added because the public Steam Community achievement page had no parseable achievement rows:
- Undertale
- ULTRAKILL
- Valheim
- Project Zomboid
- Kerbal Space Program

## Validation / repo state
- A fresh build should be run after this batch before deployment/hand-off.
- Steam catalog size has grown substantially again, so future expansion should probably move to further sharding/generated data rather than indefinitely growing one giant TS file.

## Files added/updated this session
- `src/lib/catalog-steam.ts`
- `data/catalog-expansion-status.json`
- `data/expansion-batch-2026-03-21-steam-50.json`
- `data/steam-probe-results.json`
- `SESSION_CHECKPOINT-2026-03-21.md`
