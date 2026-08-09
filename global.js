/* ===================================================
   KARVION AI — Global JavaScript
   =================================================== */
'use strict';

/* ── NAV ──────────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // scroll class
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 18);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // scroll progress bar
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    const tick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  // hamburger
  const ham = document.querySelector('.ham');
  const drawer = document.querySelector('.nav-drawer');
  if (ham && drawer) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
    // close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !drawer.contains(e.target)) {
        ham.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-center a, .nav-drawer a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* ── TOAST ─────────────────────────────────────────── */
window.toast = function (msg, type = 'info', ms = 3400) {
  let root = document.getElementById('toast-root');
  if (!root) { root = document.createElement('div'); root.id = 'toast-root'; document.body.appendChild(root); }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity 0.3s, transform 0.3s'; el.style.opacity = '0'; el.style.transform = 'translateX(10px)'; setTimeout(() => el.remove(), 320); }, ms);
};

/* ── SCROLL REVEAL ─────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !window.IntersectionObserver) {
    els.forEach(e => e.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const d = parseFloat(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), d * 1000);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(e => io.observe(e));
})();

/* ── COUNTER ────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || !window.IntersectionObserver) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ── FAQ ────────────────────────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.classList.contains('open');
    document.querySelectorAll('.faq-q.open').forEach(b => { b.classList.remove('open'); b.nextElementSibling?.classList.remove('open'); });
    if (!open) { btn.classList.add('open'); btn.nextElementSibling?.classList.add('open'); }
  });
});

/* ── CHANGELOG toggles ──────────────────────────────── */
document.querySelectorAll('.cl-header').forEach(h => {
  h.addEventListener('click', () => {
    h.nextElementSibling?.classList.toggle('open');
  });
});

/* ── PARTICLES ──────────────────────────────────────── */
window.startParticles = function (id = 'pc') {
  const canvas = document.getElementById(id);
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const pts = Array.from({ length: 65 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.3 + 0.3,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    a: Math.random(),
    da: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.a += p.da;
      if (p.a > 1 || p.a < 0) p.da *= -1;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.a * 0.38})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
};

/* ── SMOOTH ANCHOR ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' }); }
  });
});

/* ── COPY ───────────────────────────────────────────── */
window.copy = function (text) { navigator.clipboard.writeText(text).then(() => toast('Copied!', 'success')); };

/* ── STICKY AD CLOSE ────────────────────────────────── */
document.querySelectorAll('.ad-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const ad = btn.closest('.sticky-bottom-ad');
    if (ad) ad.remove();
  });
});

/* ═══════════════════════════════════════════════════════════
   KARVION AI — PREMIUM MOTION ENGINE (UI/UX v3)
   ═══════════════════════════════════════════════════════════ */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePtr = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Custom cursor glow + dot ─────────────────────────── */
  if (finePtr && !reduced) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.body.classList.add('custom-cursor');

    var mx = -100, my = -100, dx = -100, dy = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function follow() {
      dx += (mx - dx) * 0.14; dy += (my - dy) * 0.14;
      glow.style.left = dx + 'px'; glow.style.top = dy + 'px';
      requestAnimationFrame(follow);
    })();
    document.addEventListener('mouseover', function (e) {
      var hot = !!e.target.closest('a, button, .feat-card, .mock-window, [data-magnetic], .social-col a');
      dot.classList.toggle('is-link', hot);
      glow.classList.toggle('is-link', hot);
    });
  }

  /* ── 3D tilt on [data-tilt] cards ─────────────────────── */
  if (!reduced && finePtr) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.classList.add('tilt');
      var rect, maxX = 9, maxY = 9;
      el.addEventListener('mousemove', function (e) {
        rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * maxX;
        var ry = (px - 0.5) * maxY;
        el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ── Magnetic buttons ─────────────────────────────────── */
  if (finePtr && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.3;
        var y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ── Letter-split hero titles ─────────────────────────── */
  if (!reduced) {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var text = el.textContent.trim();
      el.textContent = '';
      el.classList.add('split-title');
      text.split(' ').forEach(function (w) {
        var word = document.createElement('span');
        word.className = 'word';
        var inner = document.createElement('span');
        inner.textContent = w;
        word.appendChild(inner);
        el.appendChild(word);
        el.appendChild(document.createTextNode(' '));
      });
      setTimeout(function () { el.classList.add('visible'); }, 120);
    });
  }

  /* ── Reveal variants ──────────────────────────────────── */
  var revIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        revIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var type = el.getAttribute('data-reveal') || 'fade';
    if (type === 'left') el.classList.add('reveal-left');
    else if (type === 'right') el.classList.add('reveal-right');
    else if (type === 'zoom') el.classList.add('reveal-zoom');
    else if (type === 'blur') el.classList.add('reveal-blur');
    revIO.observe(el);
  });

  /* ── Stagger containers ───────────────────────────────── */
  var stIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('visible'); stIO.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-stagger]').forEach(function (el) { stIO.observe(el); });

  /* ── Floating orbs ────────────────────────────────────── */
  if (!reduced) {
    [1, 2, 3].forEach(function (n) {
      var orb = document.createElement('div');
      orb.className = 'orb orb-' + n;
      document.body.appendChild(orb);
    });
  }

  /* ── Back to top ──────────────────────────────────────── */
  var totop = document.createElement('button');
  totop.className = 'to-top';
  totop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  totop.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(totop);
  window.addEventListener('scroll', function () {
    totop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  totop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ── Smooth theme transition class ────────────────────── */
  document.documentElement.classList.add('theme-anim');
  setTimeout(function () { document.documentElement.classList.remove('theme-anim'); }, 900);
})();

  /* ── Theme toggle (auto-inject into nav, if missing) ──── */
  (function () {
    if (!window.KarvionThemes) return;
    if (document.getElementById('themeToggle')) return;
    var navEnd = document.querySelector('.nav-end');
    var host = navEnd || document.querySelector('.nav') || document.body;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'themeToggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.title = 'Light / Dark';
    btn.innerHTML = '<i class="fa-solid fa-moon"></i><i class="fa-solid fa-sun"></i>';
    btn.addEventListener('click', function () {
      window.KarvionThemes.toggleMode();
      document.documentElement.classList.add('theme-anim');
      setTimeout(function () { document.documentElement.classList.remove('theme-anim'); }, 700);
    });
    if (navEnd) navEnd.insertBefore(btn, navEnd.firstChild);
    else host.appendChild(btn);
  })();

