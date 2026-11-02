// Social preview (Open Graph) cards, one per page, rendered at build time by
// src/pages/og/[...path].png.ts. This module lists the pages that get one;
// any other page falls back to the site-wide /og-image.png.

import { getPosts, getProjects, getProfile } from './content';
import { researchSequence } from './reading';

export interface OgCard {
  /** Big title on the card. */
  title: string;
  /** Small label above it, e.g. "Research". */
  kind: string;
  /** Optional line under the title. */
  sub?: string;
}

let cache: Promise<Map<string, OgCard>> | undefined;

/** Page path (e.g. "/projects/globalfacenet/") → card. */
export function ogPages(): Promise<Map<string, OgCard>> {
  cache ??= (async () => {
    const profile = await getProfile();
    const pages = new Map<string, OgCard>();
    pages.set('/', { title: profile.name, kind: 'Portfolio', sub: profile.role });
    pages.set('/research/', { title: 'Research', kind: 'Section', sub: 'Medical imaging · Computer vision · Fraud attribution' });
    pages.set('/publications/', { title: 'Publications', kind: 'Section', sub: 'Peer-reviewed papers, work under review and preprints' });
    pages.set('/projects/', { title: 'Projects', kind: 'Section', sub: 'Machine learning and computer vision, explained stage by stage' });
    pages.set('/blog/', { title: 'Blog', kind: 'Section', sub: 'Notes on medical AI, computer vision and research' });
    pages.set('/cv/', { title: 'Curriculum vitae', kind: 'CV', sub: profile.role });
    pages.set('/upwork/', { title: 'Applied ML work', kind: 'Upwork', sub: 'Prototyping, vision pipelines, data analysis' });
    for (const p of await getProjects()) pages.set(`/projects/${p.id}/`, { title: p.data.title, kind: 'Project', sub: p.data.one_liner });
    for (const r of await researchSequence()) pages.set(r.href, { title: r.title, kind: 'Research', sub: r.summary });
    for (const p of await getPosts()) pages.set(`/blog/${p.id}/`, { title: p.data.title, kind: 'Blog post' });
    return pages;
  })();
  return cache;
}

/** "/projects/globalfacenet/" → "projects/globalfacenet"; "/" → "home". */
export const ogKey = (path: string) => path.replace(/^\/|\/$/g, '') || 'home';
