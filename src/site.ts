// Site-wide constants. Profile details (bio, links) move to an editable
// content file in Phase 2; this file keeps only structural settings.

export const SITE = {
  name: 'Al-Nahiyan Khushbu',
  shortName: 'Al-Nahiyan',
  description:
    "Al-Nahiyan Khushbu — medical AI researcher building hybrid CNN–Transformer models for early Parkinson's disease detection from MRI.",
  locale: 'en_US',
};

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/research/', label: 'Research' },
  { href: '/publications/', label: 'Publications' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Blog' },
  { href: '/cv/', label: 'CV' },
  { href: '/upwork/', label: 'Upwork' },
] as const;
