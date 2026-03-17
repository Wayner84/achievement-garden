export type Platform = 'psn' | 'xbox' | 'steam';

export type PsnTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type PsnConsole = 'PS4' | 'PS5' | 'PS Vita' | 'PS3';
export type XboxConsole = 'Xbox One' | 'Xbox Series X|S' | 'Windows' | 'Xbox 360';

export type Achievement = {
  id: string;
  platform: Platform;
  title: string;
  description: string;
  image?: string;
  unlocked: boolean;
  // platform-specific
  psn?: { tier: PsnTier };
  xbox?: { gamerscore: number };
  steam?: { points: number }; // Steam doesn't have a universal "score"; points are app-defined. We model it anyway.
  rarity?: number; // 0..100 (% of players)
};

export type GameStatus = 'currently-playing' | 'backlog' | 'to-play' | 'wont-revisit';

export type Game = {
  id: string;
  platform: Platform;
  title: string;
  artwork?: string;
  platformDetails?: {
    psnConsole?: PsnConsole;
    xboxConsole?: XboxConsole;
  };
  status?: GameStatus;
  source?: {
    kind: 'manual' | 'steam' | 'psnprofiles' | 'xboxachievements' | 'catalog' | 'other';
    externalId?: string;
    url?: string;
  };
  achievements: Achievement[];
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  reduceMotion: boolean;
  pinkIntensity: 'soft' | 'loud';
  defaultPlatforms: Platform[];
  dataGatewayUrl: string; // optional Cloudflare Worker / gateway
  steamProfileUrl: string;
  steamWebApiKey: string;
  gridSize: 'compact' | 'default' | 'large';
  collapsedShelves: Partial<Record<GameStatus, boolean>>;
};
