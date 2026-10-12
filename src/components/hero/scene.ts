// Drawing for the landing hero (design-reference/landing-scene-spec.md).
// The landscape and sun/moon are ported from design-reference/landscape-mock.html;
// stars, birds, boat and the other objects from design-reference/element-library.html.
//
// Everything is drawn in one scene coordinate system, 1440 × 760 (the spec's
// reference canvas), and the whole picture scales uniformly with the hero:
// "meet" fit, centred horizontally, pinned to the bottom. The SVG viewBox
// covers the entire hero in scene units, so where the hero is wider or
// taller than the frame, the sky, road and river simply continue into the
// extra space. The HTML parts of the scene (placards, name and bio) and the
// pointer use the same scale, so nothing drifts out of place.
//
// The landscape mock is 1440 × 620; it sits at the bottom of the scene frame,
// so a mock y becomes a scene y by adding 140.

import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const NS = 'http://www.w3.org/2000/svg';

/** The scene frame, in scene units. */
const SW = 1440;
const SH = 760;
/** Mock y → scene y (the mock's 620 rows sit at the bottom of the frame). */
const MY = SH - 620;
/** Below this the picture would be too small to read; phones crop instead. */
const MIN_SCALE = 0.5;
/** Explorer and dog size, relative to the prototype drawings. */
const FIG = 1.15;

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

/** How the scene frame maps onto the hero right now. */
export interface View {
  /** Hero size in CSS pixels. */
  w: number;
  h: number;
  /** CSS pixels per scene unit. */
  s: number;
  /** The visible part of the scene, in scene units (the SVG viewBox). */
  x0: number;
  y0: number;
  vw: number;
  vh: number;
  /** % of the visible area to scene units. */
  x: (pct: number) => number;
  y: (pct: number) => number;
  /** Scene point → hero pixels, and back. */
  toPx: (x: number, y: number) => [number, number];
  toScene: (px: number, py: number) => [number, number];
}

export function makeView(w: number, h: number): View {
  const s = Math.max(Math.min(w / SW, h / SH), MIN_SCALE);
  const vw = w / s;
  const vh = h / s;
  // Centred when the frame fits; when a phone is too narrow for all of it,
  // keep the right-hand side (mountains, sun and nav buttons) in view and
  // crop the empty left end of the road.
  const x0 = vw >= SW ? (SW - vw) / 2 : SW - vw;
  const y0 = SH - vh;
  return {
    w, h, s, x0, y0, vw, vh,
    x: (p) => x0 + (p / 100) * vw,
    y: (p) => y0 + (p / 100) * vh,
    toPx: (x, y) => [(x - x0) * s, (y - y0) * s],
    toScene: (px, py) => [x0 + px / s, y0 + py / s],
  };
}

/** Scene units of horizontal slack beyond the visible area, for extended paths. */
const PAD = 60;

/** Converts every "x,y" pair in an absolute path from mock to scene units. */
function mock(d: string) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+x},${+y + MY}`);
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
  v: View;
  /** Where the name and bio actually sit, in scene units. */
  text: Rect[];
  geo: Geometry;
}

// ---------------------------------------------------------------- sky

/** Sun by day, moon by night: top right of the frame, above the peaks (§4.2). */
function sunOrMoon({ rc, svg, c, night }: Ctx) {
  const sx = 1330;
  const sy = 98;

  if (!night) {
    svg.appendChild(
      rc.circle(sx, sy, 104, {
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
          x1: sx + Math.cos(a) * 62, y1: sy + Math.sin(a) * 62,
          x2: sx + Math.cos(a) * 84, y2: sy + Math.sin(a) * 84,
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
  svg.appendChild(el('circle', { cx: sx, cy: sy, r: 120, fill: 'url(#hero-moon-glow)', class: 'glow' }));
  svg.appendChild(
    rc.circle(sx, sy, 96, {
      stroke: c.moon, strokeWidth: 2.4, roughness: 1.3,
      fill: c.moon, fillStyle: 'dots', fillWeight: 1.5, hachureGap: 10, seed: 5,
    }),
  );
}

/** True if p is inside the polygon (even-odd rule). */
function insidePolygon(p: Pt, poly: Pt[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Night only: twinkling dots and two sparkles in the open sky (§4.3), spread
 * over the whole visible sky. Any that would land on the mountains, road or
 * water are left out (the mountains' dot fill would let them show through),
 * as are any on the name and bio.
 */
function stars({ svg, c, night, v, text, geo }: Ctx) {
  if (!night) return;
  const ridge = mountainOutline();
  const margin = 10;
  const inSky = (p: Pt) => {
    if (p[1] > geo.roadTop - margin || insidePolygon(p, ridge)) return false;
    for (let i = 0; i < ridge.length - 1; i++) {
      if (distToSegment(p, ridge[i], ridge[i + 1]) < margin) return false;
    }
    return !text.some((t) => distToRect(p, t) < margin);
  };

  const dots: Pt[] = [
    [4, 40], [8, 8], [18, 42], [27, 12], [35, 40], [39, 36], [44, 6], [49, 26],
    [56, 36], [61, 10], [64, 42], [68, 26], [73, 44], [77, 8], [83, 46], [88, 36],
    [96, 8], [97, 30],
    // Lower sky, between the orbit and the peaks; any that land on the
    // mountains are dropped by the check above.
    [42, 46], [46, 54], [52, 50], [58, 47], [62, 55], [33, 50], [24, 48],
    [12, 52], [70, 38], [79, 30], [91, 46], [54, 30],
  ];
  dots.forEach(([x, y], i) => {
    const p: Pt = [v.x(x), v.y(y)];
    if (!inSky(p)) return;
    const s = el('circle', { cx: p[0], cy: p[1], r: i % 3 ? 1.3 : 1.9, fill: c.star, class: 'tw' });
    s.style.animationDuration = `${3 + (i % 4)}s`;
    s.style.animationDelay = `${i * 0.4}s`;
    svg.appendChild(s);
  });
  ([[52, 16], [60, 20]] as Pt[]).forEach(([x, y], i) => {
    const p: Pt = [v.x(x), v.y(y)];
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
 * flapping at its own pace. At night they are white with a soft glow. They
 * cross the whole visible sky, side bands included.
 */
function birds({ svg, c, night, v }: Ctx) {
  const s = 1.1;
  // Flock layout from the library: x, y offsets and a flap delay.
  const flock: [number, number, number][] = [
    [0, 14, 0], [52, 0, 0.18], [110, 20, 0.42], [78, 40, 0.6],
  ];
  const flockW = 130 * s;
  // At the sun's height in the frame, so they always cross near it (and
  // never above the top edge of the view).
  const top = Math.max(88, v.y0 + 40);

  const g = el('g', { class: 'fly' });
  // Where the flock rests when motion is reduced: just left of the sun.
  g.setAttribute('transform', `translate(${Math.min(v.x(64), 1100)} ${top})`);
  // CSS transforms on SVG elements are in scene units here.
  g.style.setProperty('--from', `${v.x0 + v.vw + 20}px, ${top}px`);
  g.style.setProperty('--to', `${v.x0 - flockW - 40}px, ${top}px`);
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
// The bottom edge is also the waterline. Beyond x -30 and 1470 the road runs
// on level, so it fills any side band.
type Pt = [number, number];
const ROAD_TOP_PTS: Pt[] = [[-30, 398], [260, 384], [520, 414], [800, 430], [1060, 446], [1260, 452], [1470, 456]];
const ROAD_BOTTOM_PTS: Pt[] = [[-30, 438], [260, 424], [520, 454], [800, 470], [1060, 486], [1260, 492], [1470, 496]];
const pt = ([x, y]: Pt) => `${x},${y}`;
const roadEdge = (p: Pt[]) => `C${p.slice(1, 4).map(pt).join(' ')} C${p.slice(4).map(pt).join(' ')}`;
const reversed = (p: Pt[]) => [...p].reverse();

/** Left and right ends for paths that must reach past the visible area. */
const span = (v: View): [number, number] => [Math.min(-30, v.x0 - PAD), Math.max(1470, v.x0 + v.vw + PAD)];

/** The road ribbon (top edge, then bottom edge back), in mock units. */
function roadPath(v: View) {
  const [L, R] = span(v);
  const t = ROAD_TOP_PTS;
  const b = reversed(ROAD_BOTTOM_PTS);
  return `M${L},${t[0][1]} L${pt(t[0])} ${roadEdge(t)} L${R},${t[6][1]} L${R},${b[0][1]} L${pt(b[0])} ${roadEdge(b)} L${L},${b[6][1]} Z`;
}

/** Everything above the road's bottom edge (the waterline), in mock units. */
function aboveWaterPath(v: View) {
  const [L, R] = span(v);
  const b = reversed(ROAD_BOTTOM_PTS);
  return `M${L},-4000 L${R},-4000 L${R},${b[0][1]} L${pt(b[0])} ${roadEdge(b)} L${L},${b[6][1]} Z`;
}

/** Samples one road edge (mock control points) and returns its scene height at any x. */
function edgeY(ctrl: Pt[]): (x: number) => number {
  const p = ctrl.map(([x, y]) => [x, y + MY] as Pt);
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
  const last = samples.length - 1;
  return (x) => {
    // Level beyond the ends, as the road is drawn.
    if (x <= samples[0][0]) return samples[0][1];
    if (x >= samples[last][0]) return samples[last][1];
    let i = 1;
    while (i < last && samples[i][0] < x) i++;
    const [x0, y0] = samples[i - 1];
    const [x1, y1] = samples[i];
    return y0 + (y1 - y0) * (x1 === x0 ? 0 : (x - x0) / (x1 - x0));
  };
}

/** Where things stand on the road, plus the peaks that carry nav buttons. All in scene units. */
export interface Geometry {
  view: View;
  /** Feet height on the road at x (a little below the road's centre line). */
  roadY: (x: number) => number;
  /** The road's highest point; above it is sky or mountain. */
  roadTop: number;
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

function geometry(v: View): Geometry {
  const top = edgeY(ROAD_TOP_PTS);
  const bottom = edgeY(ROAD_BOTTOM_PTS);
  const buttons = NAV_PEAKS.map(([x, y]) => {
    const ay = y + MY;
    // Lower-middle of the peak's face: a bit over halfway from apex to road.
    return [x, ay + (top(x) - ay) * 0.58] as Pt;
  });
  // On very narrow phones the leftmost peak can fall off-screen; the header
  // nav always has all three pages.
  const visible = buttons.every(([x]) => x > v.x(4) && x < v.x(96));
  return {
    view: v,
    roadY: (x) => {
      const t = top(x);
      return t + (bottom(x) - t) * 0.62;
    },
    roadTop: 384 + MY,
    roadMin: v.x(5),
    roadMax: v.x(95),
    fig: FIG,
    idleX: v.x(48), // refined once the placards are measured
    buttons: visible ? buttons : [],
  };
}

/**
 * The mountain range's outline in scene units: the mock's peaks, with the
 * right end sloping down to the road so a wide screen's side band shows a
 * natural foothill rather than a cut edge.
 */
function mountainOutline(): Pt[] {
  const peaks: Pt[] = [
    [700, 520], [700, 460], [820, 300], [920, 350], [1040, 205], [1150, 300],
    [1250, 170], [1360, 255], [1440, 210], [1520, 300], [1640, 430], [1700, 520],
  ];
  return peaks.map(([x, y]) => [x, y + MY]);
}

/**
 * Peaks clustered on the right, tallest on the right, tapering left (§4.5).
 * The base runs well below the road and is clipped at the road's bottom edge,
 * so the range always meets the road with no gap.
 */
function mountains({ rc, svg, c, v }: Ctx) {
  const defs = el('defs');
  const clip = el('clipPath', { id: 'hero-above-water' });
  clip.appendChild(el('path', { d: mock(aboveWaterPath(v)) }));
  defs.appendChild(clip);
  svg.appendChild(defs);

  const range = rc.polygon(mountainOutline(), {
    stroke: c.mtnO, strokeWidth: 2, roughness: 1.9, bowing: 1.1,
    fill: c.mtn, fillStyle: 'dots', fillWeight: 2.1, hachureGap: 11, seed: 11,
  });
  range.setAttribute('clip-path', 'url(#hero-above-water)');
  svg.appendChild(range);
}

/**
 * River, part 1 (static): a wide watercolour wash, wider on the left, whose
 * top rides up under the road and which fills to the bottom edge (§4.6).
 */
function riverWash({ svg, c, night, v }: Ctx) {
  const defs = el('defs');
  const grad = el('linearGradient', { id: 'hero-river-wash', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': c.washTop, 'stop-opacity': night ? 0.8 : 0.92 }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': c.washBot, 'stop-opacity': night ? 0.95 : 1 }));
  defs.appendChild(grad);
  const soft = el('filter', { id: 'hero-soft', x: '-5%', y: '-20%', width: '110%', height: '140%' });
  soft.appendChild(el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 3 }));
  defs.appendChild(soft);
  svg.appendChild(defs);

  const [L, R] = span(v);
  svg.appendChild(
    el('path', {
      d: mock(`M${L},426 L-30,426 C260,412 520,442 800,458 C1060,474 1260,480 1470,484 L${R},484 L${R},680 L${L},680 Z`),
      fill: 'url(#hero-river-wash)',
      filter: 'url(#hero-soft)',
    }),
  );
}

/**
 * River, part 2 (animated): five flowing dotted lines on the wash, left to
 * right (§4.6). Kept in their own layer so the flow never repaints the dense
 * mountain and road dots.
 */
function riverFlow({ svg, c, v }: Ctx) {
  const [L, R] = span(v);
  [[462, 506], [494, 524], [526, 542], [558, 560], [588, 578]].forEach(([yl, yr], i) => {
    const line = el('path', {
      d: mock(`M${L},${yl} L-30,${yl} Q420,${yl - 6} 820,${Math.trunc((yl + yr) / 2)} T1470,${yr} L${R},${yr}`),
      fill: 'none',
      stroke: c.flow,
      'stroke-width': 6,
      'stroke-linecap': 'round',
      // One dot every 14 units; the flow keyframe moves a whole number of dots.
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
 * across the whole visible river, rocking gently, then looping (§4.7).
 */
function boat({ rc, svg, c, v }: Ctx) {
  const s = 0.95;
  // Library boat: hull spans x 64–156, gunwale at y 98. Re-centre on the gunwale.
  const ox = 110;
  const oy = 98;
  const hullW = 92 * s;
  const waterline = 560 + MY;

  const sail = el('g', { class: 'sail' });
  sail.setAttribute('transform', `translate(${v.x(30)} ${waterline})`);
  sail.style.setProperty('--from', `${v.x0 - hullW}px, ${waterline}px`);
  sail.style.setProperty('--to', `${v.x0 + v.vw + hullW}px, ${waterline}px`);
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
function road({ rc, svg, c, v }: Ctx) {
  svg.appendChild(
    rc.path(mock(roadPath(v)), {
      stroke: c.road, strokeWidth: 1.3, roughness: 1.9,
      fill: c.road, fillStyle: 'dots', fillWeight: 2, hachureGap: 6.5, seed: 23,
    }),
  );
}

// ---------------------------------------------------------------- orbit

/** Shortest distance from point p to the segment a–b. */
function distToSegment(p: Pt, a: Pt, b: Pt) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Shortest distance from point p to a rectangle (0 when inside). */
function distToRect(p: Pt, r: Rect) {
  const dx = Math.max(r.left - p[0], 0, p[0] - r.right);
  const dy = Math.max(r.top - p[1], 0, p[1] - r.bottom);
  return Math.hypot(dx, dy);
}

/**
 * Picks the orbit's centre in open sky: horizontally centred in view at about
 * 36% of the frame's height, then a little higher or lower, then stepping
 * left, until everything it sweeps (radius `reach`) clears the mountains, the
 * road and the name. On tall screens it may rise into the extra sky above
 * the frame. Falls back to the spot with the most room.
 */
function placeOrbit(v: View, geo: Geometry, text: Rect[], reach: number): Pt {
  const gap = 14;
  const ridge = mountainOutline();
  const room = (p: Pt) => {
    let d = geo.roadTop - p[1];
    for (let i = 0; i < ridge.length - 1; i++) d = Math.min(d, distToSegment(p, ridge[i], ridge[i + 1]));
    for (const t of text) d = Math.min(d, distToRect(p, t));
    // Stay inside the visible area.
    return Math.min(d, p[0] - v.x0, v.x0 + v.vw - p[0], p[1] - v.y0);
  };

  const ys = [36, 38, 40, 32, 28, 24, 20, 14, 8, 0, -10, -20, -35, -50].map((f) => (f / 100) * SH);
  let best: Pt = [v.x(50), ys[0]];
  let bestRoom = -Infinity;
  for (let x = 50; x >= 25; x -= 1) {
    for (const y of ys) {
      if (y < v.y0) continue;
      const p: Pt = [v.x(x), y];
      const d = room(p);
      if (d >= reach + gap) return p;
      if (d > bestRoom) [best, bestRoom] = [p, d];
    }
  }
  return best;
}

/**
 * Brain ⟲ books: a faint dashed ring in the open sky with a mini brain and a
 * mini open book circling it, turning in place (§4.10).
 */
function orbit({ rc, svg, c, v, text, geo }: Ctx) {
  const r = 60;
  // The library draws a 38-unit ring; the mini brain and book scale with it.
  const f = r / 38;
  // Farthest point swept: the open book's corner (44 × 30 units at half scale).
  const reach = Math.hypot(22 * f, r + 11 * f);
  const [cx, cy] = placeOrbit(v, geo, text, reach);

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
  const x = Math.max(geo.roadMin, geo.idleX - 64 * geo.fig);
  wrap.setAttribute('transform', `translate(${x} ${geo.roadY(x) - 6}) scale(${geo.fig})`);
  svg.appendChild(wrap);
}

// ---------------------------------------------------------------- HTML parts

/**
 * Sizes and places the name and bio from the same scale as the drawing, via
 * CSS custom properties on the hero. On desktop they sit where the frame puts
 * them; when there is extra sky above the frame (tall screens, phones) they
 * move up into it. Font sizes have a floor so phones stay readable.
 */
function placeText(hero: HTMLElement, v: View) {
  const [fx, fy] = v.toPx(86, 115);
  const band = Math.max(0, -v.y0 * v.s); // extra sky above the frame, in px
  const left = Math.max(24, fx);
  sizeText(hero, v.w, v.s, left);
  // A portrait hero is sized to fit the text above the scene (fitHero), so
  // the text starts at the top margin.
  const top = hero.dataset.fit === 'portrait' ? TEXT_TOP : Math.max(TEXT_TOP, fy - band * 0.65);
  hero.style.setProperty('--text-top', `${top}px`);
}

/** Font sizes and line length for the name and bio at scale s. */
function sizeText(hero: HTMLElement, w: number, s: number, left: number) {
  const st = hero.style;
  st.setProperty('--text-left', `${left}px`);
  st.setProperty('--text-width', `${Math.min(w - left - 24, 1268 * s)}px`);
  st.setProperty('--name-size', `${Math.max(30, 64 * s)}px`);
  st.setProperty('--bio-size', `${Math.max(12, 14 * s)}px`);
}

/** Space above the name, and between the bio and the top of the scene. */
const TEXT_TOP = 28;
const TEXT_GAP = 32;

/**
 * On portrait screens the scene is limited by width, and a hero of 85% of
 * the screen would leave a tall empty sky above it. There the hero is sized
 * instead to the scene plus room for the name and bio above it, so About
 * shows sooner. Landscape screens keep the CSS height (85% of the screen).
 */
function fitHero(hero: HTMLElement) {
  hero.style.height = '';
  delete hero.dataset.fit;
  const w = hero.clientWidth;
  const base = hero.clientHeight; // the CSS height
  const s = Math.max(Math.min(w / SW, base / SH), MIN_SCALE);
  if (SH * s >= base) return; // the scene already fills the height
  sizeText(hero, w, s, Math.max(24, (86 - makeView(w, base).x0) * s));
  const text = hero.querySelector<HTMLElement>('.text');
  const needed = Math.ceil(TEXT_TOP + (text?.offsetHeight ?? 0) + TEXT_GAP + SH * s);
  if (needed >= base) return;
  hero.style.height = `${needed}px`;
  hero.dataset.fit = 'portrait';
}

/**
 * Places the three mountain nav links (real <a> elements in the page) on
 * their peaks, sized with the scene, and draws a rough placard behind each
 * label (§4.9). Returns each placard's half-size in scene units.
 */
function placeNavButtons(hero: HTMLElement, geo: Geometry): Pt[] {
  const v = geo.view;
  const half: Pt[] = [];
  hero.querySelectorAll<HTMLAnchorElement>('.peak-link').forEach((a, i) => {
    const pos = geo.buttons[i];
    a.hidden = !pos;
    if (!pos) return;
    const [px, py] = v.toPx(pos[0], pos[1]);
    a.style.left = `${px}px`;
    a.style.top = `${py}px`;
    a.style.fontSize = `${Math.max(11, 12.5 * v.s)}px`;
    const w = a.offsetWidth;
    const h = a.offsetHeight;
    half[i] = [w / 2 / v.s, h / 2 / v.s];
    const bg = a.querySelector<SVGSVGElement>('.peak-bg');
    if (!bg) return;
    clear(bg);
    bg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    bg.appendChild(
      rough.svg(bg).rectangle(1.5, 1.5, w - 3, h - 3, {
        strokeWidth: 1.4, roughness: 1.5, fill: '#fff', fillStyle: 'solid', seed: 61 + i,
      }),
    );
  });
  return half;
}

/**
 * The explorer's resting spot: as near the lower centre of the view as
 * possible without his head touching a placard.
 */
function idleSpot(geo: Geometry, half: Pt[]): number {
  const head = 72 * geo.fig + 6;
  const clear = (x: number) =>
    geo.buttons.every(([bx, by], i) => {
      const [hw, hh] = half[i] ?? [0, 0];
      return Math.abs(x - bx) > hw + 24 * geo.fig || geo.roadY(x) - head > by + hh;
    });
  const mid = geo.view.x(48);
  for (let d = 0; d <= geo.view.vw / 2; d += 8) {
    for (const x of [mid - d, mid + d]) {
      if (x >= geo.roadMin + 64 * geo.fig && x <= geo.roadMax && clear(x)) return x;
    }
  }
  return mid;
}

// ---------------------------------------------------------------- scene

const LAYERS: Record<string, ((ctx: Ctx) => void)[]> = {
  sky: [stars, sunOrMoon],
  birds: [birds],
  // Back to front: mountains and the river wash (static), the flowing water
  // and boat (animated), then the road over the waterline (static). The
  // static layers are composited on their own, so they are painted once.
  land: [mountains, riverWash],
  water: [riverFlow, boat],
  road: [road],
  orbit: [orbit],
  characters: [dog, explorer],
};

/**
 * Redraws every layer for the hero's current size with the day or night
 * palette, places the HTML parts to match, and returns the scene geometry
 * for motion.ts.
 */
export function drawScene(hero: HTMLElement): Geometry {
  const night = isNight();
  hero.dataset.time = night ? 'night' : 'day';
  const c = colors(night);
  fitHero(hero);
  const v = makeView(hero.clientWidth, hero.clientHeight);
  hero.style.setProperty('--scene-scale', String(v.s));

  // The text is placed first, so the drawing can keep clear of it.
  placeText(hero, v);
  const origin = hero.getBoundingClientRect();
  const text = [...hero.querySelectorAll('.name, .bio')].map((node) => {
    // The tight box around the words, not the full-width block. Once the
    // repel script has split the text, use the word boxes: they ignore the
    // letters' current scatter, so a redraw mid-scatter measures the same.
    const words = node.querySelectorAll('.word');
    const rects = words.length
      ? [...words].map((w) => w.getBoundingClientRect())
      : [(() => {
          const range = document.createRange();
          range.selectNodeContents(node);
          return range.getBoundingClientRect();
        })()];
    const [left, top] = v.toScene(Math.min(...rects.map((r) => r.left)) - origin.left, Math.min(...rects.map((r) => r.top)) - origin.top);
    const [right, bottom] = v.toScene(Math.max(...rects.map((r) => r.right)) - origin.left, Math.max(...rects.map((r) => r.bottom)) - origin.top);
    return { left, top, right, bottom };
  });

  const geo = geometry(v);
  geo.idleX = idleSpot(geo, placeNavButtons(hero, geo));

  hero.querySelectorAll<SVGSVGElement>('svg[data-layer]').forEach((svg) => {
    clear(svg);
    // The viewBox has the hero's exact aspect ratio, so "meet" never adds
    // bands of its own; it only keeps the scale uniform.
    svg.setAttribute('viewBox', `${v.x0} ${v.y0} ${v.vw} ${v.vh}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    const rc = rough.svg(svg);
    for (const draw of LAYERS[svg.dataset.layer ?? ''] ?? []) {
      draw({ rc, svg, c, night, v, text, geo });
    }
  });
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
  // A portrait-fitted hero has a fixed height, so a change in the window's
  // height alone (rotating, resizing) does not resize it; recheck the fit.
  let lastH = window.innerHeight;
  window.addEventListener('resize', () => {
    if (window.innerHeight === lastH || !hero.dataset.fit) return;
    lastH = window.innerHeight;
    cb();
  });
}
