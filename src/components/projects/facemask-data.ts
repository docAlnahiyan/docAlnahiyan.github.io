// COVID-19 Facemask Detection explainer data (design-reference/facemask-explainer.html).
// The project's files were lost, so this is a walkthrough of the method
// (detect faces, then classify each crop). There are no accuracy or dataset
// figures to cite; the per-face confidences in the demos are illustrative.
// The faces are stylised SVG drawings, not photographs.

export const SKIN = ['#e8b98f', '#d49a6a', '#c9895a', '#b57a4e', '#eac6a0'];
export const HAIR = ['#2e2620', '#4a3526', '#6b4a2e', '#1c1a18', '#5a4a3a'];

/** A face in a scene: position, scale, skin/hair index, mask on or off. */
export interface SceneFace {
  x: number;
  y: number;
  sc: number;
  si: number;
  masked: boolean;
}

/** Stage 1: a camera sees a mix. */
export const HERO_FACES: [number, number, number, boolean][] = [[80, 92, 0, false], [185, 80, 1, true], [300, 96, 2, false], [410, 82, 3, true]];
/** Stage 3: the detector scene. */
export const DET_FACES: [number, number, number, boolean][] = [[80, 80, 0, false], [185, 70, 1, true], [290, 86, 2, false]];
/** Stage 5: the live camera's starting line-up. */
export const CAM_FACES: SceneFace[] = [
  { x: 100, y: 150, sc: 1.15, si: 0, masked: true },
  { x: 235, y: 120, sc: 1.0, si: 1, masked: false },
  { x: 360, y: 160, sc: 1.2, si: 2, masked: true },
  { x: 450, y: 118, sc: 0.92, si: 3, masked: false },
];

const attrs = (a: Record<string, string | number>) => Object.entries(a).map(([k, v]) => ` ${k}="${v}"`).join('');
const el = (n: string, a: Record<string, string | number>) => `<${n}${attrs(a)}/>`;

/**
 * A front-facing stylised face centred on (0, 0), radius about 34, from the
 * reference's drawFace. Each eye blinks on its own schedule; `rand` sets
 * where in the 4.6 s blink cycle it starts.
 */
export function faceSvg(
  o: { skin?: string; hair?: string; masked?: boolean; maskColor?: string; hairStyle?: 'bald' },
  rand: () => number = Math.random,
) {
  const skin = o.skin ?? SKIN[0], hair = o.hair ?? HAIR[0];
  let s = '';
  s += el('rect', { x: -10, y: 28, width: 20, height: 20, rx: 5, fill: skin }); // neck
  s += el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 36, fill: skin, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1 }); // head
  s += el('circle', { cx: -30, cy: 2, r: 6, fill: skin }) + el('circle', { cx: 30, cy: 2, r: 6, fill: skin }); // ears
  if (o.hairStyle !== 'bald') s += el('path', { d: 'M -31 -6 Q -34 -40 0 -40 Q 34 -40 31 -6 Q 24 -26 0 -26 Q -24 -26 -31 -6 Z', fill: hair });
  const brow = { fill: 'none', stroke: hair, 'stroke-width': 2.4, 'stroke-linecap': 'round' };
  s += el('path', { d: 'M -20 -12 q 7 -4 14 0', ...brow }) + el('path', { d: 'M 6 -12 q 7 -4 14 0', ...brow });
  for (const ex of [-13, 13]) {
    s += el('ellipse', { cx: ex, cy: -4, rx: 5.5, ry: 4, fill: '#fff', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 });
    s += el('circle', { cx: ex, cy: -4, r: 2.4, fill: '#241f1b' });
    s += el('circle', { cx: ex + 0.8, cy: -5, r: 0.8, fill: '#fff' });
    s += el('rect', {
      x: ex - 6, y: -9, width: 12, height: 9, rx: 3, fill: skin, class: 'lid',
      style: `transform-box:fill-box;transform-origin:center;transform:scaleY(0);animation-delay:${(rand() * -4.6).toFixed(2)}s`,
    });
  }
  if (o.masked) {
    const mcol = o.maskColor ?? '#cfe0ee', mdk = o.maskColor ? 'rgba(0,0,0,.14)' : '#aec6dd';
    s += el('path', { d: 'M -22 4 Q -34 6 -30 2', fill: 'none', stroke: mdk, 'stroke-width': 2.4 }); // ear straps
    s += el('path', { d: 'M 22 4 Q 34 6 30 2', fill: 'none', stroke: mdk, 'stroke-width': 2.4 });
    s += el('path', { d: 'M -24 3 Q 0 -2 24 3 Q 26 24 0 34 Q -26 24 -24 3 Z', fill: mcol, stroke: mdk, 'stroke-width': 1.4 });
    s += el('path', { d: 'M -22 11 Q 0 7 22 11', fill: 'none', stroke: mdk, 'stroke-width': 1, opacity: 0.7 }); // pleats
    s += el('path', { d: 'M -22 18 Q 0 15 22 18', fill: 'none', stroke: mdk, 'stroke-width': 1, opacity: 0.7 });
  } else {
    s += el('path', { d: 'M 0 -2 q 4 10 0 12', fill: 'none', stroke: 'rgba(0,0,0,.28)', 'stroke-width': 2, 'stroke-linecap': 'round' }); // nose
    s += el('path', { d: 'M -10 20 q 10 7 20 0', fill: 'none', stroke: '#9c5a4a', 'stroke-width': 2.4, 'stroke-linecap': 'round' }); // mouth
  }
  return s;
}

/**
 * Stage 3: the detector's "face" boxes, shown for faces the scan line has
 * passed (all of them when `reveal` is null), plus the scan line itself.
 */
export function detBoxesSvg(reveal: number | null) {
  let s = '';
  for (const [x, y] of DET_FACES) {
    if (reveal !== null && reveal < x) continue;
    s += el('rect', { x: x - 30, y: y - 34, width: 60, height: 70, rx: 3, fill: 'none', 'stroke-width': 2, style: 'stroke:var(--det)' });
    s += `<text x="${x - 30}" y="${y - 38}" font-size="9" style="fill:var(--det);font-family:var(--font-mono)">face</text>`;
  }
  if (reveal !== null && reveal < 360) s += el('line', { x1: reveal, y1: 4, x2: reveal, y2: 186, 'stroke-width': 2, opacity: 0.85, class: 'sweep', style: 'stroke:var(--det)' });
  return s;
}

/** Stage 5: a scanned face's coloured box and confidence label. */
export function camBoxSvg(f: SceneFace & { conf: number }) {
  const col = f.masked ? 'var(--ok)' : 'var(--bad)';
  const bw = 66 * f.sc, bh = 82 * f.sc;
  const label = `${f.masked ? 'Mask' : 'No Mask'} ${f.conf}%`;
  const lw = label.length * 6.2 + 12;
  return el('rect', { x: f.x - bw / 2, y: f.y - bh / 2 - 4, width: bw, height: bh, rx: 4, fill: 'none', 'stroke-width': 2.4, style: `stroke:${col}` }) +
    el('rect', { x: f.x - bw / 2, y: f.y - bh / 2 - 22, width: lw, height: 16, rx: 3, style: `fill:${col}` }) +
    `<text x="${f.x - bw / 2 + 6}" y="${f.y - bh / 2 - 10}" font-size="10" font-weight="600" fill="#fff" style="font-family:var(--font-mono)">${label}</text>`;
}
