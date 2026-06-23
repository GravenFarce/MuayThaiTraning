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
