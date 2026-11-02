// Citation formats generated from a publication entry. BibTeX is stored on
// the entry (written by hand); RIS is built here from the same fields.

import type { Publication } from './content';
import { splitAuthors, bibField } from './jsonld';

/** "A.-N. Khushbu" → "Khushbu, A.-N." (RIS wants "Last, First"). */
const lastFirst = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const last = parts.pop() ?? name;
  return parts.length ? `${last}, ${parts.join(' ')}` : last;
};

const RIS_TYPE: Record<Publication['data']['type'], string> = {
  conference: 'CPAPER',
  journal: 'JOUR',
  preprint: 'UNPB',
  thesis: 'THES',
};

export function toRis(pub: Publication): string {
  const d = pub.data;
  const lines: [string, string | undefined][] = [];
  const add = (tag: string, value?: string | number) => {
    if (value !== undefined && value !== '') lines.push([tag, String(value)]);
  };
  // A paper not yet accepted is unpublished work, whatever its venue.
  add('TY', d.status === 'under-review' || d.status === 'in-progress' ? 'UNPB' : RIS_TYPE[d.type]);
  add('TI', d.title);
  for (const a of splitAuthors(d.authors)) add('AU', lastFirst(a));
  if (d.type === 'journal') add('JO', d.venue);
  else if (d.type === 'conference') add('T2', d.venue);
  add('PY', d.year);
  if (d.date) add('DA', d.date.toISOString().slice(0, 10).replace(/-/g, '/'));
  const pages = d.pages?.replace(/^pp\.\s*/, '').split(/[–-]+/);
  if (pages?.[0]) add('SP', pages[0].trim());
  if (pages?.[1]) add('EP', pages[1].trim());
  add('PB', bibField(d.bibtex, 'publisher'));
  add('DO', d.doi);
  add('UR', d.url ?? (d.doi ? `https://doi.org/${d.doi}` : undefined));
  for (const k of d.keywords) add('KW', k);
  if (d.abstract) add('AB', d.abstract.replace(/\s+/g, ' ').trim());
  if (d.status === 'under-review') add('N1', `Under review at ${d.venue}`);
  if (d.status === 'preprint') add('N1', 'Preprint; not peer-reviewed');
  return [...lines.map(([t, v]) => `${t}  - ${v}`), 'ER  - '].join('\r\n') + '\r\n';
}
