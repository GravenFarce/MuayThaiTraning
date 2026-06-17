# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page interval training timer (Muay Thai round timer), entirely contained in [index.html](index.html). There is no build step, no package manager, no test suite, and no server-side code — HTML, CSS, and JavaScript all live inline in that one file.

## Running it

Open [index.html](index.html) directly in a browser (or serve the directory with any static file server). There is nothing to install or compile.

## Architecture

The script in `index.html` is organized into two cooperating "views" toggled via CSS classes on two top-level divs, plus a single global state model:

- **`#setupView`** — the interval editor. Backed by the `intervals` array (`{ id, name, color, seconds }`) and `rounds` count. `renderSetup()` re-renders the whole list from state on every mutation (add/delete/reorder/edit) — there's no diffing, just full innerHTML replacement. Event handling is delegated at the `#intervalsList` container level (`click`, `change`, `input`) using `data-*` attributes on row elements to identify the action and index, rather than per-row listeners.
- **`#timerView`** — the running countdown. On `START`, `intervals` × `rounds` is flattened into a single `seq` array (one entry per interval-occurrence across all rounds), and `seqIdx`/`timeLeft` walk through it on a 1-second `setInterval` (`tick()`). `updateTimerUI()` repaints the countdown ring (SVG `stroke-dashoffset`), the name/color, the round badge, and the mini per-round queue list from `seq`/`seqIdx`.
- **Audio cues** use the Web Audio API directly (`AudioContext`, no external libs/assets) — `beep()` is a generic oscillator-based tone, composed into `intervalEndBeep()`, `warningBeep()` (fires at 3/2/1 seconds remaining), and `finalBeep()` (three-tone completion chime). `ensureAudio()` lazily creates/resumes the `AudioContext` and must be called from within a user gesture (done in the `START` click handler) due to browser autoplay policies.
- Drag-to-reorder intervals is implemented manually for both mouse and touch (no library) by mutating the `intervals` array directly during `mousemove`/`touchmove` and calling `renderSetup()`.

When changing timer behavior, remember that `seq` is a flattened, pre-computed snapshot of intervals × rounds taken at `START` time — edits to `intervals` after starting do not affect a running timer.
