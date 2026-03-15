import type { Platform, PsnTier, Game } from './types';

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, any> = {}, children: Array<HTMLElement | Text | string> = []): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = String(v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k === 'style') (n as HTMLElement).setAttribute('style', String(v));
    else if (k.startsWith('on') && typeof v === 'function') (n as any)[k.toLowerCase()] = v;
    else if (v === true) n.setAttribute(k, '');
    else if (v === false || v == null) continue;
    else n.setAttribute(k, String(v));
  }
  for (const c of children) n.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return n;
}

export function icon(name: 'menu' | 'plus' | 'gear' | 'arrow-left' | 'trash' | 'download' | 'upload' | 'x'): string {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  if (name === 'menu') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>`;
  if (name === 'plus') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
  if (name === 'gear') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a7.7 7.7 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a7.8 7.8 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.8 7.8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.8 7.8 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.8 7.8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z"/></svg>`;
  if (name === 'arrow-left') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M15 18l-6-6 6-6"/></svg>`;
  if (name === 'trash') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 16H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
  if (name === 'download') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>`;
  if (name === 'upload') return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>`;
  return `<svg width="20" height="20" viewBox="0 0 24 24" ${common}><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>`;
}

export function platformLabel(p: Platform): string {
  if (p === 'psn') return 'PlayStation';
  if (p === 'xbox') return 'Xbox';
  return 'Steam';
}

export function platformDotClass(p: Platform): string {
  return p;
}

export function psnTierLabel(tier: PsnTier): string {
  if (tier === 'bronze') return 'Bronze';
  if (tier === 'silver') return 'Silver';
  if (tier === 'gold') return 'Gold';
  return 'Platinum';
}

export function gamePlatformDetailLabel(game: Game): string | null {
  if (game.platform === 'psn' && game.platformDetails?.psnConsole) return game.platformDetails.psnConsole;
  if (game.platform === 'xbox' && game.platformDetails?.xboxConsole) return game.platformDetails.xboxConsole;
  return null;
}
