# Day Selection + Split View Design

Date: 2026-06-17

## Goal

Turn the single-screen interval timer into a 3-screen flow driven by the
"Heti Muay Thai Edzésterv" PDF (A nap / B nap / C nap):

1. **Landing page** — pick which day's workout to run.
2. **Day view** — vertical split: left = that day's full written plan,
   right = the existing setup/timer panel, pre-populated with that day's
   work.
3. The existing setup/timer functionality (add/edit/delete/reorder
   intervals, color picker, +/- time, Rounds, Start/Stop, audio cues,
   ring countdown, mini queue) is fully preserved — only its container
   changes from full-page to the right half of the day view.

## Navigation / view states

Three top-level views toggled the same way the current
`#setupView`/`#timerView` are (class toggling, no router):

- `#landingView` — title + 3 buttons, one per day, labeled with the PDF's
  day titles (e.g. "A nap — Váll + Mellkas + Muay Thai alapok"). Visible
  on load.
- `#dayView` — contains:
  - a small "← Napválasztó" back button (top of the right panel) that
    hides `#dayView` and shows `#landingView` again, and stops any
    running timer.
  - left panel: `#planPanel`, static formatted HTML for the selected
    day.
  - right panel: the existing `#setupView` and `#timerView` nested
    inside, unchanged in behavior.
- Clicking a landing button: sets `intervals` = that day's pre-built
  interval list (deep-copied so editing doesn't mutate the template),
  `rounds = 1`, calls `renderSetup()`, populates `#planPanel`, shows
  `#dayView`/hides `#landingView`.

### Running-timer layout

Per the approved decision, the timer stays confined to the right panel
even while running (the left plan stays visible as a reference during
the workout) — it does **not** go full-screen. This requires:

- Removing `position: fixed; inset: 0` from `#timerView` and instead
  having it fill the right panel as a normal flex child.
- The SVG ring's `min(70vw, 70vh)` sizing changes to something relative
  to the panel, e.g. `min(60%, 60vh)`, so it doesn't overflow a half-width
  column.

### Mobile

Reuse the existing `@media (max-width: 600px)` breakpoint pattern: the
two panels stack vertically (plan on top, setup/timer below) instead of
sitting side by side.

## Data model

```js
const DAYS = {
  A: {
    title: 'A nap — Váll + Mellkas + Muay Thai alapok',
    subtitle: '45–50 perc · pl. Hétfő',
    warmupHtml: '...',   // left-panel only, not in the timer
    cooldownHtml: '...', // left-panel only, not in the timer
    sections: [ /* for left-panel tables, see below */ ],
    intervals: [ {name, color, seconds}, ... ] // fully unrolled, rounds=1
  },
  B: { ... },
  C: { ... }
};
```

`sections` holds the structured table data (exercise name + sets/reps
text) used to render the left panel's tables in the same visual style as
the warmup/cooldown prose — this is purely presentational and does not
feed the timer.

### Unrolling rule (applies to all 3 days)

- Any PDF section titled **"Bemelegítés"** or containing **"Levezetés"**
  → left-panel text only, never enters `intervals`.
- Every other titled section (technique series, erőkör/strength circuits,
  kardió finish, kombók, komplex kondíciós kör) → unrolled into
  `intervals`: each set/round of each exercise becomes its own named
  interval (e.g. `"Jab+Cross (1/3)"`), with explicit `"Pihenő"` intervals
  inserted exactly where the PDF specifies rest (between sets, between
  rounds). `rounds` stays fixed at `1` because the repetition is already
  baked into the flat list.
- Where the PDF gives reps instead of a duration, a duration is estimated
  from the section's own explicit time budget or from sibling exercises
  in the same circuit that do have an explicit duration (documented per
  day below). These are just starting points — the user can adjust any
  interval's time with the existing +/- controls before starting.
- `"Pihenő"` intervals always use a fixed neutral color (`#BBDD00`, the
  same lime already used for "Rest" in the current defaults). Each
  distinct exercise name keeps one consistent color across all its
  repeated occurrences, cycling through the existing `COLORS` palette.

## Day A — unrolled intervals

Technique (zsákon), 30s rest between every set:
1. Jab+Cross (1/3) — 2:00
2. Pihenő — 0:30
3. Jab+Cross (2/3) — 2:00
4. Pihenő — 0:30
5. Jab+Cross (3/3) — 2:00
6. Pihenő — 0:30
7. Hook (1/2) — 2:00
8. Pihenő — 0:30
9. Hook (2/2) — 2:00
10. Pihenő — 0:30
11. Teep (1/2) — 1:00
12. Pihenő — 0:30
13. Teep (2/2) — 1:00
14. Pihenő — 0:30

Váll + Mellkas erőkör, 3 rounds, 60s rest between rounds. No explicit
per-exercise duration in the PDF (only the round's total 22–42 min /
3 rounds budget) — that budget computes to ~90s/exercise once the 60s
inter-round rests are subtracted, so each exercise = **1:30**:
15. Fekvőtámasz (kör 1/3) — 1:30
16. Egykezes vállnyomás (kör 1/3) — 1:30
17. Pike fekvőtámasz (kör 1/3) — 1:30
18. Egykezes evezés (kör 1/3) — 1:30
19. Pihenő — 1:00
20. Fekvőtámasz (kör 2/3) — 1:30
21. Egykezes vállnyomás (kör 2/3) — 1:30
22. Pike fekvőtámasz (kör 2/3) — 1:30
23. Egykezes evezés (kör 2/3) — 1:30
24. Pihenő — 1:00
25. Fekvőtámasz (kör 3/3) — 1:30
26. Egykezes vállnyomás (kör 3/3) — 1:30
27. Pike fekvőtámasz (kör 3/3) — 1:30
28. Egykezes evezés (kör 3/3) — 1:30

(28 intervals; warmup + cooldown shown as text only in the left panel.)

## Day B — unrolled intervals

Rúgások (zsákon), 30s rest between every set:
1. Low kick (1/3) — 2:00
2. Pihenő — 0:30
3. Low kick (2/3) — 2:00
4. Pihenő — 0:30
5. Low kick (3/3) — 2:00
6. Pihenő — 0:30
7. Middle kick (1/3) — 2:00
8. Pihenő — 0:30
9. Middle kick (2/3) — 2:00
10. Pihenő — 0:30
11. Middle kick (3/3) — 2:00
12. Pihenő — 0:30
13. Kombó: Jab-Cross-Middle kick (1/2) — 2:00
14. Pihenő — 0:30
15. Kombó: Jab-Cross-Middle kick (2/2) — 2:00
16. Pihenő — 0:30

Has erőkör, 4 rounds, 45s rest between rounds. Plank and Mountain
climber have explicit durations (40s / 30s); the three rep-only
exercises (Bicycle crunch, Lábemeléses hasprés, Oldalhajlítás) are set to
**0:40** to match the Plank duration already established in this same
circuit:
17. Plank (kör 1/4) — 0:40
18. Bicycle crunch (kör 1/4) — 0:40
19. Lábemeléses hasprés (kör 1/4) — 0:40
20. Oldalhajlítás (kör 1/4) — 0:40
21. Mountain climber (kör 1/4) — 0:30
22. Pihenő — 0:45
23–27. (same 5 exercises, "kör 2/4")
28. Pihenő — 0:45
29–33. (same 5 exercises, "kör 3/4")
34. Pihenő — 0:45
35–39. (same 5 exercises, "kör 4/4")

Kardio finish — explicit 4× (30s max intenzitás zsákon / 30s lassú
árnyékbox), no additional rest (the slow shadow-box bout IS the active
recovery):
40. Max intenzitás zsákon (1/4) — 0:30
41. Lassú árnyékbox (1/4) — 0:30
42. Max intenzitás zsákon (2/4) — 0:30
43. Lassú árnyékbox (2/4) — 0:30
44. Max intenzitás zsákon (3/4) — 0:30
45. Lassú árnyékbox (3/4) — 0:30
46. Max intenzitás zsákon (4/4) — 0:30
47. Lassú árnyékbox (4/4) — 0:30

(47 intervals; warmup + cooldown text-only.)

## Day C — unrolled intervals

Kombók, 30s rest between every set (2 reps per combo):
1. Kombó 1: Jab-Cross-Hook-Cross (1/2) — 2:00
2. Pihenő — 0:30
3. Kombó 1: Jab-Cross-Hook-Cross (2/2) — 2:00
4. Pihenő — 0:30
5. Kombó 2: Teep-Jab-Cross-Middle kick (1/2) — 2:00
6. Pihenő — 0:30
7. Kombó 2: Teep-Jab-Cross-Middle kick (2/2) — 2:00
8. Pihenő — 0:30
9. Kombó 3: Hook-Body shot-Low kick (1/2) — 2:00
10. Pihenő — 0:30
11. Kombó 3: Hook-Body shot-Low kick (2/2) — 2:00
12. Pihenő — 0:30
13. Kombó 4: Jab-Cross-Clinch-Térdütés (1/2) — 2:00
14. Pihenő — 0:30
15. Kombó 4: Jab-Cross-Clinch-Térdütés (2/2) — 2:00
16. Pihenő — 0:30

Komplex kondíciós kör, 3 rounds, 60s rest between rounds. The PDF
explicitly states "90 mp munka" for this circuit, so every exercise
(including the rep-only ones) is **1:30**, except Plank which uses
"maradék idő" in the PDF — kept at 1:30 for consistency since the timer
has no notion of a variable-length last slot:
17. Burpee (kör 1/3) — 1:30
18. Fekvőtámasz→vállnyomás (kör 1/3) — 1:30
19. Jumping squat (kör 1/3) — 1:30
20. Plank (kör 1/3) — 1:30
21. Pihenő — 1:00
22–25. (same 4 exercises, "kör 2/3")
26. Pihenő — 1:00
27–30. (same 4 exercises, "kör 3/3")

(30 intervals. "Core + Levezetés — matacon" is a cooldown/stretch
section per its title, so — consistent with the unrolling rule — it's
left-panel text only, not part of the timer.)

## Left panel content

For each day, render (in the app's existing visual language — white
rounded cards, bold black text, colored section headers) in this order:
title + subtitle, Bemelegítés (prose), the technique/erőkör/kardió
tables (exercise name + sorozat/idő or ismétlés column, matching the
PDF's own tables), Levezetés (prose). This is static HTML built once per
day and swapped into `#planPanel` on day selection — no interactivity
needed beyond scrolling.

## Out of scope

- The 12-week progression table and the diet page (PDF pages 5–6) are
  not part of this feature — only the three day plans (pages 2–4) feed
  the app.
- No persistence (localStorage) of which day was last selected — out of
  scope unless requested later.
- No "custom timer" / generic day option — only the three PDF days are
  offered on the landing page, replacing today's hardcoded default
  intervals.
