import type { Achievement, Game } from './types';

export type SteamProfile = {
  profileUrl: string;
  profileBase: string;
  steamId64?: string;
  displayName?: string;
};

export type SteamOwnedGame = {
  appId: string;
  title: string;
  artwork?: string;
  logo?: string;
  playtimeMinutes?: number;
};

function decodeHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function normalizeText(input: string): string {
  return decodeHtml(input)
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeSteamProfileUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/+$/, '');
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2 || !['id', 'profiles'].includes(parts[0])) {
    throw new Error('Use a Steam Community profile URL like https://steamcommunity.com/id/yourname');
  }
  url.pathname = `/${parts[0]}/${parts[1]}`;
  return url.toString().replace(/\/$/, '');
}

export async function resolveSteamProfile(input: string): Promise<SteamProfile> {
  const profileUrl = normalizeSteamProfileUrl(input);
  const xmlUrl = `${profileUrl}?xml=1`;
  const res = await fetch(xmlUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-steam-sync/0.1)',
      'accept-language': 'en-GB,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Steam profile lookup failed (${res.status})`);
  const xml = await res.text();
  const steamId64 = xml.match(/<steamID64>([^<]+)<\/steamID64>/i)?.[1]?.trim();
  const displayName = xml.match(/<steamID><!\[CDATA\[([\s\S]*?)\]\]><\/steamID>/i)?.[1]?.trim();
  return { profileUrl, profileBase: profileUrl, steamId64, displayName };
}

export function getSteamAppId(game: Game): string | undefined {
  if (game.platform !== 'steam') return undefined;
  const values = [game.source?.externalId, game.source?.url];
  for (const value of values) {
    if (!value) continue;
    const match = String(value).match(/(?:\/app\/|\/stats\/)(\d+)/);
    if (match?.[1]) return match[1];
    if (/^\d+$/.test(String(value))) return String(value);
  }
  return undefined;
}

export type SteamSyncResult = {
  unlockedCount: number;
  totalCount: number;
  matchedCount: number;
  statsUrl: string;
};

export async function syncSteamGameFromProfile(game: Game, profile: SteamProfile): Promise<SteamSyncResult> {
  const appId = getSteamAppId(game);
  if (!appId) throw new Error('This Steam game is missing an app ID, so it cannot be synced yet.');

  const statsUrl = `${profile.profileBase}/stats/${appId}/achievements/`;
  const res = await fetch(statsUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-steam-sync/0.1)',
      'accept-language': 'en-GB,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Steam achievement page failed (${res.status})`);
  const html = await res.text();
  if (/<title>\s*Steam Community :: Error\s*<\/title>/i.test(html)) {
    throw new Error('Steam returned an error page. You may not own this game, or its stats page is not public.');
  }

  const rows = [...html.matchAll(/<div[^>]+class="achieveRow[^"]*">([\s\S]*?)<div style="clear: both;">\s*<\/div>\s*<\/div>/g)];
  if (!rows.length) throw new Error('Could not parse the Steam achievement page.');

  const unlockedTitles = new Set<string>();
  for (const row of rows) {
    const block = row[1];
    const title = normalizeText(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? '');
    const hasUnlockTime = /class="achieveUnlockTime"/i.test(block);
    if (title && hasUnlockTime) unlockedTitles.add(title.toLowerCase());
  }

  let matchedCount = 0;
  for (const achievement of game.achievements) {
    const isUnlocked = unlockedTitles.has(achievement.title.trim().toLowerCase());
    if (isUnlocked) matchedCount += 1;
    achievement.unlocked = isUnlocked;
  }

  const sourceUrl = game.source?.url;
  if (!sourceUrl || /store\.steampowered\.com/.test(sourceUrl)) {
    game.source = {
      ...(game.source ?? { kind: 'steam' as const }),
      kind: 'steam',
      externalId: appId,
      url: statsUrl,
    };
  }

  game.updatedAt = Date.now();

  return {
    unlockedCount: unlockedTitles.size,
    totalCount: rows.length,
    matchedCount,
    statsUrl,
  };
}

export function steamGameLooksSyncable(game: Game): boolean {
  return game.platform === 'steam' && Boolean(getSteamAppId(game)) && game.achievements.length > 0;
}

export function buildSteamStatsUrl(profileBase: string, appId: string): string {
  return `${profileBase.replace(/\/$/, '')}/stats/${appId}/achievements/`;
}

export function gameMatchesSteamTitle(game: Game, ownedTitle: string): boolean {
  const left = game.title.trim().toLowerCase();
  const right = ownedTitle.trim().toLowerCase();
  return left === right || new RegExp(`^${escapeRegExp(left)}(?:\\s*edition)?$`, 'i').test(right);
}

export async function fetchOwnedSteamGames(profile: SteamProfile, apiKey: string): Promise<SteamOwnedGame[]> {
  if (!profile.steamId64) throw new Error('Could not resolve your SteamID64 from that profile URL.');
  const key = apiKey.trim();
  if (!key) throw new Error('Add a Steam Web API key first.');

  const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
  url.searchParams.set('key', key);
  url.searchParams.set('steamid', profile.steamId64);
  url.searchParams.set('include_appinfo', '1');
  url.searchParams.set('include_played_free_games', '1');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-steam-sync/0.1)',
      'accept': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Steam owned-games request failed (${res.status}).`);
  }
  const json = await res.json() as any;
  const games = Array.isArray(json?.response?.games) ? json.response.games : [];
  return games.map((g: any) => ({
    appId: String(g.appid),
    title: String(g.name ?? `Steam App ${g.appid}`),
    artwork: typeof g.img_icon_url === 'string' && g.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
      : `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
    logo: typeof g.img_logo_url === 'string' && g.img_logo_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_logo_url}.jpg`
      : undefined,
    playtimeMinutes: typeof g.playtime_forever === 'number' ? g.playtime_forever : undefined,
  }));
}

export async function fetchSteamAchievementsForProfileApp(profile: SteamProfile, appId: string): Promise<Achievement[]> {
  const statsUrl = buildSteamStatsUrl(profile.profileBase, appId);
  const res = await fetch(statsUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-steam-sync/0.1)',
      'accept-language': 'en-GB,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Steam achievement page failed (${res.status})`);
  const html = await res.text();
  if (/<title>\s*Steam Community :: Error\s*<\/title>/i.test(html)) {
    throw new Error('Steam returned an error page for that game.');
  }

  const rows = [...html.matchAll(/<div[^>]+class="achieveRow[^"]*">([\s\S]*?)<div style="clear: both;">\s*<\/div>\s*<\/div>/g)];
  if (!rows.length) throw new Error('Could not parse the Steam achievement page.');

  return rows.map((row, index) => {
    const block = row[1];
    const title = normalizeText(block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? 'Achievement');
    const description = normalizeText(block.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i)?.[1] ?? '');
    const image = block.match(/<img src="([^"]+)"/i)?.[1];
    const unlocked = /class="achieveUnlockTime"/i.test(block);
    return {
      id: `steam-${appId}-${String(index + 1).padStart(3, '0')}`,
      platform: 'steam' as const,
      title,
      description,
      image,
      unlocked,
    } satisfies Achievement;
  });
}
