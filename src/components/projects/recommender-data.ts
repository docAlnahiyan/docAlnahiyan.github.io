// E-Commerce Recommendation Engine explainer data (design-reference/recommender-explainer.html).
// The project's files were lost, so this walks through the method (hybrid
// collaborative + content-based, two-stage retrieve → rank, session-aware).
// Products are generic icons with invented names; the demo's relevance
// scores are illustrative, not the production model.

const NS = 'http://www.w3.org/2000/svg';

export type Cat = 'photo' | 'fit' | 'audio' | 'game' | 'trav';
export interface Item { id: string; name: string; cat: Cat; price: string; x: number; y: number; pop: number }

/** Category → its colour token. */
export const CATCOL: Record<Cat, string> = { photo: '--photo', fit: '--fit', audio: '--audio', game: '--game', trav: '--trav' };

export const ITEMS: Item[] = [
  { id: 'camera', name: 'Mirrorless Camera', cat: 'photo', price: '$1,290', x: 105, y: 78, pop: 0.8 },
  { id: 'lens', name: 'Prime Lens', cat: 'photo', price: '$420', x: 150, y: 70, pop: 0.6 },
  { id: 'tripod', name: 'Travel Tripod', cat: 'photo', price: '$180', x: 90, y: 108, pop: 0.5 },
  { id: 'shoe', name: 'Running Shoes', cat: 'fit', price: '$140', x: 405, y: 74, pop: 0.9 },
  { id: 'watch', name: 'Smartwatch', cat: 'fit', price: '$299', x: 360, y: 110, pop: 0.85 },
  { id: 'earbuds', name: 'Wireless Earbuds', cat: 'audio', price: '$160', x: 425, y: 200, pop: 0.9 },
  { id: 'headphones', name: 'Headphones', cat: 'audio', price: '$350', x: 392, y: 240, pop: 0.7 },
  { id: 'keyboard', name: 'Mechanical Keyboard', cat: 'game', price: '$130', x: 165, y: 250, pop: 0.6 },
  { id: 'controller', name: 'Game Controller', cat: 'game', price: '$70', x: 125, y: 274, pop: 0.65 },
  { id: 'backpack', name: 'Travel Backpack', cat: 'trav', price: '$110', x: 235, y: 128, pop: 0.7 },
];
export const BYID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// ---- scoring data (unchanged from the reference) ----
export const COLLAB: Record<string, Record<string, number>> = {
  camera: { lens: 1, tripod: 0.8, backpack: 0.5 }, lens: { camera: 1, tripod: 0.7 }, tripod: { camera: 0.8, lens: 0.7, backpack: 0.4 },
  shoe: { watch: 0.9, backpack: 0.4 }, watch: { shoe: 0.9, earbuds: 0.5 }, earbuds: { headphones: 0.8, watch: 0.5 }, headphones: { earbuds: 0.8 },
  keyboard: { controller: 0.9 }, controller: { keyboard: 0.9 }, backpack: { camera: 0.5, shoe: 0.4, tripod: 0.4 },
};
export const collab = (a: string, b: string) => COLLAB[a]?.[b] ?? 0;
// Content similarity: same category strong; loosely related categories partial.
const RELATED: Record<Cat, Cat[]> = { photo: ['trav'], trav: ['photo', 'fit'], fit: ['audio', 'trav'], audio: ['fit', 'game'], game: ['audio'] };
export function content(a: string, b: string) {
  const A = BYID[a], B = BYID[b];
  if (A.cat === B.cat) return 1;
  if ((RELATED[A.cat] || []).indexOf(B.cat) >= 0) return 0.3;
  return 0;
}
export const PERSONAS: Record<string, { label: string; aff: Partial<Record<Cat, number>> }> = {
  photographer: { label: 'Photographer', aff: { photo: 1, trav: 0.6 } },
  runner: { label: 'Runner', aff: { fit: 1, audio: 0.5 } },
  gamer: { label: 'Gamer', aff: { game: 1, audio: 0.3 } },
  new: { label: 'New shopper', aff: {} },
};

/** The three nearest items to `id` in the 2-D taste map. */
export function nearest(id: string, k: number) {
  const it = BYID[id];
  return ITEMS.filter((o) => o.id !== id)
    .map((o) => ({ id: o.id, d: Math.hypot(o.x - it.x, o.y - it.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
}

// ---- product icons (from the reference) ----
export function E(p: Element, n: string, a: Record<string, string | number>) {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, String(a[k]));
  p.appendChild(e);
  return e;
}

/** Draws a product icon (48 × 48: tinted tile plus a stroke group) into `svg`. */
export function icon(svg: Element, type: string, color: string) {
  svg.innerHTML = '';
  const c = color;
  E(svg, 'rect', { x: 1, y: 1, width: 46, height: 46, rx: 10, fill: `color-mix(in srgb,${c} 14%,transparent)` });
  const g = E(svg, 'g', { stroke: c, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  switch (type) {
    case 'camera': E(g, 'rect', { x: 10, y: 17, width: 28, height: 19, rx: 3 }); E(g, 'path', { d: 'M18 17 l2-4 h8 l2 4' }); E(g, 'circle', { cx: 24, cy: 26, r: 6 }); E(g, 'circle', { cx: 24, cy: 26, r: 2, fill: c }); break;
    case 'lens': E(g, 'circle', { cx: 24, cy: 24, r: 12 }); E(g, 'circle', { cx: 24, cy: 24, r: 7 }); E(g, 'circle', { cx: 24, cy: 24, r: 2.5, fill: c }); break;
    case 'tripod': E(g, 'path', { d: 'M16 16 h16 l-2 4 h-12 z' }); E(g, 'path', { d: 'M24 20 v6 M24 26 l-8 12 M24 26 l8 12 M24 26 v10' }); break;
    case 'shoe': E(g, 'path', { d: 'M10 30 q0 -8 6 -8 l3 3 q6 4 18 4 q3 0 3 3 v2 h-30 z' }); E(g, 'path', { d: 'M19 25 l2 3 M24 26 l2 3' }); break;
    case 'watch': E(g, 'rect', { x: 15, y: 15, width: 18, height: 18, rx: 5 }); E(g, 'path', { d: 'M19 15 l1 -5 h8 l1 5 M19 33 l1 5 h8 l1 -5 M33 22 h3' }); E(g, 'path', { d: 'M24 20 v4 h3' }); break;
    case 'earbuds': E(g, 'path', { d: 'M16 16 a5 5 0 0 1 5 5 v6 a3 3 0 0 1 -6 0 v-6' }); E(g, 'path', { d: 'M32 16 a5 5 0 0 0 -5 5 v6 a3 3 0 0 0 6 0 v-6' }); break;
    case 'headphones': E(g, 'path', { d: 'M13 28 v-4 a11 11 0 0 1 22 0 v4' }); E(g, 'rect', { x: 10, y: 26, width: 6, height: 11, rx: 3 }); E(g, 'rect', { x: 32, y: 26, width: 6, height: 11, rx: 3 }); break;
    case 'keyboard':
      E(g, 'rect', { x: 8, y: 17, width: 32, height: 16, rx: 3 });
      E(g, 'path', { d: 'M13 22 h0 M19 22 h0 M25 22 h0 M31 22 h0 M16 27 h16', stroke: c, 'stroke-width': 2.4 });
      for (let k = 0; k < 4; k++) E(g, 'circle', { cx: 13 + k * 6, cy: 22, r: 0.6, fill: c, stroke: 'none' });
      break;
    case 'controller':
      E(g, 'path', { d: 'M14 20 h20 a7 7 0 0 1 7 7 q0 6 -5 6 q-3 0 -4 -3 h-16 q-1 3 -4 3 q-5 0 -5 -6 a7 7 0 0 1 7 -7 z' });
      E(g, 'path', { d: 'M16 25 v4 M14 27 h4' });
      E(g, 'circle', { cx: 31, cy: 26, r: 1.6, fill: c, stroke: 'none' });
      E(g, 'circle', { cx: 35, cy: 29, r: 1.6, fill: c, stroke: 'none' });
      break;
    case 'backpack': E(g, 'rect', { x: 13, y: 16, width: 22, height: 24, rx: 6 }); E(g, 'path', { d: 'M19 16 q0 -5 5 -5 q5 0 5 5' }); E(g, 'rect', { x: 18, y: 26, width: 12, height: 10, rx: 3 }); break;
    default: E(g, 'circle', { cx: 24, cy: 24, r: 10 });
  }
}

/** Draws an icon's stroke group (no background tile) into an existing group. */
export function icon2(g: Element, type: string, c: string) {
  const tmp = document.createElementNS(NS, 'svg');
  icon(tmp, type, c);
  // Copy the stroke group only.
  const strokeG = tmp.querySelectorAll('g')[0];
  if (strokeG) g.appendChild(strokeG);
}

/** A nested 48 × 48 icon placed at (x, y) in an SVG, drawn with icon(). */
export function placedIcon(parent: Element, type: string, color: string, x: number, y: number, size: number) {
  const s = E(parent, 'svg', { x, y, width: size, height: size, viewBox: '0 0 48 48' });
  icon(s, type, color);
  return s;
}
