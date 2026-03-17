#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATALOG_FILE = path.join(ROOT, 'src/lib/catalog.ts');
const STATUS_FILE = path.join(ROOT, 'data/catalog-expansion-status.json');

let text = await fs.readFile(CATALOG_FILE, 'utf8');
const start = text.indexOf('export const CATALOG_GAMES: CatalogGame[] = [');
const arrStart = text.indexOf('[', start) + 1;
const arrEnd = text.indexOf('\n];\n\nexport const CATALOG_BY_ID');
const body = text.slice(arrStart, arrEnd);
const pattern = /\n\s*(psGame|xboxGame|steamGame)\([\s\S]*?\n\s*\),/g;
let last = 0;
let rebuilt = '';
const seen = new Set();
let match;
while ((match = pattern.exec(body))) {
  rebuilt += body.slice(last, match.index);
  const block = match[0];
  const idMatch = block.match(/["']([^"']+)["']/);
  const id = idMatch?.[1];
  if (id && !seen.has(id)) {
    seen.add(id);
    rebuilt += block;
  }
  last = match.index + block.length;
}
rebuilt += body.slice(last);
text = text.slice(0, arrStart) + rebuilt + text.slice(arrEnd);
await fs.writeFile(CATALOG_FILE, text);

const status = JSON.parse(await fs.readFile(STATUS_FILE, 'utf8'));
for (const key of ['psn', 'xbox', 'steam']) {
  const uniq = [];
  const seenIds = new Set();
  for (const id of status.catalogued[key]) {
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniq.push(id);
    }
  }
  status.catalogued[key] = uniq;
}
status.updatedAt = new Date().toISOString();
await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2) + '\n');
console.log('deduped catalog + status');
