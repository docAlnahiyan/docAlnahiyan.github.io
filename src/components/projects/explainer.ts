// Client helpers shared by the project explainers (GlobalFaceNet,
// MultimodalTransformerNet), ported from the design-reference prototypes.

/** Reveals each stage as it scrolls in (once), as on the research pages. */
export function revealStages(root: HTMLElement) {
  root.classList.add('js');
  const navH = document.getElementById('site-nav')?.offsetHeight ?? 0;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    // The sticky nav hides the top of the window.
    { rootMargin: `-${navH}px 0px -8% 0px`, threshold: 0.12 },
  );
  root.querySelectorAll('.stage').forEach((s) => io.observe(s));
}

/** Runs `cb` when the site's day/night theme changes (toggle or system). */
export function onThemeChange(cb: () => void) {
  new MutationObserver(cb).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
}

/** Linear congruential generator, so drawings come out the same every load. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * A feature-map stack on a canvas: a grid of activations on the front face,
 * with slices stacked behind it for channels. Size from data-s, data-cells
 * and data-depth on the canvas.
 */
export function drawStack(cv: HTMLCanvasElement, rand: () => number) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const s = Number(cv.dataset.s), cells = Number(cv.dataset.cells), depth = Number(cv.dataset.depth);
  const STEP = 4, off = depth * STEP, W = s + off, H = s + off;
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  cv.width = W * dpr;
  cv.height = H * dpr;
  cv.style.width = `${W}px`;
  cv.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let d = depth - 1; d >= 1; d--) {
    ctx.fillStyle = `rgba(59,111,176,${0.1 + 0.04 * d})`;
    ctx.strokeStyle = 'rgba(59,111,176,.35)';
    ctx.lineWidth = 1;
    rr(ctx, d * STEP, (depth - d) * STEP, s, s, 4);
    ctx.fill();
    ctx.stroke();
  }
  const cs = s / cells;
  for (let r = 0; r < cells; r++)
    for (let c = 0; c < cells; c++) {
      ctx.fillStyle = `rgba(43,95,170,${0.15 + rand() * 0.7})`;
      ctx.fillRect(c * cs + 0.5, off + r * cs + 0.5, cs - 1, cs - 1);
    }
  ctx.strokeStyle = 'rgba(59,111,176,.55)';
  ctx.lineWidth = 1;
  rr(ctx, 0, off, s, s, 4);
  ctx.stroke();
}

/** Expression parameters for the stylised face (see Face.astro). */
export interface Expression {
  bL: string;
  bR: string;
  eyeRy: number;
  mouth?: string;
  /** An open mouth, drawn filled (surprise, fear). */
  open?: string;
}

/** Sets a Face.astro drawing to an expression. */
export function setFace(svg: Element | null, e: Expression) {
  if (!svg) return;
  const part = (p: string) => svg.querySelector(`[data-part="${p}"]`);
  part('bL')?.setAttribute('d', e.bL);
  part('bR')?.setAttribute('d', e.bR);
  part('eL')?.setAttribute('ry', String(e.eyeRy));
  part('eR')?.setAttribute('ry', String(e.eyeRy));
  const mouth = part('mouth') as SVGPathElement | null;
  if (!mouth) return;
  mouth.setAttribute('d', e.open ?? e.mouth ?? '');
  mouth.style.fill = e.open ? 'var(--ink)' : 'none';
}
