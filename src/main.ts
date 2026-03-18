import './style.css';
import type { Game, Platform, Settings, Achievement } from './lib/types';
import { loadGames, saveGames, loadSettings, saveSettings, exportAll, importAll } from './lib/storage';
import { el, icon, platformLabel, platformDotClass, psnTierLabel, gamePlatformDetailLabel, gameStatusLabel, nextGameStatus } from './lib/ui';
import { searchAll, makeGameFromResult, type SearchResult } from './lib/providers';
import { fetchOwnedSteamGames, fetchSteamAchievementsForProfileApp, resolveSteamProfile, steamGameLooksSyncable, syncSteamGameFromProfile } from './lib/steam';
import { clamp, formatPct, now, uid } from './lib/util';

type Route =
  | { name: 'library' }
  | { name: 'game'; id: string }
  | { name: 'settings' }
  | { name: 'catalog' }
  | { name: 'catalog-game'; id: string };

let catalogModulePromise: Promise<typeof import('./lib/catalog')> | null = null;
function loadCatalogModule() {
  catalogModulePromise ??= import('./lib/catalog');
  return catalogModulePromise;
}

function parseRoute(): Route {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return { name: 'library' };
  const [a, b] = hash.split('/');
  if (a === 'game' && b) return { name: 'game', id: b };
  if (a === 'catalog' && b) return { name: 'catalog-game', id: b };
  if (a === 'catalog') return { name: 'catalog' };
  if (a === 'settings') return { name: 'settings' };
  return { name: 'library' };
}

function setRoute(r: Route): void {
  if (r.name === 'library') location.hash = '';
  if (r.name === 'settings') location.hash = '#settings';
  if (r.name === 'catalog') location.hash = '#catalog';
  if (r.name === 'game') location.hash = `#game/${encodeURIComponent(r.id)}`;
  if (r.name === 'catalog-game') location.hash = `#catalog/${encodeURIComponent(r.id)}`;
}

function computeProgress(g: Game): { unlocked: number; total: number; pct: number } {
  const total = g.achievements.length;
  const unlocked = g.achievements.filter((a) => a.unlocked).length;
  const pct = total ? (unlocked / total) * 100 : 0;
  return { unlocked, total, pct };
}

function computeLibraryProgress(games: Game[]): { unlocked: number; total: number; pct: number; completedGames: number } {
  const totals = games.reduce(
    (acc, game) => {
      const p = computeProgress(game);
      acc.unlocked += p.unlocked;
      acc.total += p.total;
      if (p.total > 0 && p.unlocked === p.total) acc.completedGames += 1;
      return acc;
    },
    { unlocked: 0, total: 0, completedGames: 0 },
  );
  return {
    ...totals,
    pct: totals.total ? (totals.unlocked / totals.total) * 100 : 0,
  };
}

function sortGames(games: Game[]): Game[] {
  return [...games].sort((a, b) => b.updatedAt - a.updatedAt);
}

function toast(msg: string) {
  const t = el('div', { class: 'pill', style: 'position:fixed; left:14px; right:14px; bottom:14px; z-index:200; justify-content:center; padding:12px 14px; background:rgba(0,0,0,.45); border-color:rgba(255,255,255,.14); backdrop-filter: blur(10px);' }, [msg]);
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}

function applySettingsToDom(settings: Settings) {
  document.documentElement.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  document.documentElement.setAttribute('data-pink', settings.pinkIntensity);
  document.documentElement.setAttribute('data-grid', settings.gridSize);
}

function app() {
  const root = document.querySelector<HTMLDivElement>('#app')!;

  let games = loadGames();
  let settings = loadSettings();
  applySettingsToDom(settings);

  let drawerOpen = false;

  const shell = el('div', { class: 'shell' });

  const topbarTitle = el('div', { class: 'title' }, ['Achievement Garden']);
  const topbarSub = el('div', { class: 'subtitle' }, ['Tiny tracker. Loud pink.']);

  const hamburger = el('button', { class: 'iconbtn', 'aria-label': 'Open menu' });
  hamburger.innerHTML = icon('menu');

  const contextBtn = el('button', { class: 'iconbtn', 'aria-label': 'Action' });
  contextBtn.innerHTML = icon('plus');

  const topbar = el('div', { class: 'topbar' }, [
    el('div', { class: 'row' }, [
      hamburger,
      el('div', { class: 'brand' }, [topbarTitle, topbarSub]),
      contextBtn,
    ]),
  ]);

  const main = el('main', { class: 'main' }, [el('div', { class: 'container' })]);

  // Drawer
  const scrim = el('div', { class: 'scrim', style: 'display:none' });
  const drawer = el('aside', { class: 'drawer' });
  drawer.append(
    el('div', { class: 'h' }, ['Menu']),
    el('div', { class: 'small' }, ['Add games, tweak settings, export data.']),
  );

  const navAdd = el('button', { class: 'navbtn' }, [
    el('span', {}, ['Add game']),
    el('span', { style: 'opacity:.75' }, ['+']),
  ]);
  const navCatalog = el('button', { class: 'navbtn' }, [
    el('span', {}, ['Browse all games']),
    el('span', { style: 'opacity:.75' }, ['→']),
  ]);
  const navSettings = el('button', { class: 'navbtn' }, [
    el('span', {}, ['Settings']),
    el('span', { style: 'opacity:.75' }, ['→']),
  ]);
  const navExport = el('button', { class: 'navbtn' }, [
    el('span', {}, ['Export / Backup']),
    el('span', { style: 'opacity:.75' }, ['↓']),
  ]);
  const navImport = el('button', { class: 'navbtn' }, [
    el('span', {}, ['Import']),
    el('span', { style: 'opacity:.75' }, ['↑']),
  ]);

  drawer.append(navAdd, navCatalog, navSettings, navExport, navImport);

  function setDrawer(open: boolean) {
    drawerOpen = open;
    drawer.classList.toggle('open', open);
    scrim.setAttribute('style', open ? '' : 'display:none');
  }

  scrim.onclick = () => setDrawer(false);
  hamburger.onclick = () => setDrawer(!drawerOpen);

  // Add Game sheet
  function openAddGameSheet() {
    setDrawer(false);

    const sheet = el('div', { class: 'sheet' });
    const sheetScrim = el('div', { class: 'scrim' });
    const panel = el('div', { class: 'sheetpanel' });

    const q = el('input', { class: 'input', placeholder: 'Search games… (title)', inputmode: 'search' }) as HTMLInputElement;

    const chips = el('div', { class: 'chips' });
    let enabled = new Set<Platform>(settings.defaultPlatforms);

    const platformChips: Record<Platform, HTMLButtonElement> = {
      psn: el('button', { class: 'chip', 'aria-pressed': enabled.has('psn') }, ['PlayStation']) as HTMLButtonElement,
      xbox: el('button', { class: 'chip', 'aria-pressed': enabled.has('xbox') }, ['Xbox']) as HTMLButtonElement,
      steam: el('button', { class: 'chip', 'aria-pressed': enabled.has('steam') }, ['Steam']) as HTMLButtonElement,
    };

    (Object.keys(platformChips) as Platform[]).forEach((p) => {
      const b = platformChips[p];
      b.onclick = () => {
        if (enabled.has(p)) enabled.delete(p);
        else enabled.add(p);
        b.setAttribute('aria-pressed', String(enabled.has(p)));
      };
      chips.append(b);
    });

    const resultsWrap = el('div', { class: 'results' });
    const footer = el('div', { class: 'row2', style: 'margin-top:12px' });

    const cancel = el('button', { class: 'btn' }, ['Close']);
    const addSel = el('button', { class: 'btn primary', disabled: true }, ['Add selected']);

    footer.append(cancel, addSel);

    const selected = new Map<string, SearchResult>();

    function renderResults(list: SearchResult[]) {
      resultsWrap.replaceChildren();
      if (!list.length) {
        resultsWrap.append(el('div', { class: 'empty' }, ['No results yet. Try typing a title from the starter catalog, or use Steam / a configured gateway.']));
        return;
      }

      for (const r of list) {
        const key = `${r.platform}::${r.title}`;
        const row = el('div', { class: 'result', dataset: { on: String(selected.has(key)) } });
        const art = el('div', { class: 'art', style: 'width:56px;height:56px;border-radius:16px' });
        art.append(el('img', { src: r.artwork ?? `https://picsum.photos/seed/${encodeURIComponent(key)}/256/256`, alt: '' }));

        const meta = el('div', { style: 'flex:1; min-width:0' }, [
          el('div', { class: 't' }, [r.title]),
          el('div', { class: 's' }, [
            el('span', { class: 'pill' }, [el('span', { class: `badge ${platformDotClass(r.platform)}` }), platformLabel(r.platform)]),
            el('span', { class: 'pill' }, [r.sourceKind === 'steam' ? 'Steam' : r.sourceKind === 'catalog' ? 'Catalog' : 'Gateway']),
          ]),
        ]);

        const check = el('div', { class: 'check' });
        check.innerHTML = '✓';

        row.append(art, meta, check);

        row.onclick = () => {
          const on = selected.has(key);
          if (on) selected.delete(key);
          else selected.set(key, r);
          row.dataset.on = String(!on);
          (addSel as HTMLButtonElement).disabled = selected.size === 0;
          addSel.textContent = selected.size ? `Add selected (${selected.size})` : 'Add selected';
        };

        resultsWrap.append(row);
      }
    }

    let lastController: AbortController | null = null;

    async function doSearch() {
      const query = q.value.trim();
      const plats = Array.from(enabled);
      selected.clear();
      (addSel as HTMLButtonElement).disabled = true;
      addSel.textContent = 'Add selected';

      if (!query) {
        renderResults([]);
        return;
      }

      if (!plats.length) {
        resultsWrap.replaceChildren(el('div', { class: 'empty' }, ['Pick at least one platform to search.']));
        return;
      }

      try {
        lastController?.abort();
        lastController = new AbortController();
        resultsWrap.replaceChildren(el('div', { class: 'empty' }, ['Searching…']));
        // Best-effort; we aren’t wiring abort through providers yet.
        const list = await searchAll(query, plats, settings);
        renderResults(list);
      } catch {
        resultsWrap.replaceChildren(el('div', { class: 'empty' }, ['Search failed (CORS or network). Tip: set a Cloudflare gateway URL in Settings.']));
      }
    }

    const searchBtn = el('button', { class: 'btn primary', style: 'width:42px;height:46px;display:grid;place-items:center;border-radius:16px' });
    searchBtn.innerHTML = 'Go';
    searchBtn.onclick = doSearch;

    const headerRow = el('div', { class: 'row2' }, [q, searchBtn]);

    q.oninput = () => {
      // small debounce
      const v = q.value;
      setTimeout(() => {
        if (q.value === v) doSearch();
      }, 220);
    };

    cancel.onclick = () => sheet.remove();
    sheetScrim.onclick = () => sheet.remove();

    addSel.onclick = async () => {
      const list = Array.from(selected.values());
      if (!list.length) return;
      addSel.setAttribute('disabled', '');
      addSel.textContent = 'Adding…';

      for (const r of list) {
        const g = await makeGameFromResult(r, settings);
        games = sortGames([g, ...games]);
      }
      saveGames(games);
      toast(`Added ${list.length} game${list.length === 1 ? '' : 's'}.`);
      sheet.remove();
      render();
    };

    panel.append(
      el('div', { class: 'h1', style: 'margin:4px 2px 10px' }, ['Add games']),
      headerRow,
      chips,
      resultsWrap,
      footer,
      el('div', { style: 'margin-top:10px; color: rgba(247,239,255,.55); font-size:12px; line-height:1.35' }, [
        'Notes: Public trophy sites usually block direct browser scraping. For real PSN/Xbox trophy imports, set a ',
        el('span', { style: 'color: rgba(255,122,215,.9)' }, ['Cloudflare gateway URL']),
        ' in Settings (you can deploy the included Worker template later).',
      ]),
    );

    sheet.append(sheetScrim, panel);
    document.body.append(sheet);

    q.focus();
    renderResults([]);
  }

  contextBtn.onclick = () => {
    const r = parseRoute();
    if (r.name === 'library') openAddGameSheet();
    else setRoute({ name: 'library' });
  };

  navAdd.onclick = openAddGameSheet;
  navCatalog.onclick = () => {
    setDrawer(false);
    setRoute({ name: 'catalog' });
  };
  navSettings.onclick = () => {
    setDrawer(false);
    setRoute({ name: 'settings' });
  };

  navExport.onclick = async () => {
    setDrawer(false);
    try {
      const data = exportAll();
      await navigator.clipboard.writeText(data);
      toast('Export copied to clipboard.');
    } catch {
      // fallback: download
      const data = exportAll();
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `achievement-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Export downloaded.');
    }
  };

  navImport.onclick = () => {
    setDrawer(false);
    const sheet = el('div', { class: 'sheet' });
    const sheetScrim = el('div', { class: 'scrim' });
    const panel = el('div', { class: 'sheetpanel' });

    const ta = el('textarea', { class: 'input', style: 'height: 40vh; resize:none', placeholder: 'Paste export JSON here…' }) as HTMLTextAreaElement;
    const close = el('button', { class: 'btn' }, ['Close']);
    const go = el('button', { class: 'btn primary' }, ['Import']);

    close.onclick = () => sheet.remove();
    sheetScrim.onclick = () => sheet.remove();

    go.onclick = () => {
      try {
        const { gamesImported } = importAll(ta.value);
        games = loadGames();
        settings = loadSettings();
        applySettingsToDom(settings);
        toast(`Imported ${gamesImported} games.`);
        sheet.remove();
        render();
      } catch (e: any) {
        toast(e?.message ?? 'Import failed.');
      }
    };

    panel.append(
      el('div', { class: 'h1', style: 'margin:4px 2px 10px' }, ['Import backup']),
      ta,
      el('div', { class: 'row2', style: 'margin-top:12px' }, [close, go]),
    );

    sheet.append(sheetScrim, panel);
    document.body.append(sheet);
    ta.focus();
  };

  async function addCatalogGameToLibrary(catalogId: string) {
    const { loadCatalogById, cloneCatalogGameToLibrary } = await loadCatalogModule();
    const byId = await loadCatalogById();
    const sourceGame = byId.get(catalogId);
    if (!sourceGame) {
      toast('Catalog game not found.');
      return;
    }
    const alreadyInLibrary = games.some((g) => g.source?.kind === 'catalog' && g.source.externalId === catalogId);
    if (alreadyInLibrary) {
      toast('This game is already in your library.');
      return;
    }
    games = sortGames([cloneCatalogGameToLibrary(sourceGame), ...games]);
    saveGames(games);
    toast(`Added ${sourceGame.title}.`);
    render();
  }

  async function syncSingleSteamGame(game: Game) {
    if (!settings.steamProfileUrl) {
      toast('Set your Steam profile URL in Settings first.');
      setRoute({ name: 'settings' });
      return;
    }
    try {
      const profile = await resolveSteamProfile(settings.steamProfileUrl);
      const result = await syncSteamGameFromProfile(game, profile);
      saveGames(games);
      toast(`Synced ${game.title}: ${result.matchedCount}/${game.achievements.length} unlocked.`);
      render();
    } catch (e: any) {
      toast(e?.message ?? 'Steam sync failed.');
    }
  }

  async function syncAllSteamGames() {
    const syncableGames = games.filter(steamGameLooksSyncable);
    if (!syncableGames.length) {
      toast('No syncable Steam games in your library yet.');
      return;
    }
    if (!settings.steamProfileUrl) {
      toast('Set your Steam profile URL in Settings first.');
      setRoute({ name: 'settings' });
      return;
    }

    try {
      const profile = await resolveSteamProfile(settings.steamProfileUrl);
      let ok = 0;
      for (const game of syncableGames) {
        try {
          await syncSteamGameFromProfile(game, profile);
          ok += 1;
        } catch {
          // keep going; some owned games may not expose public stats pages
        }
      }
      saveGames(games);
      toast(`Steam sync finished: ${ok}/${syncableGames.length} games updated.`);
      render();
    } catch (e: any) {
      toast(e?.message ?? 'Steam sync failed.');
    }
  }

  async function importOwnedSteamLibrary() {
    if (!settings.steamProfileUrl) {
      toast('Add your Steam profile URL first.');
      setRoute({ name: 'settings' });
      return;
    }
    if (!settings.steamWebApiKey) {
      toast('Add a Steam Web API key first.');
      setRoute({ name: 'settings' });
      return;
    }

    try {
      const profile = await resolveSteamProfile(settings.steamProfileUrl);
      const ownedGames = await fetchOwnedSteamGames(profile, settings.steamWebApiKey);
      if (!ownedGames.length) {
        toast('No owned Steam games came back from Steam.');
        return;
      }

      let added = 0;
      let updated = 0;
      for (const owned of ownedGames) {
        const existing = games.find((g) => g.platform === 'steam' && g.source?.externalId === owned.appId);
        try {
          const achievements = await fetchSteamAchievementsForProfileApp(profile, owned.appId);
          if (existing) {
            existing.achievements = achievements;
            existing.artwork = existing.artwork ?? owned.artwork;
            existing.source = {
              kind: 'steam',
              externalId: owned.appId,
              url: `${profile.profileBase}/stats/${owned.appId}/achievements/`,
            };
            existing.updatedAt = now();
            updated += 1;
            continue;
          }

          games = sortGames([
            {
              id: uid('game'),
              platform: 'steam',
              title: owned.title,
              artwork: owned.artwork,
              status: 'to-play',
              source: {
                kind: 'steam',
                externalId: owned.appId,
                url: `${profile.profileBase}/stats/${owned.appId}/achievements/`,
              },
              achievements,
              createdAt: now(),
              updatedAt: now(),
            },
            ...games,
          ]);
          added += 1;
        } catch {
          // Skip apps whose public stats page cannot be parsed.
        }
      }

      saveGames(games);
      toast(`Steam library import finished: ${added} added, ${updated} updated.`);
      render();
    } catch (e: any) {
      toast(e?.message ?? 'Steam library import failed.');
    }
  }

  function renderLibrary(container: HTMLElement) {
    topbarTitle.textContent = 'Achievement Garden';
    topbarSub.textContent = `${games.length} game${games.length === 1 ? '' : 's'} in your library`;
    contextBtn.innerHTML = icon('plus');

    const libraryProgress = computeLibraryProgress(games);

    container.append(el('div', { class: 'h1' }, ['Library']));

    if (games.length) {
      const syncableSteamCount = games.filter(steamGameLooksSyncable).length;
      container.append(
        el('div', { class: 'card', style: 'margin-bottom:14px' }, [
          el('div', { class: 'game', style: 'flex-direction:column; gap:12px' }, [
            el('div', { class: 'row2', style: 'align-items:flex-end' }, [
              el('div', {}, [
                el('div', { class: 'gtitle' }, ['Total progress']),
                el('div', { class: 'gsub' }, [`${libraryProgress.completedGames}/${games.length} completed games`]),
              ]),
              el('div', { class: 'pill' }, [`${libraryProgress.unlocked}/${libraryProgress.total}`]),
            ]),
            el('div', { class: 'progress' }, [
              el('div', { class: 'bar' }, [el('div', { class: 'fill', style: `width:${clamp(libraryProgress.pct, 0, 100)}%` })]),
              el('div', { class: 'kpi' }, [`${formatPct(libraryProgress.pct)} unlocked across your whole library`]),
            ]),
            el('div', { style: 'display:flex; gap:10px; flex-wrap:wrap' }, [
              ...(syncableSteamCount ? [
                el('button', { class: 'btn', onclick: () => { void syncAllSteamGames(); } }, [`Sync all Steam games (${syncableSteamCount})`]),
              ] : []),
              el('button', { class: 'btn', onclick: () => { void importOwnedSteamLibrary(); } }, ['Import owned Steam library']),
            ]),
          ]),
        ]),
      );
    }

    if (!games.length) {
      container.append(
        el('div', { class: 'empty' }, [
          el('div', { style: 'font-weight:700; margin-bottom:6px; color: rgba(247,239,255,.9)' }, ['Start a library.']),
          'Tap + to add a game. This app works offline, and sync is optional.',
        ]),
      );
      return;
    }

    const groups = [
      { key: 'currently-playing', label: 'Currently Playing' },
      { key: 'backlog', label: 'Backlog' },
      { key: 'to-play', label: 'To Play' },
      { key: 'wont-revisit', label: "Won’t Revisit" },
    ] as const;

    for (const group of groups) {
      const items = sortGames(games).filter((g) => (g.status ?? 'to-play') === group.key);
      const section = el('section', { class: 'shelf' });
      const isCollapsed = Boolean(settings.collapsedShelves[group.key]);
      const header = el('button', {
        class: 'shelfhead',
        style: 'width:100%; background:transparent; border:0; padding:0; text-align:left; cursor:pointer; color:rgba(247,239,255,.96)',
        onclick: () => {
          settings.collapsedShelves = {
            ...settings.collapsedShelves,
            [group.key]: !Boolean(settings.collapsedShelves[group.key]),
          };
          saveSettings(settings);
          render();
        },
      }, [
        el('div', { class: 'h1', style: 'margin: 6px 0 8px' }, [group.label]),
        el('div', { style: 'display:flex; align-items:center; gap:8px' }, [
          el('span', { class: 'pill' }, [`${items.length}`]),
          el('span', { class: 'pill' }, [isCollapsed ? 'Show' : 'Hide']),
        ]),
      ]);
      section.append(header);

      if (isCollapsed) {
        container.append(section);
        continue;
      }

      if (!items.length) {
        section.append(el('div', { class: 'empty' }, [`No games in ${group.label.toLowerCase()} yet.`]));
        container.append(section);
        continue;
      }

      const grid = el('div', { class: 'grid' });

      for (const g of items) {
        const p = computeProgress(g);
        const card = el('div', { class: 'card' });
        const row = el('div', { class: 'game' });

        const art = el('div', { class: 'art' });
        art.append(el('img', { src: g.artwork ?? `https://picsum.photos/seed/${encodeURIComponent(g.title)}/512/512`, alt: '' }));

        const meta = el('div', { class: 'meta' });
        const platformDetail = gamePlatformDetailLabel(g);
        meta.append(
          el('div', { class: 'gtitle' }, [g.title]),
          el('div', { class: 'gsub' }, [
            el('span', { class: 'pill' }, [el('span', { class: `badge ${platformDotClass(g.platform)}` }), platformLabel(g.platform)]),
            ...(platformDetail ? [el('span', { class: 'pill' }, [platformDetail])] : []),
            el('button', { class: 'pill ghostpill', onclick: (ev: Event) => {
              ev.preventDefault();
              ev.stopPropagation();
              g.status = nextGameStatus(g.status);
              g.updatedAt = now();
              saveGames(games);
              render();
            } }, [gameStatusLabel(g.status)]),
          ]),
          el('div', { class: 'progress' }, [
            el('div', { class: 'bar' }, [el('div', { class: 'fill', style: `width:${clamp(p.pct, 0, 100)}%` })]),
            el('div', { class: 'kpi' }, [`${p.unlocked}/${p.total}  ${formatPct(p.pct)}`]),
          ]),
        );

        row.append(art, meta);
        card.append(row);
        card.onclick = () => setRoute({ name: 'game', id: g.id });
        grid.append(card);
      }

      section.append(grid);
      container.append(section);
    }
  }

  function toggleAchievement(g: Game, achId: string) {
    const a = g.achievements.find((x) => x.id === achId);
    if (!a) return;
    a.unlocked = !a.unlocked;
    g.updatedAt = now();
    saveGames(games);
  }

  function achievementMeta(a: Achievement): HTMLElement {
    if (a.platform === 'psn' && a.psn) return el('span', { class: `tier ${a.psn.tier}` }, [psnTierLabel(a.psn.tier)]);
    if (a.platform === 'xbox' && a.xbox) return el('span', { class: 'pill' }, [`${a.xbox.gamerscore}G`]);
    if (a.platform === 'steam' && a.steam) return el('span', { class: 'pill' }, [`${a.steam.points} pts`]);
    return el('span', { class: 'pill' }, ['Achievement']);
  }

  function renderGame(container: HTMLElement, id: string) {
    const g = games.find((x) => x.id === id);
    if (!g) {
      container.append(el('div', { class: 'empty' }, ['Game not found.']));
      return;
    }

    const prog = computeProgress(g);
    topbarTitle.textContent = g.title;
    topbarSub.textContent = `${platformLabel(g.platform)} • ${prog.unlocked}/${prog.total} • ${formatPct(prog.pct)}`;
    contextBtn.innerHTML = icon('arrow-left');
    contextBtn.onclick = () => setRoute({ name: 'library' });

    const platformDetail = gamePlatformDetailLabel(g);

    const page = el('div', { class: 'detailpage' });

    const header = el('div', { class: 'card detailhero', style: 'margin-bottom:12px' }, [
      el('div', { class: 'game' }, [
        el('div', { class: 'art', style: 'width: 96px; height: 96px' }, [
          el('img', { src: g.artwork ?? `https://picsum.photos/seed/${encodeURIComponent(g.title + g.platform)}/512/512`, alt: '' }),
        ]),
        el('div', { class: 'meta' }, [
          el('div', { class: 'gtitle' }, [g.title]),
          el('div', { class: 'gsub' }, [
            el('span', { class: 'pill' }, [el('span', { class: `badge ${platformDotClass(g.platform)}` }), platformLabel(g.platform)]),
            ...(platformDetail ? [el('span', { class: 'pill' }, [platformDetail])] : []),
            el('button', { class: 'pill ghostpill', onclick: (ev: Event) => {
              ev.preventDefault();
              ev.stopPropagation();
              g.status = nextGameStatus(g.status);
              g.updatedAt = now();
              saveGames(games);
              render();
            } }, [gameStatusLabel(g.status)]),
            g.source?.url ? el('a', { class: 'pill', href: g.source.url, target: '_blank', rel: 'noreferrer' }, ['source ↗']) : null,
          ].filter(Boolean) as HTMLElement[]),
          el('div', { class: 'progress' }, [
            el('div', { class: 'bar' }, [el('div', { class: 'fill', style: `width:${clamp(prog.pct, 0, 100)}%` })]),
            el('div', { class: 'kpi' }, [`${prog.unlocked}/${prog.total}  ${formatPct(prog.pct)}`]),
          ]),
          el('div', { style: 'margin-top:10px; display:flex; gap:10px; flex-wrap:wrap' }, [
            ...(steamGameLooksSyncable(g) ? [
              el('button', { class: 'btn', onclick: () => { void syncSingleSteamGame(g); } }, ['Sync Steam achievements']),
            ] : []),
            el('button', { class: 'btn danger', onclick: () => {
              if (!confirm('Remove this game from your library?')) return;
              games = games.filter((x) => x.id !== g.id);
              saveGames(games);
              toast('Removed.');
              setRoute({ name: 'library' });
            } }, ['Remove game']),
          ]),
        ]),
      ]),
    ]);

    page.append(header);

    const list = el('div', { class: 'achList' });

    for (const a of g.achievements) {
      const row = el('div', { class: 'ach', dataset: { unlocked: String(a.unlocked) } });
      const img = el('div', { class: 'aimg' });
      img.append(el('img', { src: a.image ?? `https://picsum.photos/seed/${encodeURIComponent(a.title)}/256/256`, alt: '' }));

      const achievementBits = [
        achievementMeta(a),
        ...(typeof a.rarity === 'number' ? [el('span', { class: 'pill' }, [`Rarity ${a.rarity.toFixed(1)}%`])] : []),
        el('span', { class: 'pill' }, [a.unlocked ? 'Unlocked' : 'Locked']),
      ];

      const meta = el('div', { style: 'flex:1; min-width:0' }, [
        el('div', { class: 'at' }, [a.title]),
        el('div', { class: 'ad' }, [a.description || '—']),
        el('div', { class: 'ar' }, achievementBits),
      ]);

      row.append(img, meta);
      row.onclick = () => {
        toggleAchievement(g, a.id);
        row.dataset.unlocked = String(!a.unlocked);
        render();
      };

      list.append(row);
    }

    page.append(el('div', { class: 'h1', style: 'margin-top:14px' }, ['Achievements']));
    page.append(list);
    container.append(page);
  }

  async function renderCatalog(container: HTMLElement) {
    container.replaceChildren();
    topbarTitle.textContent = 'Catalog';
    topbarSub.textContent = 'Browse every game in the database';
    contextBtn.innerHTML = icon('arrow-left');
    contextBtn.onclick = () => setRoute({ name: 'library' });

    const { loadCatalogGames } = await loadCatalogModule();
    const sorted = [...await loadCatalogGames()].sort((a, b) => a.title.localeCompare(b.title));
    const counts = sorted.reduce((acc, game) => {
      acc[game.platform] += 1;
      return acc;
    }, { psn: 0, xbox: 0, steam: 0 });

    container.append(el('div', { class: 'h1' }, ['All games']));
    container.append(
      el('div', { class: 'card', style: 'margin-bottom:14px' }, [
        el('div', { class: 'game', style: 'flex-direction:column; gap:12px' }, [
          el('div', { class: 'row2', style: 'align-items:flex-end' }, [
            el('div', {}, [
              el('div', { class: 'gtitle' }, ['Database overview']),
              el('div', { class: 'gsub' }, [`${sorted.length} catalogued games ready to browse`]),
            ]),
            el('div', { class: 'pill' }, [String(sorted.length)]),
          ]),
          el('div', { style: 'display:flex; gap:10px; flex-wrap:wrap' }, [
            el('span', { class: 'pill' }, [`Steam ${counts.steam}`]),
            el('span', { class: 'pill' }, [`PlayStation ${counts.psn}`]),
            el('span', { class: 'pill' }, [`Xbox ${counts.xbox}`]),
          ]),
        ]),
      ]),
    );

    const grid = el('div', { class: 'grid' });
    for (const g of sorted) {
      const card = el('div', { class: 'card' });
      const row = el('div', { class: 'game' });
      const art = el('div', { class: 'art' });
      art.append(el('img', { src: g.artwork ?? `https://picsum.photos/seed/${encodeURIComponent(g.title)}/512/512`, alt: '' }));
      const inLibrary = games.some((game) => game.source?.kind === 'catalog' && game.source.externalId === g.id);
      const meta = el('div', { class: 'meta' }, [
        el('div', { class: 'gtitle' }, [g.title]),
        el('div', { class: 'gsub' }, [
          el('span', { class: 'pill' }, [el('span', { class: `badge ${platformDotClass(g.platform)}` }), platformLabel(g.platform)]),
          el('span', { class: 'pill' }, [`${g.achievements.length} achievements`]),
          ...(inLibrary ? [el('span', { class: 'pill' }, ['In library'])] : []),
        ]),
      ]);
      row.append(art, meta);
      card.append(row);
      card.onclick = () => setRoute({ name: 'catalog-game', id: g.id });
      grid.append(card);
    }
    container.append(grid);
  }

  async function renderCatalogGame(container: HTMLElement, id: string) {
    container.replaceChildren();
    const { loadCatalogById, cloneCatalogGameToLibrary } = await loadCatalogModule();
    const byId = await loadCatalogById();
    const g = byId.get(id);
    if (!g) {
      container.append(el('div', { class: 'empty' }, ['Catalog game not found.']));
      return;
    }

    const preview = cloneCatalogGameToLibrary(g);
    const inLibrary = games.some((game) => game.source?.kind === 'catalog' && game.source.externalId === g.id);
    const prog = computeProgress(preview);
    topbarTitle.textContent = g.title;
    topbarSub.textContent = `${platformLabel(g.platform)} • ${prog.total} achievements`;
    contextBtn.innerHTML = icon('arrow-left');
    contextBtn.onclick = () => setRoute({ name: 'catalog' });

    const platformDetail = gamePlatformDetailLabel(preview);
    const page = el('div', { class: 'detailpage' });
    const header = el('div', { class: 'card detailhero', style: 'margin-bottom:12px' }, [
      el('div', { class: 'game' }, [
        el('div', { class: 'art', style: 'width: 96px; height: 96px' }, [
          el('img', { src: g.artwork ?? `https://picsum.photos/seed/${encodeURIComponent(g.title + g.platform)}/512/512`, alt: '' }),
        ]),
        el('div', { class: 'meta' }, [
          el('div', { class: 'gtitle' }, [g.title]),
          el('div', { class: 'gsub' }, [
            el('span', { class: 'pill' }, [el('span', { class: `badge ${platformDotClass(g.platform)}` }), platformLabel(g.platform)]),
            ...(platformDetail ? [el('span', { class: 'pill' }, [platformDetail])] : []),
            el('span', { class: 'pill' }, [`${g.achievements.length} achievements`]),
            ...(inLibrary ? [el('span', { class: 'pill' }, ['Already in library'])] : []),
            g.sourceUrl ? el('a', { class: 'pill', href: g.sourceUrl, target: '_blank', rel: 'noreferrer' }, ['source ↗']) : null,
          ].filter(Boolean) as HTMLElement[]),
          el('div', { style: 'margin-top:10px; display:flex; gap:10px; flex-wrap:wrap' }, [
            ...(inLibrary ? [] : [el('button', { class: 'btn primary', onclick: () => { void addCatalogGameToLibrary(g.id); } }, ['Add to library'])]),
            el('button', { class: 'btn', onclick: () => setRoute({ name: 'catalog' }) }, ['Back to catalog']),
          ]),
        ]),
      ]),
    ]);
    page.append(header);

    const list = el('div', { class: 'achList' });
    for (const a of g.achievements) {
      const row = el('div', { class: 'ach', dataset: { unlocked: 'false' } });
      const img = el('div', { class: 'aimg' });
      img.append(el('img', { src: a.image ?? `https://picsum.photos/seed/${encodeURIComponent(a.title)}/256/256`, alt: '' }));
      const bits = [
        achievementMeta(a),
        ...(typeof a.rarity === 'number' ? [el('span', { class: 'pill' }, [`Rarity ${a.rarity.toFixed(1)}%`])] : []),
      ];
      const meta = el('div', { style: 'flex:1; min-width:0' }, [
        el('div', { class: 'at' }, [a.title]),
        el('div', { class: 'ad' }, [a.description || '—']),
        el('div', { class: 'ar' }, bits),
      ]);
      row.append(img, meta);
      list.append(row);
    }
    page.append(el('div', { class: 'h1', style: 'margin-top:14px' }, ['Achievements']));
    page.append(list);
    container.append(page);
  }

  function renderSettings(container: HTMLElement) {
    topbarTitle.textContent = 'Settings';
    topbarSub.textContent = 'Make it feel right on mobile';
    contextBtn.innerHTML = icon('arrow-left');
    contextBtn.onclick = () => setRoute({ name: 'library' });

    const card = el('div', { class: 'card' }, [el('div', { class: 'game', style: 'flex-direction:column; gap:12px' })]);
    const body = card.querySelector('.game') as HTMLElement;

    const reduce = el('button', { class: 'navbtn' }, [
      el('span', {}, ['Reduce motion']),
      el('span', { style: 'opacity:.75' }, [settings.reduceMotion ? 'On' : 'Off']),
    ]);
    reduce.onclick = () => {
      settings.reduceMotion = !settings.reduceMotion;
      saveSettings(settings);
      applySettingsToDom(settings);
      render();
    };

    const theme = el('button', { class: 'navbtn' }, [
      el('span', {}, ['Pink intensity']),
      el('span', { style: 'opacity:.75' }, [settings.pinkIntensity === 'loud' ? 'Loud' : 'Soft']),
    ]);
    theme.onclick = () => {
      settings.pinkIntensity = settings.pinkIntensity === 'loud' ? 'soft' : 'loud';
      saveSettings(settings);
      applySettingsToDom(settings);
      render();
    };

    const gridSize = el('button', { class: 'navbtn' }, [
      el('span', {}, ['Game grid size']),
      el('span', { style: 'opacity:.75' }, [settings.gridSize === 'compact' ? 'Compact' : settings.gridSize === 'large' ? 'Large' : 'Default']),
    ]);
    gridSize.onclick = () => {
      settings.gridSize = settings.gridSize === 'default' ? 'compact' : settings.gridSize === 'compact' ? 'large' : 'default';
      saveSettings(settings);
      applySettingsToDom(settings);
      render();
    };

    const collapseReset = el('button', { class: 'navbtn' }, [
      el('span', {}, ['Reset shelf drawers']),
      el('span', { style: 'opacity:.75' }, ['Open all']),
    ]);
    collapseReset.onclick = () => {
      settings.collapsedShelves = {};
      saveSettings(settings);
      render();
    };

    const steamProfile = el('div', { style: 'display:grid; gap:8px' }, [
      el('div', { style: 'font-weight:700' }, ['Steam profile sync']),
      el('div', { style: 'color: rgba(247,239,255,.62); font-size:12px; line-height:1.35' }, [
        'Paste your public Steam Community profile URL to enable per-game sync and library import. Nothing is prefilled now.',
      ]),
    ]);
    const steamProfileInput = el('input', { class: 'input', placeholder: 'Enter your Steam Community profile URL', value: settings.steamProfileUrl }) as HTMLInputElement;
    const steamProfileSave = el('button', { class: 'btn primary' }, ['Save Steam profile']);
    steamProfileSave.onclick = async () => {
      try {
        const profile = await resolveSteamProfile(steamProfileInput.value.trim());
        settings.steamProfileUrl = profile.profileUrl;
        saveSettings(settings);
        toast(`Saved Steam profile${profile.displayName ? ` for ${profile.displayName}` : ''}.`);
        render();
      } catch (e: any) {
        toast(e?.message ?? 'Could not validate Steam profile.');
      }
    };
    steamProfile.append(steamProfileInput, steamProfileSave);

    const steamApi = el('div', { style: 'display:grid; gap:8px' }, [
      el('div', { style: 'font-weight:700' }, ['Steam Web API key (for owned-library import)']),
      el('div', { style: 'color: rgba(247,239,255,.62); font-size:12px; line-height:1.35' }, [
        'Needed for importing all owned Steam games. This is stored locally in the browser for now.',
      ]),
    ]);
    const steamApiInput = el('input', { class: 'input', placeholder: 'Enter Steam Web API key', value: settings.steamWebApiKey }) as HTMLInputElement;
    const steamApiSave = el('button', { class: 'btn primary' }, ['Save Steam API key']);
    steamApiSave.onclick = () => {
      settings.steamWebApiKey = steamApiInput.value.trim();
      saveSettings(settings);
      toast('Saved.');
    };
    steamApi.append(steamApiInput, steamApiSave);

    const gateway = el('div', { style: 'display:grid; gap:8px' }, [
      el('div', { style: 'font-weight:700' }, ['Data gateway (optional)']),
      el('div', { style: 'color: rgba(247,239,255,.62); font-size:12px; line-height:1.35' }, [
        'To pull achievements from public sites (PSN trophy lists etc.), use a proxy/gateway (recommended: Cloudflare Worker).',
      ]),
    ]);
    const gatewayInput = el('input', { class: 'input', placeholder: 'https://your-worker.yourname.workers.dev', value: settings.dataGatewayUrl }) as HTMLInputElement;
    const gatewaySave = el('button', { class: 'btn primary' }, ['Save gateway']);
    gatewaySave.onclick = () => {
      settings.dataGatewayUrl = gatewayInput.value.trim();
      saveSettings(settings);
      toast('Saved.');
    };

    gateway.append(gatewayInput, gatewaySave);

    const danger = el('button', { class: 'btn danger' }, ['Reset local data']);
    danger.onclick = () => {
      if (!confirm('This will delete your library on this device. Continue?')) return;
      localStorage.clear();
      games = [];
      settings = loadSettings();
      applySettingsToDom(settings);
      toast('Reset.');
      render();
    };

    body.append(
      el('div', { class: 'h1', style: 'margin:0' }, ['Tuning']),
      reduce,
      theme,
      gridSize,
      collapseReset,
      steamProfile,
      steamApi,
      gateway,
      el('div', { style: 'height:1px; background: rgba(255,255,255,.08); margin: 6px 0' }),
      danger,
    );

    container.append(card);
  }

  function render() {
    const container = main.querySelector('.container') as HTMLElement;
    container.replaceChildren();

    // restore context button handler based on route
    contextBtn.onclick = () => {
      const r = parseRoute();
      if (r.name === 'library') openAddGameSheet();
      else setRoute({ name: 'library' });
    };

    const r = parseRoute();
    if (r.name === 'library') renderLibrary(container);
    if (r.name === 'settings') renderSettings(container);
    if (r.name === 'game') renderGame(container, decodeURIComponent(r.id));
    if (r.name === 'catalog') {
      container.append(el('div', { class: 'empty' }, ['Loading catalog…']));
      void renderCatalog(container);
    }
    if (r.name === 'catalog-game') {
      container.append(el('div', { class: 'empty' }, ['Loading game…']));
      void renderCatalogGame(container, decodeURIComponent(r.id));
    }
  }

  window.addEventListener('hashchange', render);

  shell.append(topbar, main, scrim, drawer);
  root.append(shell);

  render();
}

app();
