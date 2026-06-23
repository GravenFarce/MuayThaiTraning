# Per-Exercise Timer Groups Design

Date: 2026-06-23

## Goal

Replace each day's single, monolithic preloaded timer (one shared
interval list + one Rounds + one Start button) with **one mini-timer
per bag-work exercise** ("Jab+Cross", "Hook", "Teep", etc.), each with
its own preloaded intervals, its own Rounds, its own Start button, and
its own fully editable interval list — exactly like today's editor,
just scoped per exercise instead of per day.

## Data model (`days-data.js`)

Each day's flat `intervals: [...]` is replaced by `groups: [...]`.
Each group:

```js
{ name: 'Jab+Cross', detail: '3×2 perc, 30 mp pihenő', intervals: [ {name,color,seconds}, ... ] }
```

- `name` — short label shown as the group-card header (matches the
  exercise's existing interval-name prefix, without the `(n/N)`
  suffix).
- `detail` — the same "Sorozat / Idő" description already shown in
  the left panel's table for that exercise (copied verbatim from
  `sections[].rows[].detail`), shown as a caption under the group
  name.
- `intervals` — exactly the same unrolled work/rest entries that
  exercise already has today (unchanged names/colors/seconds), just
  sliced into its own array instead of being concatenated into one
  flat list.

One group per bag-work table row, in the same order as today's flat
list (so totals are identical, just regrouped):

**Day A** (3 groups, 14 intervals total — unchanged):
- `Jab+Cross` / `3×2 perc, 30 mp pihenő` — 6 intervals (3×120s work + 3×30s rest)
- `Hook` / `2×2 perc, 30 mp pihenő` — 4 intervals (2×120s + 2×30s)
- `Teep` / `2×1 perc, 30 mp pihenő` — 4 intervals (2×60s + 2×30s)

**Day B** (4 groups, 24 intervals total — unchanged):
- `Low kick` / `3×2 perc, 30 mp pihenő` — 6 intervals
- `Middle kick` / `3×2 perc, 30 mp pihenő` — 6 intervals
- `Kombó: Jab-Cross-Middle kick` / `2×2 perc, 30 mp pihenő` — 4 intervals
- `Kardio finish` / `4× (30 mp max intenzitás zsákon · 30 mp lassú árnyékbox)` — 8 intervals

**Day C** (4 groups, 16 intervals total — unchanged):
- `Kombó 1: Jab-Cross-Hook-Cross` / `2×2 perc, 30 mp pihenő` — 4 intervals
- `Kombó 2: Teep-Jab-Cross-Middle kick` / `2×2 perc, 30 mp pihenő` — 4 intervals
- `Kombó 3: Hook-Body shot-Low kick` / `2×2 perc, 30 mp pihenő` — 4 intervals
- `Kombó 4: Jab-Cross-Clinch-Térdütés` / `2×2 perc, 30 mp pihenő` — 4 intervals

`sections`/`warmupHtml`/`cooldownHtml` (left panel data) are untouched
by this change.

## App state (`app.js`)

Replace the single `intervals: []` / `rounds: 6` globals with:

```js
let groups = [];          // [{ name, detail, intervals: [{id,name,color,seconds}], rounds }]
let activeGroupIdx = null; // which group's timer is currently running
```

`selectDay(dayId)` now builds `groups` from `DAYS[id].groups`: each
group gets its own deep-copied `intervals` (fresh `id`s via the
existing `nextId++`) and `rounds: 1`.

## Right panel: `#groupsView` replaces `#setupView`

`renderGroups()` (replaces `renderSetup()`) renders one `.group-card`
per group, **all expanded simultaneously, stacked, scrollable** — no
accordion. Each card:

- Header: group `name` (colored using that group's first interval's
  color as an accent, consistent with the existing per-exercise
  colors already used today) + `detail` caption underneath.
- Its own interval list — same row UI as today (drag handle, name
  input, color circle, −/+ time, delete), but scoped to
  `groups[g].intervals` via a `data-group="g"` attribute alongside
  the existing `data-idx="i"`.
- Its own "＋ Add Interval" button (`data-group="g"`).
- Its own Rounds stepper (−/display/+, `data-group="g"`), default `1`.
- Its own START button (`data-group="g"`).

Event delegation moves from per-field containers
(`#intervalsList`, `#roundsMinus`, etc.) to a single listener on
`#groupsView`, reading both `data-group` and `data-idx` from
`closest()` targets to address `groups[g].intervals[i]`.

**Drag-reorder stays scoped to one group**: the existing
mousedown/touchstart drag handlers track `dragGroupIdx` alongside
`dragSrcIdx`; if the pointer moves over a row belonging to a
different group, the move is ignored (no cross-group reordering).

## Timer view: shared, unchanged in appearance

`#timerView` keeps its current ring/countdown/queue/Stop UI and stays
confined to the right panel (no change there). Behavior changes:

- Clicking a group's START button sets `activeGroupIdx = g`, builds
  `seq` from `groups[g].intervals × groups[g].rounds` (same flattening
  logic as today, just reading from the group instead of the old
  globals), and shows `#timerView` (hiding `#groupsView`, not a single
  setup view).
- `tick()` / `updateTimerUI()` reference `groups[activeGroupIdx]`
  wherever they previously referenced the global `intervals`/`rounds`
  (round badge "Round X of N", mini queue list, queue active/done
  marking).
- Stop, and the existing auto-return-after-Done (5s timeout), both
  show `#groupsView` again (every other group's edited state is
  preserved, since each group owns its own `intervals` array
  untouched by another group's timer run).

## Out of scope

- No change to the left plan panel, landing page, day selection, or
  back-to-landing flow — only the right panel's internal structure
  changes.
- No persistence of per-group edits across a day re-selection (today,
  re-clicking a day re-copies fresh data from `DAYS`; same here, just
  per group instead of per day).
- No accordion/collapse — all groups stay expanded per the approved
  decision.
