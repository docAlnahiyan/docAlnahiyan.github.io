// Research themes with a hand-built interactive page under /research/. Each
// is listed first on the research index, and its paper gets an "Explore →"
// link on the publications list. To add one, build its page and add a line
// here.

export interface Theme {
  title: string;
  /** One plain sentence for the index card. */
  summary: string;
  tags: string[];
  href: string;
  /** Id of the paper in src/content/publications this page explains. */
  publication: string;
}

export const THEMES: Theme[] = [
  {
    title: 'Catching theft when the records lie',
    summary:
      'Finding the people behind warehouse loss, even when the thief edits the records to hide it — with a live simulation to try.',
    tags: ['Insider fraud', 'PU learning'],
    href: '/research/warehouse-theft-attribution/',
    publication: 'inventory-shrinkage-attribution',
  },
];

/**
 * Research entries (src/content/research) whose generated page is replaced
 * by a hand-built one: entry id → page. The index card links to the new
 * page and the old address redirects there. Kept here rather than in the
 * entry, so editing the entry in the admin cannot drop it.
 */
export const REPLACED_PAGES: Record<string, string> = {
  'parkinsons-hybrid-cnn-transformer-2d': '/research/parkinson-cnn-transformer/',
};

/** The research page that explains a paper, if it has one. */
export const themeForPublication = (id: string) => THEMES.find((t) => t.publication === id);
