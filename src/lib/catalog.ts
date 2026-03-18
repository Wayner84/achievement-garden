import type { Platform } from './types';
import { cloneCatalogGameToLibrary, type CatalogGame } from './catalog-helpers';

export { cloneCatalogGameToLibrary };
export type { CatalogGame };

export async function loadCatalogGames(platforms?: Platform[]): Promise<CatalogGame[]> {
  const wanted = new Set(platforms ?? ['psn', 'xbox', 'steam']);
  const groups = await Promise.all([
    wanted.has('psn') ? import('./catalog-psn').then((m) => m.PSN_CATALOG_GAMES) : Promise.resolve([] as CatalogGame[]),
    wanted.has('xbox') ? import('./catalog-xbox').then((m) => m.XBOX_CATALOG_GAMES) : Promise.resolve([] as CatalogGame[]),
    wanted.has('steam') ? import('./catalog-steam').then((m) => m.STEAM_CATALOG_GAMES) : Promise.resolve([] as CatalogGame[]),
  ]);
  return groups.flat();
}

export async function loadCatalogById(platforms?: Platform[]): Promise<Map<string, CatalogGame>> {
  const games = await loadCatalogGames(platforms);
  return new Map(games.map((g) => [g.id, g]));
}
