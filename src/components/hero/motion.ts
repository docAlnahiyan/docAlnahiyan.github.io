// Motion for the landing hero (design-reference/landing-scene-spec.md §5):
// one shared requestAnimationFrame loop for everything that reacts to the
// cursor. The repel-text physics are ported from design-reference/repel-text.html.

/** Called once per frame with the hero's current position on screen. */
export type Tick = (frame: Frame) => void;

export interface Frame {
  /** The hero's box on screen this frame. */
  hero: DOMRect;
  /** Pointer position relative to the hero, or null when it is not over it. */
  pointer: { x: number; y: number } | null;
  /** Last known pointer position relative to the hero, even after it left. */
  last: { x: number; y: number } | null;
  /** Seconds since the previous frame (capped, so a background tab doesn't jump). */
  dt: number;
}

/** Starts the shared loop, which tracks the pointer and runs every tick each frame. */
export function startLoop(heroEl: HTMLElement, ticks: Tick[]): void {
  let px = 0;
  let py = 0;
  let has = false;
  const set = (x: number, y: number) => {
    px = x;
    py = y;
    has = true;
  };
  window.addEventListener('pointermove', (e) => set(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => set(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (t) set(t.clientX, t.clientY);
    },
    { passive: true },
  );
  const lose = () => {
    has = false;
  };
  window.addEventListener('touchend', lose);
  window.addEventListener('pointercancel', lose);
  document.documentElement.addEventListener('pointerleave', lose);

  let seen = false;
  let prev = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const hero = heroEl.getBoundingClientRect();
    if (has) seen = true;
    const rel = { x: px - hero.left, y: py - hero.top };
    const inside = has && px >= hero.left && px <= hero.right && py >= hero.top && py <= hero.bottom;
    const f: Frame = { hero, pointer: inside ? rel : null, last: seen ? rel : null, dt };
    for (const tick of ticks) tick(f);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- repel text

/** Approved constants (spec §4.13). */
const R = 130; // radius of influence, px
const PUSH = 46; // max push, px
const K = 0.14; // spring stiffness
const D = 0.73; // damping: below 1 gives the bouncy overshoot
const TILT = 14; // max tilt, degrees
const BIRD_PUSH = PUSH * 0.65; // birds nudge rather than blast

interface Char {
  el: HTMLElement;
  /** Resting centre relative to the hero. */
  bx: number;
  by: number;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  vr: number;
}

/**
 * Splits an element's text into per-character spans for the repel effect.
 * Screen readers and search get the original text from a visually hidden
 * copy; the letters are hidden from them and carry no text of their own.
 * Words are kept whole so lines only break at spaces.
 */
function split(node: HTMLElement): HTMLElement[] {
  const text = node.textContent?.trim() ?? '';
  node.textContent = '';

  const readable = document.createElement('span');
  readable.className = 'visually-hidden';
  readable.textContent = text;
  node.appendChild(readable);

  const letters = document.createElement('span');
  letters.setAttribute('aria-hidden', 'true');
  const out: HTMLElement[] = [];
  text.split(/\s+/).forEach((word, i) => {
    if (i > 0) letters.appendChild(document.createTextNode(' '));
    const w = document.createElement('span');
    w.className = 'word';
    for (const ch of word) {
      const s = document.createElement('span');
      s.className = 'ch';
      // Drawn by CSS from the attribute, so the page's text holds the name
      // once (in the readable copy), not twice.
      s.dataset.ch = ch;
      w.appendChild(s);
      out.push(s);
    }
    letters.appendChild(w);
  });
  node.appendChild(letters);
  return out;
}

/**
 * Letters of the given elements scatter from the cursor and from passing
 * birds, then spring back with a slight overshoot and tilt (spec §5.3).
 */
export function repelText(
  heroEl: HTMLElement,
  nodes: HTMLElement[],
  birds: () => Iterable<Element>,
): Tick {
  const chars: Char[] = nodes
    .flatMap(split)
    .map((el) => ({ el, bx: 0, by: 0, x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 }));

  // Resting positions are measured once, and again whenever the layout can
  // change, instead of reading every letter on every frame.
  const measure = () => {
    const hero = heroEl.getBoundingClientRect();
    for (const c of chars) {
      const b = c.el.getBoundingClientRect();
      c.bx = b.left + b.width / 2 - c.x - hero.left;
      c.by = b.top + b.height / 2 - c.y - hero.top;
    }
  };
  measure();
  document.fonts?.ready.then(measure);
  new ResizeObserver(measure).observe(nodes[0].parentElement ?? heroEl);

  const narrow = matchMedia('(max-width: 720px)');

  return ({ hero, pointer }) => {
    // Read every source first, then write, so the browser lays out once.
    const birdPts: { x: number; y: number }[] = [];
    // On small screens the flock crosses the name constantly; keep it calm.
    for (const bird of narrow.matches ? [] : birds()) {
      const b = bird.getBoundingClientRect();
      if (b.width === 0) continue;
      birdPts.push({ x: b.left + b.width / 2 - hero.left, y: b.top + b.height / 2 - hero.top });
    }

    for (const c of chars) {
      let tx = 0;
      let ty = 0;
      let tr = 0;
      const push = (s: { x: number; y: number }, strength: number) => {
        const dx = c.bx - s.x;
        const dy = c.by - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist >= R) return;
        const f = 1 - dist / R; // stronger when closer
        const inv = dist > 0.001 ? 1 / dist : 0;
        tx += dx * inv * f * strength;
        ty += dy * inv * f * strength;
        tr += (dx < 0 ? -1 : 1) * f * TILT * (strength / PUSH);
      };
      if (pointer) push(pointer, PUSH);
      // Only the nearest bird counts, so a passing flock nudges a letter
      // rather than adding up to a blast.
      let near: { x: number; y: number } | undefined;
      let nearD = R;
      for (const b of birdPts) {
        const d = Math.hypot(c.bx - b.x, c.by - b.y);
        if (d < nearD) [near, nearD] = [b, d];
      }
      if (near) push(near, BIRD_PUSH);
      // Cursor and bird together never push further, or tilt more, than the
      // cursor alone can.
      const len = Math.hypot(tx, ty);
      if (len > PUSH) {
        tx *= PUSH / len;
        ty *= PUSH / len;
      }
      tr = Math.max(-TILT, Math.min(TILT, tr));

      // Spring toward the target, as in the demo.
      c.vx = (c.vx + (tx - c.x) * K) * D;
      c.x += c.vx;
      c.vy = (c.vy + (ty - c.y) * K) * D;
      c.y += c.vy;
      c.vr = (c.vr + (tr - c.r) * K) * D;
      c.r += c.vr;
      // Skip letters at rest, so a still page does no work per letter.
      const moving = Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.r) > 0.01;
      if (moving || c.el.style.transform) {
        c.el.style.transform = moving
          ? `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px) rotate(${c.r.toFixed(2)}deg)`
          : '';
      }
    }
  };
}

// ---------------------------------------------------------------- explorer

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
/** Maps v from [a, b] onto [oa, ob], clamped. */
const mapc = (v: number, a: number, b: number, oa: number, ob: number) =>
  oa + (ob - oa) * clamp((v - a) / (b - a), 0, 1);

type Mode = 'genie' | 'jump';

interface Dive {
  t: number;
  /** When it started (performance.now()), for the give-up timer. */
  start: number;
  dur: number;
  mode: Mode;
  from: { x: number; y: number };
  to: { x: number; y: number };
  rippled: boolean;
}

/** Scene geometry from scene.ts, refreshed on every redraw. */
export interface Geo {
  w: number;
  roadY: (x: number) => number;
  roadMin: number;
  roadMax: number;
  fig: number;
  idleX: number;
  buttons: [number, number][];
}

/**
 * The explorer and dog, ported from design-reference/explorer-proto.html:
 * road-locked, following the pointer's x with distance-based speed (spec
 * §5.1), the dog trailing with a hop now and then (§4.12), and the genie or
 * jump dive into a mountain button on click (§5.2). The proto's per-frame
 * factors are kept and scaled by frame time, so speed is the same at 60 or
 * 120 Hz.
 */
export function explorer(heroEl: HTMLElement, getGeo: () => Geo): Tick {
  let geo = getGeo();
  const ex = { x: geo.idleX, phase: 0, facing: 1, dive: null as Dive | null };
  const dg = { x: ex.x - 64 * geo.fig, phase: 0, facing: 1, hopIn: 1.2, hop: -1, hopY: 0 };

  // The drawing is replaced on resize and theme change; look the parts up again.
  let parts: Record<string, SVGGElement | null> = {};
  let exWrap: SVGGElement | null = null;
  let dogWrap: SVGGElement | null = null;
  const lookUp = () => {
    exWrap = heroEl.querySelector('[data-actor="explorer"]');
    dogWrap = heroEl.querySelector('[data-actor="dog"]');
    parts = {};
    heroEl.querySelectorAll<SVGGElement>('[data-limb]').forEach((g) => {
      const owner = g.closest('[data-actor]')?.getAttribute('data-actor');
      parts[`${owner}:${g.dataset.limb}`] = g;
    });
  };
  lookUp();
  heroEl.addEventListener('hero:drawn', () => {
    const next = getGeo();
    // Keep the same place along the road when the width changes.
    if (next.w !== geo.w) {
      ex.x *= next.w / geo.w;
      dg.x *= next.w / geo.w;
    }
    geo = next;
    lookUp();
  });

  // ---- dive into a mountain button ----
  let hoverSince = 0;
  heroEl.querySelectorAll<HTMLAnchorElement>('.peak-link').forEach((a, i) => {
    a.addEventListener('pointerenter', () => {
      hoverSince = performance.now();
    });
    a.addEventListener('click', (e) => {
      // Keyboard (detail 0) and new-tab clicks are plain links. Nothing is
      // prevented: the page starts loading now and the dive plays over it.
      if (e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const to = geo.buttons[i];
      if (!to || ex.dive) return;
      // A quick, direct click gets the genie; a leisurely one the jump.
      const mode: Mode = performance.now() - hoverSince < 500 ? 'genie' : 'jump';
      ex.facing = to[0] > ex.x ? 1 : -1;
      ex.dive = {
        t: 0, start: performance.now(), dur: mode === 'genie' ? 0.5 : 0.8, mode, rippled: false,
        from: { x: ex.x, y: geo.roadY(ex.x) }, to: { x: to[0], y: to[1] },
      };
    });
  });
  // Coming back with the Back button restores this page as it was left;
  // put the explorer back on the road.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted || !ex.dive) return;
    ex.x = clamp(ex.dive.from.x, geo.roadMin, geo.roadMax);
    ex.dive = null;
    exWrap?.setAttribute('opacity', '1');
  });

  /** A ring that spreads from where he enters (styled in HeroScene). */
  const ripple = (x: number, y: number) => {
    const layer = heroEl.querySelector('svg[data-layer="characters"]');
    if (!layer) return;
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', String(x));
    ring.setAttribute('cy', String(y));
    ring.setAttribute('r', '52');
    ring.setAttribute('class', 'ripple');
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  };

  const rot = (g: SVGGElement | null, deg: number, cx: number, cy: number) =>
    g?.setAttribute('transform', `rotate(${deg.toFixed(2)},${cx},${cy})`);

  const renderEx = (y: number, step: number) => {
    const amp = clamp(step * 7, 6, 26); // bigger stride when running
    const a = Math.sin(ex.phase) * amp;
    rot(parts['explorer:legL'], a, 0, -24);
    rot(parts['explorer:legR'], -a, 0, -24);
    rot(parts['explorer:armL'], -a * 0.9, 0, -46);
    rot(parts['explorer:armR'], a * 0.9, 0, -46);
    const bob = -Math.abs(Math.sin(ex.phase)) * (step > 0.2 ? 3.2 : 1.2);
    exWrap?.setAttribute('transform', `translate(${ex.x.toFixed(2)} ${(y + bob).toFixed(2)}) scale(${ex.facing * geo.fig},${geo.fig})`);
    exWrap?.setAttribute('opacity', '1');
  };

  const renderDog = (step: number) => {
    const amp = clamp(step * 7, 5, 20);
    const a = Math.sin(dg.phase) * amp;
    for (const [leg, sign] of [['l1', 1], ['l2', -1], ['l3', 1], ['l4', -1]] as const) {
      const g = parts[`dog:${leg}`];
      rot(g, a * sign, Number(g?.dataset.x ?? 0), -7);
    }
    rot(parts['dog:tail'], Math.sin(dg.phase * 2.2) * 12, -22, -20);
    const y = geo.roadY(dg.x) - 6 - dg.hopY;
    dogWrap?.setAttribute('transform', `translate(${dg.x.toFixed(2)} ${y.toFixed(2)}) scale(${dg.facing * geo.fig},${geo.fig})`);
  };

  return ({ pointer, last, dt }) => {
    const n = dt * 60; // frames' worth at 60 Hz
    const ease = (f: number) => 1 - Math.pow(1 - f, n);

    if (ex.dive) {
      const A = ex.dive;
      A.t += dt / A.dur;
      const t = clamp(A.t, 0, 1);
      let x: number;
      let y: number;
      let s: number;
      let r = 0;
      let op = 1;
      if (A.mode === 'genie') {
        // Slide onto the button, then collapse into it with a slight swirl.
        const e = Math.pow(t, 1.3);
        x = A.from.x + (A.to.x - A.from.x) * e;
        y = A.from.y + (A.to.y - A.from.y) * e;
        s = 1 - t * t;
        r = ex.facing * t * 26;
        op = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
      } else if (t < 0.72) {
        // Arc up and land exactly on the button...
        const e = t / 0.72;
        x = A.from.x + (A.to.x - A.from.x) * e;
        y = A.from.y + (A.to.y - A.from.y) * e - 150 * geo.fig * Math.sin(Math.PI * e);
        s = 1;
      } else {
        // ...then dive in.
        const k = (t - 0.72) / 0.28;
        x = A.to.x;
        y = A.to.y;
        s = 1 - k;
        r = ex.facing * k * 20;
      }
      if (!A.rippled && t >= (A.mode === 'genie' ? 0.6 : 0.72)) {
        A.rippled = true;
        ripple(A.to.x, A.to.y);
      }
      const sc = Math.max(s, 0.001) * geo.fig;
      exWrap?.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${ex.facing * sc},${sc})`);
      exWrap?.setAttribute('opacity', String(Math.max(op, 0)));
      dg.x += (A.from.x - 60 * geo.fig - dg.x) * ease(0.08);
      renderDog(0);
      // He stays inside the button while the next page loads. If it never
      // does (navigation cancelled), he steps back onto the road.
      if (performance.now() - A.start > (A.dur + 3) * 1000) {
        ex.x = clamp(A.to.x, geo.roadMin, geo.roadMax);
        ex.dive = null;
      }
      return;
    }

    // ---- follow: road-locked, distance-based speed ----
    const exY = geo.roadY(ex.x);
    const target = last ?? { x: geo.idleX, y: exY };
    const tx = clamp(target.x, geo.roadMin, geo.roadMax);
    const d = Math.hypot(target.x - ex.x, target.y - exY);
    const onRoad = Math.abs(target.y - geo.roadY(tx)) < 70;
    let f = mapc(d, 60, 520, 0.2, 0.01); // near: run; far: amble
    if (!onRoad && d > 240) f *= 0.45; // lazier when the pointer is off the road and far
    if (!pointer) f *= 0.25; // settle once it has left the hero
    const dx = (tx - ex.x) * ease(f);
    ex.x += dx;
    const step = Math.abs(dx) / Math.max(n, 0.001);
    if (step > 0.25) ex.facing = dx > 0 ? 1 : -1;
    // Gait follows speed; at rest he walks gently in place.
    ex.phase += (step * 0.11 + (step > 0.2 ? 0.04 : 0.05)) * n;
    renderEx(exY, step);

    // ---- dog: trails behind, a touch slower, hops now and then ----
    const dogTx = clamp(ex.x - 64 * geo.fig * ex.facing, geo.roadMin - 20, geo.roadMax + 20);
    const ddx = (dogTx - dg.x) * ease(0.09);
    dg.x += ddx;
    const dstep = Math.abs(ddx) / Math.max(n, 0.001);
    dg.phase += (dstep * 0.12 + (dstep > 0.2 ? 0.05 : 0.04)) * n;
    if (dstep > 0.25) dg.facing = ddx > 0 ? 1 : -1;
    dg.hopIn -= dt;
    if (dg.hopIn <= 0) {
      dg.hopIn = 2 + Math.random() * 2;
      dg.hop = 0;
    }
    if (dg.hop >= 0) {
      dg.hop += dt * 3.4;
      if (dg.hop >= Math.PI) {
        dg.hop = -1;
        dg.hopY = 0;
      } else dg.hopY = Math.sin(dg.hop) * 16 * geo.fig;
    }
    renderDog(dstep);
  };
}
