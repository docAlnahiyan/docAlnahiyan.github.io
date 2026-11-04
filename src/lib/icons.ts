// Line icons for project (and research) list items, drawn on a 24×24 grid
// with a 1.6 stroke so they sit with the site's other line art. Each project
// picks one in the admin (Projects → Icon); the keys here are the values
// stored in the project's front matter. Keep ICON_KEYS in sync with the
// "icon" select in public/admin/config.yml.

export const ICONS = {
  code: {
    label: 'Code',
    paths: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  },
  'face-sound': {
    label: 'Face and sound (multimodal)',
    paths:
      '<circle cx="9" cy="12" r="6"/><path d="M7 11h.01M11 11h.01M7 14.2c1.2 1 2.8 1 4 0"/><path d="M18 9v6M21 7v10M15.5 11v2"/>',
  },
  'face-scan': {
    label: 'Face scan (emotion / face recognition)',
    paths:
      '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="4.5"/><path d="M10.3 11h.01M13.7 11h.01M10.3 13.6c1 .8 2.4 .8 3.4 0"/>',
  },
  bird: {
    label: 'Bird',
    paths:
      '<path d="M15.5 6.5h.01"/><path d="M18 7.5 21 8l-3 1.2"/><path d="M18 7.5A4 4 0 0 0 11 6c-2 2.5-3 5.5-6.5 7 2.5 1.2 6 1.5 8.5.5 3-1.2 5-3.4 5-6Z"/><path d="M10 16.8 8.5 20M13 16.4 12.5 20"/>',
  },
  mask: {
    label: 'Face mask',
    paths:
      '<circle cx="12" cy="12" r="8"/><path d="M9.5 9.5h.01M14.5 9.5h.01"/><path d="M7 12.5h10v2.2a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M4.5 12 7 12.5M19.5 12 17 12.5"/>',
  },
  cart: {
    label: 'Shopping cart (recommendation)',
    paths:
      '<circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6"/><path d="m13 9.5.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z"/>',
  },
  bone: {
    label: 'Bone (X-ray)',
    paths:
      '<path d="M8.5 5.5a2 2 0 1 0-2.8 2.8 2 2 0 1 0 2.8 2.8l6.2-6.2"/><path d="M15.5 18.5a2 2 0 1 0 2.8-2.8 2 2 0 1 0-2.8-2.8l-6.2 6.2"/><path d="m11 13 2-2"/>',
  },
  brain: {
    label: 'Brain',
    paths:
      '<path d="M12 3c4.5 0 7 3 7 7 0 2-1 3.5-1 5s1 2 1 3c0 1.5-1.5 3-4 3-1 0-1.8-.5-3-.5s-2 .5-3 .5c-2.5 0-4-1.5-4-3 0-1 1-1.5 1-3s-1-3-1-5c0-4 2.5-7 7-7Z"/><path d="M12 7v10M8.5 10.5h7M9 14h6"/>',
  },
  slices: {
    label: 'Scan slices (3D imaging)',
    paths: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 9v11"/>',
  },
  eye: {
    label: 'Eye (vision)',
    paths: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  },
  image: {
    label: 'Image',
    paths: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
  },
  chart: {
    label: 'Chart (data analysis)',
    paths: '<path d="M4 4v16h16"/><path d="m7 15 4-4 3 3 5-6"/>',
  },
  network: {
    label: 'Neural network',
    paths:
      '<circle cx="5" cy="7" r="1.6"/><circle cx="5" cy="17" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="12" r="1.6"/><path d="M6.5 7.5 10.5 5.5M6.5 7.5l4 4M6.5 16.5l4-4M6.5 16.5l4 2M13.5 5.5l4 6M13.5 12h4M13.5 18.5l4-6"/>',
  },
  microscope: {
    label: 'Microscope (medical)',
    paths: '<path d="M6 20h12M9 20a6 6 0 0 1 9-5.2"/><path d="m9.5 4 4 2.3-3 5.2-4-2.3z"/><path d="m8 11.5-1 1.7M12.5 7.5l2 1.2"/>',
  },
  database: {
    label: 'Database',
    paths: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
  },
  text: {
    label: 'Text (language)',
    paths: '<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/>',
  },
  robot: {
    label: 'Robot (AI agent)',
    paths: '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01M9.5 16h5M3 12.5v3M21 12.5v3"/>',
  },
  shield: {
    label: 'Shield (security / fraud)',
    paths: '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  },
} as const;

export type IconKey = keyof typeof ICONS;
export const ICON_KEYS = Object.keys(ICONS) as [IconKey, ...IconKey[]];
