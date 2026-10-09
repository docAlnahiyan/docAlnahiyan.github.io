// Drawing for the landing hero (design-reference/landing-scene-spec.md).
// The landscape and sun/moon are ported from design-reference/landscape-mock.html;
// stars, birds, boat and the other objects from design-reference/element-library.html.
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
        washTop: '#1f3a4d', washBot: '#13303f', flow: '#49a7da',
        sun: '#e8a54a', moon: '#f0e7d6', star: '#f3eee4', brain: '#ea9c7e',
        book: '#c7c0b2', bird: '#f4f1ea',
      }
    : {
        char: '#c96442', mtn: '#6f9b57', mtnO: '#4f7540', road: '#9c7a52',
        washTop: '#bfe6fb', washBot: '#4fbfed', flow: '#1f9fe0',
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

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Ctx {
  rc: RoughSVG;
  svg: SVGSVGElement;
  c: Palette;
  night: boolean;
  box: Box;
  /** Where the name and bio actually sit, relative to the hero. */
  text: Rect[];
  geo: Geometry;
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

/** True if p is inside the polygon (even-odd rule). */
function insidePolygon(p: [number, number], poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Night only: twinkling dots and two sparkles in the open sky (§4.3). Any
 * that would land on the mountains, road or water at this width are left
 * out (the mountains' dot fill would let them show through), as are any on
 * the name and bio.
 */
function stars({ svg, c, night, box, text }: Ctx) {
  if (!night) return;
  const ridge = mountainOutline(box);
  const roadTop = box.by(384);
  const margin = 10;
  const inSky = (p: [number, number]) => {
    if (p[1] > roadTop - margin || insidePolygon(p, ridge)) return false;
    for (let i = 0; i < ridge.length - 1; i++) {
      if (distToSegment(p, ridge[i], ridge[i + 1]) < margin) return false;
    }
    return !text.some((t) => distToRect(p, t) < margin);
  };

  const dots: [number, number][] = [
    [4, 40], [8, 8], [18, 42], [27, 12], [35, 40], [39, 36], [44, 6], [49, 26],
    [56, 36], [61, 10], [64, 42], [68, 26], [73, 44], [77, 8], [83, 46], [88, 36],
    [96, 8], [97, 30],
    // Lower sky, between the orbit and the peaks; any that land on the
    // mountains at this width are dropped by the check below.
    [42, 46], [46, 54], [52, 50], [58, 47], [62, 55], [33, 50], [24, 48],
    [12, 52], [70, 38], [79, 30], [91, 46], [54, 30],
  ];
  dots.forEach(([x, y], i) => {
    const p: [number, number] = [box.x(x), box.y(y)];
    if (!inSky(p)) return;
    const s = el('circle', { cx: p[0], cy: p[1], r: i % 3 ? 1.3 : 1.9, fill: c.star, class: 'tw' });
    s.style.animationDuration = `${3 + (i % 4)}s`;
    s.style.animationDelay = `${i * 0.4}s`;
    svg.appendChild(s);
  });
  ([[52, 16], [60, 20]] as [number, number][]).forEach(([x, y], i) => {
    const p: [number, number] = [box.x(x), box.y(y)];
    if (!inSky(p)) return;
    const g = el('g', { class: 'tw' });
    g.style.animationDuration = '4.5s';
    g.style.animationDelay = `${i * 1.2}s`;
    const arm = { stroke: c.star, 'stroke-width': 1.4, 'stroke-linecap': 'round' };
    g.appendChild(el('line', { x1: p[0] - 6, y1: p[1], x2: p[0] + 6, y2: p[1], ...arm }));
    g.appendChild(el('line', { x1: p[0], y1: p[1] - 6, x2: p[0], y2: p[1] + 6, ...arm }));
    svg.appendChild(g);
  });
}

/**
 * Four birds gliding right to left across the sun and looping (§4.4), each
 * flapping at its own pace. At night they are white with a soft glow.
 */
function birds({ svg, c, night, box }: Ctx) {
  const s = Math.min(1.3, Math.max(0.8, box.w / 1200));
  // Flock layout from the library: x, y offsets and a flap delay.
  const flock: [number, number, number][] = [
    [0, 14, 0], [52, 0, 0.18], [110, 20, 0.42], [78, 40, 0.6],
  ];
  const flockW = 130 * s;
  const top = box.y(12);

  const g = el('g', { class: 'fly' });
  // Where the flock rests when motion is reduced: just left of the sun.
  g.setAttribute('transform', `translate(${box.x(64)} ${top})`);
  g.style.setProperty('--from', `${box.w + 20}px, ${top}px`);
  g.style.setProperty('--to', `${-flockW - 40}px, ${top}px`);
  // Start part-way across, so the sky is not empty on arrival.
  g.style.animationDelay = '-7s';

  if (night) {
    const defs = el('defs');
    const glow = el('filter', { id: 'hero-bird-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    glow.appendChild(el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 2.2, result: 'b' }));
    const merge = el('feMerge');
    merge.appendChild(el('feMergeNode', { in: 'b' }));
    merge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
    glow.appendChild(merge);
    defs.appendChild(glow);
    svg.appendChild(defs);
    g.setAttribute('filter', 'url(#hero-bird-glow)');
  }

  for (const [ox, oy, delay] of flock) {
    const x = ox * s;
    const y = oy * s;
    const w = 11 * s;
    const up = `M${x - w},${y + 5 * s} Q${x - 5 * s},${y - 7 * s} ${x},${y} Q${x + 5 * s},${y - 7 * s} ${x + w},${y + 5 * s}`;
    const dn = `M${x - w},${y - 3 * s} Q${x - 5 * s},${y + 5 * s} ${x},${y} Q${x + 5 * s},${y + 5 * s} ${x + w},${y - 3 * s}`;
    const bird = el('path', { d: up, fill: 'none', stroke: c.bird, 'stroke-width': 2, 'stroke-linecap': 'round' });
    bird.appendChild(
      el('animate', {
        attributeName: 'd', values: `${up};${dn};${up}`, keyTimes: '0;0.5;1',
        dur: `${0.5 + delay}s`, begin: `${delay}s`, repeatCount: 'indefinite',
      }),
    );
    g.appendChild(bird);
  }
  svg.appendChild(g);
}

// ---------------------------------------------------------------- land

// The road's two edges, in mock units, left to right: two cubic Béziers each.
// The bottom edge is also the waterline.
type Pt = [number, number];
const ROAD_TOP_PTS: Pt[] = [[-30, 398], [260, 384], [520, 414], [800, 430], [1060, 446], [1260, 452], [1470, 456]];
const ROAD_BOTTOM_PTS: Pt[] = [[-30, 438], [260, 424], [520, 454], [800, 470], [1060, 486], [1260, 492], [1470, 496]];
const pt = ([x, y]: Pt) => `${x},${y}`;
const ROAD_TOP = `M${pt(ROAD_TOP_PTS[0])} C${ROAD_TOP_PTS.slice(1, 4).map(pt).join(' ')} C${ROAD_TOP_PTS.slice(4).map(pt).join(' ')}`;
const ROAD_BOTTOM = `L${pt(ROAD_BOTTOM_PTS[6])} C${[5, 4, 3].map((i) => pt(ROAD_BOTTOM_PTS[i])).join(' ')} C${[2, 1, 0].map((i) => pt(ROAD_BOTTOM_PTS[i])).join(' ')}`;

/**
 * Samples one road edge in pixels and returns its height at any x. The mapping
 * from mock units is linear on each axis, so sampling the mapped control
 * points gives the same curve that is drawn.
 */
function edgeY(box: Box, ctrl: Pt[]): (x: number) => number {
  const p = ctrl.map(([x, y]) => [box.fx(x), box.by(y)] as Pt);
  const samples: Pt[] = [];
  for (const seg of [p.slice(0, 4), p.slice(3, 7)]) {
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const u = 1 - t;
      const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      samples.push([
        a * seg[0][0] + b * seg[1][0] + c * seg[2][0] + d * seg[3][0],
        a * seg[0][1] + b * seg[1][1] + c * seg[2][1] + d * seg[3][1],
      ]);
    }
  }
  return (x) => {
    let i = 1;
    while (i < samples.length - 1 && samples[i][0] < x) i++;
    const [x0, y0] = samples[i - 1];
    const [x1, y1] = samples[i];
    return y0 + (y1 - y0) * (x1 === x0 ? 0 : (x - x0) / (x1 - x0));
  };
}

/** Where things stand on the road, plus the peaks that carry nav buttons. */
export interface Geometry {
  w: number;
  h: number;
  /** Feet height on the road at x (a little below the road's centre line). */
  roadY: (x: number) => number;
  roadMin: number;
  roadMax: number;
  /** Size of the explorer and dog relative to the prototype. */
  fig: number;
  /** Where the explorer rests: lower centre, kept clear of the buttons. */
  idleX: number;
  /** Button centres on the peaks, left to right; empty when they are hidden. */
  buttons: Pt[];
}

/** The three peaks (mock apex) that carry Research, Publications, Projects. */
const NAV_PEAKS: Pt[] = [[820, 300], [1040, 205], [1250, 170]];

function geometry(box: Box): Geometry {
  const top = edgeY(box, ROAD_TOP_PTS);
  const bottom = edgeY(box, ROAD_BOTTOM_PTS);
  const buttons = NAV_PEAKS.map(([x, y]) => {
    const ax = box.rx(x);
    const ay = box.by(y);
    // Lower-middle of the peak's face: a bit over halfway from apex to road.
    return [ax, ay + (top(ax) - ay) * 0.58] as Pt;
  });
  const fig = Math.min(1.15, Math.max(0.8, box.k));
  // On narrow screens the leftmost peak is off-screen; the header nav covers it.
  const visible = buttons.every(([x]) => x > box.w * 0.04 && x < box.w * 0.96);
  return {
    w: box.w,
    h: box.h,
    roadY: (x) => {
      const t = top(x);
      return t + (bottom(x) - t) * 0.62;
    },
    roadMin: box.w * 0.05,
    roadMax: box.w * 0.95,
    fig,
    idleX: visible ? Math.max(box.w * 0.3, Math.min(box.w * 0.48, buttons[0][0] - 80 * fig)) : box.w * 0.48,
    buttons: visible ? buttons : [],
  };
}

/** The mountain range's outline in pixels (mock peaks, anchored right). */
function mountainOutline(box: Box): [number, number][] {
  const peaks: [number, number][] = [
    [700, 520], [700, 460], [820, 300], [920, 350], [1040, 205], [1150, 300],
    [1250, 170], [1360, 255], [1440, 210], [1470, 210], [1470, 520],
  ];
  return peaks.map(([x, y]) => [box.rx(x), box.by(y)]);
}

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

  const range = rc.polygon(
    mountainOutline(box),
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
  // No twinkling glints on the water: twinkles belong to the sky only.
}

/**
 * A wooden boat with a small rower, sailing left to right with the current
 * and rocking gently, then looping (§4.7).
 */
function boat({ rc, svg, c, box }: Ctx) {
  const s = box.k * 0.85;
  // Library boat: hull spans x 64–156, gunwale at y 98. Re-centre on the gunwale.
  const ox = 110;
  const oy = 98;
  const hullW = 92 * s;
  const waterline = box.by(560);

  const sail = el('g', { class: 'sail' });
  sail.setAttribute('transform', `translate(${box.x(30)} ${waterline})`);
  sail.style.setProperty('--from', `${-hullW}px, ${waterline}px`);
  sail.style.setProperty('--to', `${box.w + hullW}px, ${waterline}px`);
  sail.style.animationDelay = '-8s';

  const rock = el('g', { class: 'rock' });
  const body = el('g', { transform: `scale(${s}) translate(${-ox} ${-oy})` });
  const wood = { stroke: c.road, strokeWidth: 2.4 / s, roughness: 1.5, seed: 31 };
  body.appendChild(
    rc.path('M64,98 L156,98 Q152,120 110,122 Q68,120 64,98 Z', {
      ...wood, fill: c.road, fillStyle: 'dots', fillWeight: 1.6 / s, hachureGap: 7 / s,
    }),
  );
  body.appendChild(rc.line(64, 98, 156, 98, { ...wood, strokeWidth: 2.2 / s, roughness: 1.4 }));
  // The rower; an empty boat can't move.
  const rower = { stroke: c.char, strokeWidth: 2.2 / s, roughness: 1.6, seed: 37 };
  body.appendChild(rc.circle(108, 66, 15, rower));
  body.appendChild(rc.line(108, 73, 108, 96, rower));
  body.appendChild(rc.line(108, 80, 122, 88, rower));
  body.appendChild(rc.line(116, 76, 138, 110, { ...rower, roughness: 1.5 }));
  rock.appendChild(body);
  sail.appendChild(rock);
  svg.appendChild(sail);
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

// ---------------------------------------------------------------- orbit

/** Shortest distance from point p to the segment a–b. */
function distToSegment(p: [number, number], a: [number, number], b: [number, number]) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Shortest distance from point p to a rectangle (0 when inside). */
function distToRect(p: [number, number], r: Rect) {
  const dx = Math.max(r.left - p[0], 0, p[0] - r.right);
  const dy = Math.max(r.top - p[1], 0, p[1] - r.bottom);
  return Math.hypot(dx, dy);
}

/**
 * Picks the orbit's centre in the open sky: centred at about 38% height,
 * then 36% or 40%, then stepping left, until everything it sweeps (radius
 * `reach`) clears the mountains, the road and the name. Falls back to the
 * spot with the most room if none is fully clear.
 */
function placeOrbit(box: Box, text: Rect[], reach: number): [number, number] {
  const gap = 14;
  const ridge = mountainOutline(box);
  // The road's highest point; everything above it is sky or mountain.
  const roadTop = box.by(384);

  const room = (p: [number, number]) => {
    let d = roadTop - p[1];
    for (let i = 0; i < ridge.length - 1; i++) d = Math.min(d, distToSegment(p, ridge[i], ridge[i + 1]));
    for (const t of text) d = Math.min(d, distToRect(p, t));
    // Stay inside the hero.
    d = Math.min(d, p[0], box.w - p[0], p[1]);
    return d;
  };

  let best: [number, number] = [box.x(50), box.y(38)];
  let bestRoom = -Infinity;
  for (let x = 50; x >= 30; x -= 1) {
    for (const y of [38, 36, 40]) {
      const p: [number, number] = [box.x(x), box.y(y)];
      const d = room(p);
      if (d >= reach + gap) return p;
      if (d > bestRoom) [best, bestRoom] = [p, d];
    }
  }
  return best;
}

/**
 * Brain ⟲ books: a faint dashed ring at dead centre with a mini brain and a
 * mini open book circling it, turning in place (§4.10).
 */
function orbit({ rc, svg, c, box, text }: Ctx) {
  // About 60px on desktop, a little smaller on phones.
  const r = 60 * Math.min(1.07, Math.max(0.75, box.w / 1440));
  // The library draws a 38px ring; the mini brain and book scale with it.
  const f = r / 38;
  // Farthest point swept: the open book's corner (44 × 30 units at half scale).
  const reach = Math.hypot(22 * f, r + 11 * f);
  const [cx, cy] = placeOrbit(box, text, reach);

  svg.appendChild(
    el('circle', {
      cx, cy, r, fill: 'none', stroke: c.brain, 'stroke-width': 1.3,
      'stroke-dasharray': '2 6', 'stroke-linecap': 'round', opacity: 0.5,
    }),
  );
  // Direction chevron on the right edge (clockwise).
  svg.appendChild(
    el('path', {
      d: `M${cx + r - 5 * f},${cy + 2 * f} L${cx + r},${cy + 9 * f} L${cx + r + 5 * f},${cy + 2 * f}`,
      fill: 'none', stroke: c.brain, 'stroke-width': 1.3,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.6,
    }),
  );

  const g = el('g');
  const brain = el('g', { transform: `translate(${cx} ${cy - r}) scale(${0.5 * f})` });
  brain.appendChild(
    rc.path(
      'M0,-16 q-16,-6 -24,6 q-14,2 -12,16 q-10,8 -2,18 q-2,14 14,14 q8,8 24,2 q16,6 24,-2 q16,0 14,-14 q8,-10 -2,-18 q2,-14 -12,-16 q-8,-12 -24,-6 Z',
      {
        stroke: c.brain, strokeWidth: 2.8, roughness: 1.5,
        fill: c.brain, fillStyle: 'dots', fillWeight: 2.4, hachureGap: 9, seed: 41,
      },
    ),
  );
  const book = el('g', { transform: `translate(${cx} ${cy + r}) scale(${0.5 * f})` });
  const page = { stroke: c.book, strokeWidth: 2.8, roughness: 1.3, seed: 43 };
  book.appendChild(rc.path('M0,2 C-13,-6 -30,-8 -44,-5 L-44,15 C-30,14 -13,16 0,22 Z', page));
  book.appendChild(rc.path('M0,2 C13,-6 30,-8 44,-5 L44,15 C30,14 13,16 0,22 Z', page));
  book.appendChild(el('line', { x1: 0, y1: 2, x2: 0, y2: 22, stroke: c.book, 'stroke-width': 2.8 }));
  g.appendChild(brain);
  g.appendChild(book);
  g.appendChild(
    el('animateTransform', {
      attributeName: 'transform', type: 'rotate',
      from: `0 ${cx} ${cy}`, to: `360 ${cx} ${cy}`, dur: '16s', repeatCount: 'indefinite',
    }),
  );
  svg.appendChild(g);
}

// ---------------------------------------------------------------- characters

// Ported from design-reference/explorer-proto.html. Each figure is drawn once,
// origin at the feet, with every limb in its own group so motion.ts can swing
// it. Until motion.ts takes over (or with reduced motion), they stand at the
// idle spot on the road.

/** The explorer: about 72 units tall, limbs tagged for the walk cycle. */
function explorer({ rc, svg, c, geo }: Ctx) {
  const o = { stroke: c.char, strokeWidth: 2.4, roughness: 1.4, seed: 51 };
  const wrap = el('g', { 'data-actor': 'explorer' });
  const body = el('g');
  body.appendChild(rc.circle(0, -62, 22, o));
  body.appendChild(rc.line(0, -51, 0, -24, o));
  const limb = (name: string, jx: number, jy: number, x2: number, y2: number) => {
    const g = el('g', { 'data-limb': name });
    g.appendChild(rc.line(jx, jy, x2, y2, o));
    body.appendChild(g);
  };
  limb('armL', 0, -46, -15, -34);
  limb('armR', 0, -46, 15, -34);
  limb('legL', 0, -24, -11, 0);
  limb('legR', 0, -24, 11, 0);
  wrap.appendChild(body);
  const x = geo.idleX;
  wrap.setAttribute('transform', `translate(${x} ${geo.roadY(x)}) scale(${geo.fig})`);
  svg.appendChild(wrap);
}

/** The dog: smaller, four legs, a wagging tail, trailing the explorer. */
function dog({ rc, svg, c, geo }: Ctx) {
  const o = { stroke: c.char, strokeWidth: 2.1, roughness: 1.4, seed: 53 };
  const wrap = el('g', { 'data-actor': 'dog' });
  const body = el('g');
  body.appendChild(rc.ellipse(0, -16, 46, 20, o));
  body.appendChild(rc.circle(26, -22, 16, o));
  body.appendChild(rc.path('M20,-28 L24,-38 L31,-30', o));
  body.appendChild(rc.path('M33,-20 q9,0 10,5 q-7,2 -11,-1', o));
  for (const [name, lx] of [['l1', -16], ['l2', -6], ['l3', 6], ['l4', 16]] as const) {
    const g = el('g', { 'data-limb': name, 'data-x': lx });
    g.appendChild(rc.line(lx, -7, lx, 6, o));
    body.appendChild(g);
  }
  const tail = el('g', { 'data-limb': 'tail' });
  tail.appendChild(rc.path('M-22,-20 q-11,-2 -8,-15', o));
  body.appendChild(tail);
  body.appendChild(rc.circle(30, -24, 2.4, { fill: c.char, fillStyle: 'solid', stroke: 'none', seed: 55 }));
  wrap.appendChild(body);
  const x = geo.idleX - 64 * geo.fig;
  wrap.setAttribute('transform', `translate(${x} ${geo.roadY(x) - 6}) scale(${geo.fig})`);
  svg.appendChild(wrap);
}

/**
 * Positions the three mountain nav links (real <a> elements in the page) on
 * their peaks and draws a rough placard behind each label (§4.9).
 */
function placeNavButtons(hero: HTMLElement, geo: Geometry) {
  const links = hero.querySelectorAll<HTMLAnchorElement>('.peak-link');
  links.forEach((a, i) => {
    const pos = geo.buttons[i];
    a.hidden = !pos;
    if (!pos) return;
    a.style.left = `${pos[0]}px`;
    a.style.top = `${pos[1]}px`;
    const bg = a.querySelector<SVGSVGElement>('.peak-bg');
    if (!bg) return;
    clear(bg);
    const w = a.offsetWidth;
    const h = a.offsetHeight;
    bg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    bg.appendChild(
      rough.svg(bg).rectangle(1.5, 1.5, w - 3, h - 3, {
        strokeWidth: 1.4, roughness: 1.5, fill: '#fff', fillStyle: 'solid', seed: 61 + i,
      }),
    );
  });
}

// ---------------------------------------------------------------- scene

const LAYERS: Record<string, ((ctx: Ctx) => void)[]> = {
  sky: [stars, sunOrMoon],
  birds: [birds],
  // Back to front: mountains, river and boat, then the road over the waterline.
  land: [mountains, river, boat, road],
  orbit: [orbit],
  characters: [dog, explorer],
};

/**
 * Redraws every layer at the hero's current size with the day or night
 * palette, and returns the road and button geometry for motion.ts.
 */
export function drawScene(hero: HTMLElement): Geometry {
  const night = isNight();
  hero.dataset.time = night ? 'night' : 'day';
  const c = colors(night);
  const box = makeBox(hero.clientWidth, hero.clientHeight);
  const geo = geometry(box);
  const origin = hero.getBoundingClientRect();
  const text = [...hero.querySelectorAll('.name, .bio')].map((node) => {
    // The tight box around the words, not the full-width block.
    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    return {
      left: r.left - origin.left, top: r.top - origin.top,
      right: r.right - origin.left, bottom: r.bottom - origin.top,
    };
  });

  hero.querySelectorAll<SVGSVGElement>('svg[data-layer]').forEach((svg) => {
    clear(svg);
    svg.setAttribute('viewBox', `0 0 ${box.w} ${box.h}`);
    // The viewBox matches the box exactly; "none" just avoids a shrunken frame
    // if the box resizes before the next redraw.
    svg.setAttribute('preserveAspectRatio', 'none');
    const rc = rough.svg(svg);
    for (const draw of LAYERS[svg.dataset.layer ?? ''] ?? []) {
      draw({ rc, svg, c, night, box, text, geo });
    }
  });
  placeNavButtons(hero, geo);
  return geo;
}

/**
 * Redraws when the hero changes size. ResizeObserver already runs once per
 * frame, before paint, so the new drawing appears in the same frame.
 */
export function onResize(hero: HTMLElement, cb: () => void): void {
  let w = hero.clientWidth;
  let h = hero.clientHeight;
  new ResizeObserver(() => {
    if (hero.clientWidth === w && hero.clientHeight === h) return;
    w = hero.clientWidth;
    h = hero.clientHeight;
    cb();
  }).observe(hero);
}
