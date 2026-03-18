#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, 'src/lib/catalog.ts');
const outDir = path.join(ROOT, 'src/lib');

const source = await fs.readFile(sourcePath, 'utf8');
const startToken = 'export const CATALOG_GAMES: CatalogGame[] = [';
const endToken = '\n];\n\nexport const CATALOG_BY_ID';
const start = source.indexOf(startToken);
const bodyStart = source.indexOf('[', start) + 1;
const bodyEnd = source.indexOf(endToken, bodyStart);
if (start < 0 || bodyStart < 1 || bodyEnd < 0) throw new Error('Could not locate catalog array');

const preamble = source.slice(0, start);
const body = source.slice(bodyStart, bodyEnd);
const blockPattern = /(?:^|\n)\s*(psGame|xboxGame|steamGame)\([\s\S]*?\n\s*\),/g;
const groups = { psn: [], xbox: [], steam: [] };
let match;
while ((match = blockPattern.exec(body))) {
  const fn = match[1];
  const block = match[0].replace(/^\n/, '');
  if (fn === 'psGame') groups.psn.push(block);
  if (fn === 'xboxGame') groups.xbox.push(block);
  if (fn === 'steamGame') groups.steam.push(block);
}

const rewrittenPreamble = preamble
  .replace("import type { Achievement, Game, Platform, PsnConsole, PsnTier, XboxConsole } from './types';", "import type { Achievement, Platform, PsnConsole, PsnTier, XboxConsole } from './types';\nimport type { CatalogGame } from './catalog-helpers';")
  .replace(/export type CatalogGame = \{[\s\S]*?\n\};\n\n/, '');

async function writePlatformFile(name, exportName, blocks) {
  const content = `${rewrittenPreamble}\nexport const ${exportName}: CatalogGame[] = [\n${blocks.join('\n')}\n];\n`;
  await fs.writeFile(path.join(outDir, name), content);
}

await writePlatformFile('catalog-psn.ts', 'PSN_CATALOG_GAMES', groups.psn);
await writePlatformFile('catalog-xbox.ts', 'XBOX_CATALOG_GAMES', groups.xbox);
await writePlatformFile('catalog-steam.ts', 'STEAM_CATALOG_GAMES', groups.steam);
console.log({ psn: groups.psn.length, xbox: groups.xbox.length, steam: groups.steam.length });
