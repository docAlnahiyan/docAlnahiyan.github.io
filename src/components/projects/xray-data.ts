// Bone Fracture Detection explainer data and the radiograph renderer
// (design-reference/xray-explainer.html). The project's files were damaged,
// so this is a walkthrough of the method (preprocess, CNN classify, Grad-CAM
// localise, threshold). There are no accuracy or dataset figures to cite; the
// Stage 6 operating curve and p(fracture) are illustrative.
//
// The radiographs are synthetic, drawn on a canvas — no patient images. The
// drawing helpers below are the reference's, unchanged apart from types. They
// are drawn in a 220-unit-wide space and scaled to the canvas.

import { seeded } from './explainer';

export type Part = 'wrist' | 'ankle' | 'knee' | 'hand';

export interface RadiographState {
  fracture?: boolean;
  /** Contrast stretch, standing in for CLAHE. */
  enhance?: boolean;
  /** A real Sobel pass over the rendered film. */
  edges?: boolean;
  /** Heatmap centre and radius, [x, y, r] in drawing units. */
  heat?: [number, number, number] | null;
  /** Labelled arrow, in drawing units. */
  arrow?: { fx: number; fy: number; tx: number; ty: number };
}

type Ctx = CanvasRenderingContext2D;

/** Stage 1: the gallery — part, label, caption, state. */
export const GALLERY: [Part, string, string, RadiographState][] = [
  ['wrist', 'Wrist', 'Normal', {}],
  ['ankle', 'Ankle', 'Fracture', { fracture: true }],
  ['knee', 'Knee', 'Normal', {}],
  ['hand', 'Hand', 'Fracture', { fracture: true }],
];

/** Stage 2: the arrow to the distal radius break. */
export const WRIST_ARROW = { fx: 150, fy: 100, tx: 110, ty: 128 };

/** Stages 5–6: the illustrative Grad-CAM hot spot over the break. */
export const CAM_HEAT: [number, number, number] = [88, 128, 58];

export type PreMode = 'raw' | 'clahe' | 'edges';
export const PRENOTE: Record<PreMode, string> = {
  raw: 'The original film: faint, grainy, unevenly lit.',
  clahe: 'CLAHE boosts local contrast: the bone edges and the break stand out.',
  edges: 'Edge detection reduces the film to outlines, isolating the cortical breaks.',
};

/** Stage 4: the CNN's feature maps. */
export const CNN_MAPS = [
  { s: 66, cells: 6, depth: 1, d: 'X-ray', l: 'input' },
  { s: 56, cells: 5, depth: 2, d: 'edges', l: 'conv1' },
  { s: 46, cells: 4, depth: 3, d: 'outlines', l: 'conv2' },
  { s: 38, cells: 3, depth: 4, d: 'joints', l: 'conv3' },
  { s: 30, cells: 2, depth: 5, d: 'fracture?', l: 'deep' },
];

/** Stage 6: the example output's fracture probability (illustrative). */
export const EXAMPLE_PROB = 0.72;

/**
 * Stage 6: an illustrative operating curve — the shape of the
 * sensitivity/specificity trade-off at a threshold (%), not measured values.
 */
export function opCurve(th: number) {
  const sens = Math.round(Math.max(40, Math.min(99, 99 - (th - 5) * 0.42)));
  const spec = Math.round(Math.max(35, Math.min(98, 40 + (th - 5) * 0.62)));
  return { sens, spec };
}

/* ===== realistic radiograph renderer (canvas) ===== */

function longBone(ctx: Ctx, cx1: number, y1: number, w1: number, cx2: number, y2: number, w2: number, opt: { capTop?: number; capBot?: number; noMarrow?: boolean } = {}) {
  ctx.beginPath();
  ctx.moveTo(cx1 - w1 / 2, y1);
  ctx.lineTo(cx2 - w2 / 2, y2);
  ctx.quadraticCurveTo(cx2, y2 + (opt.capBot || 6), cx2 + w2 / 2, y2);
  ctx.lineTo(cx1 + w1 / 2, y1);
  ctx.quadraticCurveTo(cx1, y1 - (opt.capTop || 6), cx1 - w1 / 2, y1);
  ctx.closePath();
  // Bright cortex at the edges, darker towards the middle.
  const g = ctx.createLinearGradient(cx1 - w1 / 2, 0, cx1 + w1 / 2, 0);
  g.addColorStop(0, '#e9edf2');
  g.addColorStop(0.18, '#c3cad2');
  g.addColorStop(0.5, '#9aa2ac');
  g.addColorStop(0.82, '#c3cad2');
  g.addColorStop(1, '#e9edf2');
  ctx.fillStyle = g;
  ctx.fill();
  if (!opt.noMarrow) {
    // Marrow cavity.
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(cx1 - w1 * 0.22, y1 + 8);
    ctx.lineTo(cx2 - w2 * 0.22, y2 - 8);
    ctx.lineTo(cx2 + w2 * 0.22, y2 - 8);
    ctx.lineTo(cx1 + w1 * 0.22, y1 + 8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(70,78,88,0.55)';
    ctx.fill();
    ctx.restore();
  }
}

function roundBone(ctx: Ctx, x: number, y: number, rx: number, ry: number, bright?: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 7);
  const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 1, x, y, Math.max(rx, ry));
  g.addColorStop(0, bright || '#dfe4ea');
  g.addColorStop(1, '#8f98a2');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(240,244,248,0.55)';
  ctx.stroke();
}

const PARTS: Record<Part, (ctx: Ctx, R: () => number, frac?: boolean) => void> = {
  wrist(ctx, R, frac) {
    longBone(ctx, 92, 0, 30, 86, 150, 46, { capBot: 10 }); // radius
    longBone(ctx, 132, 0, 20, 126, 132, 26, { capBot: 8 }); // ulna
    roundBone(ctx, 126, 150, 9, 11);
    // Carpals.
    [[74, 168, 13, 11], [96, 166, 13, 11], [116, 170, 11, 10], [82, 188, 12, 10], [104, 188, 12, 10], [122, 190, 10, 9]].forEach((c) => roundBone(ctx, c[0], c[1], c[2], c[3]));
    // Metacarpal bases.
    [66, 88, 108, 128, 146].forEach((x, i) => longBone(ctx, x, 206, 13, x + (i - 2) * 4, 250, 12));
    if (frac) {
      // Transverse break across the distal radius: dark lucent line, bright lip.
      ctx.strokeStyle = 'rgba(8,10,14,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(66, 132);
      ctx.lineTo(108, 127);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(66, 129);
      ctx.lineTo(108, 124);
      ctx.stroke();
    }
  },
  ankle(ctx, R, frac) {
    longBone(ctx, 92, 0, 40, 96, 150, 46, { capBot: 8 }); // tibia
    roundBone(ctx, 80, 168, 12, 16);
    longBone(ctx, 140, 0, 16, 138, 150, 18, { capBot: 6 }); // fibula
    roundBone(ctx, 140, 170, 9, 16);
    // Talus.
    ctx.beginPath();
    ctx.moveTo(78, 184);
    ctx.quadraticCurveTo(110, 176, 146, 186);
    ctx.quadraticCurveTo(150, 208, 120, 214);
    ctx.quadraticCurveTo(84, 216, 76, 200);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 184, 0, 214);
    g.addColorStop(0, '#dfe4ea');
    g.addColorStop(1, '#9aa2ac');
    ctx.fillStyle = g;
    ctx.fill();
    // Calcaneus.
    ctx.beginPath();
    ctx.moveTo(84, 218);
    ctx.quadraticCurveTo(140, 214, 168, 234);
    ctx.quadraticCurveTo(150, 262, 96, 258);
    ctx.quadraticCurveTo(76, 240, 84, 218);
    ctx.closePath();
    ctx.fillStyle = '#b9c0c9';
    ctx.fill();
    if (frac) {
      ctx.strokeStyle = 'rgba(8,10,14,0.9)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(132, 150);
      ctx.lineTo(146, 172);
      ctx.stroke();
    }
  },
  knee(ctx, R, frac) {
    longBone(ctx, 104, 0, 34, 104, 112, 40, { capBot: 4 }); // femur
    roundBone(ctx, 84, 128, 22, 18);
    roundBone(ctx, 126, 128, 22, 18);
    // Tibial plateau.
    ctx.beginPath();
    ctx.moveTo(74, 150);
    ctx.quadraticCurveTo(104, 142, 138, 150);
    ctx.lineTo(132, 166);
    ctx.lineTo(80, 166);
    ctx.closePath();
    ctx.fillStyle = '#cfd5dc';
    ctx.fill();
    longBone(ctx, 104, 164, 40, 106, 270, 30, { capTop: 2 }); // tibia
    roundBone(ctx, 146, 168, 11, 14);
    longBone(ctx, 150, 176, 14, 150, 270, 12); // fibula
    // Patella, faint over the femur.
    ctx.beginPath();
    ctx.ellipse(104, 120, 18, 22, 0, 0, 7);
    ctx.fillStyle = 'rgba(210,216,223,0.42)';
    ctx.fill();
    if (frac) {
      ctx.strokeStyle = 'rgba(8,10,14,0.9)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(86, 152);
      ctx.lineTo(120, 158);
      ctx.stroke();
    }
  },
  hand(ctx, R, frac) {
    [[92, 250, 14, 11], [112, 250, 12, 10], [74, 250, 11, 10]].forEach((c) => roundBone(ctx, c[0], c[1], c[2], c[3]));
    // Four fingers: metacarpal and three phalanges each.
    [[64, -10], [90, -3], [114, 4], [136, 10]].forEach((c) => {
      const x = c[0], l = c[1];
      longBone(ctx, x, 186, 15, x + l * 0.3, 236, 14);
      longBone(ctx, x + l, 140, 13, x + l * 0.4, 182, 15);
      longBone(ctx, x + l * 1.8, 102, 11, x + l, 136, 13);
      longBone(ctx, x + l * 2.5, 70, 9, x + l * 1.8, 98, 11);
    });
    // Thumb.
    ctx.save();
    ctx.translate(58, 210);
    ctx.rotate(-0.5);
    longBone(ctx, 0, 0, 15, -6, 52, 14);
    longBone(ctx, -8, -40, 12, -4, -6, 14);
    longBone(ctx, -14, -72, 10, -10, -42, 12);
    ctx.restore();
    if (frac) {
      ctx.strokeStyle = 'rgba(8,10,14,0.9)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(84, 158);
      ctx.lineTo(99, 154);
      ctx.stroke();
    }
  },
};

/** A blurred soft-tissue halo around the bones. */
function softTissue(ctx: Ctx, part: Part) {
  ctx.save();
  ctx.filter = 'blur(10px)';
  ctx.fillStyle = 'rgba(120,128,138,0.30)';
  if (part === 'wrist') {
    ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(150, 0); ctx.lineTo(156, 160); ctx.quadraticCurveTo(110, 260, 60, 210); ctx.closePath(); ctx.fill();
  } else if (part === 'ankle') {
    ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(160, 0); ctx.quadraticCurveTo(185, 220, 150, 270); ctx.lineTo(70, 266); ctx.quadraticCurveTo(52, 120, 60, 0); ctx.closePath(); ctx.fill();
  } else if (part === 'knee') {
    ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(150, 0); ctx.quadraticCurveTo(170, 140, 160, 270); ctx.lineTo(60, 270); ctx.quadraticCurveTo(48, 140, 64, 0); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(40, 70); ctx.lineTo(160, 60); ctx.quadraticCurveTo(180, 200, 150, 270); ctx.lineTo(55, 270); ctx.quadraticCurveTo(30, 180, 40, 70); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** A real 3×3 Sobel pass over the canvas, tinted cyan. */
function sobel(ctx: Ctx, W: number, H: number) {
  const src = ctx.getImageData(0, 0, W, H), s = src.data, out = ctx.createImageData(W, H), d = out.data;
  const L = (x: number, y: number) => {
    x = Math.max(0, Math.min(W - 1, x));
    y = Math.max(0, Math.min(H - 1, y));
    return s[(y * W + x) * 4];
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const gx = -L(x - 1, y - 1) - 2 * L(x - 1, y) - L(x - 1, y + 1) + L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1);
      const gy = -L(x - 1, y - 1) - 2 * L(x, y - 1) - L(x + 1, y - 1) + L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1);
      const m = Math.min(255, Math.hypot(gx, gy)), i = (y * W + x) * 4;
      d[i] = m * 0.5;
      d[i + 1] = m * 0.85;
      d[i + 2] = Math.min(255, m * 1.1);
      d[i + 3] = 255;
    }
  ctx.putImageData(out, 0, 0);
}

const cssv = (n: string) => getComputedStyle(document.body).getPropertyValue(n).trim();

/**
 * Renders a synthetic radiograph of `part` onto `canvas`: bones and soft
 * tissue drawn off-screen, blurred, converted to grey with film grain (or
 * contrast-stretched / Sobel-filtered), then the heatmap, vignette and arrow.
 * Films are dark in both site themes, as real ones are.
 */
export function radiograph(canvas: HTMLCanvasElement, part: Part, state: RadiographState = {}) {
  const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const R = seeded(part.length * 131 + 7);
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const o = off.getContext('2d')!;
  const bg = o.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, H * 0.75);
  bg.addColorStop(0, '#141821');
  bg.addColorStop(1, '#05070a');
  o.fillStyle = bg;
  o.fillRect(0, 0, W, H);
  const sc = W / 220;
  o.save();
  o.scale(sc, sc);
  softTissue(o, part);
  o.save();
  PARTS[part](o, R, state.fracture);
  o.restore();
  o.restore();

  ctx.clearRect(0, 0, W, H);
  ctx.filter = state.edges ? 'none' : `blur(${1.1 * sc}px)`;
  ctx.drawImage(off, 0, 0);
  ctx.filter = 'none';

  // Greyscale, then contrast stretch (CLAHE stand-in) and film grain.
  const img = ctx.getImageData(0, 0, W, H), d = img.data;
  const amp = state.edges ? 0 : 16, lo = state.enhance ? 36 : 0, hi = state.enhance ? 210 : 255, gain = 255 / (hi - lo || 255);
  for (let i = 0; i < d.length; i += 4) {
    let v = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    if (state.enhance) v = Math.max(0, Math.min(255, (v - lo) * gain));
    const n = amp ? (R() - 0.5) * amp : 0;
    v = Math.max(0, Math.min(255, v + n));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  if (state.edges) sobel(ctx, W, H);

  if (state.heat) {
    const hx = state.heat[0] * sc, hy = state.heat[1] * sc, hr = state.heat[2] * sc;
    const hg = ctx.createRadialGradient(hx, hy, 2, hx, hy, hr);
    hg.addColorStop(0, 'rgba(255,40,30,0.72)');
    hg.addColorStop(0.45, 'rgba(255,150,30,0.5)');
    hg.addColorStop(0.8, 'rgba(255,225,70,0.22)');
    hg.addColorStop(1, 'rgba(255,225,70,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr * 0.85, hr, 0, 0, 7);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  if (state.arrow) {
    const a = state.arrow, ac = cssv('--accent');
    ctx.strokeStyle = ac;
    ctx.fillStyle = ac;
    ctx.lineWidth = 2.2 * sc;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.fx * sc, a.fy * sc);
    ctx.lineTo(a.tx * sc, a.ty * sc);
    ctx.stroke();
    const ang = Math.atan2(a.ty - a.fy, a.tx - a.fx), hl = 8 * sc;
    ctx.beginPath();
    ctx.moveTo(a.tx * sc, a.ty * sc);
    ctx.lineTo(a.tx * sc - hl * Math.cos(ang - 0.4), a.ty * sc - hl * Math.sin(ang - 0.4));
    ctx.lineTo(a.tx * sc - hl * Math.cos(ang + 0.4), a.ty * sc - hl * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.font = `${11 * sc}px ${cssv('--font-mono') || 'monospace'}`;
    ctx.fillText('fracture', a.fx * sc + 4 * sc, a.fy * sc - 3 * sc);
  }
}
