// Bird Species Identification explainer data (design-reference/bird-explainer.html).
// The birds are stylised SVG drawings, not CUB-200 photographs. TRAIN and
// VALID are the thesis's logged per-epoch losses; the Stage 6 top-5 scores
// are illustrative, not live inference.

export interface Species {
  n: string;
  back: string;
  belly: string;
  wing?: string;
  head?: string;
  tail?: string;
  legs?: string;
  beak?: string;
  crest?: string;
  cap?: string;
  mask?: string;
  eyestripe?: string;
  throat?: string;
  breast?: string;
  wingbar?: string;
  wingspots?: boolean;
  coneBeak?: boolean;
  eyering?: boolean;
}

export const SPECIES: Species[] = [
  { n: 'Blue Jay', back: '#5b8bd0', belly: '#eef2f8', wing: '#4f7cc0', head: '#5b8bd0', crest: '#4f7cc0', wingbar: '#fbfdff', wingspots: true, beak: '#2a2620', tail: '#4f7cc0', legs: '#4a443c' },
  { n: 'Northern Cardinal', back: '#c63422', belly: '#c23526', wing: '#a52a1c', head: '#c63422', crest: '#c63422', mask: '#201712', coneBeak: true, beak: '#e8963a', tail: '#a52a1c', legs: '#9a6a5a' },
  { n: 'American Goldfinch', back: '#e8c21f', belly: '#f1e39a', wing: '#201e18', head: '#e8c21f', cap: '#201e18', wingbar: '#f6f0dc', coneBeak: true, beak: '#e0a24a', tail: '#201e18', legs: '#caa24a' },
  { n: 'Indigo Bunting', back: '#3f58b8', belly: '#5b70c8', wing: '#30429a', head: '#33459c', coneBeak: true, beak: '#c7ccd6', tail: '#30429a', legs: '#5a5a62' },
  { n: 'House Sparrow', back: '#9c7a4a', belly: '#e6ddc9', wing: '#8a6838', head: '#8f8578', cap: '#6e5a3a', eyestripe: '#7a4a2a', throat: '#3a322a', wingbar: '#efe6cf', beak: '#5a5048', tail: '#7a5a34', legs: '#b08a5a' },
  { n: 'American Robin', back: '#6b6660', belly: '#c2612f', breast: '#c2612f', wing: '#5a554f', head: '#4a4742', eyering: true, beak: '#e0a83a', tail: '#4a4742', legs: '#8a6a4a' },
];

/** Illustrative top-5 per species (index into SPECIES, then [name, %]). */
export const DEMO: Record<string, { sp: number; top: [string, number][] }> = {
  'Blue Jay': { sp: 0, top: [['Blue Jay', 91], ['Indigo Bunting', 4], ['American Robin', 2], ['House Sparrow', 2], ['Northern Cardinal', 1]] },
  'Northern Cardinal': { sp: 1, top: [['Northern Cardinal', 93], ['American Robin', 3], ['House Sparrow', 2], ['American Goldfinch', 1], ['Blue Jay', 1]] },
  'American Goldfinch': { sp: 2, top: [['American Goldfinch', 88], ['House Sparrow', 6], ['Northern Cardinal', 3], ['American Robin', 2], ['Blue Jay', 1]] },
  'Indigo Bunting': { sp: 3, top: [['Indigo Bunting', 85], ['Blue Jay', 9], ['American Robin', 3], ['House Sparrow', 2], ['Northern Cardinal', 1]] },
  'House Sparrow': { sp: 4, top: [['House Sparrow', 74], ['American Goldfinch', 12], ['American Robin', 8], ['Northern Cardinal', 4], ['Blue Jay', 2]] },
  'American Robin': { sp: 5, top: [['American Robin', 82], ['House Sparrow', 9], ['Northern Cardinal', 5], ['Blue Jay', 2], ['American Goldfinch', 2]] },
};

/** The thesis's logged per-epoch losses. Keep exactly as recorded. */
export const TRAIN = [1.579827, 0.484397, 0.344628, 0.255804, 0.203335, 0.196841, 0.17193, 0.130213, 0.1186, 0.116316, 0.106292, 0.133141, 0.093042, 0.085757, 0.07877, 0.058873, 0.076792, 0.077938, 0.061053, 0.058077];
export const VALID = [0.735421, 0.575804, 0.54677, 0.533436, 0.531494, 0.495609, 0.497623, 0.51159, 0.506606, 0.497882, 0.531919, 0.542378, 0.521776, 0.529921, 0.560282, 0.516175, 0.506742, 0.557134, 0.504938, 0.551698];

/** Lightens (amt > 0) or darkens a #rrggbb colour. */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const attrs = (a: Record<string, string | number>) => Object.entries(a).map(([k, v]) => ` ${k}="${v}"`).join('');
const el = (n: string, a: Record<string, string | number>) => `<${n}${attrs(a)}/>`;

/**
 * The inner markup of a field-guide-style bird (viewBox 0 0 150 132), from
 * the reference's drawBird. `uid` keeps gradient ids unique on the page;
 * `delay` (seconds, negative) staggers its idle animation.
 */
export function birdSvg(sp: Species, { uid, delay = 0, branch = true }: { uid: string; delay?: number; branch?: boolean }) {
  const back = sp.back, belly = sp.belly, wing = sp.wing ?? shade(back, -22), head = sp.head ?? back;
  const defs: string[] = [];
  const grad = (id: string, c1: string, c2: string, vertical: boolean) => {
    defs.push(`<linearGradient id="${uid}${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
    return `url(#${uid}${id})`;
  };
  const gBack = grad('bk', shade(back, 16), shade(back, -20), true);
  const gBelly = grad('bl', shade(belly, 14), shade(belly, -14), true);
  const gWing = grad('wg', shade(wing, 12), shade(wing, -26), true);
  const gHead = grad('hd', shade(head, 18), shade(head, -16), true);
  const d = `animation-delay:${delay.toFixed(2)}s`;
  const legs = sp.legs ?? '#7a5a38';
  const tcol = sp.tail ?? wing;
  const bk = sp.beak ?? '#d8a24a';

  let branchSvg = '';
  if (branch) {
    const twig = (dd: string, w: number) => el('path', { d: dd, fill: 'none', stroke: '#8a6a44', 'stroke-width': w, 'stroke-linecap': 'round' });
    branchSvg = twig('M 6 116 Q 60 108 148 118', 6) + twig('M 110 115 q 14 -8 26 -4', 3.4) + twig('M 40 113 q -6 6 -14 7', 3);
  }

  // Tail.
  let tail = el('path', { d: 'M 112 70 L 150 84 L 150 92 L 110 84 Z', fill: grad('tl', shade(tcol, 8), shade(tcol, -28), false), stroke: shade(tcol, -34), 'stroke-width': 1 });
  for (let t = 0; t < 3; t++) tail += el('line', { x1: 116, y1: 74 + t * 2, x2: 148, y2: 86 + t * 2.2, stroke: shade(tcol, -30), 'stroke-width': 0.8, opacity: 0.6 });

  // Body, belly, breast, legs.
  let body = el('path', { d: 'M 33 52 Q 40 30 62 33 Q 95 36 117 64 L 120 74 Q 101 97 74 97 Q 42 97 35 71 Q 31 60 33 52 Z', fill: gBack, stroke: shade(back, -30), 'stroke-width': 1.4 });
  body += el('path', { d: 'M 35 70 Q 40 96 74 97 Q 94 97 107 86 Q 86 95 58 90 Q 42 86 35 70 Z', fill: gBelly, opacity: 0.96 });
  if (sp.breast) body += el('path', { d: 'M 35 66 Q 37 90 64 93 Q 80 94 90 86 Q 70 90 50 84 Q 39 80 35 66 Z', fill: grad('br', shade(sp.breast, 14), shade(sp.breast, -16), true), opacity: 0.97 });
  body += el('path', { d: 'M 66 92 L 66 112 M 76 92 L 78 112', stroke: legs, 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  body += el('path', { d: 'M 66 112 l 7 3 M 66 112 l -5 3 M 66 112 l 1 5 M 78 112 l 7 3 M 78 112 l -5 3 M 78 112 l 1 5', stroke: legs, 'stroke-width': 1.8, 'stroke-linecap': 'round' });

  // Wing, with feather lines, wing-bar and spots.
  let wingSvg = el('path', { d: 'M 62 54 Q 100 54 114 82 Q 92 86 68 78 Q 58 70 62 54 Z', fill: gWing, stroke: shade(wing, -32), 'stroke-width': 1.2 });
  if (sp.wingbar) wingSvg += el('path', { d: 'M 70 68 Q 92 70 106 80', fill: 'none', stroke: sp.wingbar, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.95 });
  for (let f = 0; f < 5; f++) wingSvg += el('path', { d: `M ${76 + f * 7} ${60 + f * 3.5} Q ${100 + f * 5} ${74 + f * 2} ${113 + f * 4} ${84 + f * 1.5}`, fill: 'none', stroke: shade(wing, -30), 'stroke-width': 0.9, opacity: 0.6 });
  if (sp.wingspots) for (let s = 0; s < 4; s++) wingSvg += el('circle', { cx: 100 + s * 3, cy: 80 - s, r: 1.6, fill: '#fff', opacity: 0.85 });

  // Head: crest, cap, mask, eye-stripe, then the eye (with its blinking lid).
  let headSvg = el('path', { d: 'M 33 52 Q 34 32 52 31 Q 66 31 66 50 Q 62 68 44 70 Q 34 66 33 52 Z', fill: gHead, stroke: shade(head, -30), 'stroke-width': 1.3 });
  if (sp.crest) {
    const gcr = grad('cr', shade(sp.crest, 14), shade(sp.crest, -20), true);
    headSvg += el('path', { d: 'M 44 33 Q 49 15 61 12 Q 58 22 55 33 Z', fill: gcr, stroke: shade(sp.crest, -30), 'stroke-width': 1, 'stroke-linejoin': 'round' });
    headSvg += el('path', { d: 'M 50 30 Q 53 19 61 12', fill: 'none', stroke: shade(sp.crest, -8), 'stroke-width': 1.4, opacity: 0.7 });
  }
  if (sp.cap) headSvg += el('path', { d: 'M 36 40 Q 42 30 56 32 Q 50 38 40 44 Q 36 43 36 40 Z', fill: sp.cap, opacity: 0.95 });
  if (sp.mask) headSvg += el('path', { d: 'M 30 52 Q 34 60 46 62 Q 42 54 42 48 Q 36 48 30 52 Z', fill: sp.mask, opacity: 0.95 });
  if (sp.eyestripe) headSvg += el('path', { d: 'M 40 46 Q 50 46 58 50', fill: 'none', stroke: sp.eyestripe, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.9 });
  let eye = '';
  if (sp.eyering) eye += el('circle', { cx: 42, cy: 47, r: 5, fill: 'none', stroke: '#f6efe2', 'stroke-width': 2 });
  eye += el('circle', { cx: 42, cy: 47, r: 4.2, fill: '#1c1712' });
  eye += el('circle', { cx: 43.4, cy: 45.6, r: 1.3, fill: '#fff', opacity: 0.9 });
  eye += el('rect', { class: 'lid', x: 37, y: 42, width: 10, height: 10, rx: 4, fill: gHead, style: `transform-box:fill-box;transform-origin:center;transform:scaleY(0);${d}` });
  headSvg += `<g class="eye">${eye}</g>`;

  // Throat and beak sit over the head.
  let front = '';
  if (sp.throat) front += el('path', { d: 'M 34 60 Q 40 72 50 72 Q 44 64 44 58 Q 38 58 34 60 Z', fill: sp.throat, opacity: 0.95 });
  if (sp.coneBeak) {
    front += el('path', { d: 'M 33 50 L 16 53 L 33 57 Z', fill: bk, stroke: shade(bk, -40), 'stroke-width': 0.8 });
    front += el('path', { d: 'M 33 55 L 16 53 L 33 59 Z', fill: shade(bk, -18) });
  } else {
    front += el('path', { d: 'M 33 51 L 13 54 L 33 55 Z', fill: bk, stroke: shade(bk, -40), 'stroke-width': 0.8 });
    front += el('path', { d: 'M 33 55 L 15 55 L 33 58 Z', fill: shade(bk, -16) });
  }

  return `<defs>${defs.join('')}</defs><g>${branchSvg}<g class="bird" style="${d}">` +
    `<g class="tail" style="${d}">${tail}</g>${body}<g class="wing">${wingSvg}</g>` +
    `<g class="head" style="${d}">${headSvg}</g>${front}</g></g>`;
}
