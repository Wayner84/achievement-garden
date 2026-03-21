#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src', 'lib');
const PUBLIC_DIR = path.join(ROOT, 'public', 'catalog');
const GENERATED_DIR = path.join(ROOT, 'src', 'generated');
const TMP_DIR = await fs.mkdtemp(path.join(os.tmpdir(), 'achievement-catalog-'));
const SHARD_SIZE = Number(process.env.CATALOG_SHARD_SIZE ?? '25');

const FILES = [
  { platform: 'psn', file: 'catalog-psn.ts', exportName: 'PSN_CATALOG_GAMES' },
  { platform: 'xbox', file: 'catalog-xbox.ts', exportName: 'XBOX_CATALOG_GAMES' },
  { platform: 'steam', file: 'catalog-steam.ts', exportName: 'STEAM_CATALOG_GAMES' },
];

async function importTsModule(tsPath) {
  const source = await fs.readFile(tsPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: tsPath,
  }).outputText;
  const jsPath = path.join(TMP_DIR, `${path.basename(tsPath, '.ts')}.mjs`);
  await fs.writeFile(jsPath, transpiled, 'utf8');
  return import(pathToFileURL(jsPath).href);
}

function toShardFile(platform, index) {
  return `${platform}-${String(index + 1).padStart(3, '0')}.json`;
}

await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
await fs.mkdir(PUBLIC_DIR, { recursive: true });
await fs.mkdir(GENERATED_DIR, { recursive: true });

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  shardSize: SHARD_SIZE,
  platforms: {},
};

for (const spec of FILES) {
  const modulePath = path.join(SRC_DIR, spec.file);
  const mod = await importTsModule(modulePath);
  const games = mod[spec.exportName] ?? [];
  const shards = [];
  for (let index = 0; index < games.length; index += SHARD_SIZE) {
    const shardGames = games.slice(index, index + SHARD_SIZE);
    const file = toShardFile(spec.platform, shards.length);
    await fs.writeFile(path.join(PUBLIC_DIR, file), `${JSON.stringify(shardGames)}\n`, 'utf8');
    shards.push({
      file,
      gameCount: shardGames.length,
      achievementCount: shardGames.reduce((sum, game) => sum + game.achievements.length, 0),
      firstGameId: shardGames[0]?.id,
      lastGameId: shardGames.at(-1)?.id,
    });
  }

  manifest.platforms[spec.platform] = {
    gameCount: games.length,
    achievementCount: games.reduce((sum, game) => sum + game.achievements.length, 0),
    shards,
  };
}

await fs.writeFile(
  path.join(GENERATED_DIR, 'catalog-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

await fs.rm(TMP_DIR, { recursive: true, force: true });
console.log(`Generated catalog assets in ${path.relative(ROOT, PUBLIC_DIR)} with shard size ${SHARD_SIZE}`);
