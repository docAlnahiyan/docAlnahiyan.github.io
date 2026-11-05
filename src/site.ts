// Site-wide constants. Profile details (bio, links) move to an editable
// content file in Phase 2; this file keeps only structural settings.

export const SITE = {
  name: 'Al-Nahiyan Khushbu',
  shortName: 'Al-Nahiyan',
  description:
    'Al-Nahiyan Khushbu, researcher in artificial intelligence, working on medical imaging and computer vision.',
  locale: 'en_US',
  ogImage: '/og-image.png',
  ogImageAlt: 'Al-Nahiyan Khushbu, researcher in artificial intelligence, medical imaging and computer vision',
};

/**
 * FOLIO — the live demo of Folio (a document-chat app) on Hugging Face Spaces.
 * Change it here and the menu item and the Folio project follow.
 */
export const FOLIO_URL = 'https://docnahi-folio.hf.space';

export const NAV: readonly { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Home' },
  // A section of the home page, so it is never marked as the current page.
  { href: '/#about', label: 'About' },
  { href: '/research/', label: 'Research' },
  { href: '/publications/', label: 'Publications' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Blog' },
  { href: '/cv/', label: 'CV' },
  // Opens the Folio demo in a new tab.
  { href: FOLIO_URL, label: 'Ask Folio', external: true },
];

/**
 * CONTACT FORM — the "Work with me" form on the home page.
 * Paste a Formspree form endpoint here (e.g. 'https://formspree.io/f/abcdwxyz';
 * it is a public address, not a secret). While it is empty the form opens
 * the visitor's email app with the message filled in instead.
 */
export const CONTACT_FORM_ENDPOINT = '';

/**
 * ANALYTICS — privacy-friendly, cookieless page counts (Plausible).
 * `domain` must match the site added in the Plausible account. Set
 * `enabled: false` to remove the script entirely. Visitors with Do Not
 * Track or Global Privacy Control switched on are never counted.
 */
export const ANALYTICS = {
  enabled: true,
  domain: 'docalnahiyan.github.io',
  src: 'https://plausible.io/js/script.js',
};
