// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { REPLACED_PAGES } from './src/components/research/themes.ts';

// The public address, used for canonical links, Open Graph URLs and the
// sitemap. The site is hosted on GitHub Pages.
const site = 'https://docalnahiyan.github.io';

// Research entries replaced by a hand-built page keep their old address as
// a redirect, so existing links still land on the right page.
const redirects = Object.fromEntries(
  Object.entries(REPLACED_PAGES).map(([id, page]) => [`/research/${id}/`, page]),
);

export default defineConfig({
  site,
  output: 'static',
  redirects,
  integrations: [mdx(), sitemap()],
});
