// schema.org structured data (JSON-LD) for the page types that have one:
// the home page (Person), papers (ScholarlyArticle) and blog posts
// (BlogPosting). BaseLayout serialises whatever a page passes as `jsonLd`.
// Fields without a value are left out rather than sent empty.

import type { Post, Publication } from './content';
import { doiUrl } from './format';

const SITE_URL = 'https://docalnahiyan.github.io';

type Profile = Awaited<ReturnType<typeof import('./content').getProfile>>;
type Json = Record<string, unknown>;

const abs = (path: string) => new URL(path, SITE_URL).href;

/** Drops keys whose value is undefined, '' or an empty array. */
function clean<T extends Json>(o: T): T {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

const UNIVERSITY = { '@type': 'CollegeOrUniversity', name: 'Southwest Jiaotong University' };

/** The site owner, as referenced from papers and posts. */
export function authorRef(profile: Profile): Json {
  return { '@type': 'Person', name: profile.name, url: `${SITE_URL}/` };
}

export function personLd(profile: Profile): Json {
  const { links } = profile;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: profile.name,
    alternateName: 'Nahiyan',
    url: `${SITE_URL}/`,
    image: profile.photo ? abs(profile.photo) : undefined,
    jobTitle: profile.role,
    affiliation: UNIVERSITY,
    alumniOf: [UNIVERSITY, { '@type': 'CollegeOrUniversity', name: 'Sichuan University' }],
    knowsAbout: [profile.research_area, profile.methods].filter(Boolean).flatMap((s) => s!.split(' · ')),
    sameAs: [links.orcid, links.github, links.linkedin, links.scholar].filter(Boolean),
  });
}

/** "A.-N. Khushbu, X. Zhang, and Y. Pan" → ["A.-N. Khushbu", "X. Zhang", "Y. Pan"]. */
export const splitAuthors = (authors: string) =>
  authors
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((a) => a.trim())
    .filter(Boolean);

const isOwner = (name: string) => /\bKhushbu\b/.test(name);

/** A BibTeX field's value, e.g. bibField(bib, 'publisher') → "IEEE". */
export function bibField(bibtex: string, field: string): string | undefined {
  const m = bibtex.match(new RegExp(`\\b${field}\\s*=\\s*\\{(.+?)\\}\\s*,?\\s*$`, 'mi'));
  return m?.[1].replace(/[{}]/g, '').trim();
}

/**
 * A paper. `pageUrl` is where it is presented on this site. Only published
 * papers and posted preprints get a datePublished; a paper under review
 * gets its status instead.
 */
export function scholarlyArticleLd(pub: Publication, profile: Profile, pageUrl: string, withContext = true): Json {
  const d = pub.data;
  const released = d.status === 'published' || d.status === 'preprint';
  const date = d.date ? d.date.toISOString().slice(0, 10) : String(d.year);
  const publisher = bibField(d.bibtex, 'publisher');
  return clean({
    ...(withContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'ScholarlyArticle',
    '@id': `${abs(pageUrl)}#article`,
    headline: d.title.length > 110 ? `${d.title.slice(0, 107)}…` : d.title,
    name: d.title,
    author: splitAuthors(d.authors).map((name) =>
      isOwner(name) ? authorRef(profile) : { '@type': 'Person', name },
    ),
    datePublished: released ? date : undefined,
    dateCreated: released ? undefined : String(d.year),
    creativeWorkStatus: { published: 'Published', 'under-review': 'Under review', preprint: 'Preprint', 'in-progress': 'In progress' }[d.status],
    isPartOf: d.type === 'preprint' ? undefined : { '@type': d.type === 'journal' ? 'Periodical' : 'PublicationEvent', name: d.venue },
    publisher: released && publisher ? { '@type': 'Organization', name: publisher } : undefined,
    pagination: d.pages?.replace(/^pp\.\s*/, ''),
    award: d.award,
    keywords: d.keywords.join(', '),
    abstract: d.abstract?.replace(/\s+/g, ' ').trim(),
    url: abs(pageUrl),
    sameAs: [d.doi && doiUrl(d.doi), d.url].filter(Boolean),
    identifier: d.doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: d.doi } : undefined,
  });
}

export function blogPostingLd(post: Post, profile: Profile, pageUrl: string, image: string): Json {
  const d = post.data;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: d.title,
    description: d.excerpt,
    datePublished: d.date.toISOString().slice(0, 10),
    image: abs(image),
    author: authorRef(profile),
    publisher: authorRef(profile),
    mainEntityOfPage: abs(pageUrl),
    url: abs(pageUrl),
  });
}

/** JSON for a <script type="application/ld+json">, safe inside HTML. */
export const serializeLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
