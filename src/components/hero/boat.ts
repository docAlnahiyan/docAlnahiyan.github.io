// The river boat (design-reference/landing-scene-spec.md §4.7), ported from
// design-reference/boat-demo.html: a rower pulling a full oar stroke (catch →
// drive → finish → lift → recover) with a small splash at the catch, a wake,
// and a bow lantern that lights only at night, with a shimmering reflection
// on the river.
//
// The boat is drawn in the demo's own coordinates (waterline y 270, hull
// centred on x 420) inside a group that scales it by K and places it on the
// hero's waterline, so the demo's stroke maths carries over unchanged.
// It travels left → right across the river at a speed that drifts between
// slow and quick; the stroke rate, splash and wake all follow that speed.
// Each frame is driven by the hero's shared loop (motion.ts), so it pauses
// with everything else; with reduced motion it holds one composed pose.

import type { RoughSVG } from 'roughjs/bin/svg';
import type { Tick } from './motion';
import type { Palette, View } from './scene';

const NS = 'http://www.w3.org/2000/svg';

/** Demo units → scene units. */
const K = 0.6;
/** Demo waterline and the boat's centre. */
const WATER = 270;
const CX = 420;
/** Oar pivot (rowlock), outboard and inboard oar lengths. */
const P = { x: 430, y: 258 };
const LO = 132;
const LI = 58;
/** Rower's hip and shoulder, and the lantern's centre. */
const HIP = { x: 452, y: 258 };
const SHOULDER = { x: 446, y: 232 };
const LX = 528.5;
const LY = 228;
const DEG = 180 / Math.PI;

/** Mean travel speed, scene units per second (about 24 s per crossing on a desktop). */
const MEAN = 66;
/** The speed drifts between these multiples of the mean. */
const F_MIN = 0.35;
const F_MAX = 1.65;

/** Kept across redraws, so a theme switch or resize does not jump the boat. */
const state = { prog: null as number | null, phase: 0.2, t: 0, v: 0.45 };

export interface BoatParts {
  night: boolean;
  travel: SVGGElement;
  body: SVGGElement;
  torso: SVGGElement;
  oar: SVGGElement;
  arm: SVGPathElement;
  splash: SVGPathElement;
  wake: SVGPathElement;
  glow?: SVGCircleElement;
  flame?: SVGCircleElement;
  refl?: SVGLineElement[];
  /** Waterline and travel range, in scene units. */
  waterline: number;
  from: number;
  to: number;
}

function el<T extends SVGElement>(tag: string, attrs: Record<string, string | number>, parent?: Element): T {
  const e = document.createElementNS(NS, tag) as T;
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent?.appendChild(e);
  return e;
}

/** Stroke widths in demo units that read like the rest of the scene once scaled by K. */
const w = (demo: number) => (demo / K) * 0.95;

export function drawBoat(rc: RoughSVG, svg: SVGSVGElement, c: Palette, night: boolean, v: View, waterline: number): BoatParts {
  const wood = { stroke: c.road, roughness: 1.4 };
  const rower = { stroke: c.char, roughness: 1.3 };

  if (night) {
    const defs = el('defs', {}, svg);
    const glow = el('radialGradient', { id: 'hero-lamp-glow', cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    for (const [offset, op] of [[0, 0.95], [0.4, 0.45], [1, 0]])
      el('stop', { offset, 'stop-color': c.lamp, 'stop-opacity': op }, glow);
    const soft = el('filter', { id: 'hero-lamp-soft', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feGaussianBlur', { stdDeviation: 3 }, soft);
  }

  const travel = el<SVGGElement>('g', {}, svg);
  // Wake and reflection ride with the boat but not its rocking.
  const wake = el<SVGPathElement>('path', { fill: 'none', stroke: c.flow, 'stroke-width': w(1.6), 'stroke-linecap': 'round' }, travel);
  let refl: SVGLineElement[] | undefined;
  if (night) {
    const g = el('g', { filter: 'url(#hero-lamp-soft)' }, travel);
    refl = Array.from({ length: 9 }, (_, i) =>
      el<SVGLineElement>('line', {
        stroke: c.lamp, 'stroke-width': (3.4 - i * 0.25).toFixed(1), 'stroke-linecap': 'round', opacity: (0.5 - i * 0.045).toFixed(2),
      }, g),
    );
  }

  const body = el<SVGGElement>('g', {}, travel);
  // A solid backing in the river's colour, so the flow dots don't show
  // through the gaps in the hull's hatching.
  el('path', { d: 'M 300 268 C 330 300, 500 300, 540 268 L 520 262 C 470 276, 360 276, 318 262 Z', fill: c.washTop }, body);
  body.appendChild(rc.path('M 300 268 C 330 300, 500 300, 540 268 L 520 262 C 470 276, 360 276, 318 262 Z', {
    ...wood, strokeWidth: w(2.4), fill: c.road, fillStyle: 'hachure', fillWeight: w(1), hachureGap: w(6), roughness: 1.6, seed: 31,
  }));
  body.appendChild(rc.line(316, 263, 522, 263, { ...wood, strokeWidth: w(2), seed: 32 }));

  // Bow lantern on its pole.
  body.appendChild(rc.line(508, 262, 508, 214, { ...wood, strokeWidth: w(2.2), roughness: 1.2, seed: 33 }));
  body.appendChild(rc.line(508, 216, 528, 216, { ...wood, strokeWidth: w(2), roughness: 1.2, seed: 34 }));
  body.appendChild(rc.rectangle(521, 219, 15, 18, {
    ...wood, strokeWidth: w(1.8), fill: c.road, fillStyle: 'hachure', hachureGap: w(4), fillWeight: w(0.8), roughness: 1.1, seed: 35,
  }));
  const glow = night ? el<SVGCircleElement>('circle', { cx: LX, cy: LY, r: 46, fill: 'url(#hero-lamp-glow)' }, body) : undefined;
  const flame = night ? el<SVGCircleElement>('circle', { cx: LX, cy: LY, r: 3.4, fill: c.lamp }, body) : undefined;

  // Rower: torso and head lean together; the leg stays put; the arm follows the oar handle.
  const torso = el<SVGGElement>('g', {}, body);
  torso.appendChild(rc.line(HIP.x, HIP.y, SHOULDER.x, SHOULDER.y, { ...rower, strokeWidth: w(4), seed: 36 }));
  torso.appendChild(rc.circle(SHOULDER.x - 4, SHOULDER.y - 14, 20, { ...rower, strokeWidth: w(2.2), fill: c.char, fillStyle: 'solid', roughness: 1.2, seed: 37 }));
  body.appendChild(rc.line(HIP.x, HIP.y, 410, 262, { ...rower, strokeWidth: w(3), seed: 38 }));
  const arm = el<SVGPathElement>('path', { fill: 'none', stroke: c.char, 'stroke-width': w(3), 'stroke-linecap': 'round' }, body);

  // The oar turns about the pivot; its local +x points to the blade.
  const oar = el<SVGGElement>('g', {}, body);
  oar.appendChild(rc.line(-LI, 0, LO - 16, 0, { ...wood, strokeWidth: w(3), roughness: 1, seed: 39 }));
  oar.appendChild(rc.path(`M ${LO - 18} -7 L ${LO} -3 L ${LO} 7 L ${LO - 18} 9 Z`, {
    ...wood, strokeWidth: w(2), fill: c.road, fillStyle: 'hachure', hachureGap: w(4), fillWeight: w(0.8), roughness: 1.1, seed: 40,
  }));
  const splash = el<SVGPathElement>('path', { fill: 'none', stroke: c.flow, 'stroke-width': w(1.6), 'stroke-linecap': 'round', opacity: 0 }, body);

  // Off-screen at both ends: the lantern clears the left edge, the wake the right.
  const parts: BoatParts = {
    night, travel, body, torso, oar, arm, splash, wake, glow, flame, refl, waterline,
    from: v.x0 - (545 - CX) * K,
    to: v.x0 + v.vw + (CX - 120) * K,
  };
  // Start a third of the way across; afterwards, wherever the boat had got to.
  state.prog ??= (v.x(30) - parts.from) / (parts.to - parts.from);
  place(parts);
  pose(parts, state.t * 1000, false);
  return parts;
}

function place(b: BoatParts) {
  const x = b.from + (state.prog ?? 0) * (b.to - b.from);
  b.travel.setAttribute('transform', `translate(${x.toFixed(2)} ${b.waterline}) scale(${K}) translate(${-CX} ${-WATER})`);
}

/**
 * One frame of the stroke at the current phase and speed (0..1). `live` is
 * false for the still pose (reduced motion, or before the loop runs): no
 * splash, steady lantern.
 */
function pose(b: BoatParts, now: number, live: boolean) {
  const p = state.phase;
  const v = state.v;

  // Oar: forward and low at the catch, back at the finish, lifted on the recovery.
  const sweep = Math.cos(2 * Math.PI * p);
  const lift = p > 0.5 ? Math.sin((Math.PI * (p - 0.5)) / 0.5) : 0;
  const phi = 138 - 22 * sweep + 16 * lift;
  b.oar.setAttribute('transform', `translate(${P.x},${P.y}) rotate(${phi.toFixed(2)})`);
  const r = phi / DEG;
  const blade = { x: P.x + LO * Math.cos(r), y: P.y + LO * Math.sin(r) };
  const hand = { x: P.x - LI * Math.cos(r), y: P.y - LI * Math.sin(r) };

  // Arm from shoulder to the handle, with a slight elbow bend.
  const mx = (SHOULDER.x + hand.x) / 2 + 4;
  const my = (SHOULDER.y + hand.y) / 2 + 6;
  b.arm.setAttribute('d', `M ${SHOULDER.x} ${SHOULDER.y} Q ${mx} ${my} ${hand.x.toFixed(1)} ${hand.y.toFixed(1)}`);

  // Lean back on the drive, forward on the recovery.
  const lean = 10 * Math.cos(2 * Math.PI * p);
  b.torso.setAttribute('transform', `rotate(${(-lean).toFixed(2)} ${HIP.x} ${HIP.y})`);

  // The whole boat rocks and bobs, a little more when it is quick.
  const rock = (1.1 + 0.9 * v) * Math.sin(now / 900);
  const bob = 2.2 * Math.sin(now / 1100);
  b.body.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${rock.toFixed(2)} ${CX} ${WATER})`);

  // Splash while the blade is in the water, near the catch.
  if (live && p < 0.52 && blade.y > WATER - 6) {
    const sx = blade.x;
    const sy = Math.max(blade.y, WATER + 2);
    const s = 4 + 6 * v;
    b.splash.setAttribute('opacity', (0.55 * (1 - p / 0.52)).toFixed(2));
    b.splash.setAttribute('d', `M ${sx - s} ${sy} q ${s} ${-s * 1.3} ${2 * s} 0 M ${sx - 2} ${sy - 2} l 3 ${-(5 + 4 * v)}`);
  } else {
    b.splash.setAttribute('opacity', '0');
  }

  // Wake trailing behind the stern: longer, livelier and stronger with speed.
  const len = 70 + 110 * v;
  const wph = now / 260;
  let d = `M 300 ${WATER + 10}`;
  for (let x = 0; x <= len; x += 15) {
    const y = WATER + 10 + Math.sin(x / 18 + wph) * (1.5 + 3.5 * v);
    d += ` L ${(300 - x).toFixed(1)} ${y.toFixed(1)}`;
  }
  b.wake.setAttribute('d', d);
  b.wake.setAttribute('opacity', (0.18 + 0.4 * v).toFixed(2));

  // Lantern (night only): flickering halo and flame, and a wobbling reflection.
  if (!b.night || !b.glow || !b.flame || !b.refl) return;
  const flick = live ? 0.82 + 0.18 * Math.sin(now / 90) + 0.06 * Math.sin(now / 37) : 0.9;
  b.glow.setAttribute('opacity', flick.toFixed(3));
  b.glow.setAttribute('r', (44 + (live ? 3 * Math.sin(now / 120) : 0)).toFixed(1));
  b.flame.setAttribute('opacity', flick.toFixed(3));
  b.refl.forEach((dash, i) => {
    const y = WATER + 6 + i * 13;
    const wob = live ? Math.sin(now / 300 + i * 0.7) * (2 + i * 0.8) + Math.sin(now / 120 + i) * 1.2 : 0;
    const half = (10 - i * 0.7) * (0.7 + 0.5 * flick);
    const cx = LX + wob;
    dash.setAttribute('x1', (cx - half).toFixed(1));
    dash.setAttribute('x2', (cx + half).toFixed(1));
    dash.setAttribute('y1', String(y));
    dash.setAttribute('y2', String(y));
  });
}

/**
 * The boat's part of the shared loop. Its speed drifts smoothly between slow
 * and quick; the stroke rate (strokes per second), the splash and the wake
 * are all derived from that travel speed.
 */
export function boatTick(getParts: () => BoatParts | undefined): Tick {
  return ({ dt }) => {
    const b = getParts();
    if (!b || state.prog === null) return;
    state.t += dt;
    const f = 1 + 0.45 * Math.sin(state.t / 7.3) + 0.2 * Math.sin(state.t / 3.1 + 1);
    const speed = MEAN * f;
    const span = b.to - b.from;
    state.prog = (state.prog + (speed * dt) / span) % 1;
    // 0 drifting … 1 racing, from the actual travel speed.
    state.v = Math.min(1, Math.max(0, (speed - MEAN * F_MIN) / (MEAN * (F_MAX - F_MIN))));
    const hz = 0.18 + state.v * 0.95;
    state.phase = (state.phase + dt * hz) % 1;
    place(b);
    pose(b, state.t * 1000, true);
  };
}
