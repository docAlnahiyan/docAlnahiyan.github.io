# Research section — build spec

**For:** Claude Code (Astro site at `/Volumes/Study/portfolio/portfolio`)
**Goal:** Build the **Research** section — a research index plus one interactive research theme page ("Warehouse theft attribution") that embeds a live simulation and is organized as a progressive-disclosure "Dig deeper" block. Publications stays the existing list; add an "Explore" link on rows that have a research page.

This document is the reference. Two working prototypes sit beside it in `design-reference/`:

- `pub-page-demo.html` — **the full research detail page** (header, plain-language intro, Dig deeper tabs, embedded sim, clay styling, day/night). Port this faithfully.
- `warehouse-demo.html` — the standalone interactive simulation (same sim, full-size). Reference for the sim logic.

Match the prototype's structure, copy, and behavior. Use the site's existing design tokens and fonts — don't introduce new ones.

---

## 1. Routes & files

```
src/pages/research/index.astro                     → /research          (theme index)
src/pages/research/warehouse-theft-attribution.astro → /research/warehouse-theft-attribution
src/components/research/DigDeeper.astro            → the tabbed block (tabs + panels)
src/components/research/WarehouseSim.astro         → the embedded simulation (canvas + script)
```

Keep the three mountain hero nav buttons (Research · Publications · Projects) pointing at their section indexes; Research → `/research`.

---

## 2. Research index (`/research`)

A short intro line, then a grid/list of **research theme cards**. For now there is one live theme; design the card so more can be added later.

- Card: theme title ("Catching theft when the records lie"), a one-line plain summary, a small tag or two (Insider fraud · PU learning), and a "Explore →" affordance linking to the detail page.
- Same clay styling as the rest of the site; day/night aware; responsive (cards stack on mobile).

---

## 3. Research detail page (`/research/warehouse-theft-attribution`)

Port `pub-page-demo.html` section by section. Structure, top to bottom:

**3.1 Breadcrumb** — `Research › Warehouse theft attribution`.

**3.2 At-a-glance header**
- Status + topic chips: `Pre-print · under review`, `Insider fraud`, `Positive-unlabelled learning`, date `Sep 28, 2026`.
- Title: *Catching Theft When the Records Lie*.
- Plain-language line (italic, display font): "Catching warehouse theft even when the thief edits the records to hide it."
- Authors: **MD Junaeid Alam** (Trine University) · **Al-Nahiyan Khushbu** (Southwest Jiaotong University).
- Action buttons: `Request full paper`, `Code`, `Cite`. (Wire "Request full paper" to a mailto or the existing contact route; "Cite" scrolls to the Paper & code tab. Placeholders are fine for now — leave a clear TODO.)
- Three result badges: `#1 — true thief at the top of the review list` · `8 / 9 — simulated worlds, true actor recovered` · `0 — false alarms on 1.07M real transactions`.

**3.3 The idea, in plain words** — the three paragraphs from the prototype, verbatim. No math.

**3.4 Dig deeper** — a bordered block with a `⤵ Dig deeper` heading and **four tabs** (`DigDeeper.astro`). Default tab = "See it run".

- **See it run** — a one-line "how to read this" caption, then the embedded simulation (`WarehouseSim.astro`) inside a framed "interactive figure" card, then a small figure caption. The transaction log sits inside a collapsed `<details>` ("Show transaction log").
- **How it works** — the two channel cards (Channel A presence lift; Channel B write-off anomaly) in plain language, then a **"Show the math"** toggle that reveals four equations and the pipeline note. (Copy all from the prototype.)
- **Results** — the nine-worlds table + the findings paragraph.
- **Paper & code** — "Request full paper" + "View code" buttons, and the BibTeX block.

Tabs are plain buttons toggling panels (no framework needed); keyboard-focusable; one panel visible at a time.

---

## 4. The embedded simulation (`WarehouseSim.astro`)

Port the simulation from the prototype's `.sim` block + its `<script>` as a **self-contained client-side component**. Notes:

- It's a `<canvas>` top-down medicine warehouse: 6 colored zones, 16 workers (11 pickers, 3 approvers, 2 counters), cycle counts, two theft types, a live attribution panel (Channel A / Channel B ranked lists), and a "Reveal sealed file" button. All logic is in the prototype — reuse it; don't rebuild from scratch.
- **Scope the CSS** under a `.sim` wrapper exactly as the prototype does, so its flat light palette and `-apple-system` font don't leak into the clay page and vice-versa. The sim is framed as an interactive figure and intentionally keeps its own light look (even in dark mode) for now — see §7 for the optional dark pass.
- Run the script only on the client (Astro: put it in a `<script>` tag, which is client-side by default; it must run after the DOM is present). Guard all `getElementById` against null.
- **Reduced motion:** honor `prefers-reduced-motion` — start paused (the prototype already does this).
- **Performance:** keep the single `requestAnimationFrame` loop; pause it when the page/tab is hidden (`visibilitychange`) and when the figure is scrolled out of view (`IntersectionObserver`), to save battery. (The hero already uses this pattern — reuse it.)
- Element IDs in the sim (`cv`, `clock`, `rankA`, etc.) must be unique on the page. If the page could ever host two sims, namespace them; for now single-instance is fine.

---

## 5. Publications list — add the link

On the existing Publications list, for a paper that has a research page, add a small **"Explore →"** link beside the entry (pointing to `/research/warehouse-theft-attribution`). Papers without a research page show no link. Keep the list otherwise unchanged — it stays the clean formal record.

---

## 6. Styling

- Use the site's **existing** clay tokens (`--bg`, `--surface`, `--ink`, `--accent`, etc.), Newsreader (display), IBM Plex Sans (body), IBM Plex Mono (mono). The prototype duplicated these inline for standalone use — in the real site, pull from the shared tokens/global CSS instead of redefining them.
- Day/night: the page must respond to the site's existing theme toggle/`data-theme`, not its own. Remove the prototype's self-contained theme-toggle script; rely on the site's.
- Content width ~860px, generous vertical rhythm, as in the prototype.

---

## 7. Optional polish (note, don't block on it)

- **Sim dark mode:** currently the sim figure stays light in dark mode by design. If desired later, add a dark palette to the `.sim` scope driven by `data-theme` so the figure goes dark with the page. Leave a TODO; don't do it in this pass unless quick.
- Embed vs lightbox: the sim is **embedded inline** (decided). No lightbox needed.

---

## 8. Constraints (unchanged, must hold)

- Do **not** commit anything from `source-papers/` or the `papers and cv` folder; the full IEEE/pre-print PDFs stay out of the repo. The research page links to / requests the paper, it does not host it.
- No secrets in the repo.
- Keep commits small and descriptive. Don't push until the page is reviewed — build, screenshot, and wait for approval.

---

## 9. Verify before declaring done

- `/research` lists the theme and links to the detail page.
- `/research/warehouse-theft-attribution` renders: header, intro, all four tabs switch correctly, "Show the math" toggles, the log `<details>` opens.
- The sim runs: workers move, counts open loss windows, both inject buttons work, "Reveal sealed file" shows the true actors and their ranks. Auto-run populates the attribution panel within ~30s.
- `prefers-reduced-motion` starts the sim paused; the rAF loop pauses off-screen and on tab-hide.
- Day/night toggle restyles the whole page (sim figure may stay light — expected).
- Mobile: the sim stacks (floor above attribution panel), no horizontal scroll, Dig deeper tabs wrap.
- Publications list shows the "Explore →" link on this paper only.
- Nothing from `source-papers/` or `papers and cv` is staged.
