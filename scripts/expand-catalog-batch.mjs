#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATALOG_FILES = {
  psn: path.join(ROOT, 'src/lib/catalog-psn.ts'),
  xbox: path.join(ROOT, 'src/lib/catalog-xbox.ts'),
  steam: path.join(ROOT, 'src/lib/catalog-steam.ts'),
};
const STATUS_FILE = path.join(ROOT, 'data/catalog-expansion-status.json');
const argv = new Map(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.split('=');
  return [k, rest.length ? rest.join('=') : 'true'];
}));
const manifestPath = argv.get('--manifest') ? path.resolve(argv.get('--manifest')) : path.join(ROOT, 'data/expansion-batch-2026-03-16.json');
const limit = argv.has('--limit') ? Number(argv.get('--limit')) : Infinity;
const delayMs = argv.has('--delayMs') ? Number(argv.get('--delayMs')) : 2500;
const dryRun = argv.has('--dry-run');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PSN_EXPECTED_TROPHY_COUNTS = {
  'https://www.powerpyx.com/guides/bloodborne.html': 34,
  'https://www.powerpyx.com/guides/dark-souls-3-trophy-guide.html': 43,
  'https://www.powerpyx.com/resident-evil-7-trophy-guide-roadmap/': 38,
};

function decodeHtml(input) {
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
function normalizeText(input) {
  return decodeHtml(input).replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, ' ').replace(/\u00a0/g, ' ').trim();
}
function extractImageSrc(fragment) {
  const m = fragment.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}
async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-expand/0.1)', 'accept-language': 'en-GB,en;q=0.9' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}
function parseSteamAchievements(html) {
  const rows = [...html.matchAll(/<div class="achieveRow[^\"]*">([\s\S]*?)<div style="clear: both;">\s*<\/div>\s*<\/div>/g)];
  if (!rows.length) throw new Error('Steam parser found no achievements');
  return rows.map((m) => {
    const block = m[1];
    const image = block.match(/<img src="([^"]+)"/i)?.[1];
    const rarity = Number(block.match(/<div class="achievePercent">([\d.]+)%<\/div>/i)?.[1] ?? 'NaN');
    const title = normalizeText(block.match(/<h3>([\s\S]*?)<\/h3>/i)?.[1] ?? '');
    const description = normalizeText(block.match(/<h5>([\s\S]*?)<\/h5>/i)?.[1] ?? '').replace(/\.$/, '');
    return { title, description, rarity, image };
  }).filter((a) => a.title && Number.isFinite(a.rarity) && a.image);
}
function parsePowerPyxTableAchievements(html) {
  const headingIndex = html.search(/<h2[^>]*>[^<]*Trophy Guide<\/h2>/i);
  const tableIndex = html.indexOf('<table', headingIndex >= 0 ? headingIndex : 0);
  if (tableIndex < 0) throw new Error('PowerPyx parser could not find trophy table');
  const tableEnd = html.indexOf('</table>', tableIndex);
  const tableHtml = html.slice(tableIndex, tableEnd);
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  const achievements = [];
  for (let i = 0; i < rows.length - 1; i += 2) {
    const cells = [...rows[i].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    if (cells.length < 3) continue;
    const brSplit = cells[1].split(/<br\s*\/?>/i).map(normalizeText).filter(Boolean);
    const title = brSplit[0] ?? normalizeText(cells[1]);
    const description = brSplit.slice(1).join(' ') || normalizeText(cells[1]);
    const tierAlt = (cells[2].match(/(?:alt|title)=["']([^"']+)["']/i)?.[1] ?? normalizeText(cells[2])).toLowerCase();
    const tier = ['bronze', 'silver', 'gold', 'platinum'].find((value) => tierAlt.includes(value)) ?? 'bronze';
    achievements.push({ title, description, tier, image: extractImageSrc(cells[0]) });
  }
  if (!achievements.length) throw new Error('PowerPyx table parser found no trophies');
  return achievements;
}
function parseLegacyPowerPyxGuideAchievements(html) {
  const achievements = [];
  const seen = new Set();
  for (const match of html.matchAll(/<a[^>]+name=["']([^"']+)["'][^>]*><\/a>/gi)) {
    const anchor = match[1];
    const anchorIndex = match.index ?? -1;
    if (!anchor || anchorIndex < 0 || seen.has(anchor)) continue;
    const before = html.slice(Math.max(0, anchorIndex - 800), anchorIndex);
    const after = html.slice(anchorIndex, anchorIndex + 900);
    const anchorEscaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleTierMatch = new RegExp(`<img[^>]+alt=["'](Bronze|Silver|Gold|Platinum) Trophy["'][^>]*>\\s*([^<]+?)\\s*<span[^>]*>\\s*<img[^>]+alt=["'](?:Bronze|Silver|Gold|Platinum) Trophy["'][^>]*>\\s*<a[^>]+name=["']${anchorEscaped}["']`, 'i').exec(before + after.slice(0, 200));
    if (!titleTierMatch) continue;
    const title = normalizeText(titleTierMatch[2]);
    const description = normalizeText(after.match(/<em>([\s\S]*?)<\/em>/i)?.[1] ?? '').replace(/\.$/, '');
    if (!title || !description) continue;
    seen.add(anchor);
    achievements.push({ title, description, tier: titleTierMatch[1].toLowerCase() });
  }
  if (!achievements.length) throw new Error('PowerPyx legacy parser found no trophies');
  return achievements;
}
function parsePowerPyxAchievements(html) {
  try {
    return parsePowerPyxTableAchievements(html);
  } catch (error) {
    return parseLegacyPowerPyxGuideAchievements(html);
  }
}
function toSteamCode(item, achievements) {
  const sourceUrl = `https://steamcommunity.com/stats/${item.appId}/achievements`;
  const artwork = `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.appId}/header.jpg`;
  const lines = achievements.map((a, i) => {
    const extras = [];
    if (a.image) extras.push(`image: ${JSON.stringify(a.image)}`);
    if (typeof a.rarity === 'number' && Number.isFinite(a.rarity)) extras.push(`rarity: ${a.rarity}`);
    return `      steamAchievement(${JSON.stringify(`${item.id}-${String(i + 1).padStart(3, '0')}`)}, ${JSON.stringify(a.title)}, ${JSON.stringify(a.description)}${extras.length ? `, undefined, { ${extras.join(', ')} }` : ''}),`;
  }).join('\n');
  return `  steamGame(\n    ${JSON.stringify(item.id)},\n    ${JSON.stringify(item.title)},\n    ${JSON.stringify(sourceUrl)},\n    [\n${lines}\n    ],\n    ${JSON.stringify(artwork)},\n  ),\n`;
}
function toPsnCode(item, achievements) {
  const lines = achievements.map((a, i) => {
    const extras = [];
    if (a.image) extras.push(`image: ${JSON.stringify(a.image)}`);
    return `      psAchievement(${JSON.stringify(`${item.id}-${String(i + 1).padStart(3, '0')}`)}, ${JSON.stringify(a.title)}, ${JSON.stringify(a.description)}, ${JSON.stringify(a.tier)}${extras.length ? `, undefined, { ${extras.join(', ')} }` : ''}),`;
  }).join('\n');
  return `  psGame(\n    ${JSON.stringify(item.id)},\n    ${JSON.stringify(item.title)},\n    ${JSON.stringify(item.psnConsole)},\n    ${JSON.stringify(item.sourceUrl)},\n    [\n${lines}\n    ],\n  ),\n`;
}
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const catalogs = {
  psn: await fs.readFile(CATALOG_FILES.psn, 'utf8'),
  xbox: await fs.readFile(CATALOG_FILES.xbox, 'utf8'),
  steam: await fs.readFile(CATALOG_FILES.steam, 'utf8'),
};
const status = JSON.parse(await fs.readFile(STATUS_FILE, 'utf8'));
let processed = 0;
let inserted = [];
for (const item of manifest.items) {
  if (processed >= limit) break;
  const catalogKey = item.platform;
  if (!catalogs[catalogKey]) continue;
  if (catalogs[catalogKey].includes(`'${item.id}'`) || catalogs[catalogKey].includes(`"${item.id}"`)) continue;
  try {
    let code = '';
    if (item.platform === 'steam') {
      const html = await fetchText(`https://steamcommunity.com/stats/${item.appId}/achievements`);
      const achs = parseSteamAchievements(html);
      code = toSteamCode(item, achs);
      status.catalogued.steam.push(item.id);
      console.log(`OK steam ${item.title}: ${achs.length}`);
    } else if (item.platform === 'psn') {
      const html = await fetchText(item.sourceUrl);
      const achs = parsePowerPyxAchievements(html);
      const expectedCount = PSN_EXPECTED_TROPHY_COUNTS[item.sourceUrl];
      if (expectedCount && achs.length !== expectedCount) {
        throw new Error(`parsed ${achs.length}/${expectedCount} trophies from ${item.sourceUrl}`);
      }
      code = toPsnCode(item, achs);
      status.catalogued.psn.push(item.id);
      console.log(`OK psn ${item.title}: ${achs.length}`);
    } else {
      continue;
    }
    catalogs[catalogKey] = catalogs[catalogKey].replace(/\n\];\n?$/, `\n${code}];\n`);
    inserted.push(item.id);
    processed += 1;
  } catch (error) {
    console.error(`ERR ${item.platform} ${item.title}: ${error.message || error}`);
  }
  await sleep(delayMs);
}
for (const key of ['psn', 'xbox', 'steam']) {
  status.catalogued[key] = Array.from(new Set(status.catalogued[key]));
}
status.updatedAt = new Date().toISOString();
if (!dryRun) {
  await Promise.all([
    fs.writeFile(CATALOG_FILES.psn, catalogs.psn),
    fs.writeFile(CATALOG_FILES.xbox, catalogs.xbox),
    fs.writeFile(CATALOG_FILES.steam, catalogs.steam),
    fs.writeFile(STATUS_FILE, `${JSON.stringify(status, null, 2)}\n`),
  ]);
}
console.log('INSERTED', inserted.length, inserted.join(','));
