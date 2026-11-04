// Appearance settings (src/content/site/theme.yml, edited in the admin under
// "Appearance"). They are turned into CSS custom properties that override the
// defaults in src/styles/global.css, so every page, including anything added
// later through the admin, follows them without code changes.
//
// The defaults below are the built-in design; "Use the built-in design" in the
// admin ignores the saved values and uses these.

import { getEntry } from 'astro:content';

export const FONTS = {
  inter: { label: 'Inter (modern sans)', stack: '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  'ibm-plex-sans': { label: 'IBM Plex Sans (technical sans)', stack: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  'space-grotesk': { label: 'Space Grotesk (techy sans)', stack: '"Space Grotesk Variable", -apple-system, "Segoe UI", sans-serif' },
  'plus-jakarta-sans': { label: 'Plus Jakarta Sans (friendly sans)', stack: '"Plus Jakarta Sans Variable", -apple-system, "Segoe UI", sans-serif' },
  'dm-sans': { label: 'DM Sans (soft sans)', stack: '"DM Sans Variable", -apple-system, "Segoe UI", sans-serif' },
  manrope: { label: 'Manrope (geometric sans)', stack: '"Manrope Variable", -apple-system, "Segoe UI", sans-serif' },
  newsreader: { label: 'Newsreader (elegant serif)', stack: '"Newsreader Variable", "Newsreader", Georgia, "Times New Roman", serif' },
  'source-serif-4': { label: 'Source Serif 4 (academic serif)', stack: '"Source Serif 4 Variable", Georgia, "Times New Roman", serif' },
  fraunces: { label: 'Fraunces (bold serif)', stack: '"Fraunces Variable", Georgia, "Times New Roman", serif' },
  lora: { label: 'Lora (book serif)', stack: '"Lora Variable", Georgia, "Times New Roman", serif' },
  'ibm-plex-mono': { label: 'IBM Plex Mono (typewriter)', stack: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace' },
  'jetbrains-mono': { label: 'JetBrains Mono (code)', stack: '"JetBrains Mono Variable", ui-monospace, "SFMono-Regular", Menlo, monospace' },
} as const;

export type FontKey = keyof typeof FONTS;
export const FONT_KEYS = Object.keys(FONTS) as [FontKey, ...FontKey[]];

export const ROUNDNESS = { sharp: 0.3, soft: 1, round: 1.6 } as const;

const PALETTE_KEYS = ['bg', 'surface', 'surface_2', 'border', 'ink', 'ink_2', 'accent', 'accent_ink', 'accent_wash'] as const;
type Palette = Record<(typeof PALETTE_KEYS)[number], string>;

export interface Theme {
  use_default: boolean;
  light: Palette;
  dark: Palette;
  hero: { day_top: string; day_middle: string; day_horizon: string; night_top: string; night_bottom: string };
  fonts: { heading: FontKey; hero_name: FontKey; body: FontKey; labels: FontKey };
  style: { roundness: keyof typeof ROUNDNESS; heading_weight: number; cards: 'filled' | 'outlined' };
}

export const DEFAULT_THEME: Theme = {
  use_default: false,
  light: {
    bg: '#ffffff', surface: '#efefef', surface_2: '#e5e5e5', border: '#d6d6d6',
    ink: '#201e1a', ink_2: '#5c584f', accent: '#c96442', accent_ink: '#a8482b', accent_wash: '#f6e9e1',
  },
  dark: {
    bg: '#0c0c0c', surface: '#161616', surface_2: '#1c1c1c', border: '#242424',
    ink: '#efeae1', ink_2: '#b7b1a4', accent: '#e08a6a', accent_ink: '#ea9c7e', accent_wash: '#3a2a22',
  },
  hero: { day_top: '#9fd3f7', day_middle: '#cfe9fb', day_horizon: '#fff1c9', night_top: '#03060c', night_bottom: '#111a28' },
  fonts: { heading: 'inter', hero_name: 'newsreader', body: 'ibm-plex-sans', labels: 'ibm-plex-mono' },
  style: { roundness: 'soft', heading_weight: 600, cards: 'filled' },
};

export async function getTheme(): Promise<Theme> {
  const entry = await getEntry('appearance', 'theme');
  const saved = entry?.data as Partial<Theme> | undefined;
  if (!saved || saved.use_default) return DEFAULT_THEME;
  const d = DEFAULT_THEME;
  return {
    use_default: false,
    light: { ...d.light, ...saved.light },
    dark: { ...d.dark, ...saved.dark },
    hero: { ...d.hero, ...saved.hero },
    fonts: { ...d.fonts, ...saved.fonts },
    style: { ...d.style, ...saved.style },
  };
}

const vars = (p: Palette, cards: Theme['style']['cards']) =>
  [
    `--bg:${p.bg}`,
    `--surface:${cards === 'outlined' ? p.bg : p.surface}`,
    `--surface-2:${p.surface_2}`,
    `--border:${p.border}`,
    `--ink:${p.ink}`,
    `--ink-2:${p.ink_2}`,
    `--accent:${p.accent}`,
    `--accent-ink:${p.accent_ink}`,
    `--accent-wash:${p.accent_wash}`,
  ].join(';');

/**
 * CSS that applies the theme. Selectors are one step more specific than the
 * ones in global.css (html:root vs :root), so they win wherever the
 * stylesheets end up in the page.
 */
export function themeCss(t: Theme): string {
  const shared = [
    `--font-display:${FONTS[t.fonts.heading].stack}`,
    `--font-hero:${FONTS[t.fonts.hero_name].stack}`,
    `--font-body:${FONTS[t.fonts.body].stack}`,
    `--font-mono:${FONTS[t.fonts.labels].stack}`,
    `--heading-weight:${t.style.heading_weight}`,
    `--round:${ROUNDNESS[t.style.roundness]}`,
    `--sky-day-top:${t.hero.day_top}`,
    `--sky-day-middle:${t.hero.day_middle}`,
    `--sky-day-horizon:${t.hero.day_horizon}`,
    `--sky-night-top:${t.hero.night_top}`,
    `--sky-night-bottom:${t.hero.night_bottom}`,
  ].join(';');
  const light = vars(t.light, t.style.cards);
  const dark = vars(t.dark, t.style.cards);
  return (
    `html:root{${shared};${light}}` +
    `@media (prefers-color-scheme: dark){html:root:not([data-theme="light"]){${dark}}}` +
    `html:root[data-theme="dark"]{${dark}}`
  );
}
