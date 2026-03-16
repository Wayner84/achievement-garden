# Achievement Tracker Expansion Plan

## Goal
Expand the catalog to **100 games per platform** while keeping achievement lists complete and source-traceable.

## Rules
- Do **not** add partial achievement lists for newly catalogued games.
- Keep a durable record of what is already catalogued so expansion work is resumable.
- Prefer sources that are fetchable/repeatable from this environment.
- Keep seeded/current games correct before broadening scope.

## Current baseline (2026-03-16)
- PSN catalog seeded: 10 games
- Xbox catalog seeded: 10 games
- Steam catalog seeded: 11 games

## Source position
- **PSN:** working from selected public trophy-guide pages / existing ingestion routes.
- **Xbox:** MyGamerProfile is currently the first reliable fetchable+parseable source for seeded games.
- **Steam:** Steam Community achievement pages remain the most straightforward source.

## Tracking file
Use `data/catalog-expansion-status.json` as the source of truth for:
- target count per platform
- ids already catalogued
- expansion notes / constraints

## Next phase
1. Add app-level total progress summary (library-wide unlocked / total achievements)
2. Keep current seeded catalog stable
3. Expand PSN / Steam / Xbox toward 100 each
4. Record every newly catalogued game in the tracking file
5. Only move to broader scraping when source reliability is proven per platform
