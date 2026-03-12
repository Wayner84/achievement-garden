import type { Game, Settings } from './types';
import { safeJsonParse } from './util';

const KEY_GAMES = 'atk.games.v1';
const KEY_SETTINGS = 'atk.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  reduceMotion: false,
  pinkIntensity: 'loud',
  defaultPlatforms: ['psn', 'xbox', 'steam'],
  dataGatewayUrl: '',
};

export function loadGames(): Game[] {
  const data = safeJsonParse<Game[]>(localStorage.getItem(KEY_GAMES));
  if (!data) return [];
  // Basic sanity
  return Array.isArray(data) ? data : [];
}

export function saveGames(games: Game[]): void {
  localStorage.setItem(KEY_GAMES, JSON.stringify(games));
}

export function loadSettings(): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...(safeJsonParse<Settings>(localStorage.getItem(KEY_SETTINGS)) ?? {}),
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
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
