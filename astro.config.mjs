// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The public address, used for canonical links, Open Graph URLs and the
// sitemap. The site is hosted on GitHub Pages.
const site = 'https://docalnahiyan.github.io';

export default defineConfig({
  site,
  output: 'static',
  integrations: [mdx(), sitemap()],
});
