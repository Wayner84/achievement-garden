export type Platform = 'psn' | 'xbox' | 'steam';

export type PsnTier = 'bronze' | 'silver' | 'gold' | 'platinum';

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

export type Game = {
  id: string;
  platform: Platform;
  title: string;
  artwork?: string;
  source?: {
    kind: 'manual' | 'steam' | 'psnprofiles' | 'xboxachievements' | 'other';
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
};
