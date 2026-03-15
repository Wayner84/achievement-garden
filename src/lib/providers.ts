import type { Achievement, Game, Platform, Settings } from './types';
import { uid, now } from './util';
import { CATALOG_BY_ID, CATALOG_GAMES, cloneCatalogGameToLibrary } from './catalog';

export type SearchResult = {
  platform: Platform;
  title: string;
  artwork?: string;
  externalId?: string;
  url?: string;
  sourceKind: NonNullable<Game['source']>['kind'];
};

export type Provider = {
  id: string;
  label: string;
  platforms: Platform[];
  search: (q: string, platforms: Platform[], settings: Settings) => Promise<SearchResult[]>;
  fetchAchievements: (r: SearchResult, settings: Settings) => Promise<Achievement[]>;
};

const CatalogProvider: Provider = {
  id: 'catalog',
  label: 'Starter catalog (real data)',
  platforms: ['psn', 'xbox', 'steam'],
  async search(q, platforms) {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];

    return CATALOG_GAMES
      .filter((g) => platforms.includes(g.platform))
      .filter((g) => g.title.toLowerCase().includes(needle))
      .map((g) => ({
        platform: g.platform,
        title: g.title,
        artwork: g.artwork,
        externalId: g.id,
        url: g.sourceUrl,
        sourceKind: 'catalog',
      }));
  },
  async fetchAchievements(r) {
    const g = r.externalId ? CATALOG_BY_ID.get(r.externalId) : undefined;
    if (!g) return [];
    return g.achievements.map((a) => ({ ...a }));
  },
};

const SteamStoreProvider: Provider = {
  id: 'steam-store',
  label: 'Steam Store Search (no key, best-effort)',
  platforms: ['steam'],
  async search(q, platforms) {
    if (!platforms.includes('steam')) return [];
    // Note: Steam endpoints are not guaranteed CORS-friendly everywhere; this is best-effort.
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=us`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const items = Array.isArray(json?.items) ? json.items : [];
    return items.slice(0, 20).map((it: any) => ({
      platform: 'steam',
      title: String(it?.name ?? 'Unknown'),
      artwork: it?.tiny_image ? String(it.tiny_image) : undefined,
      externalId: it?.id ? String(it.id) : undefined,
      url: it?.id ? `https://store.steampowered.com/app/${it.id}` : undefined,
      sourceKind: 'steam',
    }));
  },
  async fetchAchievements(_r) {
    // Steam achievements require app-specific stats/achievements APIs and often need keys/auth.
    // Return an empty list here rather than fake placeholder data.
    return [];
  },
};

const CloudflareGatewayProvider: Provider = {
  id: 'gateway',
  label: 'Cloudflare Gateway (optional)',
  platforms: ['psn', 'xbox', 'steam'],
  async search(q, platforms, settings) {
    if (!settings.dataGatewayUrl) return [];
    const url = new URL('/search', settings.dataGatewayUrl);
    url.searchParams.set('q', q);
    url.searchParams.set('platforms', platforms.join(','));
    const res = await fetch(url.toString(), { headers: { 'accept': 'application/json' } });
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const out = Array.isArray(json?.results) ? json.results : [];
    return out.map((r: any) => ({
      platform: r.platform,
      title: r.title,
      artwork: r.artwork,
      externalId: r.externalId,
      url: r.url,
      sourceKind: r.sourceKind ?? 'other',
    }));
  },
  async fetchAchievements(r, settings) {
    if (!settings.dataGatewayUrl) return [];
    const url = new URL('/achievements', settings.dataGatewayUrl);
    url.searchParams.set('platform', r.platform);
    if (r.externalId) url.searchParams.set('externalId', r.externalId);
    if (r.url) url.searchParams.set('url', r.url);
    url.searchParams.set('title', r.title);

    const res = await fetch(url.toString(), { headers: { 'accept': 'application/json' } });
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const list = Array.isArray(json?.achievements) ? json.achievements : [];

    const achievements: Achievement[] = list.map((a: any) => ({
      id: uid('ach'),
      platform: r.platform,
      title: String(a.title ?? 'Achievement'),
      description: String(a.description ?? ''),
      image: a.image ? String(a.image) : undefined,
      unlocked: Boolean(a.unlocked ?? false),
      rarity: typeof a.rarity === 'number' ? a.rarity : undefined,
      psn: a.psn,
      xbox: a.xbox,
      steam: a.steam,
    }));

    return achievements;
  },
};

export const PROVIDERS: Provider[] = [CatalogProvider, CloudflareGatewayProvider, SteamStoreProvider];

export async function searchAll(q: string, platforms: Platform[], settings: Settings): Promise<SearchResult[]> {
  const q2 = q.trim();
  if (!q2) return [];

  const results = await Promise.all(
    PROVIDERS.map(async (p) => {
      try {
        const wanted = platforms.filter((x) => p.platforms.includes(x));
        if (!wanted.length) return [];
        return await p.search(q2, wanted, settings);
      } catch {
        return [];
      }
    }),
  );

  // Deduplicate by (platform,title)
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const group of results) {
    for (const r of group) {
      const key = `${r.platform}::${r.title}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
  }

  return out;
}

export async function makeGameFromResult(r: SearchResult, settings: Settings): Promise<Game> {
  if (r.sourceKind === 'catalog' && r.externalId) {
    const g = CATALOG_BY_ID.get(r.externalId);
    if (g) return cloneCatalogGameToLibrary(g);
  }

  // Prefer gateway for achievements if set; else provider that produced the result can be ambiguous.
  const gateway = PROVIDERS.find((p) => p.id === 'gateway')!;
  const achievements = await gateway.fetchAchievements(r, settings);

  return {
    id: uid('game'),
    platform: r.platform,
    title: r.title,
    artwork: r.artwork,
    source: {
      kind: r.sourceKind,
      externalId: r.externalId,
      url: r.url,
    },
    achievements,
    createdAt: now(),
    updatedAt: now(),
  };
}
