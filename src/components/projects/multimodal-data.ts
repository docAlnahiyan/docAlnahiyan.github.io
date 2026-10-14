// MultimodalTransformerNet explainer data (design-reference/multimodal-explainer.html).
// The faces and waveforms are illustrations, not RAF-DB / RAVDESS media, and
// the confidences are illustrative outputs that follow the paper's reported
// pattern — not live inference.
import type { Expression } from './explainer';

/** Emotions shared by the two datasets (illustrative set). */
export const CLASSES = ['happy', 'angry', 'surprise', 'fearful', 'disgust', 'sad'] as const;
export type Emotion = (typeof CLASSES)[number];
export type Mode = 'img' | 'aud' | 'both';

export const FACE: Record<Emotion, Expression> = {
  happy: { bL: 'M -32 -24 Q -22 -26 -12 -24', bR: 'M 12 -24 Q 22 -26 32 -24', eyeRy: 6, mouth: 'M -20 16 Q 0 34 20 16' },
  angry: { bL: 'M -32 -25 Q -22 -22 -12 -18', bR: 'M 12 -18 Q 22 -22 32 -25', eyeRy: 5, mouth: 'M -18 26 Q 0 21 18 26' },
  surprise: { bL: 'M -32 -26 Q -22 -31 -12 -27', bR: 'M 12 -27 Q 22 -31 32 -26', eyeRy: 9, open: 'M 0 8 Q 13 8 13 22 Q 13 36 0 36 Q -13 36 -13 22 Q -13 8 0 8 Z' },
  fearful: { bL: 'M -32 -25 Q -22 -30 -12 -29', bR: 'M 12 -29 Q 22 -30 32 -25', eyeRy: 9, open: 'M 0 15 Q 8 15 8 24 Q 8 33 0 33 Q -8 33 -8 24 Q -8 15 0 15 Z' },
  disgust: { bL: 'M -32 -24 Q -22 -21 -12 -19', bR: 'M 12 -19 Q 22 -21 32 -24', eyeRy: 5, mouth: 'M -18 24 Q -2 16 18 23' },
  sad: { bL: 'M -32 -20 Q -22 -24 -12 -26', bR: 'M 12 -26 Q 22 -24 32 -20', eyeRy: 6, mouth: 'M -20 28 Q 0 14 20 28' },
};

/** Confidence in the true class by input, plus a confusable neighbour for the spread. */
export const CONF: Record<Emotion, { img: number; aud: number; both: number; nb: Emotion }> = {
  happy: { img: 94, aud: 86, both: 99.5, nb: 'surprise' },
  angry: { img: 88, aud: 91, both: 99.0, nb: 'disgust' },
  surprise: { img: 92, aud: 82, both: 99.0, nb: 'fearful' },
  fearful: { img: 76, aud: 85, both: 98.5, nb: 'surprise' },
  disgust: { img: 85, aud: 72, both: 98.0, nb: 'angry' },
  sad: { img: 71, aud: 86, both: 99.0, nb: 'fearful' }, // the hard case for vision alone
};

/** The output distribution: the true class's confidence, the rest shared out. */
export function dist(emo: Emotion, mod: Mode): number[] {
  const ti = CLASSES.indexOf(emo);
  const conf = CONF[emo][mod];
  const nb = CLASSES.indexOf(CONF[emo].nb);
  const rem = 100 - conf;
  const base = CLASSES.map((_, i) => (i === ti ? 0 : (i === nb ? 2.4 : 1) + ((i * 13 + emo.length) % 5) * 0.12));
  const sum = base.reduce((a, b) => a + b, 0);
  return CLASSES.map((_, i) => (i === ti ? conf : +((rem * base[i]) / sum).toFixed(1)));
}

/** The note under the bars for each input setting. */
export function jumpText(emo: Emotion, mod: Mode): string {
  const c = CONF[emo];
  if (mod === 'img') return 'One modality only — the face. Turn on audio to see the lift.';
  if (mod === 'aud') return 'One modality only — the voice. Turn on the image to see the lift.';
  return `Image-only would be ${c.img}% · audio-only ${c.aud}% → both ${c.both}%  (+${(c.both - Math.max(c.img, c.aud)).toFixed(1)} pts)`;
}

/** Envelope character of each voice: [peak, sustain]. */
const VOICE: Record<Emotion, [number, number]> = {
  happy: [1, 0.7], angry: [1.3, 0.95], surprise: [1.1, 0.8], fearful: [0.9, 0.85], disgust: [0.8, 0.55], sad: [0.55, 0.3],
};

/**
 * A deterministic, speech-like waveform for an emotion: attack, sustain
 * with syllable dips, decay, and fixed fine detail. The canvas's logical
 * size comes from data-w / data-h; it is drawn at the screen's density.
 */
export function drawWave(cv: HTMLCanvasElement, emo: Emotion, active: boolean, color: string) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const W = Number(cv.dataset.w), H = Number(cv.dataset.h), mid = H / 2;
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  cv.width = W * dpr;
  cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const [peak, sus] = VOICE[emo] ?? [1, 0.6];
  ctx.strokeStyle = color;
  ctx.globalAlpha = active ? 1 : 0.4;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let seed = emo.length * 7 + 3;
  for (let x = 0; x < W; x++) {
    const t = x / W;
    let env = Math.min(1, t * 6) * (1 - Math.pow(Math.max(0, t - 0.75) / 0.25, 2));
    env *= sus + (peak - sus) * Math.abs(Math.sin(t * Math.PI * (emo === 'angry' ? 7 : emo === 'sad' ? 2 : 4)));
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const r = seed / 0x7fffffff - 0.5;
    const amp = env * (mid - 6) * (0.72 + 0.5 * Math.abs(r));
    const y = mid - amp * Math.sin(t * Math.PI * (emo === 'sad' ? 10 : 22)) - r * 6 * env;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}
