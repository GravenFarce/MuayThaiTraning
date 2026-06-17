# Day Selection + Split View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-screen interval timer with a landing page (pick A/B/C day) that opens a split view: left = that day's full written plan, right = the existing setup/timer panel pre-populated with that day's intervals.

**Architecture:** Split the current single-file `index.html` into `index.html` (markup), `styles.css` (all CSS), `days-data.js` (per-day data), and `app.js` (all behavior). Add a `DAYS` data object keyed by day id, each with a fully unrolled `intervals` array (rounds fixed at 1) plus presentational `warmupHtml`/`sections`/`cooldownHtml` for the left panel. Two new top-level views (`#landingView`, `#dayView`) are toggled the same way `#setupView`/`#timerView` already are, via a `.active` class.

**Tech Stack:** Plain HTML/CSS/JS, no build step, no framework, no test runner (verification is manual browser checks plus one Node-based data-integrity check).

## Global Constraints

- No build tools, bundlers, or new dependencies — stay plain HTML/CSS/JS, consistent with the existing project ([CLAUDE.md](../../../CLAUDE.md)).
- `rounds` is always `1` for day-driven intervals; the existing Rounds +/- control remains fully functional and editable.
- `"Bemelegítés"` and any `"...Levezetés..."` titled section is left-panel text only — never enters a day's `intervals` array.
- `"Pihenő"` intervals always use color `#BBDD00`.
- The running timer stays confined to the right panel (`#trainerPanel`) — it must not go full-screen / `position: fixed` over the whole viewport.
- Exact per-day interval counts and total durations (from the spec) must hold: Day A = 28 intervals / 2130s, Day B = 47 intervals / 2335s, Day C = 30 intervals / 2400s.

---

### Task 1: Extract CSS into `styles.css`

**Files:**
- Create: `styles.css`
- Modify: `index.html`

**Interfaces:**
- Produces: a `styles.css` file containing every CSS rule currently inline in `index.html`, unchanged. No other task depends on its internal structure (later tasks append new rules to the end of this file).

- [ ] **Step 1: Create `styles.css` with the extracted rules**

Create `e:\VSCODE\Claude Practice\MuayThaiPlan\styles.css` with exactly this content:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #87CEEB;
  min-height: 100vh;
  padding: 28px 20px 40px;
  color: #111;
}

/* ─────────────── SETUP VIEW ─────────────── */
#setupView { max-width: 680px; margin: 0 auto; }
#setupView.hidden { display: none; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.page-header h1 { font-size: 2.2rem; font-weight: 800; }

.btn-add {
  background: #fff;
  border: 2.5px solid #222;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}
.btn-add:hover { background: #f0f0f0; }

/* Interval rows */
#intervalsList { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }

.interval-row {
  background: #fff;
  border-radius: 14px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,.09);
  transition: opacity .2s;
}
.interval-row.dragging { opacity: .35; }
.interval-row.drag-over { box-shadow: 0 0 0 3px #444; }

.drag-handle {
  width: 44px; height: 44px;
  border: 2px solid #ccc;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
  color: #555;
  cursor: grab;
  flex-shrink: 0;
  user-select: none;
}
.drag-handle:active { cursor: grabbing; }

.interval-name {
  flex: 1;
  min-width: 0;
  background: #ececec;
  border: none;
  border-radius: 999px;
  padding: 9px 18px;
  font-size: 1.05rem;
  font-weight: 700;
  outline: none;
}
.interval-name:focus { background: #e0e0e0; }

/* Color picker */
.color-wrap { position: relative; flex-shrink: 0; }
.color-circle {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 2.5px solid rgba(0,0,0,.12);
  cursor: pointer;
  display: block;
  transition: transform .15s;
}
.color-circle:hover { transform: scale(1.12); }
.color-input {
  position: absolute;
  width: 1px; height: 1px;
  opacity: 0;
  pointer-events: none;
  top: 0; left: 0;
}

/* Time controls */
.time-controls { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.btn-blk {
  width: 44px; height: 44px;
  background: #111; color: #fff;
  border: none; border-radius: 10px;
  font-size: 1.6rem; line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}
.btn-blk:hover { background: #333; }
.btn-blk.delete { font-size: 1.1rem; }

.time-label {
  font-size: 1.1rem; font-weight: 700;
  min-width: 58px; text-align: center;
  background: #ececec;
  border: none;
  border-radius: 8px;
  padding: 6px 4px;
  cursor: text;
  outline: none;
  width: 62px;
}
.time-label:focus {
  background: #ddd;
  box-shadow: 0 0 0 2px #888;
}

/* Rounds */
.rounds-section { text-align: center; margin-bottom: 28px; }
.rounds-section h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 14px; }
.rounds-controls { display: flex; align-items: center; justify-content: center; gap: 20px; }
.btn-outline {
  width: 52px; height: 52px;
  border: 2.5px solid #222;
  border-radius: 10px;
  background: #fff;
  font-size: 1.7rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.btn-outline:hover { background: #f0f0f0; }
#roundsDisplay { font-size: 1.5rem; font-weight: 800; min-width: 36px; text-align: center; }

/* Start */
.btn-start {
  display: block;
  width: 100%; max-width: 680px;
  margin: 0 auto;
  padding: 54px;
  background: #111; color: #fff;
  border: none; border-radius: 14px;
  font-size: 4.5rem; font-weight: 800; letter-spacing: 3px;
  cursor: pointer;
  transition: background .15s;
}
.btn-start:hover { background: #333; }

/* ─────────────── TIMER VIEW ─────────────── */
#timerView {
  display: none;
  position: fixed;
  inset: 0;
  background: #87CEEB;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  z-index: 10;
}
#timerView.active { display: flex; }

#timerName {
  font-size: 5vmin; font-weight: 800;
  margin-bottom: 2vmin;
  transition: color .4s;
}
#timerRoundBadge {
  display: inline-block;
  background: rgba(0,0,0,.14);
  border-radius: 999px;
  padding: 4px 16px;
  font-size: 2.5vmin; font-weight: 700;
  margin-bottom: 3vmin;
}

/* SVG Ring */
.ring-wrap {
  position: relative;
  display: inline-flex;
  align-items: center; justify-content: center;
  width: min(70vw, 70vh);
  height: min(70vw, 70vh);
  margin-bottom: 3vmin;
  flex-shrink: 0;
}
.ring-wrap svg { width: 100%; height: 100%; display: block; }
#ringBg   { fill: none; stroke: rgba(255,255,255,.35); stroke-width: 6; }
#ringFg   { fill: none; stroke-width: 6; stroke-linecap: round;
            transition: stroke-dashoffset 1s linear, stroke .4s; }

.ring-center {
  position: absolute;
  inset: 0;
  display: flex; align-items: center; justify-content: center;
}
#timerCountdown {
  font-size: 18vmin; font-weight: 800; line-height: 1;
}

/* Mini queue list */
#timerQueue {
  display: none;
}
.tqi {
  background: rgba(255,255,255,.42);
  border-radius: 10px;
  padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  font-weight: 600;
  text-align: left;
  transition: background .3s, opacity .3s;
}
.tqi.active { background: #fff; box-shadow: 0 3px 14px rgba(0,0,0,.12); font-weight: 800; }
.tqi.done   { opacity: .28; }
.tqi-dot    { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.tqi-time   { margin-left: auto; font-size: .92rem; opacity: .75; }

.btn-stop {
  padding: 14px 44px;
  background: #c0392b; color: #fff;
  border: none; border-radius: 12px;
  font-size: 1.2rem; font-weight: 800;
  cursor: pointer;
  transition: background .15s;
}
.btn-stop:hover { background: #96281b; }

/* Done state */
.done-label { font-size: 3rem; font-weight: 800; margin: 20px 0; }

/* ─────────────── MOBILE ─────────────── */
@media (max-width: 600px) {
  body { padding: 16px 12px 32px; }

  .page-header h1 { font-size: 1.6rem; }
  .btn-add { padding: 8px 14px; font-size: .85rem; }

  /* Interval rows: stack name on its own line */
  .interval-row {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
  }
  .interval-name {
    order: -1;           /* name full-width on top */
    width: 100%;
    flex: none;
  }
  .drag-handle { width: 36px; height: 36px; font-size: 1rem; }
  .color-circle { width: 32px; height: 32px; }
  .btn-blk { width: 36px; height: 36px; font-size: 1.3rem; }
  .time-label { width: 54px; font-size: 1rem; }

  .btn-outline { width: 44px; height: 44px; font-size: 1.4rem; }
  #roundsDisplay { font-size: 1.3rem; }

  .btn-start {
    padding: 20px;
    font-size: 2rem;
    max-width: 100%;
  }
}
```

- [ ] **Step 2: Replace the inline `<style>` block in `index.html` with a stylesheet link**

In `index.html`, find the `<head>` block. It currently reads:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Training Timer</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <style>
```

...followed by all the CSS rules from Step 1, ending in:

```css
  </style>
</head>
```

Replace the entire `<head>...</head>` block with:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Training Timer</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="stylesheet" href="styles.css" />
</head>
```

- [ ] **Step 3: Manual smoke test**

Open `index.html` directly in a browser. Confirm:
- The page renders identically to before (sky-blue background, 4 default intervals: Interval 1 / Rest / Interval 2 / Rest, Rounds showing `6`).
- No errors in the browser console.
- Clicking **START** shows the timer ring and countdown; clicking **STOP** returns to the setup view.

- [ ] **Step 4: Commit**

```bash
git add styles.css index.html
git commit -m "Extract inline CSS into styles.css"
```

---

### Task 2: Extract JS into `app.js`

**Files:**
- Create: `app.js`
- Modify: `index.html`

**Interfaces:**
- Produces: `app.js` with all current behavior (state, rendering, drag-reorder, timer tick, audio). Later tasks (3, 4, 5, 7) append to or edit this file. The global functions/variables later tasks rely on: `intervals` (array), `rounds` (number), `nextId` (number, used as `nextId++` when creating interval objects), `renderSetup()` (re-renders `#intervalsList` and `#roundsDisplay` from `intervals`/`rounds`), `esc(text)` (HTML-escapes a string), `tickHandle` (the running `setInterval` handle, or `null`).

- [ ] **Step 1: Create `app.js` with the extracted script**

Create `e:\VSCODE\Claude Practice\MuayThaiPlan\app.js` with exactly the JavaScript currently inside `index.html`'s `<script>...</script>` block (everything from the `// State` comment down to, but not including, the final 4 `addInterval(...)` bootstrap calls and their preceding comment — those move with Task 7). Concretely, copy this content verbatim:

```js
// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────
const COLORS = ['#FFA500','#CC2222','#6666CC','#BBDD00','#00AABB','#FF6688','#22AA66','#EE7722'];
const CIRCUMFERENCE = 2 * Math.PI * 104; // ≈ 653.45

let intervals = [];
let rounds = 6;
let nextId = 1;

// Timer
let seq = [];
let seqIdx = 0;
let timeLeft = 0;
let totalTime = 0;
let tickHandle = null;
let audioCtx = null;

// Drag
let dragSrcIdx = null;
let dragOverIdx = null;

// ──────────────────────────────────────────────────────────────
// Audio
// ──────────────────────────────────────────────────────────────
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function beep(freq = 880, dur = 0.25, vol = 0.45, delay = 0) {
  try {
    ensureAudio();
    const t = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur);
  } catch(e) {}
}

function intervalEndBeep() { beep(880, 0.2); }
function warningBeep()      { beep(660, 0.12, 0.3); }
function finalBeep() {
  beep(660, 0.2, 0.4, 0);
  beep(880, 0.2, 0.4, 0.28);
  beep(1100, 0.6, 0.5, 0.56);
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function fmt(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

function esc(t) {
  return String(t).replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ──────────────────────────────────────────────────────────────
// Interval state mutations
// ──────────────────────────────────────────────────────────────
function addInterval(name, color, seconds) {
  const id = nextId++;
  intervals.push({
    id,
    name: name ?? `Interval ${intervals.length + 1}`,
    color: color ?? COLORS[intervals.length % COLORS.length],
    seconds: seconds ?? 20
  });
  renderSetup();
}

// ──────────────────────────────────────────────────────────────
// Render setup
// ──────────────────────────────────────────────────────────────
function renderSetup() {
  const list = document.getElementById('intervalsList');
  list.innerHTML = intervals.map((iv, idx) => `
    <div class="interval-row" data-idx="${idx}">
      <div class="drag-handle" data-drag="${idx}">☰</div>
      <input class="interval-name" draggable="false"
             value="${esc(iv.name)}"
             data-field="name" data-idx="${idx}" />
      <div class="color-wrap">
        <button class="color-circle"
                style="background:${iv.color}"
                data-color-btn="${idx}"
                title="Change colour"></button>
        <input class="color-input" type="color"
               id="cp-${iv.id}" value="${iv.color}"
               data-color-input="${idx}" />
      </div>
      <div class="time-controls">
        <button class="btn-blk" data-minus="${idx}">−</button>
        <input class="time-label" type="text"
               value="${fmt(iv.seconds)}"
               data-time-input="${idx}"
               inputmode="numeric" />
        <button class="btn-blk" data-plus="${idx}">+</button>
      </div>
      <button class="btn-blk delete" data-delete="${idx}">✕</button>
    </div>
  `).join('');

  document.getElementById('roundsDisplay').textContent = rounds;
}

// ──────────────────────────────────────────────────────────────
// Event delegation — setup view
// ──────────────────────────────────────────────────────────────
document.getElementById('intervalsList').addEventListener('click', e => {
  const el = e.target;

  // Delete
  if (el.dataset.delete !== undefined) {
    const idx = +el.dataset.delete;
    intervals.splice(idx, 1);
    renderSetup();
    return;
  }

  // Time +5
  if (el.dataset.plus !== undefined) {
    intervals[+el.dataset.plus].seconds += 5;
    renderSetup();
    return;
  }

  // Time -5
  if (el.dataset.minus !== undefined) {
    const iv = intervals[+el.dataset.minus];
    iv.seconds = Math.max(5, iv.seconds - 5);
    renderSetup();
    return;
  }

  // Color circle → open hidden input
  if (el.dataset.colorBtn !== undefined) {
    const iv = intervals[+el.dataset.colorBtn];
    document.getElementById(`cp-${iv.id}`)?.click();
    return;
  }
});

// Name changes
document.getElementById('intervalsList').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.field === 'name' && el.dataset.idx !== undefined) {
    intervals[+el.dataset.idx].name = el.value;
  }
  if (el.dataset.colorInput !== undefined) {
    const idx = +el.dataset.colorInput;
    intervals[idx].color = el.value;
    renderSetup();
  }
  if (el.dataset.timeInput !== undefined) {
    const idx = +el.dataset.timeInput;
    const secs = parseTimeInput(el.value);
    if (secs !== null) {
      intervals[idx].seconds = Math.max(5, secs);
    }
    renderSetup(); // always re-render to normalise display
  }
});

function parseTimeInput(val) {
  val = val.trim().replace(/\s/g, '');
  // Formats: "1:30", "130", "90"
  const colonMatch = val.match(/^(\d+):([0-5]?\d)$/);
  if (colonMatch) return +colonMatch[1] * 60 + +colonMatch[2];
  const digits = val.replace(/\D/g, '');
  if (!digits) return null;
  const n = +digits;
  // If 3-4 digits with no colon treat as MMSS (e.g. 130 → 1:30)
  if (digits.length >= 3) {
    const ss = n % 100;
    const mm = Math.floor(n / 100);
    if (ss < 60) return mm * 60 + ss;
  }
  return n; // plain seconds
}

// Live color preview
document.getElementById('intervalsList').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.colorInput !== undefined) {
    const idx = +el.dataset.colorInput;
    intervals[idx].color = el.value;
    // Fast update without full re-render
    const btn = document.querySelector(`[data-color-btn="${idx}"]`);
    if (btn) btn.style.background = el.value;
  }
});

// Rounds
document.getElementById('roundsMinus').addEventListener('click', () => {
  rounds = Math.max(1, rounds - 1);
  document.getElementById('roundsDisplay').textContent = rounds;
});
document.getElementById('roundsPlus').addEventListener('click', () => {
  rounds++;
  document.getElementById('roundsDisplay').textContent = rounds;
});

document.getElementById('addBtn').addEventListener('click', () => addInterval());

// ──────────────────────────────────────────────────────────────
// Drag to reorder
// ──────────────────────────────────────────────────────────────
document.getElementById('intervalsList').addEventListener('mousedown', e => {
  const handle = e.target.closest('[data-drag]');
  if (!handle) return;
  dragSrcIdx = +handle.dataset.drag;
  e.preventDefault();

  const onMove = ev => {
    const row = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.interval-row');
    const overIdx = row ? +row.dataset.idx : null;

    if (overIdx !== null && overIdx !== dragSrcIdx && overIdx !== dragOverIdx) {
      dragOverIdx = overIdx;
      const [item] = intervals.splice(dragSrcIdx, 1);
      intervals.splice(overIdx, 0, item);
      dragSrcIdx = overIdx;
      renderSetup();
      // Re-mark dragging row
      document.querySelector(`.interval-row[data-idx="${dragSrcIdx}"]`)
               ?.classList.add('dragging');
    }
  };

  const onUp = () => {
    dragSrcIdx = null; dragOverIdx = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    renderSetup();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  document.querySelector(`.interval-row[data-idx="${dragSrcIdx}"]`)
           ?.classList.add('dragging');
});

// Touch drag
document.getElementById('intervalsList').addEventListener('touchstart', e => {
  const handle = e.target.closest('[data-drag]');
  if (!handle) return;
  dragSrcIdx = +handle.dataset.drag;

  const onMove = ev => {
    ev.preventDefault();
    const touch = ev.touches[0];
    const row = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.interval-row');
    const overIdx = row ? +row.dataset.idx : null;

    if (overIdx !== null && overIdx !== dragSrcIdx) {
      const [item] = intervals.splice(dragSrcIdx, 1);
      intervals.splice(overIdx, 0, item);
      dragSrcIdx = overIdx;
      renderSetup();
    }
  };
  const onEnd = () => {
    dragSrcIdx = null;
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}, { passive: true });

// ──────────────────────────────────────────────────────────────
// Start Timer
// ──────────────────────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', () => {
  if (intervals.length === 0) { alert('Add at least one interval first.'); return; }

  ensureAudio(); // create AudioContext inside user gesture

  // Build flat sequence
  seq = [];
  for (let r = 1; r <= rounds; r++) {
    intervals.forEach(iv => seq.push({ ...iv, round: r }));
  }

  seqIdx = 0;
  timeLeft = seq[0].seconds;
  totalTime = seq[0].seconds;
  warningFired = false;

  document.getElementById('setupView').classList.add('hidden');
  document.getElementById('timerView').classList.add('active');
  document.getElementById('stopBtn').textContent = 'STOP';

  updateTimerUI();
  tickHandle = setInterval(tick, 1000);
});

// ──────────────────────────────────────────────────────────────
// Tick
// ──────────────────────────────────────────────────────────────
function tick() {
  timeLeft--;

  // Countdown beeps at 3, 2, 1
  if (timeLeft === 3 || timeLeft === 2 || timeLeft === 1) {
    warningBeep();
  }

  if (timeLeft <= 0) {
    seqIdx++;

    if (seqIdx >= seq.length) {
      // All done!
      clearInterval(tickHandle); tickHandle = null;
      finalBeep();
      document.getElementById('timerName').textContent = 'Done! 🎉';
      document.getElementById('timerName').style.color = '#111';
      document.getElementById('timerCountdown').textContent = '0:00';
      document.getElementById('timerRoundBadge').textContent = 'All rounds complete';
      document.getElementById('ringFg').style.strokeDashoffset = CIRCUMFERENCE;
      document.getElementById('stopBtn').textContent = 'BACK';
      document.getElementById('timerQueue').innerHTML = '';
      setTimeout(() => document.getElementById('stopBtn').click(), 5000);
      return;
    }

    intervalEndBeep();
    timeLeft = seq[seqIdx].seconds;
    totalTime = seq[seqIdx].seconds;
    warningFired = false;
  }

  updateTimerUI();
}

// ──────────────────────────────────────────────────────────────
// Update timer UI
// ──────────────────────────────────────────────────────────────
function updateTimerUI() {
  const cur = seq[seqIdx];

  // Name & color
  const nameEl = document.getElementById('timerName');
  nameEl.textContent = cur.name;
  nameEl.style.color = cur.color;

  // Countdown
  document.getElementById('timerCountdown').textContent = fmt(timeLeft);

  // Round badge
  document.getElementById('timerRoundBadge').textContent = `Round ${cur.round} of ${rounds}`;

  // Ring progress
  const fraction = timeLeft / totalTime;
  const offset = CIRCUMFERENCE * (1 - fraction);
  const ring = document.getElementById('ringFg');
  ring.style.strokeDashoffset = offset;
  ring.setAttribute('stroke', cur.color);

  // Mini queue for current round
  const roundBase = (cur.round - 1) * intervals.length;
  const queueHtml = intervals.map((iv, i) => {
    const si = roundBase + i;
    const cls = si === seqIdx ? 'active' : si < seqIdx ? 'done' : '';
    return `<div class="tqi ${cls}">
      <span class="tqi-dot" style="background:${iv.color}"></span>
      <span>${esc(iv.name)}</span>
      <span class="tqi-time">${fmt(iv.seconds)}</span>
    </div>`;
  }).join('');

  const queueEl = document.getElementById('timerQueue');
  queueEl.innerHTML = queueHtml;

  // Scroll active item into view
  const activeItem = queueEl.querySelector('.tqi.active');
  activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ──────────────────────────────────────────────────────────────
// Stop
// ──────────────────────────────────────────────────────────────
document.getElementById('stopBtn').addEventListener('click', () => {
  clearInterval(tickHandle); tickHandle = null;
  document.getElementById('timerView').classList.remove('active');
  document.getElementById('setupView').classList.remove('hidden');
  // Reset timer name color
  document.getElementById('timerName').style.color = '';
});

// ──────────────────────────────────────────────────────────────
// Init with defaults
// ──────────────────────────────────────────────────────────────
addInterval('Interval 1', '#2B00FF', 20);
addInterval('Rest',       '#BBDD00', 10);
addInterval('Interval 2', '#CC2222', 120);
addInterval('Rest',       '#6666CC', 30);
```

(The 4 bootstrap `addInterval(...)` calls are kept here for now — Task 7 removes them once day selection replaces them as the source of initial intervals. Keeping them in this task means the app still behaves exactly as before after this extraction.)

- [ ] **Step 2: Replace the inline `<script>` block in `index.html` with a script tag**

In `index.html`, find the `<script>` block (everything between `<script>` and `</script>` right before `</body>`) and delete its contents, then point it at the new file. Replace:

```html
<script>
```

through

```html
</script>
</body>
</html>
```

(i.e. the opening `<script>` tag, the entire JS body copied in Step 1, and the closing `</script>` tag) with:

```html
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Manual smoke test**

Open `index.html` in a browser. Confirm the same behavior as Task 1's smoke test (4 default intervals, Rounds = 6, Start/Stop work, no console errors).

- [ ] **Step 4: Commit**

```bash
git add app.js index.html
git commit -m "Extract inline JS into app.js"
```

---

### Task 3: Add `days-data.js` with the per-day dataset

**Files:**
- Create: `days-data.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing.
- Produces: a global `DAYS` object, keyed by `'A'`, `'B'`, `'C'`. Each value has shape:
  `{ title: string, subtitle: string, warmupHtml: string, sections: Array<{ title: string, rows: Array<{ exercise: string, detail: string }> }>, cooldownHtml: string, intervals: Array<{ name: string, color: string, seconds: number }> }`.
  Task 4 reads `DAYS[id].title/subtitle` and `.intervals`. Task 5 reads `DAYS[id].warmupHtml/.sections/.cooldownHtml`.

- [ ] **Step 1: Create `days-data.js`**

Create `e:\VSCODE\Claude Practice\MuayThaiPlan\days-data.js`:

```js
const DAYS = {
  A: {
    title: 'A nap — Váll + Mellkas + Muay Thai alapok',
    subtitle: '45–50 perc · pl. Hétfő',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 3 perc. Dinamikus vállkörzés előre-hátra — 20 ism. Mellkasnyitás (karok oldalra tárva, összecsukva) — 15 ism. Árnyékbox lazán, guardban — 2 perc.</p>',
    sections: [
      {
        title: 'Muay Thai technikaépítés — zsákon (8–22 perc)',
        rows: [
          { exercise: 'Jab + Cross — csípőrotációval', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Hook — könyök szögben, mellkasból indítva', detail: '2×2 perc, 30 mp pihenő' },
          { exercise: 'Teep (talpas rúgás) — távolságtartó', detail: '2×1 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Váll + Mellkas erőkör — 3 forduló (22–42 perc, 60 mp pihenő fordulók között)',
        rows: [
          { exercise: 'Fekvőtámasz (lassú, 2-1-2 tempó)', detail: '12 ism.' },
          { exercise: 'Egykezes vállnyomás állva', detail: '10 ism./oldal' },
          { exercise: 'Pike fekvőtámasz (csípő fent, vállra terhelve)', detail: '10 ism.' },
          { exercise: 'Egykezes evezés (asztalra támaszkodva)', detail: '10 ism./oldal' }
        ]
      }
    ],
    cooldownHtml: '<p>Mellizom nyújtás ajtófélfánál — 30 mp/oldal. Válltok nyújtás (kar átfogva) — 30 mp/oldal. Rekeszlégzés — 2 perc.</p>',
    intervals: [
      { name: 'Jab+Cross (1/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Jab+Cross (2/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Jab+Cross (3/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Hook (1/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Hook (2/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Teep (1/2)', color: '#6666CC', seconds: 60 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Teep (2/2)', color: '#6666CC', seconds: 60 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Fekvőtámasz (kör 1/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 1/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 1/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 1/3)', color: '#EE7722', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Fekvőtámasz (kör 2/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 2/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 2/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 2/3)', color: '#EE7722', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Fekvőtámasz (kör 3/3)', color: '#00AABB', seconds: 90 },
      { name: 'Egykezes vállnyomás (kör 3/3)', color: '#FF6688', seconds: 90 },
      { name: 'Pike fekvőtámasz (kör 3/3)', color: '#22AA66', seconds: 90 },
      { name: 'Egykezes evezés (kör 3/3)', color: '#EE7722', seconds: 90 }
    ]
  },
  B: {
    title: 'B nap — Has + Rúgástechnikák + Kardio',
    subtitle: '50–55 perc · pl. Szerda',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 2 perc. Jumping jack — 2 perc. Csípőkörzés, bokamobilizáció — 2×1 perc.</p>',
    sections: [
      {
        title: 'Muay Thai rúgások — zsákon (8–28 perc)',
        rows: [
          { exercise: 'Low kick (combra, sípcsont belső éle)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Middle kick (csípő nyitás, teljes rotáció)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Kombó: Jab → Cross → Middle kick', detail: '2×2 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Has erőkör — 4 forduló (28–46 perc, 45 mp pihenő fordulók között)',
        rows: [
          { exercise: 'Plank', detail: '40 mp' },
          { exercise: 'Bicycle crunch', detail: '20 ism./oldal' },
          { exercise: 'Lábemeléses hasprés (hanyatt fekve)', detail: '15 ism.' },
          { exercise: 'Egykezes súlyzós oldalhajlítás', detail: '15 ism./oldal' },
          { exercise: 'Mountain climber', detail: '30 mp' }
        ]
      },
      {
        title: 'Kardio finish — zsákon (46–54 perc)',
        rows: [
          { exercise: 'Zsákos intervall', detail: '4× (30 mp max intenzitás zsákon · 30 mp lassú árnyékbox)' }
        ]
      }
    ],
    cooldownHtml: '<p>Csípőhajlító nyújtás — 40 mp/oldal. Macska-tehén mozgás matacon — 1 perc.</p>',
    intervals: [
      { name: 'Low kick (1/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Low kick (2/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Low kick (3/3)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (1/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (2/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Middle kick (3/3)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó: Jab-Cross-Middle kick (1/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó: Jab-Cross-Middle kick (2/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Plank (kör 1/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 1/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 1/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 1/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 1/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 2/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 2/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 2/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 2/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 2/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 3/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 3/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 3/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 3/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 3/4)', color: '#FFA500', seconds: 30 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 45 },
      { name: 'Plank (kör 4/4)', color: '#00AABB', seconds: 40 },
      { name: 'Bicycle crunch (kör 4/4)', color: '#FF6688', seconds: 40 },
      { name: 'Lábemeléses hasprés (kör 4/4)', color: '#22AA66', seconds: 40 },
      { name: 'Oldalhajlítás (kör 4/4)', color: '#EE7722', seconds: 40 },
      { name: 'Mountain climber (kör 4/4)', color: '#FFA500', seconds: 30 },
      { name: 'Max intenzitás zsákon (1/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (1/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (2/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (2/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (3/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (3/4)', color: '#6666CC', seconds: 30 },
      { name: 'Max intenzitás zsákon (4/4)', color: '#CC2222', seconds: 30 },
      { name: 'Lassú árnyékbox (4/4)', color: '#6666CC', seconds: 30 }
    ]
  },
  C: {
    title: 'C nap — Teljes test kombók + Core integráció',
    subtitle: '50–55 perc · pl. Péntek / Szombat',
    warmupHtml: '<p>Burpee lassítva, bemelegítő tempóban — 2 perc. Dinamikus nyújtás: váll, csípő, boka. Árnyékbox wai kru stílusban — 3 perc.</p>',
    sections: [
      {
        title: 'Kombók zsákon (8–30 perc, minden kombó 2×2 perc, 30 mp pihenő)',
        rows: [
          { exercise: '1. Jab → Cross → Hook → Cross', detail: 'Alap 4 ütéses sorozat' },
          { exercise: '2. Teep → Jab → Cross → Middle kick', detail: 'Távolságváltás' },
          { exercise: '3. Hook → Body shot → Low kick', detail: '3. héttől' },
          { exercise: '4. Jab → Cross → Clinch → Térdütés', detail: '6. héttől (zsák megfogva)' }
        ]
      },
      {
        title: 'Komplex kondíciós kör — 3 forduló (30–48 perc, 90 mp munka, 60 mp pihenő fordulónként)',
        rows: [
          { exercise: 'Burpee', detail: '10 ism.' },
          { exercise: 'Fekvőtámasz → rögtön egykezes vállnyomás', detail: '8 + 8 ism.' },
          { exercise: 'Jumping squat (robbanékony guggolás)', detail: '12 ism.' },
          { exercise: 'Plank', detail: 'maradék idő' }
        ]
      },
      {
        title: 'Core + Levezetés — matacon (48–55 perc)',
        rows: [
          { exercise: 'Oblique crunch (ferde hasizom)', detail: '3×15 ism./oldal' },
          { exercise: 'Pigeon pose (csípő nyitás)', detail: '60 mp/oldal' },
          { exercise: 'Mellkas + vállnyújtás', detail: '2 perc' }
        ]
      }
    ],
    cooldownHtml: '',
    intervals: [
      { name: 'Kombó 1: Jab-Cross-Hook-Cross (1/2)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 1: Jab-Cross-Hook-Cross (2/2)', color: '#FFA500', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (1/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (2/2)', color: '#CC2222', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 3: Hook-Body shot-Low kick (1/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 3: Hook-Body shot-Low kick (2/2)', color: '#6666CC', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (1/2)', color: '#00AABB', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (2/2)', color: '#00AABB', seconds: 120 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
      { name: 'Burpee (kör 1/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 1/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 1/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 1/3)', color: '#FFA500', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Burpee (kör 2/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 2/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 2/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 2/3)', color: '#FFA500', seconds: 90 },
      { name: 'Pihenő', color: '#BBDD00', seconds: 60 },
      { name: 'Burpee (kör 3/3)', color: '#FF6688', seconds: 90 },
      { name: 'Fekvőtámasz→vállnyomás (kör 3/3)', color: '#22AA66', seconds: 90 },
      { name: 'Jumping squat (kör 3/3)', color: '#EE7722', seconds: 90 },
      { name: 'Plank (kör 3/3)', color: '#FFA500', seconds: 90 }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAYS };
}
```

- [ ] **Step 2: Add the script tag to `index.html`, before `app.js`**

Find:

```html
<script src="app.js"></script>
</body>
</html>
```

Replace with:

```html
<script src="days-data.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify the data with Node**

Run:

```bash
node -e "
const { DAYS } = require('./days-data.js');
const expected = { A: { count: 28, seconds: 2130 }, B: { count: 47, seconds: 2335 }, C: { count: 30, seconds: 2400 } };
let ok = true;
for (const id of Object.keys(expected)) {
  const ivs = DAYS[id].intervals;
  const count = ivs.length;
  const seconds = ivs.reduce((s, iv) => s + iv.seconds, 0);
  const exp = expected[id];
  if (count !== exp.count || seconds !== exp.seconds) {
    console.error('FAIL', id, { count, seconds }, 'expected', exp);
    ok = false;
  }
}
if (ok) console.log('PASS all day totals match');
else process.exit(1);
"
```

Expected output: `PASS all day totals match`

- [ ] **Step 4: Manual smoke test**

Open `index.html` in a browser. Confirm it still behaves exactly as before (the new `DAYS` global is loaded but unused so far; no visual or behavioral change yet).

- [ ] **Step 5: Commit**

```bash
git add days-data.js index.html
git commit -m "Add per-day workout dataset (days-data.js)"
```

---

### Task 4: Add landing page, day view shell, and day selection/back wiring

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`

**Interfaces:**
- Consumes: `DAYS` (from Task 3), `intervals`/`rounds`/`nextId`/`renderSetup()` (from Task 2).
- Produces: `selectDay(dayId)` (sets `intervals`/`rounds`, calls `renderSetup()`, shows `#dayView`), `backToLanding()` (stops any running timer, shows `#landingView`). Task 5 extends `selectDay` to also call `renderPlanPanel(dayId)`.

- [ ] **Step 1: Restructure `index.html`'s body**

Find the body content — from the `<!-- ═══════════ SETUP VIEW ═══════════ -->` comment through the end of the `#timerView` div:

```html
<!-- ═══════════ SETUP VIEW ═══════════ -->
<div id="setupView">
  <div class="page-header">
    <h1>Intervals</h1>
    <button class="btn-add" id="addBtn">＋ Add Interval</button>
  </div>

  <div id="intervalsList"></div>

  <div class="rounds-section">
    <h2>Rounds</h2>
    <div class="rounds-controls">
      <button class="btn-outline" id="roundsMinus">−</button>
      <span id="roundsDisplay">8</span>
      <button class="btn-outline" id="roundsPlus">+</button>
    </div>
  </div>

  <button class="btn-start" id="startBtn">START</button>
  <p style="text-align:center; margin-top:14px; font-size:1.2rem; font-weight:800; opacity:0.85;">📢 Don't forget to turn up the volume!</p>
</div>

<!-- ═══════════ TIMER VIEW ═══════════ -->
<div id="timerView">
  <div id="timerName">Interval 1</div>
  <div id="timerRoundBadge">Round 1 of 8</div>

  <div class="ring-wrap">
    <svg id="ringSvg" width="240" height="240" viewBox="0 0 240 240">
      <circle id="ringBg" cx="120" cy="120" r="104"/>
      <circle id="ringFg" cx="120" cy="120" r="104"
              transform="rotate(-90 120 120)"
              stroke-dasharray="653.45"
              stroke-dashoffset="0"/>
    </svg>
    <div class="ring-center">
      <span id="timerCountdown">0:20</span>
    </div>
  </div>

  <div id="timerRoundBadge2" style="display:none"></div>
  <div id="timerQueue"></div>
  <button class="btn-stop" id="stopBtn">STOP</button>
</div>
```

Replace with:

```html
<!-- ═══════════ LANDING VIEW ═══════════ -->
<div id="landingView" class="active">
  <div class="landing-inner">
    <h1>Heti Muay Thai Edzésterv</h1>
    <p class="landing-sub">Válassz napot a kezdéshez</p>
    <div id="dayButtons"></div>
  </div>
</div>

<!-- ═══════════ DAY VIEW ═══════════ -->
<div id="dayView">
  <div id="planPanel"></div>

  <div id="trainerPanel">
    <button class="btn-back" id="backBtn">← Napválasztó</button>

    <!-- ═══════════ SETUP VIEW ═══════════ -->
    <div id="setupView">
      <div class="page-header">
        <h1>Intervals</h1>
        <button class="btn-add" id="addBtn">＋ Add Interval</button>
      </div>

      <div id="intervalsList"></div>

      <div class="rounds-section">
        <h2>Rounds</h2>
        <div class="rounds-controls">
          <button class="btn-outline" id="roundsMinus">−</button>
          <span id="roundsDisplay">1</span>
          <button class="btn-outline" id="roundsPlus">+</button>
        </div>
      </div>

      <button class="btn-start" id="startBtn">START</button>
      <p style="text-align:center; margin-top:14px; font-size:1.2rem; font-weight:800; opacity:0.85;">📢 Don't forget to turn up the volume!</p>
    </div>

    <!-- ═══════════ TIMER VIEW ═══════════ -->
    <div id="timerView">
      <div id="timerName">Interval 1</div>
      <div id="timerRoundBadge">Round 1 of 8</div>

      <div class="ring-wrap">
        <svg id="ringSvg" width="240" height="240" viewBox="0 0 240 240">
          <circle id="ringBg" cx="120" cy="120" r="104"/>
          <circle id="ringFg" cx="120" cy="120" r="104"
                  transform="rotate(-90 120 120)"
                  stroke-dasharray="653.45"
                  stroke-dashoffset="0"/>
        </svg>
        <div class="ring-center">
          <span id="timerCountdown">0:20</span>
        </div>
      </div>

      <div id="timerRoundBadge2" style="display:none"></div>
      <div id="timerQueue"></div>
      <button class="btn-stop" id="stopBtn">STOP</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add landing page and day view layout CSS**

Append to the end of `styles.css` (before the existing `@media (max-width: 600px)` block stays where it is — add this new block right after the `.done-label` rule and before `/* ─────────────── MOBILE ─────────────── */`):

```css
/* ─────────────── LANDING VIEW ─────────────── */
#landingView {
  display: none;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
}
#landingView.active { display: flex; }

.landing-inner { max-width: 480px; width: 100%; text-align: center; }
.landing-inner h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
.landing-sub { font-size: 1.1rem; opacity: .8; margin-bottom: 28px; }

#dayButtons { display: flex; flex-direction: column; gap: 16px; }
.day-btn {
  background: #fff;
  border: 2.5px solid #222;
  border-radius: 14px;
  padding: 20px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.day-btn:hover { background: #f0f0f0; }
.day-btn-sub {
  display: block;
  font-size: .85rem;
  font-weight: 600;
  opacity: .7;
  margin-top: 4px;
}

/* ─────────────── DAY VIEW (split layout) ─────────────── */
#dayView { display: none; min-height: 100vh; }
#dayView.active { display: flex; }

#planPanel {
  flex: 1 1 50%;
  min-width: 0;
  overflow-y: auto;
  max-height: 100vh;
  padding: 28px 24px;
  background: #fff;
}

#trainerPanel {
  flex: 1 1 50%;
  min-width: 0;
  overflow-y: auto;
  max-height: 100vh;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
}

.btn-back {
  align-self: flex-start;
  background: #fff;
  border: 2.5px solid #222;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 18px;
  transition: background .15s;
}
.btn-back:hover { background: #f0f0f0; }
```

Then, inside the existing `@media (max-width: 600px) { ... }` block, add these rules right before its closing `}`:

```css
  #dayView.active { flex-direction: column; }
  #planPanel, #trainerPanel { max-height: none; }
```

- [ ] **Step 3: Add day-selection and back-navigation logic to `app.js`**

Append to the end of `app.js`, replacing the previous bootstrap block. Find:

```js
// ──────────────────────────────────────────────────────────────
// Init with defaults
// ──────────────────────────────────────────────────────────────
addInterval('Interval 1', '#2B00FF', 20);
addInterval('Rest',       '#BBDD00', 10);
addInterval('Interval 2', '#CC2222', 120);
addInterval('Rest',       '#6666CC', 30);
```

Replace it with:

```js
// ──────────────────────────────────────────────────────────────
// Day selection
// ──────────────────────────────────────────────────────────────
let currentDayId = null;

function renderDayButtons() {
  const wrap = document.getElementById('dayButtons');
  wrap.innerHTML = Object.keys(DAYS).map(id => {
    const day = DAYS[id];
    return `
      <button class="day-btn" data-day="${id}">
        ${esc(day.title)}
        <span class="day-btn-sub">${esc(day.subtitle)}</span>
      </button>
    `;
  }).join('');
}

function selectDay(dayId) {
  const day = DAYS[dayId];
  if (!day) return;

  currentDayId = dayId;
  intervals = day.intervals.map(iv => ({
    id: nextId++,
    name: iv.name,
    color: iv.color,
    seconds: iv.seconds
  }));
  rounds = 1;
  renderSetup();

  document.getElementById('landingView').classList.remove('active');
  document.getElementById('dayView').classList.add('active');
}

function backToLanding() {
  if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
  document.getElementById('timerView').classList.remove('active');
  document.getElementById('setupView').classList.remove('hidden');
  document.getElementById('timerName').style.color = '';

  document.getElementById('dayView').classList.remove('active');
  document.getElementById('landingView').classList.add('active');
  currentDayId = null;
}

document.getElementById('dayButtons').addEventListener('click', e => {
  const btn = e.target.closest('[data-day]');
  if (btn) selectDay(btn.dataset.day);
});

document.getElementById('backBtn').addEventListener('click', backToLanding);

renderDayButtons();
```

- [ ] **Step 4: Manual smoke test**

Open `index.html` in a browser. Confirm:
- The landing page shows, with 3 buttons titled "A nap — Váll + Mellkas + Muay Thai alapok", "B nap — Has + Rúgástechnikák + Kardio", "C nap — Teljes test kombók + Core integráció", each with its subtitle underneath.
- Clicking the A-nap button switches to a two-column view: left column is currently empty (white), right column shows the setup view populated with the A-day intervals (first row "Jab+Cross (1/3)", Rounds = `1`).
- Clicking **"← Napválasztó"** returns to the landing page.
- Clicking the B-nap or C-nap buttons loads their respective intervals (47 and 30 rows).
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css app.js
git commit -m "Add landing page and day selection/back navigation"
```

---

### Task 5: Render the day's full plan in the left panel

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `DAYS[id].warmupHtml/.sections/.cooldownHtml` (Task 3), `esc()` (Task 2), `selectDay()` (Task 4).
- Produces: `renderPlanPanel(dayId)`, called from `selectDay`.

- [ ] **Step 1: Add `renderPlanPanel` to `app.js` and call it from `selectDay`**

Find this line inside `selectDay` (added in Task 4):

```js
  rounds = 1;
  renderSetup();
```

Replace with:

```js
  rounds = 1;
  renderSetup();
  renderPlanPanel(dayId);
```

Then add the `renderPlanPanel` function right above `function selectDay(dayId) {`:

```js
function renderPlanSection(section) {
  return `
    <div class="plan-block">
      <h2>${esc(section.title)}</h2>
      <table class="plan-table">
        <thead><tr><th>Gyakorlat</th><th>Sorozat / Idő</th></tr></thead>
        <tbody>
          ${section.rows.map(r => `<tr><td>${esc(r.exercise)}</td><td>${esc(r.detail)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPlanPanel(dayId) {
  const day = DAYS[dayId];
  const panel = document.getElementById('planPanel');

  const warmupBlock = day.warmupHtml
    ? `<div class="plan-block"><h2>Bemelegítés</h2>${day.warmupHtml}</div>`
    : '';
  const cooldownBlock = day.cooldownHtml
    ? `<div class="plan-block"><h2>Levezetés</h2>${day.cooldownHtml}</div>`
    : '';

  panel.innerHTML = `
    <h1 class="plan-title">${esc(day.title)}</h1>
    <p class="plan-subtitle">${esc(day.subtitle)}</p>
    ${warmupBlock}
    ${day.sections.map(renderPlanSection).join('')}
    ${cooldownBlock}
  `;
}
```

- [ ] **Step 2: Add plan-panel content styling to `styles.css`**

Append right after the `#planPanel { ... }` rule added in Task 4:

```css
.plan-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
.plan-subtitle { font-size: .95rem; opacity: .7; margin-bottom: 22px; }

.plan-block { margin-bottom: 22px; }
.plan-block h2 {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #ececec;
}
.plan-block p { font-size: .95rem; line-height: 1.5; }

.plan-table { width: 100%; border-collapse: collapse; font-size: .92rem; }
.plan-table th, .plan-table td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid #e0e0e0;
}
.plan-table th { font-weight: 800; background: #f5f5f5; }
```

- [ ] **Step 3: Manual smoke test**

Open `index.html` in a browser. Click each day button in turn and confirm the left panel shows: title + subtitle, a "Bemelegítés" block with the warm-up text, one table per technique/strength/cardio section (matching the PDF's exercise names and set/rep details), and (for A and B days) a "Levezetés" block at the end. For C-day, confirm there is no "Levezetés" block but the "Core + Levezetés — matacon" table is present among the sections. Confirm the right panel still shows that day's intervals as before.

- [ ] **Step 4: Commit**

```bash
git add app.js styles.css
git commit -m "Render the selected day's full plan in the left panel"
```

---

### Task 6: Confine the running timer to the right panel

**Files:**
- Modify: `styles.css`

**Interfaces:**
- Consumes: existing `#timerView`/`.ring-wrap`/`#timerCountdown` rules (Task 1).
- Produces: none (leaf CSS change).

- [ ] **Step 1: Stop the timer view from going full-screen**

In `styles.css`, find:

```css
#timerView {
  display: none;
  position: fixed;
  inset: 0;
  background: #87CEEB;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  z-index: 10;
}
#timerView.active { display: flex; }
```

Replace with:

```css
#timerView {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px 0;
}
#timerView.active { display: flex; }
```

- [ ] **Step 2: Scale the ring and countdown to fit the panel instead of the viewport**

Find:

```css
.ring-wrap {
  position: relative;
  display: inline-flex;
  align-items: center; justify-content: center;
  width: min(70vw, 70vh);
  height: min(70vw, 70vh);
  margin-bottom: 3vmin;
  flex-shrink: 0;
}
```

Replace with:

```css
.ring-wrap {
  position: relative;
  display: inline-flex;
  align-items: center; justify-content: center;
  width: min(80%, 45vh);
  height: min(80%, 45vh);
  margin-bottom: 3vmin;
  flex-shrink: 0;
}
```

Find:

```css
#timerCountdown {
  font-size: 18vmin; font-weight: 800; line-height: 1;
}
```

Replace with:

```css
#timerCountdown {
  font-size: clamp(2.2rem, 9vmin, 5.5rem); font-weight: 800; line-height: 1;
}
```

- [ ] **Step 3: Manual smoke test**

Open `index.html`, pick any day, click **START**. Confirm:
- The left plan panel stays visible while the timer runs in the right panel.
- The ring and countdown text fit inside the right panel without overflowing into the left panel or off-screen.
- Resize the browser window narrower (or use devtools device toolbar) and confirm the ring still fits.

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "Confine the running timer to the right panel instead of full-screen"
```

---

### Task 7: Remove the obsolete default-interval bootstrap; final end-to-end check

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this is cleanup plus final verification of the whole feature.

- [ ] **Step 1: Confirm no leftover bootstrap calls remain**

Task 4, Step 3 already replaced the `// Init with defaults` block (the 4 `addInterval(...)` calls) with the day-selection code, so `app.js` should no longer call `addInterval` at load time. Open `app.js` and confirm there is no `addInterval('Interval 1', ...)` call left anywhere in the file — the only `addInterval` references should be its `function addInterval(...)` definition and the `#addBtn` click listener (`addInterval()` with no arguments, for the manual "Add Interval" button in the setup view).

If any bootstrap `addInterval(...)` call is still present, delete it now.

- [ ] **Step 2: Full end-to-end manual verification**

Open `index.html` in a browser and walk through:
1. Landing page shows 3 day buttons. No intervals/timer visible.
2. Click **A nap** → left panel shows A-day plan (warm-up text, 2 tables, cooldown text); right panel shows 28 intervals, Rounds = 1.
3. Click **START** → timer runs in the right panel only, left panel still visible; countdown reaches the end of "Jab+Cross (1/3)" and advances to "Pihenő" with a beep.
4. Click **STOP** → returns to the A-day setup view (still inside the day view, not the landing page).
5. Click **"← Napválasztó"** → returns to the landing page.
6. Click **B nap** → 47 intervals, Rounds = 1, left panel shows B-day's 3 tables.
7. Click **C nap** → 30 intervals, Rounds = 1, left panel shows C-day's 3 tables (including "Core + Levezetés — matacon" as a table, with no separate "Levezetés" prose block).
8. In any day's setup view, confirm the pre-existing functionality still works: add an interval via "＋ Add Interval", edit its name/color/time, drag-reorder rows, delete a row, and adjust Rounds with +/-.
9. No console errors at any point.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "Remove obsolete default-interval bootstrap now that day selection drives initial state"
```
