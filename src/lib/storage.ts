import type { Game, Settings } from './types';
import { safeJsonParse } from './util';

const KEY_GAMES = 'atk.games.v1';
const KEY_SETTINGS = 'atk.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  pinkIntensity: 'loud',
  defaultPlatforms: ['psn', 'xbox', 'steam'],
  dataGatewayUrl: '',
  steamProfileUrl: '',
  steamWebApiKey: '',
  gridSize: 'default',
  collapsedShelves: {},
};

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode / blocked storage). App should still render.
  }
}

export function loadGames(): Game[] {
  const data = safeJsonParse<Game[]>(storageGet(KEY_GAMES));
  if (!data) return [];
  // Basic sanity
  return Array.isArray(data) ? data : [];
}

export function saveGames(games: Game[]): void {
  storageSet(KEY_GAMES, JSON.stringify(games));
}

export function loadSettings(): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...(safeJsonParse<Settings>(storageGet(KEY_SETTINGS)) ?? {}),
  };
}

export function saveSettings(settings: Settings): void {
  storageSet(KEY_SETTINGS, JSON.stringify(settings));
}

export function exportAll(): string {
  const payload = {
    v: 1,
    exportedAt: new Date().toISOString(),
    games: loadGames(),
    settings: loadSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAll(json: string): { gamesImported: number } {
  const parsed = safeJsonParse<any>(json);
  if (!parsed || parsed.v !== 1) throw new Error('Not a valid export (v1).');
  if (!Array.isArray(parsed.games)) throw new Error('Export missing games[]');
  saveGames(parsed.games);
  if (parsed.settings) saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
  return { gamesImported: parsed.games.length };
}
