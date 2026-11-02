// Pixel size of an image in public/, read at build time, so <img> tags can
// carry width and height (no layout shift). Remote images return undefined.

import sharp from 'sharp';
import { join } from 'node:path';

// Builds run from the project root; this module itself is bundled elsewhere.
const PUBLIC = join(process.cwd(), 'public');
const cache = new Map<string, { width: number; height: number } | undefined>();

export async function imageSize(src: string | undefined) {
  if (!src || !src.startsWith('/')) return undefined;
  if (cache.has(src)) return cache.get(src);
  let size: { width: number; height: number } | undefined;
  try {
    const meta = await sharp(join(PUBLIC, decodeURI(src))).metadata();
    if (meta.width && meta.height) size = { width: meta.width, height: meta.height };
  } catch {
    size = undefined;
  }
  cache.set(src, size);
  return size;
}
