// Drawing for the landing hero (design-reference/landing-scene-spec.md).
// The landscape and sun/moon are ported from design-reference/landscape-mock.html;
// the other objects come from design-reference/element-library.html.
//
// Every layer is redrawn at the hero's real pixel size, so stroke widths and
// dot spacing stay the same on every screen. Landscape coordinates are kept
// in the mock's 1440 × 620 frame and mapped onto the hero:
//   - river and road stretch across the full width, pinned to the bottom;
//   - mountains keep their shape and are anchored to the right edge;
//   - the sun and moon are anchored to the top-right corner.

import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const NS = 'http://www.w3.org/2000/svg';

/** The landscape mock's frame. */
const MOCK_W = 1440;
const MOCK_H = 620;

export type Palette = ReturnType<typeof colors>;

/** Day follows the light theme and night the dark one, saved or system. */
export function isNight(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Object colours (spec §2; landscape and sky bodies from the mock). */
export function colors(night: boolean) {
  return night
    ? {
        char: '#e8a07f', mtn: '#5a7d4e', mtnO: '#7fa86d', road: '#7a5f45',
        washTop: '#1f3a4d', washBot: '#13303f', flow: '#49a7da', glint: '#cfe6f2',
        sun: '#e8a54a', moon: '#f0e7d6', star: '#f3eee4', brain: '#ea9c7e',
        book: '#c7c0b2', bird: '#f4f1ea',
      }
    : {
        char: '#c96442', mtn: '#6f9b57', mtnO: '#4f7540', road: '#9c7a52',
        washTop: '#bfe6fb', washBot: '#4fbfed', flow: '#1f9fe0', glint: '#bfe3f2',
        sun: '#e8954a', moon: '#e7dcc6', star: '#9a9280', brain: '#a8482b',
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

/** The hero's size, plus ways to place things in it. */
interface Box {
  w: number;
  h: number;
  /** % of the box to pixels. */
  x: (pct: number) => number;
  y: (pct: number) => number;
  /** Scale of the landscape: mock units to pixels. */
  k: number;
  /** Mock x, stretched across the full width. */
  fx: (x: number) => number;
  /** Mock x, at true scale, measured from the right edge. */
  rx: (x: number) => number;
  /** Mock y, measured from the bottom edge. */
  by: (y: number) => number;
}

function makeBox(w: number, h: number): Box {
  // Fill the hero's height like the mock does, but on narrow screens keep the
  // land lower so the peaks stay clear of the name.
  const k = Math.min(h / MOCK_H, Math.max((w / MOCK_W) * 1.6, 0.8));
  return {
    w,
    h,
    x: (p) => (p / 100) * w,
    y: (p) => (p / 100) * h,
    k,
    fx: (x) => (x / MOCK_W) * w,
    rx: (x) => w - (MOCK_W - x) * k,
    by: (y) => h - (MOCK_H - y) * k,
  };
}

/** Maps every "x,y" pair in an absolute path written in mock units. */
function mapPath(d: string, mx: (x: number) => number, my: (y: number) => number) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) =>
    `${mx(+x).toFixed(1)},${my(+y).toFixed(1)}`,
  );
}

interface Ctx {
  rc: RoughSVG;
  svg: SVGSVGElement;
  c: Palette;
  night: boolean;
  box: Box;
}

// ---------------------------------------------------------------- sky

/** Sun by day, moon by night: top right, behind the mountains (§4.2). */
function sunOrMoon({ rc, svg, c, night, box }: Ctx) {
  // Smaller on narrow screens, so the rays stay clear of the name.
  const k = Math.min(box.k, Math.max(0.55, box.w / 1000));
  const sx = box.w - (1440 - 1330) * k;
  const sy = 98 * k;

  if (!night) {
    svg.appendChild(
      rc.circle(sx, sy, 104 * k, {
        stroke: c.sun, strokeWidth: 2.8, roughness: 1.3,
        fill: c.sun, fillStyle: 'dots', fillWeight: 1.8, hachureGap: 9, seed: 5,
      }),
    );
    // Twelve em-dash rays turning slowly around it.
    const rays = el('g');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rays.appendChild(
        el('line', {
          x1: sx + Math.cos(a) * 62 * k, y1: sy + Math.sin(a) * 62 * k,
          x2: sx + Math.cos(a) * 84 * k, y2: sy + Math.sin(a) * 84 * k,
          stroke: c.sun, 'stroke-width': 5, 'stroke-linecap': 'round',
        }),
      );
    }
    rays.appendChild(
      el('animateTransform', {
        attributeName: 'transform', type: 'rotate',
        from: `0 ${sx} ${sy}`, to: `360 ${sx} ${sy}`, dur: '55s', repeatCount: 'indefinite',
      }),
    );
    svg.appendChild(rays);
    return;
  }

  const defs = el('defs');
  const glow = el('radialGradient', { id: 'hero-moon-glow', cx: '50%', cy: '50%', r: '50%' });
  glow.appendChild(el('stop', { offset: '0%', 'stop-color': c.moon, 'stop-opacity': 0.5 }));
  glow.appendChild(el('stop', { offset: '70%', 'stop-color': c.moon, 'stop-opacity': 0.1 }));
  glow.appendChild(el('stop', { offset: '100%', 'stop-color': c.moon, 'stop-opacity': 0 }));
  defs.appendChild(glow);
  svg.appendChild(defs);
  svg.appendChild(el('circle', { cx: sx, cy: sy, r: 120 * k, fill: 'url(#hero-moon-glow)', class: 'glow' }));
  svg.appendChild(
    rc.circle(sx, sy, 96 * k, {
      stroke: c.moon, strokeWidth: 2.4, roughness: 1.3,
      fill: c.moon, fillStyle: 'dots', fillWeight: 1.5, hachureGap: 10, seed: 5,
    }),
  );
}

// ---------------------------------------------------------------- land

// The road's two edges, in mock units. The bottom edge is also the waterline.
const ROAD_TOP = 'M-30,398 C260,384 520,414 800,430 C1060,446 1260,452 1470,456';
const ROAD_BOTTOM = 'L1470,496 C1260,492 1060,486 800,470 C520,454 260,424 -30,438';

/**
 * Peaks clustered on the right, tallest on the right, tapering left (§4.5).
 * The base runs well below the road and is clipped at the road's bottom edge,
 * so the range always meets the road with no gap, whatever the screen width.
 */
function mountains({ rc, svg, c, box }: Ctx) {
  const defs = el('defs');
  const clip = el('clipPath', { id: 'hero-above-water' });
  clip.appendChild(
    el('path', { d: mapPath(`M-30,-2000 L1470,-2000 ${ROAD_BOTTOM} Z`, box.fx, box.by) }),
  );
  defs.appendChild(clip);
  svg.appendChild(defs);

  const peaks: [number, number][] = [
    [700, 520], [700, 460], [820, 300], [920, 350], [1040, 205], [1150, 300],
    [1250, 170], [1360, 255], [1440, 210], [1470, 210], [1470, 520],
  ];
  const range = rc.polygon(
    peaks.map(([x, y]) => [box.rx(x), box.by(y)] as [number, number]),
    {
      stroke: c.mtnO, strokeWidth: 2, roughness: 1.9, bowing: 1.1,
      fill: c.mtn, fillStyle: 'dots', fillWeight: 2.3, hachureGap: 8, seed: 11,
    },
  );
  range.setAttribute('clip-path', 'url(#hero-above-water)');
  svg.appendChild(range);
}

/**
 * A wide watercolour wash, wider on the left, whose top rides up under the
 * road, with five flowing dotted lines on top, left to right (§4.6).
 */
function river({ svg, c, night, box }: Ctx) {
  const defs = el('defs');
  const grad = el('linearGradient', { id: 'hero-river-wash', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': c.washTop, 'stop-opacity': night ? 0.8 : 0.92 }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': c.washBot, 'stop-opacity': night ? 0.95 : 1 }));
  defs.appendChild(grad);
  const soft = el('filter', { id: 'hero-soft', x: '-5%', y: '-20%', width: '110%', height: '140%' });
  soft.appendChild(el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 3 }));
  defs.appendChild(soft);
  svg.appendChild(defs);

  svg.appendChild(
    el('path', {
      d: mapPath(
        'M-30,426 C260,412 520,442 800,458 C1060,474 1260,480 1470,484 L1470,640 L-30,640 Z',
        box.fx, box.by,
      ),
      fill: 'url(#hero-river-wash)',
      filter: 'url(#hero-soft)',
    }),
  );

  [[462, 506], [494, 524], [526, 542], [558, 560], [588, 578]].forEach(([yl, yr], i) => {
    const line = el('path', {
      d: mapPath(`M-30,${yl} Q420,${yl - 6} 820,${Math.trunc((yl + yr) / 2)} T1470,${yr}`, box.fx, box.by),
      fill: 'none',
      stroke: c.flow,
      'stroke-width': 6,
      'stroke-linecap': 'round',
      // One dot every 14px; the flow keyframe moves a whole number of dots.
      'stroke-dasharray': '0.1 13.9',
      class: 'flow',
      opacity: 0.95 - i * 0.12,
    });
    line.style.animationDuration = `${7 + i * 1.6}s`;
    svg.appendChild(line);
  });

  if (night) {
    [[180, 510], [640, 536], [1040, 500], [1300, 548]].forEach(([gx, gy], i) => {
      const g = el('circle', { cx: box.fx(gx), cy: box.by(gy), r: 2.6, fill: c.glint, class: 'tw' });
      g.style.animationDuration = `${3 + (i % 3)}s`;
      g.style.animationDelay = `${i * 0.7}s`;
      svg.appendChild(g);
    });
  }
}

/** A winding mud ribbon, higher on the left, drawn over the waterline (§4.8). */
function road({ rc, svg, c, box }: Ctx) {
  svg.appendChild(
    rc.path(mapPath(`${ROAD_TOP} ${ROAD_BOTTOM} Z`, box.fx, box.by), {
      stroke: c.road, strokeWidth: 1.3, roughness: 1.9,
      fill: c.road, fillStyle: 'dots', fillWeight: 2, hachureGap: 6.5, seed: 23,
    }),
  );
}

// ---------------------------------------------------------------- scene

const LAYERS: Record<string, ((ctx: Ctx) => void)[]> = {
  sky: [sunOrMoon],
  birds: [],
  // Back to front: mountains, river, then the road over the waterline.
  land: [mountains, river, road],
  orbit: [],
  characters: [],
};

/** Redraws every layer at the hero's current size with the day or night palette. */
export function drawScene(hero: HTMLElement): void {
  const night = isNight();
  hero.dataset.time = night ? 'night' : 'day';
  const c = colors(night);
  const box = makeBox(hero.clientWidth, hero.clientHeight);

  hero.querySelectorAll<SVGSVGElement>('svg[data-layer]').forEach((svg) => {
    clear(svg);
    svg.setAttribute('viewBox', `0 0 ${box.w} ${box.h}`);
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
