// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks, lazyImages } from './src/lib/external-links-plugin.ts';
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
  markdown: {
    // Off-site links in Markdown and MDX open in a new tab; links within the
    // site (relative, or to this origin) stay in the same tab.
    processor: satteri({ hastPlugins: [externalLinks(site), lazyImages()] }),
  },
  vite: {
    build: {
      // The largest chunk is TensorFlow.js for the facemask page's live demo
      // (~800 kB). It is imported only when a visitor presses Run, never with
      // the page, so the default 500 kB warning does not apply to it.
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        // Astro marks every MDX content entry with a "use astro:head-inject"
        // directive, which the bundler reports on each build. It is Astro's
        // own marker and harmless; every other warning still shows.
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('astro:head-inject')) return;
          warn(warning);
        },
      },
    },
  },
});
