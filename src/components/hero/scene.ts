// Drawing for the landing hero (design-reference/landing-scene-spec.md).
// Shapes and colours are ported from design-reference/element-library.html.
//
// Every layer is redrawn at the hero's real pixel size, with positions taken
// as a % of the box (spec §1). Stroke widths and dot spacing therefore stay
// the same on every screen, and the land stays pinned to the bottom.

import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const NS = 'http://www.w3.org/2000/svg';

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

function el(tag: string, attrs: Record<string, string | number> = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  return e;
}

function clear(svg: SVGSVGElement) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

/** Converts % of the hero box to pixels. */
interface Box {
  w: number;
  h: number;
  x: (pct: number) => number;
  y: (pct: number) => number;
}

interface Ctx {
  rc: RoughSVG;
  svg: SVGSVGElement;
  c: Palette;
  night: boolean;
  box: Box;
}

const pts = (box: Box, list: [number, number][]) =>
  list.map(([x, y]) => [box.x(x), box.y(y)] as [number, number]);

// ---------------------------------------------------------------- land

/**
 * Tall peaks massed on the left, tapering to low hills on the right (§4.5).
 * The highest apex sits a little lower than the spec's 34% so it clears the
 * bio line, and the dots are spaced wider than in the small library tiles so
 * the range stays light at full width.
 */
function mountains({ rc, svg, c, box }: Ctx) {
  // Drawn at least 900px wide, so a phone shows the tall left part of the
  // range rather than squeezing every peak into a spike.
  const span = Math.max(box.w, 900);
  const outline = pts({ ...box, x: (p) => (p / 100) * span }, [
    [-2, 82], [-2, 60], [5, 49], [9, 56], [14, 40], [20, 54], [26, 47],
    [33, 59], [40, 57], [47, 64], [56, 62], [64, 68], [74, 66], [85, 70.5],
    [94, 69.5], [102, 72], [102, 82],
  ]);
  svg.appendChild(
    rc.polygon(outline, {
      stroke: c.mtnO, strokeWidth: 2, roughness: 1.9, bowing: 1.2,
      fill: c.mtn, fillStyle: 'dots', fillWeight: 2.2, hachureGap: 13, seed: 11,
    }),
  );
}

/** Mud band between the mountains and the river; static (§4.8). */
function road({ rc, svg, c, box }: Ctx) {
  const { x, y } = box;
  const d =
    `M${x(-1)},${y(79.5)} Q${x(25)},${y(76.5)} ${x(50)},${y(78.5)} T${x(101)},${y(78)} ` +
    `L${x(101)},${y(86.5)} Q${x(75)},${y(88)} ${x(50)},${y(86.5)} T${x(-1)},${y(87)} Z`;
  svg.appendChild(
    rc.path(d, {
      stroke: c.road, strokeWidth: 1.4, roughness: 1.9,
      fill: c.road, fillStyle: 'dots', fillWeight: 2, hachureGap: 9, seed: 23,
    }),
  );
}

/** One gentle wave across the full width, about every 240px. */
function wavePath(box: Box, yPct: number, amp: number, phase: number) {
  const y = box.y(yPct);
  const step = 240;
  let d = `M${-step + phase},${y} Q${-step / 2 + phase},${y - amp} ${phase},${y}`;
  for (let x = phase + step; x < box.w + step; x += step) d += ` T${x},${y}`;
  return d;
}

/** Three flowing dotted strokes along the very bottom, left to right (§4.6). */
function river({ svg, c, night, box }: Ctx) {
  const lanes = [
    { y: 89.5, amp: 10, phase: 0, dur: 7, opacity: 0.85 },
    { y: 93.5, amp: 8, phase: 90, dur: 9, opacity: 0.7 },
    { y: 97.5, amp: 9, phase: 40, dur: 11, opacity: 0.55 },
  ];
  for (const l of lanes) {
    const p = el('path', {
      d: wavePath(box, l.y, l.amp, l.phase),
      fill: 'none',
      stroke: c.river,
      'stroke-width': 6,
      'stroke-linecap': 'round',
      // One dot every 13px; the flow keyframe moves a whole number of dots.
      'stroke-dasharray': '0.1 12.9',
      class: 'flow',
      opacity: l.opacity,
    });
    p.style.animationDuration = `${l.dur}s`;
    svg.appendChild(p);
  }
  if (night) {
    // Moonlight glinting on the water.
    [[12, 91], [31, 96], [47, 92.5], [63, 97], [79, 90.5], [92, 95]].forEach(([gx, gy], i) => {
      const g = el('circle', { cx: box.x(gx), cy: box.y(gy), r: 2.4, fill: c.glint, class: 'tw' });
      g.style.animationDuration = `${3 + (i % 3)}s`;
      g.style.animationDelay = `${i * 0.6}s`;
      svg.appendChild(g);
    });
  }
}

// ---------------------------------------------------------------- scene

const LAYERS: Record<string, ((ctx: Ctx) => void)[]> = {
  sky: [],
  birds: [],
  // Back to front: mountains, river, then the road above it.
  land: [mountains, river, road],
  orbit: [],
  characters: [],
};

/** Redraws every layer at the hero's current size with the day or night palette. */
export function drawScene(hero: HTMLElement): void {
  const night = isNight();
  hero.dataset.time = night ? 'night' : 'day';
  const c = colors(night);
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  const box: Box = { w, h, x: (p) => (p / 100) * w, y: (p) => (p / 100) * h };

  hero.querySelectorAll<SVGSVGElement>('svg[data-layer]').forEach((svg) => {
    clear(svg);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    // The viewBox matches the box exactly; "none" just avoids a shrunken frame
    // if the box resizes before the next redraw.
    svg.setAttribute('preserveAspectRatio', 'none');
    const rc = rough.svg(svg);
    for (const draw of LAYERS[svg.dataset.layer ?? ''] ?? []) {
      draw({ rc, svg, c, night, box });
    }
  });
}

/** Redraws when the hero changes size, at most once per frame. */
export function onResize(hero: HTMLElement, cb: () => void): void {
  let w = hero.clientWidth;
  let h = hero.clientHeight;
  let queued = false;
  new ResizeObserver(() => {
    if (hero.clientWidth === w && hero.clientHeight === h) return;
    w = hero.clientWidth;
    h = hero.clientHeight;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      cb();
    });
  }).observe(hero);
}
