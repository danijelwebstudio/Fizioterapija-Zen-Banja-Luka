/* === animations.js — cleaned, consolidated & robust === */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const safeQueryAll = (sel) => {
    try { return document.querySelectorAll(sel); }
    catch (e) { return []; }
  };
  const toArray = (nn) => Array.prototype.slice.call(nn || []);
  const isVisibleInDoc = (el) => !!(el && el.offsetParent !== null);

  /* ---------- REVEAL ON SCROLL (IntersectionObserver) ---------- */
  function initReveal() {
    const reveals = toArray(safeQueryAll('.reveal'));
    const staggerParents = toArray(safeQueryAll('.reveal-stagger'));
    if (!reveals.length && !staggerParents.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-reveal-delay');
            if (delay) el.style.setProperty('--reveal-delay', delay);
            // add revealed in RAF so CSS transition-delay is respected
            requestAnimationFrame(() => el.classList.add('revealed'));
            obs.unobserve(el);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12
      });

      reveals.forEach(el => io.observe(el));
      staggerParents.forEach(el => io.observe(el));
    } else {
      // fallback: basic scroll check
      const onScroll = () => {
        const vh = window.innerHeight;
        (reveals.concat(staggerParents)).forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.88) el.classList.add('revealed');
        });
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }
  }

  /* ---------- NAVBAR SHRINK ---------- */
  function initNavbarShrink() {
    const header = document.querySelector('.main-header') || document.querySelector('.navbar');
    if (!header) return;
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      if (y > 80) header.classList.add('shrink');
      else header.classList.remove('shrink');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- HERO PARALLAX (gentle) ---------- */
  function initHeroParallax() {
    const video = document.querySelector('.hero-video');
    if (!video) return;
    const max = 40;
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const shift = Math.min(max, Math.max(-max, y * 0.08));
      video.style.transform = `translateY(${shift}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  function initAnchorSmooth() {
    toArray(safeQueryAll('a[href^="#"]')).forEach(a => {
      // skip empty/placeholder hashes
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      // attach single listener safely
      if (a.__smoothBound) return;
      a.__smoothBound = true;
      a.addEventListener('click', (e) => {
        try {
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) { /* ignore malformed href */ }
      });
    });
  }

  /* ---------- BUTTON PRESS FEEDBACK ---------- */
  function initButtonFeedback() {
    toArray(safeQueryAll('button, .btn-anim, .cta-button')).forEach(btn => {
      if (btn.__animBound) return;
      btn.__animBound = true;
      btn.addEventListener('mousedown', () => {
        btn.style.transition = 'transform 120ms ease';
        btn.style.transform = 'scale(0.96)';
      });
      const up = () => { btn.style.transform = ''; };
      btn.addEventListener('mouseup', up);
      btn.addEventListener('mouseleave', up);
      btn.addEventListener('touchend', up, { passive: true });
      btn.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') up(); });
    });
  }

  /* ---------- REBUILD REVEAL (for dynamic content) ---------- */
  function initRebuildReveal() {
    const revealEls = toArray(safeQueryAll('.rebuild, .animated-element'));
    if (!revealEls.length) return;
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------- COUNTERS (single, robust implementation) ---------- */
  function initCounters() {
    const statEls = toArray(safeQueryAll('.stat'));
    if (!statEls.length) return;

    // Track which h3s have animated (avoid duplicates)
    const animated = new WeakSet();

    // format helper (locale sr-Latn; fallback to default)
    const formatNumber = (n) => {
      try { return n.toLocaleString('sr-Latn'); }
      catch (e) { return String(Math.round(n)); }
    };

    const animateValue = (el, start, end, duration, suffix) => {
      const startTime = performance.now();
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = easeOutCubic(t);
        const value = Math.floor(start + (end - start) * eased);
        el.textContent = formatNumber(value) + (suffix || '');
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = formatNumber(end) + (suffix || '');
      };
      requestAnimationFrame(step);
    };

    // IntersectionObserver to start counting when stat container is visible
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const container = entry.target;
          const h3 = container.querySelector('h3');
          if (!h3 || animated.has(h3)) { obs.unobserve(container); return; }

          // read text -> detect suffix plus
          const raw = h3.textContent.trim();
          const hasPlus = /\+$/.test(raw);
          // extract number (allow decimals with comma or dot)
          const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
          const target = Math.round(parseFloat(cleaned) || 0);

          animated.add(h3);
          h3.dataset.original = raw;

          // small start > 0 for smoother small numbers
          const startVal = 0;
          const duration = Math.max(900, Math.min(3000, target > 1000 ? 1800 : 1500));

          animateValue(h3, startVal, target, duration, hasPlus ? '+' : '');
          obs.unobserve(container);
        });
      }, { threshold: 0.35 });

      statEls.forEach(s => io.observe(s));
    } else {
      // fallback: trigger all
      statEls.forEach(container => {
        const h3 = container.querySelector('h3');
        if (!h3 || animated.has(h3)) return;
        const raw = h3.textContent.trim();
        const hasPlus = /\+$/.test(raw);
        const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
        const target = Math.round(parseFloat(cleaned) || 0);
        animated.add(h3);
        animateValue(h3, 0, target, 1500, hasPlus ? '+' : '');
      });
    }
  }

  /* ---------- MAIN INIT ---------- */
  function initAll() {
    try { initReveal(); } catch (e) { console.error('initReveal error', e); }
    try { initNavbarShrink(); } catch (e) { console.error('initNavbarShrink error', e); }
    try { initHeroParallax(); } catch (e) { console.error('initHeroParallax error', e); }
    try { initAnchorSmooth(); } catch (e) { console.error('initAnchorSmooth error', e); }
    try { initButtonFeedback(); } catch (e) { console.error('initButtonFeedback error', e); }
    try { initCounters(); } catch (e) { console.error('initCounters error', e); }
    try { initRebuildReveal(); } catch (e) { console.error('initRebuildReveal error', e); }

    // mark DOM so CSS can adapt if needed
    try { document.documentElement.classList.add('js-animations-ready'); } catch (e) {}
  }

  // Expose one stable API point
  window.__fzAnimations = window.__fzAnimations || {};
  window.__fzAnimations.initAll = initAll;

  // Run when page fully loaded (ensures images/videos measured correctly)
  if (document.readyState === 'complete') {
    initAll();
  } else {
    window.addEventListener('load', initAll, { passive: true });
  }

})();
