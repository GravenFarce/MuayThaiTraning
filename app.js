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
// Day selection
// ──────────────────────────────────────────────────────────────
let currentDayId = null;

const WARMUP_COLOR = '#3F9142';
const COOLDOWN_COLOR = '#707070';

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
  intervals = day.intervals.map(iv => ({
    id: nextId++,
    name: iv.name,
    color: iv.color,
    seconds: iv.seconds
  }));
  rounds = 1;
  renderSetup();
  renderPlanPanel(dayId);

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
