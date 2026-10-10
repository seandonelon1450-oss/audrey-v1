'use strict';
/* Arbor — shared site behavior.
 *  - Dark/adaptive theme: follows OS by default; header toggle overrides,
 *    choice stored on device (localStorage).
 *  - Scroll-triggered reveals: headings/cards/media only, once, <=600ms,
 *    max 4 staggered by 60ms. With no JS or reduced motion, everything
 *    is visible (no-motion state).
 *  - Respects prefers-reduced-motion: reveals render instantly visible. */
(function () {
  document.documentElement.classList.remove('no-js');

  /* ---------- theme ---------- */
  var THEME_KEY = 'arbor_theme';
  function applyTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (e) { /* storage unavailable: OS default stands */ }
  }
  applyTheme();
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next;
      if (current === 'dark') next = 'light';
      else if (current === 'light') next = 'dark';
      else next = prefersDark ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      document.documentElement.setAttribute('data-theme', next);
    });
  }

  /* ---------- reveals ---------- */
  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!els.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('no-motion'); });
    return;
  }
  var pending = 0;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      var delay = Math.min(pending, 3) * 60; // max 4 staggered by 60ms
      pending++;
      setTimeout(function () {
        el.classList.add('in');
        setTimeout(function () { pending = Math.max(0, pending - 1); }, 650);
      }, delay);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
