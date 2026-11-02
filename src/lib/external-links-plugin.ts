// Markdown/MDX counterpart of ext() in links.ts: off-site links open in a new
// tab with rel="noopener noreferrer". Astro 7 renders Markdown with Sätteri,
// which takes hast plugins of its own instead of rehype plugins, so this does
// what rehype-external-links did on the old unified pipeline.

import { defineHastPlugin } from 'satteri';

export const externalLinks = (siteOrigin: string) =>
  defineHastPlugin({
    name: 'external-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = String(node.properties?.href ?? '');
        if (!/^https?:\/\//i.test(href) || href.startsWith(siteOrigin)) return;
        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      },
    },
  });
