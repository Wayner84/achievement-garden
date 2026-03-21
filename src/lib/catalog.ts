import manifest from '../generated/catalog-manifest.json';
import type { Platform } from './types';
import { cloneCatalogGameToLibrary, type CatalogGame } from './catalog-helpers';

export { cloneCatalogGameToLibrary };
export type { CatalogGame };

type CatalogManifest = typeof manifest;
type PlatformManifest = CatalogManifest['platforms'][Platform];

const shardCache = new Map<string, Promise<CatalogGame[]>>();

function catalogUrl(file: string): string {
  return new URL(`${import.meta.env.BASE_URL}catalog/${file}`, window.location.href).toString();
}

function loadShard(file: string): Promise<CatalogGame[]> {
  let pending = shardCache.get(file);
  if (!pending) {
    pending = fetch(catalogUrl(file)).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load catalog shard ${file}: HTTP ${response.status}`);
      }
      return response.json() as Promise<CatalogGame[]>;
    });
    shardCache.set(file, pending);
  }
  return pending;
}

async function loadPlatformGames(platform: Platform): Promise<CatalogGame[]> {
  const platformManifest: PlatformManifest | undefined = manifest.platforms[platform];
  if (!platformManifest) return [];
  const groups = await Promise.all(platformManifest.shards.map((shard) => loadShard(shard.file)));
  return groups.flat();
}

export async function loadCatalogGames(platforms?: Platform[]): Promise<CatalogGame[]> {
  const wanted = platforms ?? ['psn', 'xbox', 'steam'];
  const groups = await Promise.all(wanted.map((platform) => loadPlatformGames(platform)));
  return groups.flat();
}

export async function loadCatalogById(platforms?: Platform[]): Promise<Map<string, CatalogGame>> {
  const games = await loadCatalogGames(platforms);
  return new Map(games.map((g) => [g.id, g]));
}
