/* Samuel Rhawi by Nursel — script principale */
(function () {
  'use strict';

  /* ====== PRELOADER ====== */
  // disabilita ripristino scroll automatico del browser (refresh)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Blocca scroll/interazioni durante l'intro cinematografica
  function lockScroll() {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
  }
  function unlockScroll() {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
  // forza la pagina in cima
  window.scrollTo(0, 0);
  lockScroll();

  // intercetta qualsiasi tentativo di scroll/touch durante il preloader
  function preventScroll(e) {
    if (document.documentElement.classList.contains('no-scroll')) {
      e.preventDefault();
    }
  }
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (!document.documentElement.classList.contains('no-scroll')) return;
    // blocca tasti che causano scroll
    const blocked = [' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (blocked.includes(e.key)) e.preventDefault();
  }, false);

  window.addEventListener('load', function () {
    const pre = document.getElementById('preloader');
    if (!pre) { unlockScroll(); return; }
    // attesa finché animazioni interne completano (~3.6s)
    setTimeout(() => {
      window.scrollTo(0, 0); // garantisce hero visibile
      pre.classList.add('is-hidden');
      // sblocca dopo che il tendone ha iniziato l'apertura
      setTimeout(() => {
        unlockScroll();
        window.scrollTo(0, 0);
      }, 200);
    }, 3800);
  });

  /* ====== YEAR ====== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ====== NAV: scroll state ====== */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 60) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ====== BODY SCROLL LOCK (preserva la posizione di scroll) ======
     body.no-scroll usa position:fixed → senza salvare/ripristinare la
     posizione la pagina tornerebbe in cima alla riapertura. */
  let savedScrollY = 0;
  function lockBody() {
    savedScrollY = window.scrollY;
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.classList.add('no-scroll');
  }
  function unlockBody() {
    // disabilita temporaneamente lo smooth scroll del CSS per evitare
    // l'animazione di ritorno alla posizione precedente
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    // ripristina al frame successivo
    requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
  }

  /* ====== BURGER ====== */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (nav) nav.classList.toggle('is-menu-open', open);
      if (open) lockBody(); else unlockBody();
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        if (nav) nav.classList.remove('is-menu-open');
        unlockBody();
      });
    });
  }

  /* ====== HERO SLIDESHOW ====== */
  const heroImgs = document.querySelectorAll('.hero__img');
  if (heroImgs.length > 1) {
    let idx = 0;
    setInterval(() => {
      heroImgs[idx].classList.remove('is-active');
      idx = (idx + 1) % heroImgs.length;
      heroImgs[idx].classList.add('is-active');
    }, 5500);
  }

  /* ====== LANGUAGE SWITCHER ====== */
  const lang = document.getElementById('lang');
  const langCurrent = document.getElementById('langCurrent');
  const langLabel = document.getElementById('langLabel');
  const T = window.TRANSLATIONS || {};

  function applyLanguage(code) {
    const dict = T[code];
    if (!dict) return;
    document.documentElement.setAttribute('lang', code);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    if (langLabel) langLabel.textContent = code.toUpperCase();
    if (lang) {
      lang.querySelectorAll('.lang__menu button').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-lang') === code);
      });
    }
    try { localStorage.setItem('sr_lang', code); } catch (e) {}
  }

  if (lang && langCurrent) {
    langCurrent.addEventListener('click', e => {
      e.stopPropagation();
      const open = lang.classList.toggle('is-open');
      langCurrent.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', () => {
      lang.classList.remove('is-open');
      langCurrent.setAttribute('aria-expanded', 'false');
    });
    lang.querySelectorAll('.lang__menu button').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-lang');
        applyLanguage(code);
        lang.classList.remove('is-open');
      });
    });
  }

  // Initial language: stored > browser > 'it'
  const stored = (() => { try { return localStorage.getItem('sr_lang'); } catch (e) { return null; } })();
  const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  const initial = stored && T[stored] ? stored : (T[browser] ? browser : 'it');
  applyLanguage(initial);

  /* ====== REVEAL ON SCROLL ====== */
  const revealTargets = document.querySelectorAll(
    '.section__head, .about__text, .about__media, .nursel__text, .nursel__media, ' +
    '.boutique__text, .boutique__media, .press__media, .press__text, ' +
    '.gallery__item, .review, .contact__info, .contact__map, .coming__inner, .quote__text'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ====== LIGHTBOX ====== */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbItems = Array.from(document.querySelectorAll('[data-lightbox]'));
  let lbIndex = 0;

  function openLb(i) {
    lbIndex = i;
    lbImg.src = lbItems[lbIndex].getAttribute('href');
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    lockBody();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    unlockBody();
  }
  function navLb(delta) {
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    lbImg.src = lbItems[lbIndex].getAttribute('href');
  }

  lbItems.forEach((el, i) => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openLb(i);
    });
  });
  if (lb) {
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    lbClose && lbClose.addEventListener('click', closeLb);
    lbPrev && lbPrev.addEventListener('click', e => { e.stopPropagation(); navLb(-1); });
    lbNext && lbNext.addEventListener('click', e => { e.stopPropagation(); navLb(1); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') navLb(-1);
      if (e.key === 'ArrowRight') navLb(1);
    });
  }

  /* ====== SMOOTH SCROLL — usa lo scroll-margin-top CSS di ogni sezione ======
     L'offset di ogni sezione è gestito in styles.css via le variabili
     --offset-<id>. Modifica lì per cambiare il punto in cui si ferma lo scroll. */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const cs = getComputedStyle(target);
      const margin = parseFloat(cs.scrollMarginTop) || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - margin;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
