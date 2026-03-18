import type { Game, Platform, PsnConsole, XboxConsole } from './types';
import type { Achievement } from './types';

export type CatalogGame = {
  id: string;
  platform: Platform;
  title: string;
  artwork?: string;
  sourceUrl?: string;
  platformDetails?: {
    psnConsole?: PsnConsole;
    xboxConsole?: XboxConsole;
  };
  achievements: Achievement[];
};

export function cloneCatalogGameToLibrary(g: CatalogGame): Game {
  return {
    id: g.id,
    platform: g.platform,
    title: g.title,
    artwork: g.artwork,
    platformDetails: g.platformDetails,
    source: {
      kind: 'catalog',
      externalId: g.id,
      url: g.sourceUrl,
    },
    achievements: g.achievements.map((a) => ({ ...a })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
