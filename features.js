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
