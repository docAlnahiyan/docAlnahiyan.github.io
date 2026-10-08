// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Netlify sets URL to the site's primary address at build time; it feeds
// canonical links, Open Graph URLs and the sitemap.
const site = process.env.URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
});
