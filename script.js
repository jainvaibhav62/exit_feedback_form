'use strict';

// ── Set this after deploying your Google Apps Script Web App ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmPSx-YGgbYOz-XGwZGs7yA0Hh-36c9_cv7H-2O-OeQlQU2PY5a8O3SHlphdwRBrRo/exec';
// ─────────────────────────────────────────────────────────────

let currentStep = 1;
const TOTAL_STEPS = 5;
const formData = {};
let _usedGenerator = false;

// ══════════════════════════════════════════
//  Navigation
// ══════════════════════════════════════════

function nextStep(from) {
  if (!validateStep(from)) return;
  collectStepData(from);

  const next = from >= TOTAL_STEPS ? 'step-complete' : `step-${from + 1}`;
  transition(`step-${from}`, next, 'forward');

  if (from < TOTAL_STEPS) currentStep = from + 1;
  updateProgress(currentStep);

  triggerStepAchievement(from);
}

function prevStep(from) {
  collectStepData(from);
  transition(`step-${from}`, `step-${from - 1}`, 'backward');
  currentStep = from - 1;
  updateProgress(currentStep);
}

function transition(fromId, toId, direction = 'forward') {
  const fromEl = document.getElementById(fromId);
  const toEl   = document.getElementById(toId);
  const cls    = direction === 'forward' ? 'slide-in-forward' : 'slide-in-backward';

  fromEl.classList.remove('active');
  toEl.classList.add('active', cls);
  toEl.addEventListener('animationend', () => toEl.classList.remove(cls), { once: true });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════
//  Progress Bar
// ══════════════════════════════════════════

function updateProgress(step) {
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${((step - 1) / TOTAL_STEPS) * 100}%`;

  document.querySelectorAll('.milestone').forEach((m, i) => {
    m.classList.toggle('active', i < step);
    m.classList.toggle('current', i === step - 1);
  });
}

// ══════════════════════════════════════════
//  Achievement Toasts
// ══════════════════════════════════════════

const _toasted = new Set();

function showToast(emoji, title, msg, key) {
  if (key && _toasted.has(key)) return;
  if (key) _toasted.add(key);

  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `<div class="toast-emoji">${emoji}</div><div><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
  document.body.appendChild(el);

  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));

  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 500);
  }, 4000);
}

function triggerStepAchievement(from) {
  if (from === 1) {
    setTimeout(() => showToast('🎖️', 'Witness Logged', 'Your identity is on the official record.', 'step1'), 400);
  }
}

// ══════════════════════════════════════════
//  Archetype Reveal
// ══════════════════════════════════════════

const ARCHETYPE_PROFILES = [
  { min: 9, type: 'The Complete Legend 🌟', desc: 'Checked nearly everything. According to you, this man did it all. A myth.' },
  { min: 7, type: 'The Indispensable One ⚡', desc: 'Nearly impossible to replace. His next team has no idea what\'s coming.' },
  { min: 5, type: 'The Well-Rounded Teammate 🎯', desc: 'Multiple dimensions. Not just a colleague — a genuinely complete person.' },
  { min: 3, type: 'The Focused Contributor 🔍', desc: 'You\'ve pinpointed exactly what made Vaibhav valuable. Specificity is respect.' },
  { min: 1, type: 'First Impressions 🌱',       desc: 'Keep selecting to build the full picture...' },
];

function updateArchetypeReveal() {
  const count   = document.querySelectorAll('input[name="archetypes"]:checked').length;
  const el      = document.getElementById('archetype-reveal');
  const typeEl  = document.getElementById('reveal-type');
  const descEl  = document.getElementById('reveal-desc');
  const labelEl = el.querySelector('.reveal-label');

  if (count === 0) {
    labelEl.textContent = 'Select traits above to unlock your reading...';
    typeEl.textContent  = '';
    descEl.textContent  = '';
    return;
  }

  const profile = ARCHETYPE_PROFILES.find(p => count >= p.min);
  labelEl.textContent = '✨ The Vaibhav you\'re describing is...';

  if (typeEl.textContent !== profile.type) {
    typeEl.style.animation = 'none';
    typeEl.offsetHeight; // reflow
    typeEl.style.animation = '';
    typeEl.textContent = profile.type;
  }
  descEl.textContent = profile.desc;

  if (count >= 7) {
    showToast('🌟', 'Legend Unlocked', 'You\'ve described the whole man. A complete portrait.', 'archetype7');
  }
}

// ══════════════════════════════════════════
//  Validation
// ══════════════════════════════════════════

function validateStep(step) {
  clearErrors();
  if (step !== 1) return true;

  const relationship   = document.getElementById('relationship').value;
  const workedTogether = document.querySelector('input[name="worked_together"]:checked');
  let ok = true;

  if (!relationship) {
    showError('relationship', "How did you work with Vaibhav? (We need at least this.)");
    ok = false;
  }
  if (!workedTogether) {
    const hint = document.createElement('p');
    hint.className = 'error-msg';
    hint.textContent = 'How long did you work together? Just a ballpark.';
    document.querySelector('input[name="worked_together"]').closest('.radio-grid').after(hint);
    ok = false;
  }
  return ok;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.classList.add('error');
  const p = document.createElement('p');
  p.className = 'error-msg';
  p.textContent = msg;
  el.after(p);
  el.addEventListener('change', () => {
    el.classList.remove('error');
    el.nextElementSibling?.classList.contains('error-msg') && el.nextElementSibling.remove();
  }, { once: true });
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.remove());
  document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}

// ══════════════════════════════════════════
//  Data Collection
// ══════════════════════════════════════════

function collectStepData(step) {
  if (step === 1) {
    formData.respondent_name = document.getElementById('respondent_name').value.trim() || 'Anonymous';
    formData.relationship    = document.getElementById('relationship').value;
    formData.worked_together = document.querySelector('input[name="worked_together"]:checked')?.value;
  }
  if (step === 2) {
    formData.working_style  = document.querySelector('input[name="working_style"]:checked')?.value;
    formData.responsiveness = document.querySelector('input[name="responsiveness"]:checked')?.value;
    formData.meeting_vibe   = document.getElementById('vibe-value').value;
    formData.impact_score   = document.getElementById('impact_score').value;
  }
  if (step === 3) {
    formData.archetypes     = [...document.querySelectorAll('input[name="archetypes"]:checked')].map(c => c.value);
    formData.vaibhav_moment = document.getElementById('vaibhav_moment').value.trim();
  }
  if (step === 4) {
    formData.things_will_miss = [...document.querySelectorAll('input[name="will_miss"]:checked')].map(c => c.value);
    formData.honest_feedback  = [...document.querySelectorAll('input[name="wont_miss"]:checked')].map(c => c.value);
  }
  if (step === 5) {
    formData.farewell_message = document.getElementById('farewell_message').value.trim();
    formData.rehire_score     = document.getElementById('rehire_score').value;
    formData.one_word         = document.getElementById('one_word').value.trim();
  }
}

// ══════════════════════════════════════════
//  Slider Reactions
// ══════════════════════════════════════════

const IMPACT_REACTIONS = [
  { max: 2,  text: "A blocker? That's rare honesty. Noted. 👀" },
  { max: 4,  text: "Some friction. Fair and useful feedback." },
  { max: 6,  text: "Solid. You got things done together." },
  { max: 8,  text: "A genuine force-multiplier. The good kind of colleague. ✨" },
  { max: 10, text: "A secret weapon. You're going to feel the gap. 🏆" },
];

const REHIRE_REACTIONS = [
  { max: 2,  text: "Yikes. We'll keep this between us. 🤫" },
  { max: 4,  text: "Some hesitation there. Growth opportunities were present." },
  { max: 6,  text: "You'd consider it. That's something!" },
  { max: 8,  text: "A definite yes. Vaibhav is reading this and smiling. 😊" },
  { max: 10, text: "Drag him to your next company. Don't ask, just drag. 🚀" },
];

function getReaction(val, list) {
  return (list.find(r => val <= r.max) ?? list[list.length - 1]).text;
}

function bindSlider(sliderId, numberId, reactionId, list) {
  const slider = document.getElementById(sliderId);
  const numEl  = document.getElementById(numberId);
  const reacEl = document.getElementById(reactionId);
  const update = () => {
    numEl.textContent  = slider.value;
    reacEl.textContent = getReaction(parseInt(slider.value), list);
  };
  slider.addEventListener('input', update);
  update();
}

// ══════════════════════════════════════════
//  Emoji Rating (Meeting Vibe)
// ══════════════════════════════════════════

const VIBE_LABELS = {
  '1': "Checked out. Meetings are hard. No judgment.",
  '2': "Present but quiet. Sometimes that's the move.",
  '3': "Engaged and contributing. A solid attendee.",
  '4': "Running the room. Others leaned in when he spoke. 🔥",
  '5': "The meeting was better because he was in it. Full stop. 🚀",
};

function initEmojiRating() {
  document.querySelectorAll('#vibe-rating .emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#vibe-rating .emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const val = btn.dataset.value;
      document.getElementById('vibe-value').value = val;
      document.getElementById('vibe-label').textContent = VIBE_LABELS[val];
    });
  });
}

// ══════════════════════════════════════════
//  Ledger Score
// ══════════════════════════════════════════

function updateLedgerScore() {
  const missCount     = document.querySelectorAll('input[name="will_miss"]:checked').length;
  const feedbackCount = document.querySelectorAll('input[name="wont_miss"]:checked').length;
  const scoreEl       = document.getElementById('ledger-score');
  const diff          = missCount - feedbackCount;

  let verdict;
  if (missCount === 0 && feedbackCount === 0) {
    verdict = "Select some items and watch the verdict appear...";
  } else if (diff > 3) {
    verdict = `Love: ${missCount} vs Feedback: ${feedbackCount} — You're going to miss this man. We can tell. 💙`;
  } else if (diff > 0) {
    verdict = `More love than critique. The good kind of bittersweet. 🥹`;
  } else if (diff === 0) {
    verdict = `A balanced perspective. Measured and fair. ⚖️ Namaste.`;
  } else if (diff < -3) {
    verdict = `Feedback: ${feedbackCount} vs Love: ${missCount} — Real talk. Vaibhav will appreciate the candor. 💪`;
  } else {
    verdict = `More growth notes than praise. Honest feedback done right. 📝`;
  }

  scoreEl.textContent = verdict;
}

// ══════════════════════════════════════════
//  Generate Message
// ══════════════════════════════════════════

function generateFarewell(type) {
  const name = formData.respondent_name || 'A Colleague';

  const templates = {
    sweet: `Vaibhav,

Working with you raised the bar for what I thought a great colleague looked like.

You have a rare ability to make complex things feel manageable, and to make people feel genuinely heard without even trying. The way you showed up — consistently, thoughtfully, with actual care for the work and the people doing it — is something I'll be thinking about long after you're gone.

You made this place better just by being in it. The next team gets to be lucky now.

Wishing you everything that comes next.

— ${name}`,

    roast: `Vaibhav,

Let me be honest: you're annoyingly good at this job, and it's been a little exhausting for the rest of us.

You set a standard we now have to quietly aspire to while pretending to be unbothered. The worst part? You're also a genuinely decent human, which means we can't even be properly jealous.

The bar is currently on the floor now that you're leaving. The floor.

Please try to be slightly less competent at your next place. For everyone's sake.

Good luck. We'll be over here, lowering expectations back to sustainable levels.

— ${name}

P.S. We're not actually lowering expectations. Your fault for raising them.`,
  };

  _usedGenerator = true;
  const ta = document.getElementById('farewell_message');
  ta.value = templates[type];
  ta.classList.add('just-filled');
  setTimeout(() => ta.classList.remove('just-filled'), 500);
}

// ══════════════════════════════════════════
//  Form Submit
// ══════════════════════════════════════════

async function submitForm() {
  collectStepData(5);

  const btn = document.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = '📬 Sending tribute...';

  // no-cors: Apps Script receives the POST; we can't read the response
  // cross-origin, so we show completion optimistically after a brief delay.
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(formData),
  });

  await new Promise(r => setTimeout(r, 900));
  showCompletion();

  const rehire = parseInt(formData.rehire_score);
  if (rehire === 10) setTimeout(() => showToast('🚀', 'Drag Him Back', 'A perfect 10. You\'d rehire immediately. We feel that.', 'rehire10'), 800);
  if (formData.farewell_message && !_usedGenerator) setTimeout(() => showToast('✍️', 'Words from the Heart', 'You wrote this yourself. That means something.', 'handwritten'), 1600);
}

// ══════════════════════════════════════════
//  Completion Screen
// ══════════════════════════════════════════

function showCompletion() {
  transition('step-5', 'step-complete');
  buildLegacy();
  launchConfetti();
  updateProgress(6);
}

function buildLegacy() {
  const parts = [];

  const submitter = formData.respondent_name || 'Anonymous';
  const rel       = formData.relationship    || 'A colleague';
  parts.push(`<p class="legacy-name">👤 <strong>${submitter}</strong> — ${rel} | ${formData.worked_together || 'Some time together'}</p>`);

  if (formData.working_style) {
    parts.push(`<p>⚡ Working style verdict: <strong>${formData.working_style}</strong></p>`);
  }

  if (formData.rehire_score) {
    const score   = parseInt(formData.rehire_score);
    const comment = score >= 9 ? '— drag him back immediately.' : score >= 7 ? '— a clear yes.' : score >= 5 ? '— you\'d consider it.' : '— honest is honest.';
    parts.push(`<p>🔄 "Would work with again" score: <strong>${score}/10</strong> ${comment}</p>`);
  }

  if (formData.one_word) {
    parts.push(`<p>🏷️ One word: <strong>"${formData.one_word}"</strong></p>`);
  }

  if (formData.things_will_miss?.length) {
    const n = formData.things_will_miss.length;
    parts.push(`<p>💙 Will miss <strong>${n} thing${n > 1 ? 's' : ''}</strong> about him — he left a mark.</p>`);
  }

  if (formData.farewell_message) {
    const firstLine = formData.farewell_message.split('\n').find(l => l.trim()) ?? '';
    parts.push(`<blockquote class="legacy-quote">"${firstLine}..."</blockquote>`);
  }

  if (!parts.length) {
    parts.push('<p>A tribute submitted with the quiet confidence of someone who knows exactly what they think.</p>');
  }

  document.getElementById('legacy-content').innerHTML = parts.join('');
}

// ══════════════════════════════════════════
//  Confetti
// ══════════════════════════════════════════

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const COLORS = ['#7c3aed','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#f97316','#14b8a6'];
  const pieces = Array.from({ length: 220 }, () => ({
    x:     Math.random() * canvas.width,
    y:     -(Math.random() * canvas.height * 0.6),
    w:     Math.random() * 13 + 5,
    h:     Math.random() * 7  + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:    (Math.random() - 0.5) * 7,
    vy:    Math.random() * 4 + 1.5,
    g:     0.04 + Math.random() * 0.06,
    r:     Math.random() * Math.PI * 2,
    rs:    (Math.random() - 0.5) * 0.18,
    op:    1,
  }));

  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.g;
      p.r  += p.rs;
      if (frame > 160) p.op -= 0.007;
      if (p.op <= 0) return;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.op);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 450) requestAnimationFrame(draw);
    else canvas.style.display = 'none';
  })();
}

// ══════════════════════════════════════════
//  Init
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step-1');
  step1.classList.add('slide-in-forward');
  step1.addEventListener('animationend', () => step1.classList.remove('slide-in-forward'), { once: true });

  updateProgress(1);
  initEmojiRating();

  bindSlider('impact_score', 'impact-number', 'impact-reaction', IMPACT_REACTIONS);
  bindSlider('rehire_score', 'rehire-number', 'rehire-reaction', REHIRE_REACTIONS);

  document.querySelectorAll('input[name="will_miss"], input[name="wont_miss"]')
    .forEach(cb => cb.addEventListener('change', updateLedgerScore));

  document.querySelectorAll('input[name="archetypes"]')
    .forEach(cb => cb.addEventListener('change', updateArchetypeReveal));

  document.getElementById('relationship').addEventListener('change', function () {
    this.classList.remove('error');
    this.nextElementSibling?.classList.contains('error-msg') && this.nextElementSibling.remove();
  });
});
