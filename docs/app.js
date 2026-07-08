(() => {
  'use strict';

  const data = window.MobileUIGeneratorData;
  if (!data) return;

  const { translations, examples, fontBySlug, fonts } = data;

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
    );

  function renderExamples(lang) {
    const container = document.getElementById('exampleCards');
    if (!container) return;

    container.innerHTML = examples
      .map(([slug, theme, copyByLang]) => {
        const copy = copyByLang[lang];
        const font = fontBySlug[slug] || fontBySlug.fintech;
        const items = copy.items
          .map((item) => `<div class="mock-row">${escapeHTML(item)}</div>`)
          .join('');

        return `<article class="phone-card" aria-label="${escapeHTML(copy.cardTitle)}">
          <div class="phone ${escapeHTML(theme)} ${escapeHTML(font.className)}" lang="${escapeHTML(lang)}">
            <div class="status"></div>
            <div class="topbar"><span></span><strong>${escapeHTML(copy.nav)}</strong></div>
            <div class="mock-visual ${escapeHTML(slug)}"><small>${escapeHTML(copy.badge)}</small></div>
            <span class="font-chip">${escapeHTML(font.label)}</span>
            <h3>${escapeHTML(copy.title)}</h3>
            <p class="subcopy">${escapeHTML(copy.sub)}</p>
            <div class="mock-list">${items}</div>
            <span class="mock-button">${escapeHTML(copy.cta)}</span>
          </div>
          <h3>${escapeHTML(copy.cardTitle)}</h3>
          <p>${escapeHTML(copy.cardDesc)}</p>
        </article>`;
      })
      .join('');
  }

  function renderFonts(lang) {
    const container = document.getElementById('fontCards');
    if (!container) return;

    const projectLabel = translations['fonts.project'][lang];
    const cssLabel = translations['fonts.css'][lang];

    container.innerHTML = fonts
      .map(
        (font) => `<article class="font-card">
          <span class="font-badge">${escapeHTML(font.tag[lang])}</span>
          <h3>${escapeHTML(font.name)}</h3>
          <p>${escapeHTML(font.desc[lang])}</p>
          <div class="font-links">
            <a href="${escapeHTML(font.project)}" aria-label="${escapeHTML(font.name)} ${escapeHTML(projectLabel)}">${escapeHTML(projectLabel)}</a>
            <a href="${escapeHTML(font.css)}" aria-label="${escapeHTML(font.name)} ${escapeHTML(cssLabel)}">${escapeHTML(cssLabel)}</a>
          </div>
        </article>`,
      )
      .join('');
  }

  function getInitialLanguage() {
    if (window.location.pathname.replace(/\/$/, '').endsWith('/ko')) return 'ko';
    const param = new URLSearchParams(window.location.search).get('lang');
    return param === 'ko' ? 'ko' : 'en';
  }

  function targetUrlForLanguage(lang) {
    const hash = window.location.hash;
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const basePath = isLocal ? '/' : '/mobile-ui-generator-skill/';
    if (lang === 'ko') return `${basePath}ko/${hash}`;
    return `${basePath}${hash}`;
  }

  function setLanguage(lang, options = {}) {
    const nextLang = lang === 'ko' ? 'ko' : 'en';
    document.documentElement.lang = nextLang;
    document.body.dataset.lang = nextLang;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      if (translations[key]) node.textContent = translations[key][nextLang];
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const key = node.dataset.i18nAriaLabel;
      if (translations[key]) node.setAttribute('aria-label', translations[key][nextLang]);
    });

    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === nextLang));
    });

    renderExamples(nextLang);
    renderFonts(nextLang);

    if (options.navigate) {
      window.location.assign(targetUrlForLanguage(nextLang));
    }
  }

  function enableCarouselKeyboard() {
    const carousel = document.getElementById('exampleCards');
    if (!carousel) return;

    carousel.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const firstCard = carousel.querySelector('.phone-card');
      const step = firstCard ? firstCard.getBoundingClientRect().width + 20 : 360;
      carousel.scrollBy({
        left: event.key === 'ArrowRight' ? step : -step,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }

  document.querySelectorAll('[data-set-lang]').forEach((button) => {
    button.addEventListener('click', () =>
      setLanguage(button.dataset.setLang, { navigate: true }),
    );
  });

  setLanguage(getInitialLanguage());
  enableCarouselKeyboard();
})();
