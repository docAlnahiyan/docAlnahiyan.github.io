# Parkinson research page — build spec

**For:** Claude Code (Astro site at `/Volumes/Study/portfolio/portfolio`)
**Goal:** Build the second Research theme page — the **Parkinson's CNN-Transformer (2D MRI)** explainer — by porting the approved prototype. This is the detail page behind the existing Research card *"Parkinson's recognition with a hybrid CNN–Transformer on 2D MRI"* (IARCE 2024, Best Paper). Replace whatever placeholder page currently backs that card with this explainer; leave the HybridTransMedFormer (3D) card untouched.

Reference files sit beside this spec in `design-reference/`:

- `parkinson-explainer.html` — the full prototype to port faithfully (six-stage scroll explainer + interactive bits).
- `design-reference/mri/` — 14 MNI152 brain-slice PNGs the page uses (`slice_00`–`slice_12` for the scrubber + `slice_mid` for the hero/attention stages).

This is Nahiyan's **main research field**, so scientific accuracy is the priority. Several labels are intentionally marked "confirm" and the attention map is a flagged placeholder — keep those exactly as they are (see §6). Do not invent numbers.

---

## 1. Route & files

```
src/pages/research/parkinson-cnn-transformer.astro   → /research/parkinson-cnn-transformer
src/components/research/ParkinsonExplainer.astro      → the explainer (stages + interactive script)
public/research/parkinson/mri/slice_00.png … slice_12.png, slice_mid.png   → the brain slices
```

- Point the existing Research index card for this paper's **Explore →** at `/research/parkinson-cnn-transformer`.
- The MNI152 PNGs are an **open template** (not patient data) — fine to commit as static assets. Reference them from the page (e.g. `/research/parkinson/mri/slice_06.png`). Update the `src` paths in the ported markup/JS to wherever you place them.

---

## 2. Page structure (port `parkinson-explainer.html` top to bottom)

- **Header**: breadcrumb `Research › Parkinson's from brain MRI`; chips (`Best Paper · IARCE 2024`, `Medical imaging`, `CNN + Transformer`, `PPMI`); title *Reading Parkinson's from a brain MRI*; the italic plain-language line; author line with the 80.5% / AUC 0.84 note.
- **Six stages**, each a panel that reveals on scroll:
  1. **PPMI — three cohorts** (Control / Prodromal / PD) + the DUA note that only the MNI152 template is shown.
  2. **Volume → middle axial slice** — the volume stack (shows brain slices) + the **slice scrubber** over the 13 slices, middle flagged.
  3. **Preprocessing** — register → brain extraction → normalize → resize thumbnails.
  4. **ResNet18 (CNN)** — feature maps shrinking/deepening, labels stacked under each square.
  5. **Transformer encoder** — tokens + positional encoding + self-attention lines.
  6. **Prediction & attention** — Control/Prodromal/PD switcher → probability bars + verdict, the **Show attention map** toggle over the slice, and the metrics row.
- A left **progress rail** (desktop) tracking the six stages.

---

## 3. Interactivity (all client-side)

- **Slice scrubber** (Stage 2): range input swaps `slice_00`–`slice_12`; middle tag shows at index 6.
- **Cohort switcher** (Stage 6): Control / Prodromal / PD updates the three probability bars, the verdict, and the attention emphasis.
- **Attention toggle** (Stage 6): shows/hides the heatmap canvas over the slice.
- Put the script in a client `<script>`; guard `getElementById` against null.

---

## 4. Scroll & performance

- Reveal stages with an **IntersectionObserver** (reuse the hero's pattern). 
- Honor **`prefers-reduced-motion`**: show every stage immediately, no transforms.
- Nothing runs a continuous animation loop here (unlike the warehouse sim), so no rAF pausing needed — but the canvas heatmap only needs to redraw on cohort/toggle change, not on a timer.

---

## 5. Styling

- Use the site's **existing** clay tokens, Newsreader / IBM Plex fonts, and the site's **day/night toggle** — remove the prototype's self-contained theme script and token block; pull from shared CSS. The prototype duplicated them only to run standalone.
- Content width ~900px, matching the prototype.

---

## 6. Accuracy placeholders — KEEP AS-IS (do not fill in or remove)

These are deliberately provisional until Nahiyan supplies the real details. Keep the exact wording/flags from the prototype:

- **Stage 6 attention map** is a placeholder shape, with the amber note saying the real attention figure will be swapped in. Keep the note.
- **Stage 3 preprocessing** carries a "steps shown illustratively — confirm the exact pipeline" note. Keep it.
- **Stages 4–5** carry "confirm the ResNet18 output dimensions / Transformer layers, heads, CLS token" notes. Keep them.
- The Stage 6 probability numbers are illustrative example outputs, not from specific scans. Keep them as-is.

Do not replace any placeholder with invented specifics. We refine these in a later pass once the real figures/numbers are confirmed.

---

## 7. Verify before done

- `/research/parkinson-cnn-transformer` renders; the index card's Explore link reaches it.
- All six stages reveal on scroll; progress rail tracks them.
- Slice scrubber steps through 13 distinct brain levels (middle flagged); cohort switch updates bars + verdict; attention toggle shows/hides the overlay.
- `prefers-reduced-motion` shows everything static.
- Day/night toggle restyles the page.
- Mobile: stages stack, scrubber and switcher usable, no horizontal scroll.
- MNI152 slices load from their static path; no PPMI/patient data in the repo.
- The accuracy placeholder notes (§6) are all still present.

Build, screenshot, and wait for review — don't push yet.
