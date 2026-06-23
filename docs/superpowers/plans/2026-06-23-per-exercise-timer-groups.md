# Per-Exercise Timer Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace each day's single monolithic preloaded timer with one mini-timer per bag-work exercise (its own preloaded intervals, Rounds, Start button, and fully editable interval list).

**Architecture:** `days-data.js`'s flat per-day `intervals` array becomes a `groups` array (one group per exercise). `app.js`'s single global `intervals`/`rounds` state becomes an array of group objects, each with its own `intervals`/`rounds`; a shared `#timerView` runs whichever group is currently active. `#setupView` is replaced by `#groupsView`, which renders one card per group, all expanded simultaneously.

**Tech Stack:** Plain HTML/CSS/JS, no build step, no framework, no test runner (verification is manual browser checks plus a Node-based data-integrity check).

## Global Constraints

- No build tools, bundlers, or new dependencies — stay plain HTML/CSS/JS.
- One group per bag-work table row, same order as today's flat list — per-day group/interval counts and total seconds must be unchanged: Day A = 3 groups / 14 intervals / 930s, Day B = 4 groups / 24 intervals / 1440s, Day C = 4 groups / 16 intervals / 1200s.
- Each group has its own `rounds`, defaulting to `1`, with its own +/- control (not shared across groups).
- All groups render expanded simultaneously, stacked — no accordion/collapse.
- Drag-reorder is scoped to one group — dragging a row into a different group's list is a no-op.
- The running timer (`#timerView`) stays confined to the right panel (unchanged from the existing behavior) and is shared across all groups — only one group's timer can run at a time.
- Left plan panel, landing page, day selection, and back-to-landing flow are unaffected — only the right panel's internal structure (`#setupView` → `#groupsView`) changes.

---

### Task 1: Restructure `days-data.js` — `intervals` → `groups`

**Files:**
- Modify: `days-data.js` (entire file)

**Interfaces:**
- Produces: `DAYS[id].groups` — `Array<{ name: string, detail: string, intervals: Array<{name, color, seconds}> }>`, replacing the old `DAYS[id].intervals`. `DAYS[id].sections`/`.warmupHtml`/`.cooldownHtml`/`.title`/`.subtitle`/`.accentColor` are unchanged. Task 4 (`app.js`) reads `DAYS[id].groups` inside `selectDay()`.

- [ ] **Step 1: Replace the entire contents of `days-data.js`**

Replace the whole file with:

```js
const DAYS = {
  A: {
    title: 'A nap — Váll + Mellkas + Muay Thai alapok',
    subtitle: '45–50 perc · pl. Hétfő',
    accentColor: '#C0392B',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 3 perc. Dinamikus vállkörzés előre-hátra — 20 ism. Mellkasnyitás (karok oldalra tárva, összecsukva) — 15 ism. Árnyékbox lazán, guardban — 2 perc.</p>',
    sections: [
      {
        title: 'Muay Thai technikaépítés — zsákon (8–22 perc)',
        color: '#2C6FA8',
        rows: [
          { exercise: 'Jab + Cross — csípőrotációval', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Hook — könyök szögben, mellkasból indítva', detail: '2×2 perc, 30 mp pihenő' },
          { exercise: 'Teep (talpas rúgás) — távolságtartó', detail: '2×1 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Váll + Mellkas erőkör — 3 forduló (22–42 perc, 60 mp pihenő fordulók között)',
        color: '#C0392B',
        rows: [
          { exercise: 'Fekvőtámasz (lassú, 2-1-2 tempó)', detail: '12 ism.' },
          { exercise: 'Egykezes vállnyomás állva', detail: '10 ism./oldal' },
          { exercise: 'Pike fekvőtámasz (csípő fent, vállra terhelve)', detail: '10 ism.' },
          { exercise: 'Egykezes evezés (asztalra támaszkodva)', detail: '10 ism./oldal' }
        ]
      }
    ],
    cooldownHtml: '<p>Mellizom nyújtás ajtófélfánál — 30 mp/oldal. Válltok nyújtás (kar átfogva) — 30 mp/oldal. Rekeszlégzés — 2 perc.</p>',
    groups: [
      {
        name: 'Jab+Cross',
        detail: '3×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Jab+Cross (1/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Jab+Cross (2/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Jab+Cross (3/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Hook',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Hook (1/2)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Hook (2/2)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Teep',
        detail: '2×1 perc, 30 mp pihenő',
        intervals: [
          { name: 'Teep (1/2)', color: '#6666CC', seconds: 60 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Teep (2/2)', color: '#6666CC', seconds: 60 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      }
    ]
  },
  B: {
    title: 'B nap — Has + Rúgástechnikák + Kardio',
    subtitle: '50–55 perc · pl. Szerda',
    accentColor: '#2C6FA8',
    warmupHtml: '<p>Helyben futás magas térdemeléssel — 2 perc. Jumping jack — 2 perc. Csípőkörzés, bokamobilizáció — 2×1 perc.</p>',
    sections: [
      {
        title: 'Muay Thai rúgások — zsákon (8–28 perc)',
        color: '#2C6FA8',
        rows: [
          { exercise: 'Low kick (combra, sípcsont belső éle)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Middle kick (csípő nyitás, teljes rotáció)', detail: '3×2 perc, 30 mp pihenő' },
          { exercise: 'Kombó: Jab → Cross → Middle kick', detail: '2×2 perc, 30 mp pihenő' }
        ]
      },
      {
        title: 'Has erőkör — 4 forduló (28–46 perc, 45 mp pihenő fordulók között)',
        color: '#C0392B',
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
        color: '#8B5A2B',
        rows: [
          { exercise: 'Zsákos intervall', detail: '4× (30 mp max intenzitás zsákon · 30 mp lassú árnyékbox)' }
        ]
      }
    ],
    cooldownHtml: '<p>Csípőhajlító nyújtás — 40 mp/oldal. Macska-tehén mozgás matacon — 1 perc.</p>',
    groups: [
      {
        name: 'Low kick',
        detail: '3×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Low kick (1/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Low kick (2/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Low kick (3/3)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Middle kick',
        detail: '3×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Middle kick (1/3)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Middle kick (2/3)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Middle kick (3/3)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Kombó: Jab-Cross-Middle kick',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Kombó: Jab-Cross-Middle kick (1/2)', color: '#6666CC', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Kombó: Jab-Cross-Middle kick (2/2)', color: '#6666CC', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Kardio finish',
        detail: '4× (30 mp max intenzitás zsákon · 30 mp lassú árnyékbox)',
        intervals: [
          { name: 'Max intenzitás zsákon (1/4)', color: '#CC2222', seconds: 30 },
          { name: 'Lassú árnyékbox (1/4)', color: '#6666CC', seconds: 30 },
          { name: 'Max intenzitás zsákon (2/4)', color: '#CC2222', seconds: 30 },
          { name: 'Lassú árnyékbox (2/4)', color: '#6666CC', seconds: 30 },
          { name: 'Max intenzitás zsákon (3/4)', color: '#CC2222', seconds: 30 },
          { name: 'Lassú árnyékbox (3/4)', color: '#6666CC', seconds: 30 },
          { name: 'Max intenzitás zsákon (4/4)', color: '#CC2222', seconds: 30 },
          { name: 'Lassú árnyékbox (4/4)', color: '#6666CC', seconds: 30 }
        ]
      }
    ]
  },
  C: {
    title: 'C nap — Teljes test kombók + Core integráció',
    subtitle: '50–55 perc · pl. Péntek / Szombat',
    accentColor: '#2E8B57',
    warmupHtml: '<p>Burpee lassítva, bemelegítő tempóban — 2 perc. Dinamikus nyújtás: váll, csípő, boka. Árnyékbox wai kru stílusban — 3 perc.</p>',
    sections: [
      {
        title: 'Kombók zsákon (8–30 perc, minden kombó 2×2 perc, 30 mp pihenő)',
        color: '#2C6FA8',
        rows: [
          { exercise: '1. Jab → Cross → Hook → Cross', detail: 'Alap 4 ütéses sorozat' },
          { exercise: '2. Teep → Jab → Cross → Middle kick', detail: 'Távolságváltás' },
          { exercise: '3. Hook → Body shot → Low kick', detail: '3. héttől' },
          { exercise: '4. Jab → Cross → Clinch → Térdütés', detail: '6. héttől (zsák megfogva)' }
        ]
      },
      {
        title: 'Komplex kondíciós kör — 3 forduló (30–48 perc, 90 mp munka, 60 mp pihenő fordulónként)',
        color: '#C0392B',
        rows: [
          { exercise: 'Burpee', detail: '10 ism.' },
          { exercise: 'Fekvőtámasz → rögtön egykezes vállnyomás', detail: '8 + 8 ism.' },
          { exercise: 'Jumping squat (robbanékony guggolás)', detail: '12 ism.' },
          { exercise: 'Plank', detail: 'maradék idő' }
        ]
      },
      {
        title: 'Core + Levezetés — matacon (48–55 perc)',
        color: '#707070',
        rows: [
          { exercise: 'Oblique crunch (ferde hasizom)', detail: '3×15 ism./oldal' },
          { exercise: 'Pigeon pose (csípő nyitás)', detail: '60 mp/oldal' },
          { exercise: 'Mellkas + vállnyújtás', detail: '2 perc' }
        ]
      }
    ],
    cooldownHtml: '',
    groups: [
      {
        name: 'Kombó 1: Jab-Cross-Hook-Cross',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Kombó 1: Jab-Cross-Hook-Cross (1/2)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Kombó 1: Jab-Cross-Hook-Cross (2/2)', color: '#FFA500', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Kombó 2: Teep-Jab-Cross-Middle kick',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (1/2)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Kombó 2: Teep-Jab-Cross-Middle kick (2/2)', color: '#CC2222', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Kombó 3: Hook-Body shot-Low kick',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Kombó 3: Hook-Body shot-Low kick (1/2)', color: '#6666CC', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Kombó 3: Hook-Body shot-Low kick (2/2)', color: '#6666CC', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      },
      {
        name: 'Kombó 4: Jab-Cross-Clinch-Térdütés',
        detail: '2×2 perc, 30 mp pihenő',
        intervals: [
          { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (1/2)', color: '#00AABB', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 },
          { name: 'Kombó 4: Jab-Cross-Clinch-Térdütés (2/2)', color: '#00AABB', seconds: 120 },
          { name: 'Pihenő', color: '#BBDD00', seconds: 30 }
        ]
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAYS };
}
```

- [ ] **Step 2: Verify with Node**

Run:

```bash
node -e "
const { DAYS } = require('./days-data.js');
const expected = { A: { groups: 3, count: 14, seconds: 930 }, B: { groups: 4, count: 24, seconds: 1440 }, C: { groups: 4, count: 16, seconds: 1200 } };
let ok = true;
for (const id of Object.keys(expected)) {
  const grps = DAYS[id].groups;
  const count = grps.reduce((s, g) => s + g.intervals.length, 0);
  const seconds = grps.reduce((s, g) => s + g.intervals.reduce((s2, iv) => s2 + iv.seconds, 0), 0);
  const exp = expected[id];
  if (grps.length !== exp.groups || count !== exp.count || seconds !== exp.seconds) {
    console.error('FAIL', id, { groups: grps.length, count, seconds }, 'expected', exp);
    ok = false;
  }
}
if (ok) console.log('PASS all day group totals match'); else process.exit(1);
"
```

Expected output: `PASS all day group totals match`

- [ ] **Step 3: Commit**

```bash
git add days-data.js
git commit -m "Restructure days-data.js: per-day intervals into per-exercise groups"
```

---

### Task 2: Replace `#setupView` markup with `#groupsView` in `index.html`

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: `#groupsView` (outer container, toggled via `.hidden` class exactly like `#setupView` was), `#groupsList` (inner container that Task 4's `renderGroups()` fills with one `.group-card` per group). No other markup changes.

- [ ] **Step 1: Replace the `#setupView` block**

Find:

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
          <span id="roundsDisplay">1</span>
          <button class="btn-outline" id="roundsPlus">+</button>
        </div>
      </div>

      <button class="btn-start" id="startBtn">START</button>
      <p style="text-align:center; margin-top:14px; font-size:1.2rem; font-weight:800; opacity:0.85;">📢 Don't forget to turn up the volume!</p>
    </div>
```

Replace with:

```html
    <!-- ═══════════ GROUPS VIEW ═══════════ -->
    <div id="groupsView">
      <p class="volume-reminder">📢 Don't forget to turn up the volume!</p>
      <div id="groupsList"></div>
    </div>
```

- [ ] **Step 2: Manual smoke test**

Open `index.html` in a browser. Confirm the page still loads with no console errors (it will show the landing page fine; the day view will currently be broken/empty until Tasks 3-4 land, since `app.js` still references the old `#setupView`/`#intervalsList`/etc. ids — that's expected at this point in the plan, this task only changes markup).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace #setupView markup with #groupsView for per-exercise groups"
```

---

### Task 3: Update `styles.css` for group cards

**Files:**
- Modify: `styles.css`

**Interfaces:**
- Consumes: nothing new (pure CSS).
- Produces: `.group-card`, `.group-header`, `.group-detail`, `.group-intervals`, `.group-footer`, `.rounds-display`, `.btn-start-group`, `#groupsView`/`#groupsView.hidden`, `.volume-reminder` — class names Task 4's `renderGroups()`/`renderGroupCard()` will emit.

- [ ] **Step 1: Replace the SETUP VIEW header block**

Find:

```css
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
```

Replace with:

```css
/* ─────────────── GROUPS VIEW ─────────────── */
#groupsView { max-width: 680px; margin: 0 auto; }
#groupsView.hidden { display: none; }

.volume-reminder {
  text-align: center;
  margin-bottom: 18px;
  font-size: 1.2rem;
  font-weight: 800;
  opacity: 0.85;
}

.group-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,.09);
}

.group-header {
  border-left: 6px solid #222;
  padding-left: 12px;
  margin-bottom: 14px;
}
.group-header h2 { font-size: 1.3rem; font-weight: 800; }
.group-detail { font-size: .85rem; opacity: .7; margin-top: 2px; }

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
.group-intervals { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
```

- [ ] **Step 2: Replace the Rounds/Start block**

Find:

```css
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
```

Replace with:

```css
/* Group footer: add-interval + rounds */
.group-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.rounds-controls { display: flex; align-items: center; justify-content: center; gap: 14px; }
.btn-outline {
  width: 40px; height: 40px;
  border: 2.5px solid #222;
  border-radius: 10px;
  background: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.btn-outline:hover { background: #f0f0f0; }
.rounds-display { font-size: 1.2rem; font-weight: 800; min-width: 30px; text-align: center; }

/* Group start button */
.btn-start-group {
  display: block;
  width: 100%;
  padding: 18px;
  background: #111; color: #fff;
  border: none; border-radius: 12px;
  font-size: 1.6rem; font-weight: 800; letter-spacing: 2px;
  cursor: pointer;
  transition: background .15s;
}
.btn-start-group:hover { background: #333; }
```

- [ ] **Step 3: Update the mobile media query**

Find (inside `@media (max-width: 600px) { ... }`):

```css
  .page-header h1 { font-size: 1.6rem; }
  .btn-add { padding: 8px 14px; font-size: .85rem; }
```

Replace with:

```css
  .group-header h2 { font-size: 1.1rem; }
  .btn-add { padding: 8px 14px; font-size: .85rem; }
```

Find:

```css
  .btn-outline { width: 44px; height: 44px; font-size: 1.4rem; }
  #roundsDisplay { font-size: 1.3rem; }

  .btn-start {
    padding: 20px;
    font-size: 2rem;
    max-width: 100%;
  }
```

Replace with:

```css
  .btn-outline { width: 36px; height: 36px; font-size: 1.2rem; }
  .rounds-display { font-size: 1.05rem; }

  .group-card { padding: 14px; }
  .btn-start-group {
    padding: 14px;
    font-size: 1.3rem;
  }
```

- [ ] **Step 4: Manual smoke test**

Open `index.html` in a browser. The day view's right panel will still be visually broken (empty `#groupsList`, since `app.js` hasn't been updated yet — that's Task 4). Confirm there are no CSS syntax errors by checking the browser devtools "Styles" panel shows no parse warnings, and that the landing page and left plan panel still render correctly (unaffected by this task).

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "Add group-card styles, replacing single setup-view styles"
```

---

### Task 4: Rewrite `app.js` to be group-aware

**Files:**
- Modify: `app.js` (entire file)

**Interfaces:**
- Consumes: `DAYS[id].groups` (Task 1), `#groupsView`/`#groupsList` (Task 2), `.group-card`/`.btn-start-group`/etc. CSS (Task 3, doesn't affect JS correctness but affects visual smoke test), `#landingView`/`#dayView`/`#planPanel`/`#trainerPanel`/`#backBtn`/`#timerView`/`#timerName`/`#timerRoundBadge`/`#ringFg`/`#timerCountdown`/`#timerQueue`/`#stopBtn`/`#dayButtons` (all pre-existing, unchanged ids).
- Produces: `groups` (array state), `activeGroupIdx`, `renderGroups()`, `renderGroupCard(g)`, `addIntervalToGroup(g, name, color, seconds)`, `startGroupTimer(g)`, `selectDay(dayId)`, `backToLanding()`, `renderDayButtons()`, `renderPlanPanel(dayId)`, `renderPlanSection(section)`, `esc(text)`, `fmt(seconds)`, `parseTimeInput(value)` — nothing outside this file consumes any of these (this is the last task that touches application logic).

- [ ] **Step 1: Replace the entire contents of `app.js`**

Replace the whole file with:

```js
// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────
const COLORS = ['#FFA500','#CC2222','#6666CC','#BBDD00','#00AABB','#FF6688','#22AA66','#EE7722'];
const CIRCUMFERENCE = 2 * Math.PI * 104; // ≈ 653.45

let groups = [];           // [{ name, detail, rounds, intervals: [{id,name,color,seconds}] }]
let nextId = 1;
let activeGroupIdx = null; // which group's timer is currently running

// Timer
let seq = [];
let seqIdx = 0;
let timeLeft = 0;
let totalTime = 0;
let tickHandle = null;
let audioCtx = null;

// Drag
let dragSrcGroupIdx = null;
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

// ──────────────────────────────────────────────────────────────
// Group interval mutations
// ──────────────────────────────────────────────────────────────
function addIntervalToGroup(g, name, color, seconds) {
  const grp = groups[g];
  const id = nextId++;
  grp.intervals.push({
    id,
    name: name ?? `Interval ${grp.intervals.length + 1}`,
    color: color ?? COLORS[grp.intervals.length % COLORS.length],
    seconds: seconds ?? 20
  });
  renderGroups();
}

// ──────────────────────────────────────────────────────────────
// Render groups
// ──────────────────────────────────────────────────────────────
function renderGroupCard(g) {
  const grp = groups[g];
  const accent = grp.intervals[0] ? grp.intervals[0].color : '#222';

  const rows = grp.intervals.map((iv, idx) => `
    <div class="interval-row" data-group="${g}" data-idx="${idx}">
      <div class="drag-handle" data-drag="${idx}" data-group="${g}">☰</div>
      <input class="interval-name" draggable="false"
             value="${esc(iv.name)}"
             data-field="name" data-group="${g}" data-idx="${idx}" />
      <div class="color-wrap">
        <button class="color-circle"
                style="background:${iv.color}"
                data-color-btn="${idx}" data-group="${g}"
                title="Change colour"></button>
        <input class="color-input" type="color"
               id="cp-${iv.id}" value="${iv.color}"
               data-color-input="${idx}" data-group="${g}" />
      </div>
      <div class="time-controls">
        <button class="btn-blk" data-minus="${idx}" data-group="${g}">−</button>
        <input class="time-label" type="text"
               value="${fmt(iv.seconds)}"
               data-time-input="${idx}" data-group="${g}"
               inputmode="numeric" />
        <button class="btn-blk" data-plus="${idx}" data-group="${g}">+</button>
      </div>
      <button class="btn-blk delete" data-delete="${idx}" data-group="${g}">✕</button>
    </div>
  `).join('');

  return `
    <div class="group-card" data-group-card="${g}">
      <div class="group-header" style="border-left-color:${accent}">
        <h2>${esc(grp.name)}</h2>
        <p class="group-detail">${esc(grp.detail)}</p>
      </div>
      <div class="group-intervals">${rows}</div>
      <div class="group-footer">
        <button class="btn-add" data-add-group="${g}">＋ Add Interval</button>
        <div class="rounds-controls">
          <button class="btn-outline" data-rounds-minus="${g}">−</button>
          <span class="rounds-display" data-rounds-display="${g}">${grp.rounds}</span>
          <button class="btn-outline" data-rounds-plus="${g}">+</button>
        </div>
      </div>
      <button class="btn-start-group" data-start-group="${g}">START</button>
    </div>
  `;
}

function renderGroups() {
  document.getElementById('groupsList').innerHTML =
    groups.map((_, g) => renderGroupCard(g)).join('');
}

// ──────────────────────────────────────────────────────────────
// Event delegation — groups view
// ──────────────────────────────────────────────────────────────
document.getElementById('groupsView').addEventListener('click', e => {
  const el = e.target;

  if (el.dataset.delete !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.delete;
    groups[g].intervals.splice(idx, 1);
    renderGroups();
    return;
  }

  if (el.dataset.plus !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.plus;
    groups[g].intervals[idx].seconds += 5;
    renderGroups();
    return;
  }

  if (el.dataset.minus !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.minus;
    const iv = groups[g].intervals[idx];
    iv.seconds = Math.max(5, iv.seconds - 5);
    renderGroups();
    return;
  }

  if (el.dataset.colorBtn !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.colorBtn;
    const iv = groups[g].intervals[idx];
    document.getElementById(`cp-${iv.id}`)?.click();
    return;
  }

  if (el.dataset.addGroup !== undefined) {
    addIntervalToGroup(+el.dataset.addGroup);
    return;
  }

  if (el.dataset.roundsMinus !== undefined) {
    const g = +el.dataset.roundsMinus;
    groups[g].rounds = Math.max(1, groups[g].rounds - 1);
    document.querySelector(`[data-rounds-display="${g}"]`).textContent = groups[g].rounds;
    return;
  }

  if (el.dataset.roundsPlus !== undefined) {
    const g = +el.dataset.roundsPlus;
    groups[g].rounds++;
    document.querySelector(`[data-rounds-display="${g}"]`).textContent = groups[g].rounds;
    return;
  }

  if (el.dataset.startGroup !== undefined) {
    startGroupTimer(+el.dataset.startGroup);
    return;
  }
});

// Name / color / time field changes
document.getElementById('groupsView').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.field === 'name' && el.dataset.idx !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.idx;
    groups[g].intervals[idx].name = el.value;
  }
  if (el.dataset.colorInput !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.colorInput;
    groups[g].intervals[idx].color = el.value;
    renderGroups();
  }
  if (el.dataset.timeInput !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.timeInput;
    const secs = parseTimeInput(el.value);
    if (secs !== null) {
      groups[g].intervals[idx].seconds = Math.max(5, secs);
    }
    renderGroups(); // always re-render to normalise display
  }
});

// Live color preview
document.getElementById('groupsView').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.colorInput !== undefined) {
    const g = +el.dataset.group, idx = +el.dataset.colorInput;
    groups[g].intervals[idx].color = el.value;
    const btn = document.querySelector(`[data-color-btn="${idx}"][data-group="${g}"]`);
    if (btn) btn.style.background = el.value;
  }
});

// ──────────────────────────────────────────────────────────────
// Drag to reorder (scoped to one group — cross-group drop is a no-op)
// ──────────────────────────────────────────────────────────────
document.getElementById('groupsView').addEventListener('mousedown', e => {
  const handle = e.target.closest('[data-drag]');
  if (!handle) return;
  dragSrcGroupIdx = +handle.dataset.group;
  dragSrcIdx = +handle.dataset.drag;
  e.preventDefault();

  const onMove = ev => {
    const row = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.interval-row');
    if (!row) return;
    const overGroupIdx = +row.dataset.group;
    const overIdx = +row.dataset.idx;
    if (overGroupIdx !== dragSrcGroupIdx) return; // no cross-group reordering

    if (overIdx !== dragSrcIdx && overIdx !== dragOverIdx) {
      dragOverIdx = overIdx;
      const list = groups[dragSrcGroupIdx].intervals;
      const [item] = list.splice(dragSrcIdx, 1);
      list.splice(overIdx, 0, item);
      dragSrcIdx = overIdx;
      renderGroups();
      document.querySelector(`.interval-row[data-group="${dragSrcGroupIdx}"][data-idx="${dragSrcIdx}"]`)
               ?.classList.add('dragging');
    }
  };

  const onUp = () => {
    dragSrcGroupIdx = null; dragSrcIdx = null; dragOverIdx = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    renderGroups();
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  document.querySelector(`.interval-row[data-group="${dragSrcGroupIdx}"][data-idx="${dragSrcIdx}"]`)
           ?.classList.add('dragging');
});

document.getElementById('groupsView').addEventListener('touchstart', e => {
  const handle = e.target.closest('[data-drag]');
  if (!handle) return;
  dragSrcGroupIdx = +handle.dataset.group;
  dragSrcIdx = +handle.dataset.drag;

  const onMove = ev => {
    ev.preventDefault();
    const touch = ev.touches[0];
    const row = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.interval-row');
    if (!row) return;
    const overGroupIdx = +row.dataset.group;
    const overIdx = +row.dataset.idx;
    if (overGroupIdx !== dragSrcGroupIdx) return;

    if (overIdx !== dragSrcIdx) {
      const list = groups[dragSrcGroupIdx].intervals;
      const [item] = list.splice(dragSrcIdx, 1);
      list.splice(overIdx, 0, item);
      dragSrcIdx = overIdx;
      renderGroups();
    }
  };
  const onEnd = () => {
    dragSrcGroupIdx = null; dragSrcIdx = null;
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}, { passive: true });

// ──────────────────────────────────────────────────────────────
// Start Timer (per group)
// ──────────────────────────────────────────────────────────────
function startGroupTimer(g) {
  const grp = groups[g];
  if (grp.intervals.length === 0) { alert('Add at least one interval first.'); return; }

  ensureAudio(); // create AudioContext inside user gesture
  activeGroupIdx = g;

  // Build flat sequence for this group only
  seq = [];
  for (let r = 1; r <= grp.rounds; r++) {
    grp.intervals.forEach(iv => seq.push({ ...iv, round: r }));
  }

  seqIdx = 0;
  timeLeft = seq[0].seconds;
  totalTime = seq[0].seconds;

  document.getElementById('groupsView').classList.add('hidden');
  document.getElementById('timerView').classList.add('active');
  document.getElementById('stopBtn').textContent = 'STOP';

  updateTimerUI();
  tickHandle = setInterval(tick, 1000);
}

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
  }

  updateTimerUI();
}

// ──────────────────────────────────────────────────────────────
// Update timer UI
// ──────────────────────────────────────────────────────────────
function updateTimerUI() {
  const cur = seq[seqIdx];
  const grp = groups[activeGroupIdx];

  // Name & color
  const nameEl = document.getElementById('timerName');
  nameEl.textContent = cur.name;
  nameEl.style.color = cur.color;

  // Countdown
  document.getElementById('timerCountdown').textContent = fmt(timeLeft);

  // Round badge
  document.getElementById('timerRoundBadge').textContent = `Round ${cur.round} of ${grp.rounds}`;

  // Ring progress
  const fraction = timeLeft / totalTime;
  const offset = CIRCUMFERENCE * (1 - fraction);
  const ring = document.getElementById('ringFg');
  ring.style.strokeDashoffset = offset;
  ring.setAttribute('stroke', cur.color);

  // Mini queue for current round
  const roundBase = (cur.round - 1) * grp.intervals.length;
  const queueHtml = grp.intervals.map((iv, i) => {
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
  document.getElementById('groupsView').classList.remove('hidden');
  // Reset timer name color
  document.getElementById('timerName').style.color = '';
  activeGroupIdx = null;
});

// ──────────────────────────────────────────────────────────────
// Day selection
// ──────────────────────────────────────────────────────────────
let currentDayId = null;

function renderDayButtons() {
  const wrap = document.getElementById('dayButtons');
  wrap.innerHTML = Object.keys(DAYS).map(id => {
    const day = DAYS[id];
    return `
      <button class="day-btn" data-day="${id}" style="border-left-color:${day.accentColor}">
        ${esc(day.title)}
        <span class="day-btn-sub">${esc(day.subtitle)}</span>
      </button>
    `;
  }).join('');
}

function renderPlanSection(section) {
  return `
    <div class="plan-block">
      <h2 style="background:${section.color};color:#fff">${esc(section.title)}</h2>
      <table class="plan-table">
        <thead><tr><th>Gyakorlat</th><th>Sorozat / Idő</th></tr></thead>
        <tbody>
          ${section.rows.map(r => `<tr><td>${esc(r.exercise)}</td><td>${esc(r.detail)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

const WARMUP_COLOR = '#3F9142';
const COOLDOWN_COLOR = '#707070';

function renderPlanPanel(dayId) {
  const day = DAYS[dayId];
  const panel = document.getElementById('planPanel');

  const warmupBlock = day.warmupHtml
    ? `<div class="plan-block"><h2 style="background:${WARMUP_COLOR};color:#fff">Bemelegítés</h2>${day.warmupHtml}</div>`
    : '';
  const cooldownBlock = day.cooldownHtml
    ? `<div class="plan-block"><h2 style="background:${COOLDOWN_COLOR};color:#fff">Levezetés</h2>${day.cooldownHtml}</div>`
    : '';

  panel.innerHTML = `
    <h1 class="plan-title" style="color:${day.accentColor}">${esc(day.title)}</h1>
    <p class="plan-subtitle">${esc(day.subtitle)}</p>
    ${warmupBlock}
    ${day.sections.map(renderPlanSection).join('')}
    ${cooldownBlock}
  `;
}

function selectDay(dayId) {
  const day = DAYS[dayId];
  if (!day) return;

  currentDayId = dayId;
  groups = day.groups.map(grp => ({
    name: grp.name,
    detail: grp.detail,
    rounds: 1,
    intervals: grp.intervals.map(iv => ({
      id: nextId++,
      name: iv.name,
      color: iv.color,
      seconds: iv.seconds
    }))
  }));
  renderGroups();
  renderPlanPanel(dayId);

  document.getElementById('landingView').classList.remove('active');
  document.getElementById('dayView').classList.add('active');
}

function backToLanding() {
  if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
  document.getElementById('timerView').classList.remove('active');
  document.getElementById('groupsView').classList.remove('hidden');
  document.getElementById('timerName').style.color = '';

  document.getElementById('dayView').classList.remove('active');
  document.getElementById('landingView').classList.add('active');
  currentDayId = null;
  groups = [];
  activeGroupIdx = null;
}

document.getElementById('dayButtons').addEventListener('click', e => {
  const btn = e.target.closest('[data-day]');
  if (btn) selectDay(btn.dataset.day);
});

document.getElementById('backBtn').addEventListener('click', backToLanding);

renderDayButtons();
```

Note: this rewrite intentionally drops the old `warningFired` variable, which the prior whole-branch review flagged as dead write-only code (assigned, never read) carried over from the original single-file version — it has no behavioral effect either way, so this is a no-op cleanup, not a functional change.

- [ ] **Step 2: Manual smoke test — Day A**

Open `index.html` in a browser. Click **A nap**. Confirm:
- Three group cards appear, stacked: "Jab+Cross" (6 rows: 3× work + 3× rest), "Hook" (4 rows), "Teep" (4 rows).
- Each card shows its `detail` caption (e.g. "3×2 perc, 30 mp pihenő") under its name.
- Each card has its own Rounds stepper showing `1`, its own "＋ Add Interval" button, and its own START button.
- Clicking **Jab+Cross**'s START button shows the timer (ring/countdown) in the right panel only — the left plan panel stays visible — starting with "Jab+Cross (1/3)" at `2:00`.
- Clicking **STOP** returns to the group-cards view (all 3 groups still present, including any edits made before starting).
- Editing **Hook**'s first row's name, dragging rows within Teep, and changing Jab+Cross's Rounds to `2` all work as before, scoped to that one card.
- Dragging a row from the Jab+Cross card and dropping it onto the Hook card's list does **not** move it across groups.
- No console errors.

- [ ] **Step 3: Manual smoke test — Day B and Day C**

Repeat the same checks for **B nap** (4 cards: Low kick, Middle kick, "Kombó: Jab-Cross-Middle kick", Kardio finish) and **C nap** (4 cards: Kombó 1-4). Confirm each card's interval count matches Task 1's data (Low kick 6, Middle kick 6, Kombó 4, Kardio finish 8; each C-day Kombó 4).

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Rewrite app.js for per-exercise timer groups"
```

---

### Task 5: Final end-to-end verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-4.
- Produces: nothing — this task confirms the whole feature works together.

- [ ] **Step 1: Re-run the Task 1 Node check**

```bash
node -e "
const { DAYS } = require('./days-data.js');
const expected = { A: { groups: 3, count: 14, seconds: 930 }, B: { groups: 4, count: 24, seconds: 1440 }, C: { groups: 4, count: 16, seconds: 1200 } };
let ok = true;
for (const id of Object.keys(expected)) {
  const grps = DAYS[id].groups;
  const count = grps.reduce((s, g) => s + g.intervals.length, 0);
  const seconds = grps.reduce((s, g) => s + g.intervals.reduce((s2, iv) => s2 + iv.seconds, 0), 0);
  const exp = expected[id];
  if (grps.length !== exp.groups || count !== exp.count || seconds !== exp.seconds) {
    console.error('FAIL', id, { groups: grps.length, count, seconds }, 'expected', exp);
    ok = false;
  }
}
if (ok) console.log('PASS all day group totals match'); else process.exit(1);
"
```

Expected output: `PASS all day group totals match`

- [ ] **Step 2: Full browser walkthrough**

Open `index.html` and walk through, for **each of the 3 days**:
1. Landing page → click the day → group cards render with the right names/counts (per Task 4's smoke test).
2. Start one group's timer, let it run a few seconds, confirm the left plan panel is still visible and the ring/countdown updates.
3. Click STOP → back to the group cards, with all groups (including the one just run) intact.
4. Start a different group in the same day, let it finish naturally (or fast-forward by setting a row's time very low via the time input) and confirm the "Done! 🎉" state appears, then auto-returns to the group cards after 5 seconds.
5. Click "← Napválasztó" → returns to the landing page.
6. No console errors at any point across all 3 days.

- [ ] **Step 3: Confirm CLAUDE.md still describes the architecture accurately**

Read `CLAUDE.md`. Its `### days-data.js — the DAYS model` and `### Setup/timer engine` sections currently describe a single flat `intervals`/`rounds` per day. Update it to describe the new `groups` model and the per-group timer behavior. Replace the paragraph that currently reads:

```
Each day (`'A'`, `'B'`, `'C'`) has `{ title, subtitle, warmupHtml, sections, cooldownHtml, intervals }`. `intervals` is a **fully unrolled** flat list — every set/round of every exercise is its own named entry (e.g. `"Jab+Cross (1/3)"`, `"Fekvőtámasz (kör 2/3)"`) with explicit `"Pihenő"` (rest) entries interspersed, rather than relying on the timer's round-repeat mechanism. This is why `rounds` is always set to `1` when a day is selected — the day's own repetition is already baked into the array. The Rounds +/- control stays fully functional regardless (a user can still multiply the whole day's sequence if they want).
```

with:

```
Each day (`'A'`, `'B'`, `'C'`) has `{ title, subtitle, warmupHtml, sections, cooldownHtml, groups }`. `groups` is one entry per bag-work exercise (e.g. `Jab+Cross`, `Hook`, `Teep`), each with `{ name, detail, intervals }`. Each group's `intervals` is a **fully unrolled** flat list for that exercise alone — every set is its own named entry (e.g. `"Jab+Cross (1/3)"`) with explicit `"Pihenő"` (rest) entries interspersed. `selectDay()` copies this into the runtime `groups` array, giving each group its own `rounds` (default `1`, independently adjustable per group).
```

Also replace:

```
- **`#setupView`** — the interval editor. Backed by the `intervals` array (`{ id, name, color, seconds }`) and `rounds` count. `renderSetup()` re-renders the whole list from state on every mutation (add/delete/reorder/edit) — there's no diffing, just full innerHTML replacement. Event handling is delegated at the `#intervalsList` container level (`click`, `change`, `input`) using `data-*` attributes on row elements to identify the action and index, rather than per-row listeners.
- **`#timerView`** — the running countdown, confined to `#trainerPanel` (not full-screen). On `START`, `intervals` × `rounds` is flattened into a single `seq` array (one entry per interval-occurrence across all rounds), and `seqIdx`/`timeLeft` walk through it on a 1-second `setInterval` (`tick()`). `updateTimerUI()` repaints the countdown ring (SVG `stroke-dashoffset`), the name/color, the round badge, and the mini per-round queue list from `seq`/`seqIdx`.
```

with:

```
- **`#groupsView`** — one `.group-card` per exercise group, all rendered expanded simultaneously by `renderGroups()`/`renderGroupCard(g)`. Each card is its own interval editor (add/delete/reorder/edit), backed by `groups[g].intervals` and `groups[g].rounds` — re-rendered wholesale on every mutation, same full-innerHTML-replacement approach as the original single-list version. Event handling is delegated once at the `#groupsView` container level (`click`, `change`, `input`), using both `data-group` and `data-idx` attributes to address `groups[g].intervals[i]`. Drag-reorder is scoped per group: a drop target belonging to a different group is ignored.
- **`#timerView`** — the running countdown, confined to `#trainerPanel` (not full-screen), shared across all groups — only one group runs at a time, tracked via `activeGroupIdx`. Clicking a group's own START button flattens `groups[g].intervals` × `groups[g].rounds` into `seq`, and `seqIdx`/`timeLeft` walk through it on a 1-second `setInterval` (`tick()`). `updateTimerUI()` repaints the countdown ring (SVG `stroke-dashoffset`), the name/color, the round badge (`Round X of groups[activeGroupIdx].rounds`), and the mini per-round queue list from `seq`/`seqIdx`. Stop (or the automatic return after "Done") shows `#groupsView` again, preserving every group's edited state.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md for the per-exercise timer-group architecture"
```
