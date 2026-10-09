// Site-wide constants. Profile details (bio, links) move to an editable
// content file in Phase 2; this file keeps only structural settings.

export const SITE = {
  name: 'Al-Nahiyan Khushbu',
  shortName: 'Al-Nahiyan',
  description:
    'Al-Nahiyan Khushbu — PhD researcher in artificial intelligence at Southwest Jiaotong University, working on medical imaging and computer vision.',
  locale: 'en_US',
  ogImage: '/og-image.png',
  ogImageAlt: 'Al-Nahiyan Khushbu — PhD researcher in artificial intelligence, Southwest Jiaotong University',
};

export const NAV = [
  { href: '/', label: 'Home' },
  // A section of the home page, so it is never marked as the current page.
  { href: '/#about', label: 'About' },
  { href: '/research/', label: 'Research' },
  { href: '/publications/', label: 'Publications' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Blog' },
  { href: '/cv/', label: 'CV' },
] as const;
