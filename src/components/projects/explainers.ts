// Projects whose detail page is a hand-built illustrated explainer
// (src/pages/projects/<id>.astro) instead of the page generated from the
// Markdown entry. The explainer lives at the same address, so the Projects
// list and every existing link open it; [slug].astro skips these ids.

export const EXPLAINED_PROJECTS = new Set(['globalfacenet', 'multimodal-transformer-net']);
