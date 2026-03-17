#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATALOG_FILE = path.join(ROOT, 'src/lib/catalog.ts');
const delayMs = 3000;
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
    .trim();
}
function normalizeText(input) {
  return decodeHtml(input).replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, ' ').replace(/\u00a0/g, ' ').trim();
}
async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; achievement-garden-steam-refresh/0.1)', 'accept-language': 'en-GB,en;q=0.9' } });
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

let text = await fs.readFile(CATALOG_FILE, 'utf8');
const entries = [...text.matchAll(/steamGame\(\s*(["'])([^"']+)\1\s*,\s*(["'])([^"']+)\3\s*,\s*(["'])(https:\/\/steamcommunity\.com\/stats\/(\d+)\/achievements)\5/g)];
for (const m of entries) {
  const id = m[2];
  const title = m[4];
  const url = m[6];
  const appId = m[7];
  const html = await fetchText(url);
  const achs = parseSteamAchievements(html);
  const lines = achs.map((a, i) => `      steamAchievement(${JSON.stringify(`${id}-${String(i + 1).padStart(3, '0')}`)}, ${JSON.stringify(a.title)}, ${JSON.stringify(a.description)}, undefined, { image: ${JSON.stringify(a.image)}, rarity: ${a.rarity} }),`).join('\n');
  const start = text.indexOf(id);
  const gameStart = text.lastIndexOf('steamGame(', start);
  const nextStart = text.indexOf('\n  steamGame(', start);
  const end = nextStart === -1 ? text.indexOf('\n];\n\nexport const CATALOG_BY_ID', start) : nextStart;
  let block = text.slice(gameStart, end);
  const arr = block.match(/(\n\s*\[)([\s\S]*?)(\n\s*\],)/);
  if (!arr) throw new Error(`Could not replace achievements for ${id}`);
  block = block.slice(0, arr.index + arr[1].length) + '\n' + lines + block.slice(arr.index + arr[1].length + arr[2].length);
  text = text.slice(0, gameStart) + block + text.slice(end);
  console.log(`OK ${title}: ${achs.length}`);
  await sleep(delayMs);
}
await fs.writeFile(CATALOG_FILE, text);
console.log('DONE refresh-all-steam');
