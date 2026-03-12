import { Hono } from 'hono';

type Platform = 'psn' | 'xbox' | 'steam';

type SearchResult = {
  platform: Platform;
  title: string;
  artwork?: string;
  externalId?: string;
  url?: string;
  sourceKind: 'steam' | 'psnprofiles' | 'xboxachievements' | 'other' | 'manual';
};

type Achievement = {
  title: string;
  description: string;
  image?: string;
  rarity?: number;
  unlocked?: boolean;
  psn?: { tier: 'bronze' | 'silver' | 'gold' | 'platinum' };
  xbox?: { gamerscore: number };
  steam?: { points: number };
};

const app = new Hono();

app.get('/', (c) => c.text('Achievement Garden gateway is running.'));

app.get('/search', (c) => {
  const q = (c.req.query('q') ?? '').trim();
  const platforms = (c.req.query('platforms') ?? 'psn,xbox,steam')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean) as Platform[];

  const results: SearchResult[] = [];
  if (!q) return c.json({ results });

  for (const p of platforms) {
    results.push(
      {
        platform: p,
        title: `${q} (Gateway demo)` ,
        artwork: `https://picsum.photos/seed/${encodeURIComponent(q + p)}/512/512`,
        sourceKind: 'other',
        externalId: `${p}-${q}`,
      },
      {
        platform: p,
        title: `${q} — Deluxe (Gateway demo)` ,
        artwork: `https://picsum.photos/seed/${encodeURIComponent(q + p + 'deluxe')}/512/512`,
        sourceKind: 'other',
        externalId: `${p}-${q}-deluxe`,
      },
    );
  }

  return c.json({ results: results.slice(0, 24) });
});

app.get('/achievements', (c) => {
  const platform = (c.req.query('platform') ?? 'psn') as Platform;
  const title = (c.req.query('title') ?? 'Game').slice(0, 80);

  const base = [
    { title: 'First Steps', description: `Start ${title}.` },
    { title: 'Collector', description: 'Pick up 100 items.' },
    { title: 'No Damage', description: 'Finish a level without taking damage.' },
    { title: 'Speedrunner', description: 'Beat the game in under 3 hours.' },
    { title: 'Completionist', description: 'Unlock every other achievement.' },
  ];

  const achievements: Achievement[] = base.map((b, i) => {
    const rarity = Math.max(1, Math.min(95, 70 - i * 14));
    const a: Achievement = {
      title: b.title,
      description: b.description,
      image: `https://picsum.photos/seed/${encodeURIComponent(title + b.title)}/256/256`,
      rarity,
      unlocked: false,
    };

    if (platform === 'psn') a.psn = { tier: (['bronze', 'silver', 'gold', 'platinum'][Math.min(i, 3)] as any) };
    if (platform === 'xbox') a.xbox = { gamerscore: [10, 20, 30, 50, 100][i] };
    if (platform === 'steam') a.steam = { points: [5, 10, 15, 25, 50][i] };

    return a;
  });

  return c.json({ achievements });
});

export default app;
