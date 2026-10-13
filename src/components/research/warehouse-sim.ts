// Warehouse theft simulation, ported from design-reference/warehouse-demo.html
// (via pub-page-demo.html). A top-down medicine warehouse: six zones, 16
// workers, cycle counts, two kinds of theft, and the two attribution channels
// ranking who to review. Every element is looked up inside `root` by its
// data-ref, so the page could host more than one.

type Zone = {
  id: string; name: string; risk: number; tiers: string[];
  tint: { fill: string; line: string; label: string; shelf: string; shelfEdge: string };
  x: number; y: number; w: number; h: number;
};
type Shelf = { x: number; y: number; w: number; h: number; zone: string };
type Target = Shelf | { zone: string; center: true };
type Role = 'picker' | 'approver' | 'counter';
type Worker = {
  id: string; role: Role; x: number; y: number; tx: number; ty: number; target: Target;
  state: 'move' | 'work'; wait: number; speed: number; flash: number;
  path: { x: number; y: number }[]; pendingTheft: boolean; pendingEdit: boolean;
};
type Row = { id: string; score: number };

export interface Sim {
  /** Runs the frame loop while true (the figure is on screen and the tab visible). */
  setActive(active: boolean): void;
  /** Starts the simulation paused, e.g. for reduced motion. */
  pause(): void;
}

export function startSim(root: HTMLElement): Sim | undefined {
  const $ = <T extends HTMLElement = HTMLElement>(ref: string) =>
    root.querySelector<T>(`[data-ref="${ref}"]`);
  const cv = $<HTMLCanvasElement>('canvas');
  const ctx = cv?.getContext('2d');
  const logEl = $('log'), bEl = $('banner'), clockEl = $('clock'), noteEl = $('revealNote');
  const rankEls = { A: $('rankA'), B: $('rankB') };
  const statEls = { actions: $('actions'), stock: $('stock'), loss: $('loss') };
  const btnPlay = $<HTMLButtonElement>('play');
  const tgCam = $<HTMLInputElement>('cams'), tgPath = $<HTMLInputElement>('paths');
  if (!cv || !ctx || !logEl || !bEl || !btnPlay || !tgCam || !tgPath) return undefined;

  // Drawn in the canvas's own 1020 × 440 units, at the screen's pixel
  // density (up to 2×) so small labels stay sharp on high-density screens.
  const W = cv.width, H = cv.height;
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  cv.width = W * dpr;
  cv.height = H * dpr;
  ctx.scale(dpr, dpr);
  const C = { picker: '#2E6FE0', approver: '#16A34A', counter: '#E0902A', cam: '#1F3A5F', path: '#B8C4D2' };

  const M = 16, GAP = 14, cols = 3, rows = 2;
  const zw = (W - M * 2 - GAP * (cols - 1)) / cols, zh = (H - M * 2 - GAP * (rows - 1)) / rows;
  const zoneMeta = [
    { name: 'Z1 · PICKING', risk: 1, tiers: ['Cheap', 'Mid'] },
    { name: 'Z2 · HIGH-VALUE VAULT', risk: 3, tiers: ['Controlled', 'Expensive'] },
    { name: 'Z3 · BULK STORE', risk: 1, tiers: ['Cheap', 'Mid'] },
    { name: 'Z4 · COLD CHAIN', risk: 2, tiers: ['Expensive', 'Mid'] },
    { name: 'Z5 · RECEIVING', risk: 1, tiers: ['Mid', 'Cheap'] },
    { name: 'Z6 · DISPATCH', risk: 2, tiers: ['Mid', 'Expensive'] },
  ];
  const ZTINT = [
    { fill: '#EAF2FD', line: '#AFCDEE', label: '#2563B0', shelf: '#C8DCF3', shelfEdge: '#8FB4E0' },
    { fill: '#FBF0DD', line: '#E8C97F', label: '#B07611', shelf: '#F0DBA6', shelfEdge: '#D9B85F' },
    { fill: '#E7F5EC', line: '#A9DCC0', label: '#1E8A58', shelf: '#C7E8D5', shelfEdge: '#8CCBA7' },
    { fill: '#E3F3F6', line: '#A4D6DE', label: '#1296A8', shelf: '#C2E5EB', shelfEdge: '#86C8D2' },
    { fill: '#F0ECFA', line: '#C9BAEA', label: '#6B4CC4', shelf: '#DAD0F1', shelfEdge: '#B3A0E0' },
    { fill: '#FDEFE3', line: '#F2CDA3', label: '#C77A2C', shelf: '#F7DBC2', shelfEdge: '#E6B684' },
  ];
  const zones: Zone[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    zones.push({ id: 'Z' + (i + 1), ...zoneMeta[i], tint: ZTINT[i], x: M + c * (zw + GAP), y: M + r * (zh + GAP), w: zw, h: zh });
  }
  const zoneById: Record<string, Zone> = {};
  zones.forEach((z) => (zoneById[z.id] = z));

  function makeShelves(z: Zone): Shelf[] {
    const sh: Shelf[] = [];
    const c2 = 3, r2 = 2, padX = 16, padTop = 38, padBot = 14, gapX = 18, gapY = 20;
    const sw = (z.w - padX * 2 - gapX * (c2 - 1)) / c2, shh = (z.h - padTop - padBot - gapY * (r2 - 1)) / r2;
    for (let r = 0; r < r2; r++) for (let c = 0; c < c2; c++)
      sh.push({ x: z.x + padX + c * (sw + gapX), y: z.y + padTop + r * (shh + gapY), w: sw, h: shh, zone: z.id });
    return sh;
  }
  const shelves = zones.flatMap(makeShelves);
  const shelvesInZone: Record<string, Shelf[]> = {};
  zones.forEach((z) => (shelvesInZone[z.id] = shelves.filter((s) => s.zone === z.id)));
  const cams = zones.map((z) => ({ x: z.x + 9, y: z.y + 9, a: Math.atan2(z.h, z.w) }));
  const CAM_R = Math.min(zw, zh) * 1.05, CAM_SPREAD = Math.PI * 0.3;
  const shelfPoint = (s: Shelf) => ({ x: s.x + s.w / 2, y: s.y + s.h + 9 });
  const zoneCenter = (z: Zone) => ({ x: z.x + z.w / 2, y: z.y + z.h / 2 });
  const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
  const randShelf = () => pick(shelves);
  const randShelfIn = (zid: string) => pick(shelvesInZone[zid]);

  const TIERVAL: Record<string, number> = { Cheap: 2, Mid: 15, Expensive: 120, Controlled: 300 };
  const MEDS: Record<string, string[]> = {
    Cheap: ['Saline 500ml', 'Paracetamol 500mg', 'Ibuprofen 200mg', 'Syringe 5ml'],
    Mid: ['Amoxicillin 500mg', 'Metformin 850mg', 'Atorvastatin 20mg', 'Omeprazole 20mg'],
    Expensive: ['Insulin glargine', 'Enoxaparin', 'Filgrastim', 'Adalimumab'],
    Controlled: ['Morphine 10mg', 'Oxycodone 5mg', 'Fentanyl patch', 'Methadone 10mg'],
  };
  function pickMed(zid: string) {
    const tier = pick(zoneById[zid].tiers);
    return { name: pick(MEDS[tier]), tier, val: TIERVAL[tier] };
  }

  const roster: { id: string; role: Role }[] = [];
  const eid = (i: number) => 'E-' + String(i).padStart(2, '0');
  for (let i = 1; i <= 11; i++) roster.push({ id: eid(i), role: 'picker' });
  for (let i = 12; i <= 14; i++) roster.push({ id: eid(i), role: 'approver' });
  for (let i = 15; i <= 16; i++) roster.push({ id: eid(i), role: 'counter' });
  const workers: Worker[] = roster.map((r, i) => {
    const z = zones[i % zones.length];
    const s = randShelf(), p = shelfPoint(s);
    return {
      ...r, x: z.x + 28 + Math.random() * (z.w - 56), y: z.y + 32 + Math.random() * (z.h - 56),
      tx: p.x, ty: p.y, target: s, state: 'move', wait: 0, speed: 1.0 + Math.random() * 0.7,
      flash: 0, path: [], pendingTheft: false, pendingEdit: false,
    };
  });
  const byId: Record<string, Worker> = {};
  workers.forEach((w) => (byId[w.id] = w));
  const pickers = workers.filter((w) => w.role === 'picker'), approvers = workers.filter((w) => w.role === 'approver');
  // The two culprits are drawn at random on every load.
  const physThief = pick(pickers).id;
  const recThief = pick(approvers).id;
  const thiefZoneBias = 'Z2';

  const stock: Record<string, number> = {}, realStock: Record<string, number> = {};
  zones.forEach((z) => { stock[z.id] = 4000; realStock[z.id] = 4000; });
  let simMin = 8 * 60, day = 1;
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = () => `${pad(((simMin / 60) | 0) % 24)}:${pad((simMin % 60) | 0)}`;
  const clockStr = () => `Day ${day} · ${ts()}`;

  const kA: Record<string, number> = {}, nA: Record<string, number> = {};
  workers.forEach((w) => { kA[w.id] = 0; nA[w.id] = 0; });
  const windowActors: Record<string, Set<string>> = {};
  zones.forEach((z) => (windowActors[z.id] = new Set()));
  const woValue: Record<string, number> = {};
  approvers.forEach((a) => (woValue[a.id] = 0));
  const noteActivity = (e: string, z: string) => windowActors[z].add(e);

  let actionCount = 0, lossCount = 0;
  const answerFile: { t: string; emp: string; zone: string; qty: number; trick: string }[] = [];
  function addRow({ emp, act, zone, qty, note = '', cls = '' }: { emp: string; act: string; zone: string; qty: number; note?: string; cls?: string }) {
    const row = document.createElement('div');
    row.className = 'row' + (cls ? ' ' + cls : '');
    const q = qty > 0 ? '+' + qty : qty < 0 ? String(qty) : '—';
    const qcls = qty < 0 ? 'neg' : qty > 0 ? 'pos' : '';
    const cell = (c: string, text: string) => {
      const s = document.createElement('span');
      s.className = c;
      s.textContent = text;
      row.append(s);
    };
    cell('t', ts()); cell('emp', emp); cell('act', act); cell('zone', zone); cell(`qty ${qcls}`, q); cell('note', note);
    logEl!.prepend(row);
    while (logEl!.children.length > 40) logEl!.lastChild!.remove();
  }
  const zoneOf = (w: Worker) => w.target.zone;
  function doPick(w: Worker) {
    const z = zoneOf(w), m = pickMed(z), qty = -(2 + ((Math.random() * 8) | 0));
    stock[z] += qty; realStock[z] += qty; actionCount++; noteActivity(w.id, z);
    addRow({ emp: w.id, act: 'pick ' + m.name, zone: z, qty, note: m.tier });
  }
  function doPutaway(w: Worker) {
    const z = zoneOf(w), m = pickMed(z), qty = 4 + ((Math.random() * 10) | 0);
    stock[z] += qty; realStock[z] += qty; actionCount++; noteActivity(w.id, z);
    addRow({ emp: w.id, act: 'putaway ' + m.name, zone: z, qty, note: m.tier });
  }
  function doAdjust(w: Worker) {
    const z = zoneOf(w), qty = -(1 + ((Math.random() * 3) | 0));
    stock[z] += qty; realStock[z] += qty; actionCount++; noteActivity(w.id, z);
    addRow({ emp: w.id, act: 'adjust stock', zone: z, qty });
  }
  function doApprove(w: Worker) {
    const z = zoneOf(w), m = pickMed(z);
    actionCount++; noteActivity(w.id, z);
    const qty = 1 + ((Math.random() * 3) | 0);
    woValue[w.id] += qty * m.val;
    addRow({ emp: w.id, act: 'approve write-off', zone: z, qty: 0, note: `${qty}× ${m.name} · signed` });
  }
  function doTheft(w: Worker) {
    const z = w.id === physThief && Math.random() < 0.7 ? thiefZoneBias : zoneOf(w);
    const m = pickMed(z), stolen = -(15 + ((Math.random() * 25) | 0));
    realStock[z] += stolen; w.flash = 1; noteActivity(w.id, z);
    answerFile.push({ t: ts(), emp: w.id, zone: z, qty: stolen, trick: 'physical removal' });
    flashBanner(`Hidden removal by ${w.id} in ${z} — ${m.name}. Sealed, absent from the log.`);
    stock[z] += -2; actionCount++;
    addRow({ emp: w.id, act: 'adjust stock', zone: z, qty: -2, note: 'looks normal' });
  }
  function doEdit(w: Worker) {
    const z = zoneOf(w), m = pickMed('Z2'), qty = 8 + ((Math.random() * 14) | 0), v = qty * TIERVAL[m.tier];
    realStock[z] -= qty; stock[z] -= qty; woValue[w.id] += v; w.flash = 1; actionCount++; noteActivity(w.id, z);
    answerFile.push({ t: ts(), emp: w.id, zone: z, qty: -qty, trick: 'fake write-off' });
    flashBanner(`${w.id} wrote off ${qty}× ${m.name} — books reconcile, no window. Sealed.`);
    addRow({ emp: w.id, act: 'approve write-off', zone: z, qty: 0, note: `${qty}× ${m.name} · signed` });
  }

  function runCount(zoneId?: string) {
    const z = zoneId || pick(zones).id;
    const counter = workers.find((w) => w.role === 'counter');
    const short = stock[z] - realStock[z], positive = short > 0;
    windowActors[z].forEach((e) => { nA[e]++; if (positive) kA[e]++; });
    windowActors[z] = new Set();
    const emp = counter ? counter.id : 'E-15';
    if (positive) {
      lossCount++; stock[z] = realStock[z];
      addRow({ emp, act: 'cycle count', zone: z, qty: -short, note: `SHORT ${short} · loss window`, cls: 'flag' });
      flashBanner(`Cycle count in ${z}: ${short} units missing — loss window opened`);
    } else {
      addRow({ emp, act: 'cycle count', zone: z, qty: 0, note: 'all correct', cls: 'count' });
    }
    updateAttribution();
  }
  let bTimer: ReturnType<typeof setTimeout> | undefined;
  function flashBanner(m: string) {
    bEl!.textContent = m;
    bEl!.classList.add('show');
    clearTimeout(bTimer);
    bTimer = setTimeout(() => bEl!.classList.remove('show'), 2800);
  }

  let revealed = false;
  // Channel A: Beta-smoothed share of each picker's loss-window presence,
  // as a lift over the global rate.
  function channelA(): Row[] {
    let K = 0, N = 0;
    workers.forEach((w) => { K += kA[w.id]; N += nA[w.id]; });
    const r0 = N > 0 ? K / N : 0, kappa = 5, a0 = r0 * kappa, b0 = (1 - r0) * kappa;
    return pickers
      .map((w) => ({ id: w.id, score: r0 > 0 ? (a0 + kA[w.id]) / (a0 + b0 + nA[w.id]) / r0 : 1 }))
      .sort((p, q) => q.score - p.score);
  }
  // Channel B: robust z-score of write-off value against the approver peers.
  function channelB(): Row[] {
    const vals = approvers.map((a) => woValue[a.id]).sort((x, y) => x - y);
    const median = vals.length ? vals[(vals.length - 1) >> 1] : 0;
    const devs = approvers.map((a) => Math.abs(woValue[a.id] - median)).sort((x, y) => x - y);
    const mad = devs.length ? devs[(devs.length - 1) >> 1] : 0, eps = 50;
    return approvers
      .map((a) => ({ id: a.id, score: (woValue[a.id] - median) / Math.max(mad, eps) }))
      .sort((p, q) => q.score - p.score);
  }
  function renderRank(el: HTMLElement | null, rowsArr: Row[], fmt: (s: number) => string) {
    if (!el) return;
    const top = rowsArr.slice(0, 4);
    const maxAbs = Math.max(0.001, ...top.map((r) => Math.abs(r.score)));
    el.innerHTML = top
      .map((r, i) => {
        const isThief = revealed && (r.id === physThief || r.id === recThief);
        const w = Math.max(4, Math.min(100, (r.score / maxAbs) * 100));
        return `<div class="rank ${isThief ? 'truth' : ''}"><span class="pos">${i + 1}</span><span class="who">${r.id}</span>` +
          `<span class="barwrap"><span class="bar" style="width:${w}%"></span></span><span class="scoreval">${fmt(r.score)}</span></div>`;
      })
      .join('');
  }
  function updateAttribution() {
    renderRank(rankEls.A, channelA(), (s) => s.toFixed(2) + '×');
    renderRank(rankEls.B, channelB(), (s) => s.toFixed(1) + 'σ');
  }
  function doReveal() {
    revealed = true;
    const A = channelA(), B = channelB();
    const rA = A.findIndex((r) => r.id === physThief) + 1, rB = B.findIndex((r) => r.id === recThief) + 1;
    const phys = answerFile.filter((a) => a.trick === 'physical removal').length;
    const edit = answerFile.filter((a) => a.trick === 'fake write-off').length;
    if (noteEl) {
      noteEl.classList.add('show');
      noteEl.innerHTML = `<b>Sealed file opened.</b> ${phys} removals by <b>${physThief}</b>, ${edit} edits by <b>${recThief}</b>.<br>` +
        `Channel A ranks ${physThief} at <b>#${rA || '—'}</b>/${A.length} · Channel B ranks ${recThief} at <b>#${rB || '—'}</b>/${B.length}.`;
    }
    updateAttribution();
    flashBanner('Sealed file revealed — compare the true actors to the list');
    render();
  }

  function assignTarget(w: Worker) {
    if (w.role === 'counter') {
      const z = pick(zones), c = zoneCenter(z);
      w.tx = c.x; w.ty = c.y; w.target = { zone: z.id, center: true };
    } else {
      const s = w.id === physThief && w.pendingTheft && Math.random() < 0.7 ? randShelfIn(thiefZoneBias) : randShelf();
      const p = shelfPoint(s);
      w.tx = p.x; w.ty = p.y; w.target = s;
    }
    w.state = 'move';
  }
  function arrive(w: Worker) {
    w.state = 'work';
    w.wait = 16 + ((Math.random() * 26) | 0);
    const r = Math.random();
    if (w.pendingTheft) { doTheft(w); w.pendingTheft = false; }
    else if (w.pendingEdit) { doEdit(w); w.pendingEdit = false; }
    else if (w.role === 'counter' && 'center' in w.target) runCount(w.target.zone);
    else if (w.role === 'approver') r < 0.6 ? doApprove(w) : doAdjust(w);
    else if (r < 0.62) doPick(w);
    else if (r < 0.85) doPutaway(w);
    else doAdjust(w);
  }

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx!.beginPath(); ctx!.moveTo(x + r, y);
    ctx!.arcTo(x + w, y, x + w, y + h, r); ctx!.arcTo(x + w, y + h, x, y + h, r);
    ctx!.arcTo(x, y + h, x, y, r); ctx!.arcTo(x, y, x + w, y, r); ctx!.closePath();
  }
  function drawZone(z: Zone) {
    const c = ctx!;
    c.fillStyle = z.tint.fill; c.strokeStyle = z.tint.line; c.lineWidth = 1.8;
    roundRect(z.x, z.y, z.w, z.h, 9); c.fill(); c.stroke();
    c.textAlign = 'left'; c.fillStyle = z.tint.label; c.font = '700 10px -apple-system,Segoe UI,Roboto,sans-serif';
    c.fillText(z.name, z.x + 12, z.y + 20);
    if (z.risk === 3) {
      c.fillStyle = '#C0392B'; c.font = '700 8px -apple-system,Segoe UI,sans-serif';
      c.fillText('● HIGH RISK', z.x + 12, z.y + 31);
    }
  }
  function drawShelf(s: Shelf) {
    const c = ctx!, t = zoneById[s.zone].tint;
    c.fillStyle = t.shelf; c.strokeStyle = t.shelfEdge; c.lineWidth = 1;
    roundRect(s.x, s.y, s.w, s.h, 3); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.6)';
    for (let i = 1; i < 3; i++) {
      const yy = s.y + (s.h * i) / 3;
      c.beginPath(); c.moveTo(s.x + 2, yy); c.lineTo(s.x + s.w - 2, yy); c.stroke();
    }
  }
  function drawCamera(cam: { x: number; y: number; a: number }) {
    const c = ctx!;
    if (tgCam!.checked) {
      const g = c.createRadialGradient(cam.x, cam.y, 8, cam.x, cam.y, CAM_R);
      g.addColorStop(0, 'rgba(31,58,95,.15)'); g.addColorStop(1, 'rgba(31,58,95,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(cam.x, cam.y);
      c.arc(cam.x, cam.y, CAM_R, cam.a - CAM_SPREAD, cam.a + CAM_SPREAD); c.closePath(); c.fill();
    }
    c.fillStyle = C.cam; c.beginPath(); c.arc(cam.x, cam.y, 5, 0, 7); c.fill();
  }
  function drawWorker(w: Worker) {
    const c = ctx!;
    if (tgPath!.checked && w.path.length > 1) {
      c.strokeStyle = C.path; c.lineWidth = 1.1; c.setLineDash([3, 4]); c.beginPath();
      c.moveTo(w.path[0].x, w.path[0].y);
      for (const p of w.path) c.lineTo(p.x, p.y);
      c.stroke(); c.setLineDash([]);
    }
    if (w.flash > 0) {
      c.strokeStyle = `rgba(192,57,43,${w.flash})`; c.lineWidth = 3; c.beginPath();
      c.arc(w.x, w.y, 12 + (1 - w.flash) * 12, 0, 7); c.stroke();
    }
    const col = C[w.role];
    c.fillStyle = col; c.beginPath(); c.arc(w.x, w.y, 6.5, 0, 7); c.fill();
    if (revealed && (w.id === physThief || w.id === recThief)) {
      c.strokeStyle = '#C0392B'; c.lineWidth = 2.2; c.beginPath(); c.arc(w.x, w.y, 11, 0, 7); c.stroke();
    }
    c.fillStyle = '#fff'; c.font = '700 7px Segoe UI'; c.textAlign = 'center';
    c.fillText(w.id.slice(2), w.x, w.y + 2.5);
    if (w.state === 'work') {
      c.strokeStyle = col; c.lineWidth = 1.3; c.beginPath(); c.arc(w.x, w.y, 10, 0, 7); c.stroke();
    }
  }
  function render() {
    ctx!.clearRect(0, 0, W, H);
    zones.forEach(drawZone); shelves.forEach(drawShelf); cams.forEach(drawCamera); workers.forEach(drawWorker);
  }

  let countTimer = 0, autoTheftTimer = 1400, autoEditTimer = 2200;
  function step(dt: number) {
    simMin += dt * 0.6;
    if (simMin >= 24 * 60) { simMin -= 24 * 60; day++; }
    workers.forEach((w) => {
      // The theft flash fades with sim time, so it holds while paused.
      if (w.flash > 0) w.flash = Math.max(0, w.flash - 0.02 * dt);
      if (w.state === 'move') {
        const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
        if (d < 2) { arrive(w); return; }
        const v = w.speed * dt * 1.5;
        w.x += (dx / d) * Math.min(v, d); w.y += (dy / d) * Math.min(v, d);
        const lastP = w.path[w.path.length - 1];
        if (!lastP || Math.hypot(w.x - lastP.x, w.y - lastP.y) > 7) {
          w.path.push({ x: w.x, y: w.y });
          if (w.path.length > 30) w.path.shift();
        }
      } else {
        w.wait -= dt;
        if (w.wait <= 0) { w.path = []; assignTarget(w); }
      }
    });
    countTimer += dt;
    if (countTimer > 700) { countTimer = 0; runCount(); }
    autoTheftTimer -= dt;
    if (autoTheftTimer <= 0) { autoTheftTimer = 2200 + Math.random() * 1600; byId[physThief].pendingTheft = true; }
    autoEditTimer -= dt;
    if (autoEditTimer <= 0) { autoEditTimer = 3000 + Math.random() * 2000; byId[recThief].pendingEdit = true; }
  }
  function updateStats() {
    if (clockEl) clockEl.textContent = clockStr();
    if (statEls.actions) statEls.actions.textContent = actionCount.toLocaleString();
    if (statEls.stock) statEls.stock.textContent = Object.values(stock).reduce((a, b) => a + b, 0).toLocaleString();
    if (statEls.loss) statEls.loss.textContent = String(lossCount);
  }

  // One requestAnimationFrame loop. It runs only while the visitor has it
  // playing and the figure can be seen; otherwise the canvas holds its last
  // frame and is redrawn only when something on it changes.
  let playing = true, active = false, speed = 1, raf = 0, last = 0;
  function frame(now: number) {
    const dt = Math.min(48, now - last) / 16.67;
    last = now;
    for (let i = 0; i < speed; i++) step(dt);
    updateStats();
    render();
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    const run = playing && active;
    if (run && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  function setPlaying(p: boolean) {
    playing = p;
    btnPlay!.textContent = p ? '❚❚ Pause' : '▶ Play';
    btnPlay!.setAttribute('aria-pressed', String(!p));
    sync();
  }

  btnPlay.addEventListener('click', () => setPlaying(!playing));
  $('theft')?.addEventListener('click', () => {
    byId[physThief].pendingTheft = true;
    flashBanner(`${physThief} is heading to divert stock…`);
  });
  $('edit')?.addEventListener('click', () => {
    byId[recThief].pendingEdit = true;
    flashBanner(`${recThief} is heading to sign an inflated write-off…`);
  });
  $('reveal')?.addEventListener('click', doReveal);
  const speedBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-sp]')];
  for (const b of speedBtns) {
    b.addEventListener('click', () => {
      for (const x of speedBtns) {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-pressed', String(x === b));
      }
      speed = +b.dataset.sp!;
    });
  }
  tgCam.addEventListener('change', render);
  tgPath.addEventListener('change', render);

  updateAttribution();
  updateStats();
  render();
  return {
    setActive(a) { active = a; sync(); },
    pause() { setPlaying(false); },
  };
}
