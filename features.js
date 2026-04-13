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
