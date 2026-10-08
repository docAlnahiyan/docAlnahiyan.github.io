// Maps a research entry's `walkthrough` key to its walkthrough component.
// Each paper gets its own component (built in Phase 7); an entry whose key is
// empty or not registered here simply shows no walkthrough.

type AstroComponent = (props: Record<string, unknown>) => unknown;

export const WALKTHROUGHS: Record<string, AstroComponent> = {};
