# Landing Hero — Sketch Scene Build Specification

**For:** Claude Code (building into the Astro site at `docAlnahiyan.github.io`)
**Author of spec:** design partner (Claude, via claude.ai) with Nahiyan
**Visual references (open these — they are the source of truth for look & motion):**
- **Sketch Element Library** artifact — every object drawn individually (explorer, dog, mountain, muddy road, river, brain, open book, sun, moon, stars, birds, boat, brain⟲books orbit). Use its exact `rough.js` drawing code and palette.
- **Repel Text** artifact — the cursor-repel kinetic name/bio effect with the spring physics.

> The two artifacts already contain working, approved code. **Port their drawing functions and physics directly** — do not re-invent the shapes. This document tells you *where each object goes, how big, which way it moves, how fast, and how the pieces interact.*

---

## 0. Goal & feel

A hand-sketched, watercolor-dots landing hero: an explorer character walks a muddy road, drifts toward the visitor's cursor (never touching), and can "dive into" sketch signposts to open a page. A dog follows. Birds glide across the sky over the sun; a boat sails the river below. A brain⟲books motif orbits at center. The visitor's name/bio is kinetic "repel" text that scatters from the cursor (and from passing birds). A day/night toggle swaps the whole scene between a sunny and a moonlit version.

**Overall intensity:** *lively but light* — the scene is clearly visible and animated, but soft enough that the **name/text and nav read first**. Nothing should fight the content.

---

## 1. Tech approach

- **One hero component** (e.g. `src/components/HeroScene.astro` + a client script, or an Astro island). Rendered only on the home page.
- **Drawing:** `rough.js` (v4.6.6). **Install as an npm dependency** (`npm i roughjs`) and import it in the client script — do NOT load from a CDN (CDN fails on local/offline and adds a request). Draw into inline `<svg>` layers.
- **Structure:** the scene is a stack of absolutely-positioned layers inside a `position:relative` hero box. Mix of:
  - **SVG layers** for all drawn objects (sky bodies, birds, mountains, river, boat, road, orbit, explorer, dog).
  - **HTML overlay layers** for: the **repel text** (real text for SEO/a11y) and the **road signposts** (real `<a>` links for SEO/a11y/keyboard).
- **Animation:** reuse the demos' techniques — CSS keyframes (`flow`, `twinkle`, `glow`, `fly`, `sail`, walk bob), SMIL `animateTransform`/`animate` (sun rays, orbit, leg/arm swing, tail wag, bird flap), and one shared `requestAnimationFrame` loop for the cursor-driven physics (explorer follow + repel text).
- **Hero height:** `min(85vh, …)` — about **85% of the viewport**, so the next section peeks up and invites scrolling. Keep a sensible min-height (~560px) so it never collapses.
- **Responsiveness:** the scene scales with the hero. Use SVG `viewBox` with `preserveAspectRatio` so drawn objects scale; position HTML overlays in `%`. Design reference canvas: **1440 × 760**. All coordinates below are given as **% of the hero box** (x from left, y from top) unless noted.

---

## 2. Palette & fonts (reuse existing site tokens)

Use the site's existing clay tokens. Day = light theme, Night = dark theme. Object stroke colors (from the element library `colors()` function):

| token | Day (light) | Night (dark) |
|---|---|---|
| character (explorer/dog/boat rower) | `#c96442` | `#e8a07f` |
| mountain fill | `#6f9b57` | `#5a7d4e` |
| mountain outline | `#4f7540` | `#7fa86d` |
| river | `#4fa3cf` | `#5a93c8` |
| river glint (night only) | `#bfe3f2` | `#cfe6f2` |
| road / boat wood | `#9c7a52` | `#7a5f45` |
| sun | `#e8954a` | — |
| moon | — | `#f0e7d6` |
| star | `#9a9280` | `#f3eee4` |
| brain | `#a8482b` | `#ea9c7e` |
| book | `#5c584f` | `#c7c0b2` |
| bird | `#8a8378` | `#f4f1ea` (glowing white) |

Fonts: **Newsreader** (name/display), **IBM Plex Sans** (body), **IBM Plex Mono** (labels/signposts). Already loaded site-wide.

---

## 3. Layer stack (back → front, z-index)

| z | layer | type | notes |
|---|---|---|---|
| 0 | Sky | CSS gradient on hero box | day: warm cream→peach; night: deep indigo→charcoal |
| 1 | Sun / Moon | SVG | top-right; sun in day, moon in night |
| 1 | Stars | SVG | night only; behind/around moon |
| 2 | Birds | SVG | glide across sky |
| 3 | Mountains | SVG | tall left, tapering right |
| 4 | River + Boat | SVG | bottom band |
| 5 | Muddy road | SVG | above river |
| 5 | Road signposts | **HTML `<a>`** | on the road; real links |
| 6 | Brain⟲books orbit | SVG | center, medium |
| 7 | Explorer + Dog | SVG | foreground, on road; follow cursor |
| 8 | Repel text (name + bio) | **HTML** | upper-left; transparent; `pointer-events:none` on the text itself |
| 10 | Header nav | HTML | responsive bar → hamburger |

---

## 4. Elements — placement, size, motion

### 4.1 Sky
- Full hero background. **Day:** vertical gradient warm cream `#fbeede` → soft peach `#f6ead5`. **Night:** `#141821` → `#1f2430` (indigo→charcoal). Tie to theme.
- No motion.

### 4.2 Sun (day) / Moon (night) — top-right, **above the right mountains**
- **Position:** center ≈ **x 82%, y 14–16%** — high in the top-right corner, sitting **above the mountain peaks** (which are now on the right, §4.5). Draw it **before** the mountains so a tall peak can overlap its lower edge naturally.
- **Size:** radius ≈ 64–72px at reference scale.
- **Sun:** dotted-fill circle (`fillStyle:'dots'`) + **12 em-dash rays** rotating slowly around it (SMIL rotate, **55s**, continuous). Color `#e8954a`.
- **Moon:** dotted-fill circle `#f0e7d6` + soft **radial-gradient glow** that gently pulses (`glow` keyframe, ~5s). 
- Swap sun↔moon on theme toggle (cross-fade ~400ms is nice but not required).

### 4.3 Stars — night only
- Scattered twinkling dots across the upper sky (roughly y 6–45%), plus 1–2 four-point sparkles. Color `#f3eee4`. `twinkle` keyframe, staggered durations/delays.
- Hidden in day (opacity 0 / not rendered).

### 4.4 Birds — 3–4, continuous, **right → left**, slow
- **Flight band:** start just **below the top-right corner** (~x 102%, y 12–22%), fly **leftward across and over the sun**, exit past the left edge (~x -8%), then **loop seamlessly** (infinite). Feels like endless migration.
- **Speed:** slow — **~24s** per full crossing (`fly` keyframe translateX from +260 → −70 in the demo; scale to full width).
- **Shape:** little two-stroke "⌄" wings; each **flaps** via SMIL `animate` on `d` between wings-up/wings-down, each bird a slightly different flap speed (0.5–0.95s) and stagger so they're not in lockstep.
- **Day:** muted grey `#8a8378`. **Night:** **glowing white** `#f4f1ea`.
- **Interaction:** each bird's live screen position is fed into the **repel-text** physics as an extra push source (see §5.3) — as a bird passes over the name, those letters scatter under it.

### 4.5 Mountains — **clustered on the RIGHT only** (not full width)
> **Reference the exact shapes in `design-reference/landscape-mock.html`** (the `mountain` / river / road drawing there is approved). Positions below describe it.
- **Footprint:** a cluster occupying roughly the **right ~half** (x 50–100%). **Tallest peaks on the right**, **tapering DOWN toward the left** so they fade out around mid-scene. The **left and center stay open** (this is where the water, text and explorer live). Do **not** span the full width — that was the earlier mistake.
- **Base:** tuck the polygon base **down under the road** (so there's no cream gap between the mountains and the road); the road, drawn in front, covers the seam.
- **Look:** green **dots-filled** polygon (`fillStyle:'dots'`, `fillWeight` ~2.3, `hachureGap` ~8), outline `#4f7540` (day) / `#7fa86d` (night). 3–4 peaks, right-weighted.
- No motion (static backdrop).

### 4.6 River — wide sky-blue **watercolor wash** + flowing dots (NO gaps)
> Port from `design-reference/landscape-mock.html` (the `river` block there is approved).
- **Band:** full width along the **very bottom**, **wider (taller) on the LEFT**, tapering narrower on the right where the mountains come down.
- **Watercolor wash (the base):** a **filled** sky-blue shape with a soft vertical gradient (lighter top `#bfe6fb` → deeper `#4fbfed` day; `#1f3a4d` → `#13303f` night) and a slight blur for a painted edge. **The wash top rides UP flush to the road's bottom edge so there is no cream gap between the road and the water.** This solid fill is what makes the river read as sky-blue water — not bare lines.
- **Flowing dots on top:** **five** flowing dotted strokes (`stroke-dasharray:'0.1 14'`, `flow` keyframe animating `stroke-dashoffset`), brighter blue `#1f9fe0`, at slightly different speeds/opacity, spread wider on the left. (Three was too sparse — use five so the water looks filled.)
- **Flow direction:** **left → right** (same as the boat, opposite the birds).
- **Night:** deeper-blue wash + a few twinkling **glints** `#cfe6f2` on the water.

### 4.7 Boat — one, continuous, **left → right**, slow
- **Path:** sails along the river, **bottom-left → bottom-right** (~y 90%), exits right, **loops** back in from the left (infinite). **Same direction as the water flow, opposite the birds.**
- **Speed:** slow — **~22–26s** per crossing (`sail` keyframe). Gentle **rock** (±1.6° + 2px bob, `rock` keyframe ~3.2s).
- **Shape:** wooden dotted hull (`#9c7a52` day / `#7a5f45` night) with a **small explorer aboard** (clay stroke) holding an **oar** dipping into the water. *(An empty boat can't move.)*

### 4.8 Muddy road — **winding "snake" ribbon**, above the river, static
> Port from `design-reference/landscape-mock.html` (the `road` block there is approved).
- **Band:** a **winding ribbon** (not a straight/flat band) that bends as it crosses — "like it's going somewhere." It trends from **higher on the left down to lower on the right**, sitting just above the river.
- **Key:** the road's **bottom edge is the waterline** — the river wash meets it flush (§4.6), and the road is drawn **in front of** the river so it covers the seam. No cream gap above or below the road.
- **Look:** mud-color **dots** ribbon (closed path filled `fillStyle:'dots'`), color `#9c7a52` (day) / `#7a5f45` (night). **No motion** — it's the ground the explorer and dog walk on.

### 4.9 Mountain nav buttons — Research · Publications · Projects
> The road is too small for nav, so the buttons live **on the mountains**. Behavior ported from `design-reference/explorer-proto.html` (approved).
- **What:** three **sketch nav buttons**, one on each of the three mountain peaks, each a real `<a>` link: **Research · Publications · Projects**.
- **Position:** at the **lower-middle of each peak** (between apex and base), sitting clearly on the mountain face.
- **Look:** a small rough-rectangle placard with the page name in **IBM Plex Mono**, clay outline on a light fill; clay accent on hover/focus.
- **Bonus path only:** all pages (these three included) stay in the header nav (§6) — keyboard/mobile users navigate there. These buttons are the playful extra.
- **Behavior:** clicking one plays the dive (§5.2); keyboard focus + Enter navigates immediately.

### 4.10 Brain ⟲ Books orbit — center, medium, always circling in place
- **Position:** **true center, x 50%, y ~46–48%**.
- **Size:** **medium accent** — orbit ring radius ≈ 58–64px.
- **Look:** a faint **dashed orbit ring** (the ↺) with a direction chevron; a **mini brain** and **mini open book** orbit the ring continuously (SMIL rotate, ~16s). Brain dotted-fill `#a8482b`/`#ea9c7e`; open book `#5c584f`/`#c7c0b2`.
- **Static location** (it does not travel) — it just spins in the middle, all the time.

### 4.11 Explorer — **road-locked**, follows the cursor's horizontal direction
> Behavior ported from `design-reference/explorer-proto.html` (approved). The real road's geometry (the `roadY(x)` curve from step 2) replaces the proto's simplified road.
- **Road-locked:** only his **horizontal position (x)** changes; his **y follows the road slope** (`y = roadY(x)`). He never leaves the road — no vertical chasing into the sky.
- **Idle:** lower-center on the road, walking in place.
- **Size:** ≈ 70–90px tall. Clay stroke `#c96442`/`#e8a07f`. Faces his direction of travel.
- **Follow (horizontal):** target x = cursor x, clamped to the road's x-range; he eases toward it. Cursor left → walks left; right → right. The cursor's vertical position does **not** move him off the road, but it counts toward the *distance* below.
- **Distance-based speed (the key behavior):**
  - Cursor **near** him (or on the road) → high responsiveness; **he runs** (fast approach, bigger/faster stride).
  - Cursor **far** → low responsiveness; **he ambles** slowly — lazier still when the cursor is both far and off the road, so he's not darting around while someone reads. Settles when the cursor leaves the hero.
  - Proto values: ease factor mapped from distance ~**0.20 near → ~0.010 far**; ×0.45 when off-road & far; ×0.25 when cursor outside.
  - **Gait follows speed** — stride length/cadence scale with how fast he's moving (fast = running, slow = strolling).
- **Dive-to-navigate:** see §5.2.

### 4.12 Dog — always follows the explorer
> Ported from `design-reference/explorer-proto.html`.
- **Follows** the explorer, trailing ~60–70px behind on the road, with a slight lag (eases a touch slower) so it reads as following, not glued.
- **Gait scales with speed** like the explorer; **tail wags** continuously.
- **Occasional little hop** (every ~2–4s, a small parabolic bounce) for dog energy.
- Smaller than the explorer; clay stroke.

### 4.13 Repel text — name + bio, upper-left, transparent, no card
- **Position:** **upper-left**, name at ≈ **x 6%, y 15%**; bio line directly under it.
- **Content:** 
  - **Name** = the large scatter-text (display font).
  - **Bio** = one small line under it: e.g. *"PhD researcher in Artificial Intelligence, doing a PhD at Southwest Jiaotong University."* — **mention Southwest Jiaotong University only once, here.** Tiny mono/sans.
- **No background, no card** — fully transparent so the scene shows through.
- **Effect:** each character is its own element; on cursor-move nearby letters are **pushed away** from the pointer and spring back with a bouncy overshoot (the "knocked" wobble). Port the **Repel Text** demo's physics exactly. Approved defaults:
  - radius of influence `R = 130px`
  - max push `PUSH = 46`
  - spring stiffness `K = 0.14`, damping `D ≈ 0.73` (bounce slider at ~62/100)
  - slight per-letter tilt on push for the "hit" feel
- **Bird disturbance:** feed passing **bird positions** into the same physics as extra push sources (§5.3), so birds flying over the name scatter the letters too.
- The text layer is `pointer-events:none` so the cursor still reaches the explorer-follow logic underneath (the repel reads the global cursor position regardless).

---

## 5. Interactions (the shared rAF loop)

One `requestAnimationFrame` loop drives everything cursor-reactive. Track the cursor position globally (and touch). Each frame:

### 5.1 Explorer follow (road-locked, distance speed)
- Each frame: target x = clamp(cursorX, road-min, road-max); distance `d = hypot(cursor − explorer)`. Derive the ease factor from `d` (near → fast/run, far → slow/amble), reduced when the cursor is off-road & far, and when it has left the hero. Move x toward target by that factor; set `y = roadY(x)`; flip facing by x-direction; advance the gait phase proportional to the per-frame step so speed drives walk↔run. He never leaves the road. (Port the integrator from `explorer-proto.html`.)

### 5.2 Dive-to-navigate (genie / jump **into** the mountain button)
- Each mountain button `<a>` has an `href` to its page.
- **On click**, the explorer animates **into** the button — as if entering a portal to that page — a small **ripple** rings out where he enters, and the page navigates. Two entry styles (both ported from the proto):
  - **Genie (quick / direct click):** he slides onto the button and **collapses into it to a point** with a slight swirl (~0.5s) — macOS-Dock-like, fast, so it never feels laggy.
  - **Jump (slow approach):** he arcs up, **lands exactly on the button**, then **dives in** / shrinks into it (~0.8s).
  - Choose genie vs jump by how it was triggered (fast/direct → genie; leisurely → jump).
- **No lag:** on the real site, **fire the navigation immediately on click** and let the chosen animation play as a quick flourish over the page load.
- **Accessibility / fallback:** the button is a plain link — **keyboard focus + Enter navigates immediately** (no animation needed), works with no cursor. Respect `prefers-reduced-motion` (navigate instantly, no dive).

### 5.3 Repel text (cursor + birds)
- Maintain a list of **repulsion sources**: the cursor (when active) **plus each bird's current screen position**. For every letter, sum the pushes from all sources within `R`, spring toward the summed target, render `translate(x,y) rotate(r)`. Port the demo's integrator.
- Birds contribute a gentler push than the cursor (e.g. 60–70% of `PUSH`) so they nudge rather than blast the letters.

---

## 6. Header navigation (responsive)

- **Desktop:** a horizontal nav bar in the header showing all pages: **Home · About · Research · Publications · Projects · Blog · CV**.
- **Mobile / narrow:** the same nav collapses into the **3-dash (hamburger)** menu automatically (one responsive nav, breakpoint ~720px).
- **CV** link opens the **CV PDF** directly (in `public/cv/…`), opening in a new tab.
- This header is the complete, reliable navigation; the road signposts are the playful extra for Research/Publications/Projects only.
- Keep same-tab navigation for internal pages (per site convention); CV PDF may open in a new tab.

---

## 7. Day / Night

- Driven by the **existing site theme toggle** (light = day, dark = night). No separate control.
- **Day:** warm sky, **sun** top-right with rotating rays, grey birds, green mountains, blue river, boat sailing, no stars.
- **Night:** indigo sky, **moon** top-right with soft glow, **white glowing** birds, **stars** out and twinkling, moonlit river with glints, boat still sailing, mountains darker green.
- Everything that moves in day keeps moving at night (birds, boat, river, explorer, dog, orbit) — just recolored. Redraw all `rough.js` objects on theme change (re-run the draw function with the night palette), as the library does.

---

## 8. Accessibility & reduced-motion

- **`prefers-reduced-motion: reduce`:** hold the whole scene **static** — a complete, composed sketch (sun/moon, mountains, river, road, boat, explorer, dog, orbit, birds all drawn but not animated; text does not scatter; no dive animation — links navigate instantly). It must still look finished and intentional.
- **Keyboard:** all nav (header + signposts) reachable and operable by keyboard; visible focus states.
- **Semantics:** name is a real `<h1>`; bio is real text; nav are real links. The SVG scene is decorative (`aria-hidden="true"`) since every destination has a real link elsewhere.
- **Contrast:** keep text/nav contrast to standard; the scene is soft enough not to reduce text legibility (lively-but-light).

---

## 9. Performance

- One shared `requestAnimationFrame` loop; avoid per-element timers.
- `will-change: transform` on moving groups; prefer `transform`/`opacity` only.
- **Pause** the rAF loop and CSS/SMIL when the tab is hidden (`visibilitychange`) and when the hero is scrolled out of view (`IntersectionObserver`) — saves battery.
- Birds/boat/orbit via CSS/SMIL are cheap; the rAF loop only needs to touch the explorer, dog, and the repel letters.
- Keep `rough.js` seeds stable per object so re-draws (theme change) don't reshuffle the sketch jitter distractingly (optional: pass a fixed `seed`).

---

## 10. Suggested file layout (Astro)

```
src/
  components/
    HeroScene.astro        # markup: layers + overlays + <a> signposts + <h1>/bio
    hero/
      scene.ts             # rough.js draw functions (ported from Element Library)
      motion.ts            # rAF loop: explorer follow, dog, dive, repel physics
      elements/            # optional: one module per object
  layouts/ ...
  pages/index.astro        # uses <HeroScene/>
public/
  cv/…pdf
```
- Load `scene.ts`/`motion.ts` as a client script (e.g. `<script>` in the component, or an island with `client:load`).
- Re-draw on theme toggle; init on mount; clean up observers on unmount.

---

## 11. Build order (suggested)

1. Hero box + sky gradient + theme wiring (day/night backgrounds).
2. Static landscape: mountains (left-tall), road, river — ported shapes, correct positions.
3. Sky bodies: sun/moon top-right (+ rays/glow), stars at night.
4. Moving ambient: river flow, birds (right→left loop), boat (left→right loop).
5. Brain⟲books orbit at center.
6. Repel text (name + bio) upper-left — cursor repel first.
7. Explorer walk + cursor-follow; then dog follow.
8. Road signposts (links) + dive-to-navigate; then feed bird positions into repel text.
9. Responsive header nav (bar → hamburger); CV→PDF.
10. Reduced-motion static fallback + visibility/offscreen pausing.
11. Polish: speeds, sizes, easing, and the lively-but-light balance.

---

## 12. Acceptance checklist

- [ ] Hero ≈ 85vh; next section peeks below.
- [ ] Name upper-left, transparent, scatters from cursor **and** from passing birds, springs back.
- [ ] "Southwest Jiaotong University" appears **once** (in the bio line).
- [ ] Explorer is **road-locked**; runs when the cursor is near, ambles when far, never leaves the road.
- [ ] Dog follows with a lag, tail wagging, with an occasional hop.
- [ ] Clicking a **mountain nav button** (Research/Publications/Projects) plays the genie/jump dive **into** it + ripple, then navigates; keyboard navigates instantly.
- [ ] Birds: 3–4, slow, right→left, cross the sun, loop; white glow at night.
- [ ] Boat: slow, left→right along the river, loops; rower aboard; river flows left→right.
- [ ] Mountains tall-left tapering right; sun/moon clear top-right.
- [ ] Brain⟲books orbit spins at dead center, medium size.
- [ ] Day/night follows the theme toggle; all objects recolor; stars only at night.
- [ ] Research-focus card now lives in the section **below** the hero (not in the hero).
- [ ] Header nav responsive (bar→hamburger), all pages; CV opens PDF.
- [ ] `prefers-reduced-motion`: full static scene, instant navigation, still looks complete.
- [ ] rAF/animation pauses when tab hidden or hero offscreen.
```
