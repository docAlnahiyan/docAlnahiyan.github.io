// GlobalFaceNet explainer data (design-reference/globalfacenet-explainer.html).
// The seven RAF-DB classes, a stylised face per expression, and an
// illustrative softmax per expression (CLASSES order) — the shape of a
// confident prediction, not live inference.
import type { Expression } from './explainer';

export const CLASSES = ['surprise', 'fear', 'disgust', 'happy', 'sad', 'angry', 'neutral'] as const;
export type Emotion = (typeof CLASSES)[number];

export const EMO: Record<Emotion, Expression & { probs: number[] }> = {
  surprise: { bL: 'M -32 -26 Q -22 -31 -12 -27', bR: 'M 12 -27 Q 22 -31 32 -26', eyeRy: 9, open: 'M 0 8 Q 13 8 13 22 Q 13 36 0 36 Q -13 36 -13 22 Q -13 8 0 8 Z', probs: [86, 5, 1, 3, 1, 1, 3] },
  fear: { bL: 'M -32 -25 Q -22 -30 -12 -29', bR: 'M 12 -29 Q 22 -30 32 -25', eyeRy: 9, open: 'M 0 15 Q 8 15 8 24 Q 8 33 0 33 Q -8 33 -8 24 Q -8 15 0 15 Z', probs: [6, 80, 3, 2, 5, 2, 2] },
  disgust: { bL: 'M -32 -24 Q -22 -21 -12 -19', bR: 'M 12 -19 Q 22 -21 32 -24', eyeRy: 5, mouth: 'M -18 24 Q -2 16 18 23', probs: [2, 3, 82, 1, 4, 6, 2] },
  happy: { bL: 'M -32 -24 Q -22 -26 -12 -24', bR: 'M 12 -24 Q 22 -26 32 -24', eyeRy: 6, mouth: 'M -20 16 Q 0 34 20 16', probs: [2, 1, 1, 88, 3, 2, 3] },
  sad: { bL: 'M -32 -20 Q -22 -24 -12 -26', bR: 'M 12 -26 Q 22 -24 32 -20', eyeRy: 6, mouth: 'M -20 28 Q 0 14 20 28', probs: [2, 4, 3, 2, 80, 5, 4] },
  angry: { bL: 'M -32 -25 Q -22 -22 -12 -18', bR: 'M 12 -18 Q 22 -22 32 -25', eyeRy: 5, mouth: 'M -18 26 Q 0 21 18 26', probs: [1, 3, 6, 1, 4, 82, 3] },
  neutral: { bL: 'M -32 -22 Q -22 -24 -12 -22', bR: 'M 12 -22 Q 22 -24 32 -22', eyeRy: 7, mouth: 'M -18 23 Q 0 25 18 23', probs: [3, 2, 2, 4, 3, 3, 83] },
};
