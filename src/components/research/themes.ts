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

/** The research page that explains a paper, if it has one. */
export const themeForPublication = (id: string) => THEMES.find((t) => t.publication === id);
