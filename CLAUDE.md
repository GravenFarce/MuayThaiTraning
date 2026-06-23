# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A day-driven interval training timer for a Muay Thai training plan (A/B/C workout days). There is no build step, no package manager, and no server-side code — plain HTML/CSS/JS across 4 files:

- [index.html](index.html) — markup only (landing view, day view shell, setup/timer views)
- [styles.css](styles.css) — all styles
- [days-data.js](days-data.js) — the `DAYS` data object (per-day workout plans)
- [app.js](app.js) — all behavior, loaded after `days-data.js` (script order matters: `app.js` reads `DAYS` at load time to render the landing page's day buttons)

## Running it

Open [index.html](index.html) directly in a browser (or serve the directory with any static file server). There is nothing to install or compile.

The one automated check in this repo is a data-integrity sanity check for `days-data.js` (interval counts and total durations per day):

```bash
node -e "
const { DAYS } = require('./days-data.js');
const expected = { A: { count: 14, seconds: 930 }, B: { count: 24, seconds: 1440 }, C: { count: 16, seconds: 1200 } };
let ok = true;
for (const id of Object.keys(expected)) {
  const ivs = DAYS[id].intervals;
  const count = ivs.length;
  const seconds = ivs.reduce((s, iv) => s + iv.seconds, 0);
  const exp = expected[id];
  if (count !== exp.count || seconds !== exp.seconds) { console.error('FAIL', id, { count, seconds }, 'expected', exp); ok = false; }
}
if (ok) console.log('PASS all day totals match'); else process.exit(1);
"
```

## Architecture

Three top-level views toggled via an `.active` class (no router):

- **`#landingView`** — 3 buttons, one per workout day, rendered by `renderDayButtons()` from the `DAYS` object's `title`/`subtitle` fields. Visible on load.
- **`#dayView`** — a two-column split, shown after a day is picked:
  - **`#planPanel`** (left) — that day's full written plan, built by `renderPlanPanel(dayId)` from `DAYS[id].warmupHtml` / `.sections` (exercise tables) / `.cooldownHtml`. Purely presentational; rebuilt from scratch on every day selection.
  - **`#trainerPanel`** (right) — contains the original setup/timer UI (`#setupView` + `#timerView`, see below), plus a "← Napválasztó" back button (`backToLanding()`, stops any running timer and returns to the landing view).
- Clicking a day button calls `selectDay(dayId)`: copies `DAYS[id].intervals` into the existing `intervals` array (assigning fresh `id`s via `nextId++`), sets `rounds = 1`, then calls `renderSetup()` and `renderPlanPanel()`.

### `days-data.js` — the `DAYS` model

Each day (`'A'`, `'B'`, `'C'`) has `{ title, subtitle, warmupHtml, sections, cooldownHtml, groups }`. `groups` is one entry per bag-work exercise (e.g. `Jab+Cross`, `Hook`, `Teep`), each with `{ name, detail, intervals }`. Each group's `intervals` is a **fully unrolled** flat list for that exercise alone — every set is its own named entry (e.g. `"Jab+Cross (1/3)"`) with explicit `"Pihenő"` (rest) entries interspersed. `selectDay()` copies this into the runtime `groups` array, giving each group its own `rounds` (default `1`, independently adjustable per group).

Any PDF section titled "Bemelegítés" (warm-up) or containing "Levezetés" (cooldown) is presentational only — it appears in `warmupHtml`/`cooldownHtml`/`sections` for the left panel, but never contributes intervals to the timer. The same goes for bodyweight strength/conditioning circuits done off the bag (e.g. Day A's "Váll + Mellkas erőkör", Day B's "Has erőkör", Day C's "Komplex kondíciós kör") — they're listed as tables in `sections` for reference, but only **zsákon** (bag-work: technique combos, kicks, the bag-based cardio finisher) gets a preloaded timer interval.

### Setup/timer engine (`app.js`, unchanged from the original single-file version)

- **`#groupsView`** — one `.group-card` per exercise group, all rendered expanded simultaneously by `renderGroups()`/`renderGroupCard(g)`. Each card is its own interval editor (add/delete/reorder/edit), backed by `groups[g].intervals` and `groups[g].rounds` — re-rendered wholesale on every mutation, same full-innerHTML-replacement approach as the original single-list version. Event handling is delegated once at the `#groupsView` container level (`click`, `change`, `input`), using both `data-group` and `data-idx` attributes to address `groups[g].intervals[i]`. Drag-reorder is scoped per group: a drop target belonging to a different group is ignored.
- **`#timerView`** — the running countdown, confined to `#trainerPanel` (not full-screen), shared across all groups — only one group runs at a time, tracked via `activeGroupIdx`. Clicking a group's own START button flattens `groups[g].intervals` × `groups[g].rounds` into `seq`, and `seqIdx`/`timeLeft` walk through it on a 1-second `setInterval` (`tick()`). `updateTimerUI()` repaints the countdown ring (SVG `stroke-dashoffset`), the name/color, the round badge (`Round X of groups[activeGroupIdx].rounds`), and the mini per-round queue list from `seq`/`seqIdx`. Stop (or the automatic return after "Done") shows `#groupsView` again, preserving every group's edited state.
- **Audio cues** use the Web Audio API directly (`AudioContext`, no external libs/assets) — `beep()` is a generic oscillator-based tone, composed into `intervalEndBeep()`, `warningBeep()` (fires at 3/2/1 seconds remaining), and `finalBeep()` (three-tone completion chime). `ensureAudio()` lazily creates/resumes the `AudioContext` and must be called from within a user gesture (done in the `START` click handler) due to browser autoplay policies.
- Drag-to-reorder intervals is implemented manually for both mouse and touch (no library) by mutating the `intervals` array directly during `mousemove`/`touchmove` and calling `renderSetup()`.

When changing timer behavior, remember that `seq` is a flattened, pre-computed snapshot of intervals × rounds taken at `START` time — edits to `intervals` after starting do not affect a running timer.
