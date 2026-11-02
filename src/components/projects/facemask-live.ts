// The in-browser face detector for the facemask page's live demo. Imported
// only when the visitor asks for it, so TensorFlow.js and the model never
// load with the page. Runs entirely on the device: images and camera frames
// are never uploaded.
//
// The model is BlazeFace (Google, Apache-2.0), a small pre-trained face
// detector, self-hosted in public/models/blazeface/. It stands in for the
// project's first stage (finding faces); the project's own mask classifier
// is not available, so faces are found but not judged.

import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as blazeface from '@tensorflow-models/blazeface';

export interface Detection {
  x: number;
  y: number;
  w: number;
  h: number;
  /** The detector's own confidence, 0–1. */
  score: number;
}

let model: blazeface.BlazeFaceModel | undefined;

/** Loads the backend (WebGL, else CPU) and the model. Returns the backend used. */
export async function loadDetector(): Promise<string> {
  if (!(await tf.setBackend('webgl').catch(() => false))) await tf.setBackend('cpu');
  await tf.ready();
  model ??= await blazeface.load({ modelUrl: '/models/blazeface/model.json', maxFaces: 20, scoreThreshold: 0.75 });
  return tf.getBackend();
}

/** Faces in an image, video frame or canvas, in its own pixel coordinates. */
export async function detect(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Detection[]> {
  if (!model) throw new Error('Detector not loaded');
  // TensorFlow.js reads an <img> at its displayed size, not its file size;
  // copy it to a canvas at full size so boxes are in the image's own pixels.
  let source: HTMLVideoElement | HTMLCanvasElement;
  const w = input instanceof HTMLImageElement ? input.naturalWidth : input instanceof HTMLVideoElement ? input.videoWidth : input.width;
  if (!w) return []; // not loaded yet: nothing to look at
  if (input instanceof HTMLImageElement) {
    source = document.createElement('canvas');
    source.width = input.naturalWidth;
    source.height = input.naturalHeight;
    source.getContext('2d')!.drawImage(input, 0, 0);
  } else {
    source = input;
  }
  const faces = await model.estimateFaces(source, false);
  return faces.map((f) => {
    const [x1, y1] = f.topLeft as [number, number];
    const [x2, y2] = f.bottomRight as [number, number];
    const p = f.probability as unknown as number[] | number;
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, score: Array.isArray(p) ? p[0] : Number(p) };
  });
}
