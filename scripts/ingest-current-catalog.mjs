#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATALOG_FILE = path.join(ROOT, 'src/lib/catalog.ts');
const STATE_DIR = path.join(ROOT, '.ingest-state');
const STATE_FILE = path.join(STATE_DIR, 'current-catalog-achievements.json');

const argv = new Map(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.split('=');
  return [k, rest.length ? rest.join('=') : 'true'];
}));

const dryRun = argv.has('--dry-run');
const resume = argv.has('--resume');
const limit = argv.has('--limit') ? Number(argv.get('--limit')) : Infinity;
const allowedPlatforms = new Set((argv.get('--platforms') ?? 'psn,steam').split(',').map((x) => x.trim()).filter(Boolean));
const delayMs = argv.has('--delayMs') ? Number(argv.get('--delayMs')) : 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '...')
    .trim();
}

function normalizeText(input) {
  return decodeHtml(input)
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function parseCatalogEntries(source) {
  const entries = [];
  const re = /(psGame|steamGame|xboxGame)\(\s*'([^']+)'\s*,\s*(["'])(.*?)\3\s*,\s*(?:'[^']+'\s*,\s*)?'([^']+)'\s*,\s*\[(.*?)\]\s*,\s*'([^']+)'/gs;
  let match;
  while ((match = re.exec(source))) {
    const fn = match[1];
    const id = match[2];
    const title = match[4];
    const url = match[5];
    const artwork = match[7];
    entries.push({
      fn,
      id,
      title,
      url,
      artwork,
      platform: fn === 'psGame' ? 'psn' : fn === 'steamGame' ? 'steam' : 'xbox',
    });
  }
  return entries;
}

function extractImageSrc(fragment) {
  const m = fragment.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

function parseSteamAchievements(html) {
  const rows = [...html.matchAll(/<div class="achieveRow[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<h5>([\s\S]*?)<\/h5>[\s\S]*?<div class="achievePercent">([\d.]+)%<\/div>[\s\S]*?<img src="([^"]+)"/g)];
  if (!rows.length) throw new Error('Steam parser found no achievements');
  return rows.map((m) => ({
    title: normalizeText(m[1]),
    description: normalizeText(m[2]).replace(/\.$/, ''),
    rarity: Number(m[3]),
    image: m[4],
  }));
}

function parsePowerPyxAchievements(html) {
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
    const tierAlt = (cells[2].match(/alt=["']([^"']+)["']/i)?.[1] ?? normalizeText(cells[2])).toLowerCase();
    const tier = ['bronze', 'silver', 'gold', 'platinum'].find((value) => tierAlt.includes(value)) ?? 'bronze';
    achievements.push({
      title,
      description,
      tier,
      image: extractImageSrc(cells[0]),
    });
  }
  if (!achievements.length) throw new Error('PowerPyx parser found no trophies');
  return achievements;
}

function parseEurogamerAchievements(html) {
  const tableIndex = html.indexOf('<table>');
  const tableEnd = html.indexOf('</table>', tableIndex);
  if (tableIndex < 0 || tableEnd < 0) throw new Error('Eurogamer parser could not find trophy table');
  const tableHtml = html.slice(tableIndex, tableEnd);
  const rows = [...tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].slice(1);
  const achievements = rows.map((row, index) => {
    const cells = [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => normalizeText(m[1]));
    if (cells.length < 3) return null;
    return {
      title: cells[0],
      description: cells[1],
      tier: cells[2].toLowerCase(),
      image: undefined,
      index,
    };
  }).filter(Boolean);
  if (!achievements.length) throw new Error('Eurogamer parser found no trophies');
  return achievements;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-ingest/0.1; +https://example.invalid)',
      'accept-language': 'en-GB,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function ingestGame(entry) {
  const html = await fetchText(entry.url);
  if (entry.platform === 'steam') return parseSteamAchievements(html);
  if (entry.platform === 'psn') {
    if (entry.url.includes('powerpyx.com')) return parsePowerPyxAchievements(html);
    if (entry.url.includes('eurogamer.net')) return parseEurogamerAchievements(html);
  }
  throw new Error(`No parser for ${entry.platform} source ${entry.url}`);
}

function toAchievementCode(entry, achievements) {
  const helper = entry.platform === 'steam' ? 'steamAchievement' : 'psAchievement';
  return achievements.map((achievement, index) => {
    const id = `${entry.id}-${String(index + 1).padStart(2, '0')}`;
    const title = JSON.stringify(achievement.title);
    const description = JSON.stringify(achievement.description);
    const extras = [];
    if (achievement.image) extras.push(`image: ${JSON.stringify(achievement.image)}`);
    if (typeof achievement.rarity === 'number' && Number.isFinite(achievement.rarity)) extras.push(`rarity: ${achievement.rarity}`);
    if (entry.platform === 'steam') {
      return `      ${helper}(${JSON.stringify(id)}, ${title}, ${description}${extras.length ? `, undefined, { ${extras.join(', ')} }` : ''}),`;
    }
    const tier = JSON.stringify(achievement.tier ?? 'bronze');
    return `      ${helper}(${JSON.stringify(id)}, ${title}, ${description}, ${tier}${extras.length ? `, undefined, { ${extras.join(', ')} }` : ''}),`;
  }).join('\n');
}

async function loadState() {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
  } catch {
    return { updatedAt: null, games: {} };
  }
}

async function saveState(state) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  state.updatedAt = new Date().toISOString();
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

const source = await fs.readFile(CATALOG_FILE, 'utf8');
const entries = parseCatalogEntries(source).filter((entry) => allowedPlatforms.has(entry.platform));
const state = await loadState();
let updatedSource = source;
let processed = 0;

for (const entry of entries) {
  if (processed >= limit) break;
  if (resume && state.games?.[entry.id]?.status === 'success') continue;
  try {
    const achievements = await ingestGame(entry);
    const replacement = toAchievementCode(entry, achievements);
    const blockRe = new RegExp(`(${entry.fn}\\(\\s*'${entry.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?\\n\\s*\\[)([\\s\\S]*?)(\\n\\s*\\],\\n\\s*'[^']+')`, 'm');
    if (!blockRe.test(updatedSource)) throw new Error(`Could not locate achievement block for ${entry.id}`);
    updatedSource = updatedSource.replace(blockRe, `$1\n${replacement}$3`);
    state.games[entry.id] = {
      title: entry.title,
      platform: entry.platform,
      url: entry.url,
      status: 'success',
      count: achievements.length,
      fetchedAt: new Date().toISOString(),
    };
    processed += 1;
    console.log(`OK ${entry.platform} ${entry.title}: ${achievements.length}`);
  } catch (error) {
    state.games[entry.id] = {
      title: entry.title,
      platform: entry.platform,
      url: entry.url,
      status: 'error',
      error: String(error.message || error),
      fetchedAt: new Date().toISOString(),
    };
    console.error(`ERR ${entry.platform} ${entry.title}: ${error.message || error}`);
  }
  await saveState(state);
  await sleep(delayMs);
}

if (!dryRun && updatedSource !== source) {
  await fs.writeFile(CATALOG_FILE, updatedSource);
}

console.log(`Finished. Updated ${processed} game(s). State: ${path.relative(ROOT, STATE_FILE)}`);
