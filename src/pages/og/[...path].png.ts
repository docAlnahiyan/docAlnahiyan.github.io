// Renders each page's social preview card (1200×630 PNG) at build time with
// Satori (layout to SVG) and resvg (SVG to PNG), in the site's clay style.

import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ogKey, ogPages, type OgCard } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () =>
  [...(await ogPages()).entries()].map(([path, card]) => ({ params: { path: ogKey(path) }, props: { card } }));

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`));
const fonts = [
  { name: 'Newsreader', data: font('@fontsource/newsreader', 'newsreader-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Plex Sans', data: font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex Sans', data: font('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Plex Mono', data: font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];

// Clay tokens (light theme), as in global.css.
const C = { bg: '#faf7f0', ink: '#201e1a', ink2: '#5c584f', accent: '#c96442', accentInk: '#a8482b' };

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

function card({ title, kind, sub }: OgCard): Node {
  const size = title.length > 60 ? 54 : title.length > 36 ? 64 : 76;
  return h('div', { width: 1200, height: 630, display: 'flex', background: C.accent, padding: 12 }, [
    h('div', { width: 1176, height: 606, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: C.bg, padding: '64px 72px' }, [
      h('div', { fontFamily: 'Plex Mono', fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: C.accent }, kind),
      h('div', { marginTop: 22, fontFamily: 'Newsreader', fontWeight: 600, fontSize: size, lineHeight: 1.1, color: C.ink, maxWidth: 1000 }, title),
      h('div', { marginTop: 30, width: 130, height: 6, borderRadius: 3, background: C.accent }),
      sub ? h('div', { marginTop: 26, fontFamily: 'Plex Sans', fontSize: 30, lineHeight: 1.35, color: C.ink2, maxWidth: 980 }, sub) : h('div', {}),
      h('div', { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }, [
        h('div', { fontFamily: 'Plex Sans', fontWeight: 500, fontSize: 26, color: C.ink }, 'Al-Nahiyan Khushbu'),
        h('div', { fontFamily: 'Plex Mono', fontSize: 24, color: C.accentInk }, 'docalnahiyan.github.io'),
      ]),
    ]),
  ]);
}

export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(card((props as { card: OgCard }).card) as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: false } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
