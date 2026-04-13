/* ================================================================
   features.js  —  Progressive feature additions
================================================================ */
'use strict';

const IS_MOBILE = window.innerWidth < 768;

/* ────────────────────────────────────────────────────────────────
   F1 — Custom Glowing Cursor Trail
──────────────────────────────────────────────────────────────── */
(function initCursor() {
  if (IS_MOBILE) return;

  document.body.classList.add('has-custom-cursor');

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function loopRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loopRing);
  }
  loopRing();

  const SELECTORS = 'a, button, .card-panel, canvas, .filter-pill, .cv-link, input, select, textarea';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(SELECTORS)) {
      dot.classList.add('hidden');
      ring.classList.add('expand');
      const accentColor = window.activeAccentColor || 'rgba(255,255,255,0.5)';
      ring.style.borderColor = accentColor;
    } else {
      dot.classList.remove('hidden');
      ring.classList.remove('expand');
      ring.style.borderColor = 'rgba(255,255,255,0.5)';
    }
  });

  window.spawnCursorParticles = function(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;width:4px;height:4px;border-radius:50%;background:${color};pointer-events:none;z-index:9998;left:${x}px;top:${y}px;transform:translate(-50%,-50%);`;
      document.body.appendChild(p);
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const dist  = 30 + Math.random() * 40;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px),calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => p.remove();
    }
  };
})();

/* ────────────────────────────────────────────────────────────────
   F2 — Ambient Space Audio Toggle (Web Audio API)
──────────────────────────────────────────────────────────────── */
(function initAudio() {
  const btn     = document.getElementById('audio-toggle');
  const iconOn  = document.getElementById('icon-sound-on');
  const iconOff = document.getElementById('icon-sound-off');
  const tooltip = document.getElementById('audio-tooltip');

  let ctx, masterGain, filter, playing = false;

  if (!localStorage.getItem('audioTooltipSeen')) {
    setTimeout(() => {
      tooltip.classList.add('show');
      setTimeout(() => {
        tooltip.classList.remove('show');
        localStorage.setItem('audioTooltipSeen', '1');
      }, 3000);
    }, 4000);
  }

  function buildAudio() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    [{ freq: 55, detune: 0 }, { freq: 110, detune: 8 }, { freq: 220, detune: -5 }].forEach(({ freq, detune }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.setValueAtTime(0.33, ctx.currentTime);
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      (function breathe() {
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 2);
        gain.gain.linearRampToValueAtTime(0.2, t + 4);
        setTimeout(breathe, 4000);
      })();
    });
  }

  btn.addEventListener('click', () => {
    if (!playing) {
      buildAudio();
      ctx.resume();
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
      playing = true;
      btn.classList.add('active');
      iconOn.style.display  = '';
      iconOff.style.display = 'none';
    } else {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => ctx.suspend(), 1100);
      playing = false;
      btn.classList.remove('active');
      iconOn.style.display  = 'none';
      iconOff.style.display = '';
    }
  });
})();

/* ────────────────────────────────────────────────────────────────
   F3 — Animated Skill Progress Bars
──────────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  let triggered = false;
  const observer = new IntersectionObserver(entries => {
    if (triggered || !entries[0].isIntersecting) return;
    triggered = true;
    observer.disconnect();
    grid.querySelectorAll('.skill-row').forEach((row, i) => {
      const pct = parseInt(row.dataset.pct, 10);
      const bar = row.querySelector('.skill-bar');
      const label = row.querySelector('.skill-pct');
      bar.style.background = row.dataset.gradient;
      setTimeout(() => {
        bar.style.width = pct + '%';
        const start = performance.now();
        (function count(now) {
          const val = Math.min(Math.round(((now - start) / 1200) * pct), pct);
          label.textContent = val + '%';
          label.style.color = row.dataset.gradient.match(/#[0-9a-f]{6}/i)?.[0] || '#4d9fff';
          if (val < pct) requestAnimationFrame(count);
        })(performance.now());
      }, i * 80);
    });
  }, { threshold: 0.3 });
  observer.observe(grid);
})();

/* ────────────────────────────────────────────────────────────────
   F4 — Contact Form with Validation
──────────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fName = document.getElementById('f-name');
  const fEmail = document.getElementById('f-email');
  const fMessage = document.getElementById('f-message');
  const submitBtn = document.getElementById('form-submit-btn');
  const success = document.getElementById('form-success');

  function setError(el, id, msg) {
    const e = document.getElementById(id);
    if (e) e.textContent = msg;
    msg ? el.classList.add('error') : el.classList.remove('error');
    return !!msg;
  }

  function validate() {
    let err = false;
    if (!fName.value.trim() || fName.value.trim().length < 2) err = setError(fName, 'err-name', 'Name must be at least 2 characters.') || err;
    else setError(fName, 'err-name', '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value.trim())) err = setError(fEmail, 'err-email', 'Please enter a valid email address.') || err;
    else setError(fEmail, 'err-email', '');
    if (!fMessage.value.trim() || fMessage.value.trim().length < 10) err = setError(fMessage, 'err-message', 'Message must be at least 10 characters.') || err;
    else setError(fMessage, 'err-message', '');
    return !err;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 600);
      return;
    }
    submitBtn.innerHTML = '<span class="btn-spinner"></span>';
    submitBtn.classList.add('loading');
    console.log('Form submission:', { name: fName.value, email: fEmail.value, type: document.getElementById('f-type').value, message: fMessage.value });
    setTimeout(() => {
      Array.from(form.querySelectorAll('.form-group')).forEach(g => { g.style.opacity = '0'; g.style.transition = 'opacity 0.3s'; });
      submitBtn.innerHTML = '✓ Sent!';
      submitBtn.classList.replace('loading', 'success');
      setTimeout(() => {
        Array.from(form.querySelectorAll('.form-group')).forEach(g => { g.style.display = 'none'; });
        submitBtn.style.display = 'none';
        success.style.display = 'flex';
      }, 400);
    }, 1500);
  });
})();
