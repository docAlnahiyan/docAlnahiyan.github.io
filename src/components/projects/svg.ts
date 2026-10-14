// Build-time SVG builder for the explainers' diagrams. Mirrors the
// prototypes' E/box/tx helpers; colours go in style="" so the site's
// day/night tokens apply.

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function svgBuilder() {
  const out: string[] = [];
  const el = (n: string, a: Record<string, string | number>, style = '', text?: string) => {
    const attrs = Object.entries(a).map(([k, v]) => ` ${k}="${v}"`).join('');
    const st = style ? ` style="${style}"` : '';
    out.push(text == null ? `<${n}${attrs}${st}/>` : `<${n}${attrs}${st}>${esc(text)}</${n}>`);
  };
  return {
    el,
    raw: (s: string) => out.push(s),
    box(x: number, y: number, w: number, h: number, o: { r?: number; fill?: string; stroke?: string; sw?: number } = {}) {
      el('rect', { x, y, width: w, height: h, rx: o.r ?? 7 },
        `fill:${o.fill ?? 'var(--surface-2)'};stroke:${o.stroke ?? 'var(--border)'};stroke-width:${o.sw ?? 1.2}`);
    },
    tx(x: number, y: number, t: string, o: { a?: string; fs?: number; fill?: string; ff?: string; fw?: number } = {}) {
      el('text', { x, y, 'text-anchor': o.a ?? 'middle', 'font-size': o.fs ?? 10.5, 'font-weight': o.fw ?? 400 },
        `fill:${o.fill ?? 'var(--ink)'};font-family:${o.ff ?? 'var(--font-body)'}`, t);
    },
    /** An arrowhead marker in a given colour. */
    marker(id: string, color: string) {
      out.push(`<marker id="${id}" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" style="fill:${color}"/></marker>`);
    },
    arrow(x1: number, y1: number, x2: number, y2: number, color: string, marker: string, width = 1.3) {
      el('line', { x1, y1, x2, y2, 'stroke-width': width, 'marker-end': `url(#${marker})` }, `stroke:${color}`);
    },
    html: () => out.join(''),
  };
}
