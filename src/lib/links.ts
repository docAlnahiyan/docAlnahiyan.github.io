// Off-site links open in a new tab; links within the site stay in the same
// tab. Markdown content gets the same treatment from rehype-external-links
// (astro.config.mjs).

const SITE_ORIGIN = 'https://docalnahiyan.github.io';

/** True for an absolute http(s) URL on another site. */
export const isExternal = (href?: string) =>
  !!href && /^https?:\/\//i.test(href) && !href.startsWith(SITE_ORIGIN);

/**
 * Attributes to spread onto an <a>: `{...ext(href)}`. `rel` adds to the
 * external values (e.g. "me" on profile links).
 */
export function ext(href?: string, rel?: string) {
  if (!isExternal(href)) return rel ? { rel } : {};
  return { target: '_blank', rel: [rel, 'noopener noreferrer'].filter(Boolean).join(' ') };
}
