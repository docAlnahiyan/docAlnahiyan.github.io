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

  const frame = () => {
    const hero = heroEl.getBoundingClientRect();
    const inside = has && px >= hero.left && px <= hero.right && py >= hero.top && py <= hero.bottom;
    const f: Frame = { hero, pointer: inside ? { x: px - hero.left, y: py - hero.top } : null };
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

  return ({ hero, pointer }) => {
    // Read every source first, then write, so the browser lays out once.
    const birdPts: { x: number; y: number }[] = [];
    for (const bird of birds()) {
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
