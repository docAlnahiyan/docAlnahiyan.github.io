import type { Publication } from './content';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Both IEEE renderings of the site owner's name. */
const OWNER_NAME = /\b(A\.-?\s?N\. Khushbu)\b/g;

/** Author list as HTML with the site owner's name in bold. */
export function authorsHtml(authors: string): string {
  return escapeHtml(authors).replace(OWNER_NAME, '<strong>$1</strong>');
}

/** Minimal inline Markdown for short profile text: **bold** only. */
export function inlineMarkdown(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

// Fixed three-letter months (Intl's en-GB writes "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Jun 2025" */
export const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
/** "28 Sep 2026" */
export const fullDate = (d: Date) => `${d.getUTCDate()} ${monthYear(d)}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

export function requestPaperMailto(email: string, title: string): string {
  const subject = `Full paper request: ${title}`;
  const body =
    `Hello,\n\nI would like to read the full text of "${title}".\n\n` +
    `Name:\nAffiliation:\nReason for interest:\n\nThank you.`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function publicationCounts(pubs: Publication[]) {
  const by = (s: Publication['data']['status']) => pubs.filter((p) => p.data.status === s).length;
  return {
    total: pubs.length,
    published: by('published'),
    underReview: by('under-review'),
    preprint: by('preprint'),
  };
}

/** "1 published · 1 under review · 1 preprint", omitting zero groups. */
export function publicationBreakdown(pubs: Publication[]): string {
  const c = publicationCounts(pubs);
  return [
    c.published && `${c.published} published`,
    c.underReview && `${c.underReview} under review`,
    c.preprint && `${c.preprint} preprint${c.preprint > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export type YearBucket = { year: number; published: number; underReview: number; preprint: number; total: number };

/** Every year from the first paper to the last, including empty years. */
export function publicationsByYear(pubs: Publication[]): YearBucket[] {
  if (pubs.length === 0) return [];
  const years = pubs.map((p) => p.data.year);
  const buckets: YearBucket[] = [];
  for (let y = Math.min(...years); y <= Math.max(...years); y++) {
    const inYear = pubs.filter((p) => p.data.year === y);
    const c = publicationCounts(inYear);
    buckets.push({ year: y, published: c.published, underReview: c.underReview, preprint: c.preprint, total: c.total });
  }
  return buckets;
}

/**
 * Polyline points (100×28 box) for the cumulative count of items over time.
 * Returns undefined when there are too few distinct dates to draw a line.
 */
export function cumulativeSpark(dates: Date[]): string | undefined {
  const times = dates.map((d) => +d).sort((a, b) => a - b);
  const distinct = [...new Set(times)];
  if (distinct.length < 2) return undefined;
  const t0 = distinct[0];
  const span = distinct[distinct.length - 1] - t0;
  const n = times.length;
  return distinct
    .map((t) => {
      const count = times.filter((x) => x <= t).length;
      const x = ((t - t0) / span) * 100;
      const y = 26 - (count / n) * 22;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** First paragraph of a Markdown body as plain text (links and emphasis removed). */
export function firstParagraph(markdown: string | undefined): string | undefined {
  const para = markdown
    ?.split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|[-*] |\||<|!\[)/.test(p));
  return para
    ?.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .replace(/\s*\n\s*/g, ' ');
}
