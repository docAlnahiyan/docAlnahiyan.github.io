// Helpers for long pages: reading time, and the order of the research pages
// for previous/next links (the same order as the research index).

import { getEntry } from 'astro:content';
import { REPLACED_PAGES, THEMES } from '../components/research/themes';
import { getResearch } from './content';

/** Minutes to read a Markdown/MDX body at ~220 words a minute (at least 1). */
export function readingMinutes(body: string | undefined): number {
  const text = (body ?? '')
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ') // MDX components and HTML
    .replace(/[#*_`>\[\]()!-]/g, ' ');
  const words = text.split(/\s+/).filter((w) => /\w/.test(w)).length;
  return Math.max(1, Math.round(words / 220));
}

export interface PageLink {
  title: string;
  href: string;
  /** One-line summary, for preview cards. */
  summary?: string;
}

/** Every research page, hand-built themes first, as listed on /research/. */
export async function researchSequence(): Promise<PageLink[]> {
  const themes = await Promise.all(
    THEMES.map(async (t) => {
      const pub = await getEntry('publications', t.publication);
      return { title: pub?.data.title.split(':')[0] ?? t.title, href: t.href, summary: t.summary };
    }),
  );
  const entries = (await getResearch()).map((r) => ({
    title: r.data.title.split(':')[0],
    href: REPLACED_PAGES[r.id] ?? `/research/${r.id}/`,
    summary: r.data.subtitle,
  }));
  return [...themes, ...entries];
}

/** The pages before and after `href` in `list`. */
export function neighbours(list: PageLink[], href: string) {
  const norm = (h: string) => h.replace(/\/?$/, '/');
  const i = list.findIndex((p) => norm(p.href) === norm(href));
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}
