// Drawing for the landing hero (design-reference/landing-scene-spec.md).
// Shapes and colours are ported from design-reference/element-library.html.

import rough from 'roughjs';

export type Palette = ReturnType<typeof colors>;

/** Day follows the light theme and night the dark one, saved or system. */
export function isNight(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Object stroke and fill colours (spec §2). */
export function colors(night: boolean) {
  return night
    ? {
        char: '#e8a07f', mtn: '#5a7d4e', mtnO: '#7fa86d', river: '#5a93c8', glint: '#cfe6f2',
        road: '#7a5f45', sun: '#e8a54a', moon: '#f0e7d6', star: '#f3eee4', brain: '#ea9c7e',
        book: '#c7c0b2', bird: '#f4f1ea',
      }
    : {
        char: '#c96442', mtn: '#6f9b57', mtnO: '#4f7540', river: '#4fa3cf', glint: '#bfe3f2',
        road: '#9c7a52', sun: '#e8954a', moon: '#e7dcc6', star: '#9a9280', brain: '#a8482b',
        book: '#5c584f', bird: '#8a8378',
      };
}

/** Runs `cb` whenever the theme toggle or the system setting changes. */
export function onThemeChange(cb: () => void): void {
  new MutationObserver(cb).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
}

function clear(svg: SVGSVGElement) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

/** Redraws every layer of the scene with the current day or night palette. */
export function drawScene(hero: HTMLElement): void {
  const night = isNight();
  hero.dataset.time = night ? 'night' : 'day';
  const c = colors(night);

  hero.querySelectorAll<SVGSVGElement>('svg[data-layer]').forEach((svg) => {
    clear(svg);
    const rc = rough.svg(svg);
    // Objects are added layer by layer in the following build steps.
    void rc;
    void c;
  });
}
