/* Samuel Rhawi by Nursel — script pagina Grancia */
(function () {
  'use strict';

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

  /* ====== BODY SCROLL LOCK (preserva la posizione di scroll) ====== */
  let savedScrollY = 0;
  function lockBody() {
    savedScrollY = window.scrollY;
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.classList.add('no-scroll');
  }
  function unlockBody() {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
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

  // Lingua iniziale: salvata > browser > 'it'
  const stored = (() => { try { return localStorage.getItem('sr_lang'); } catch (e) { return null; } })();
  const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  const initial = stored && T[stored] ? stored : (T[browser] ? browser : 'it');
  applyLanguage(initial);

  /* ====== REVEAL ON SCROLL ====== */
  const revealTargets = document.querySelectorAll(
    '.grancia-hero__content, .grancia-about__photos, .grancia-about__text, ' +
    '.section__head, .contact__info, .contact__map, .footer__hours-block, .footer__left'
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
})();
