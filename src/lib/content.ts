// The one place pages read content from. Drafts are filtered out and
// cross-collection rules are enforced here, so a contradiction between two
// entries stops the build instead of reaching the live site.

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Research = CollectionEntry<'research'>;
export type Project = CollectionEntry<'projects'>;
export type Publication = CollectionEntry<'publications'>;
export type Post = CollectionEntry<'blog'>;
export type UpworkItem = CollectionEntry<'upwork'>;

export const STATUS_LABEL: Record<Publication['data']['status'], string> = {
  published: 'Published',
  'under-review': 'Under review',
  preprint: 'Preprint',
  'in-progress': 'In progress',
};

export async function getProfile() {
  const entry = await getEntry('site', 'profile');
  if (!entry) throw new Error('Missing src/content/site/profile.yml');
  return entry.data;
}

export async function getPage(id: 'cv' | 'upwork') {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`Missing src/content/pages/${id}.md`);
  return entry;
}

export async function getPublications(): Promise<Publication[]> {
  const pubs = await getCollection('publications');
  return pubs.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

export async function getResearch(): Promise<Research[]> {
  const items = await getCollection('research');
  for (const item of items) {
    const ref = item.data.publication;
    if (!ref) continue;
    const pub = await getEntry(ref);
    if (!pub) {
      throw new Error(`research/${item.id} links to publication "${ref.id}", which does not exist.`);
    }
    if (pub.data.status !== item.data.status) {
      throw new Error(
        `research/${item.id} has status "${item.data.status}" but its publication ` +
          `"${pub.id}" has status "${pub.data.status}". Make them match.`,
      );
    }
  }
  return items.sort((a, b) => a.data.order - b.data.order);
}

export async function getProjects(): Promise<Project[]> {
  const items = await getCollection('projects');
  return items.sort((a, b) => a.data.order - b.data.order || +b.data.date - +a.data.date);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => !p.data.draft);
  return posts.sort((a, b) => +b.data.date - +a.data.date);
}

export async function getUpworkItems(): Promise<UpworkItem[]> {
  const items = await getCollection('upwork', (i) => !i.data.draft);
  return items.sort((a, b) => a.data.order - b.data.order);
}
