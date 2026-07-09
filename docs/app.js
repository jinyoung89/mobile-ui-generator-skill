(() => {
  'use strict';

  const data = window.MobileUIGeneratorData;
  if (!data) return;

  const { translations = {}, skillOutputs = [], fonts = [] } = data;

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
    );

  function t(key, lang) {
    return translations[key]?.[lang] || translations[key]?.en || key;
  }

  function localized(value, lang) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value[lang] ?? value.en ?? value.ko ?? '';
    }
    return value ?? '';
  }

  function list(items, className = 'artifact-list') {
    return `<ul class="${className}">${(items || [])
      .map((item) => `<li>${escapeHTML(item)}</li>`)
      .join('')}</ul>`;
  }

  function uxRows(brief) {
    const entries = Object.entries(brief || {}).filter(([key]) =>
      ['goal', 'hierarchy', 'layout', 'interaction'].includes(key),
    );
    return entries
      .map(([key, value]) => `<div><b>${escapeHTML(key.replace(/_/g, ' '))}</b><p>${escapeHTML(value)}</p></div>`)
      .join('');
  }

  function renderSkillOutputs(lang) {
    const container = document.getElementById('exampleCards');
    if (!container) return;

    container.innerHTML = skillOutputs
      .map((item) => {
        const title = localized(item.title, lang);
        const brief = localized(item.brief, lang);
        const components = localized(item.components, lang);
        const states = localized(item.states, lang);
        const sourcePrompt = localized(item.sourcePrompt, lang);
        const fontReason = localized(item.fontProfile?.reason, lang);
        const appType = localized(item.appType, lang);
        const preview = localized(item.preview, lang);

        return `<article class="skill-output-card" aria-label="${escapeHTML(title)}">
          <div class="artifact-card-head">
            <span>${escapeHTML(t('examples.generatedLabel', lang))}</span>
            <h3>${escapeHTML(title)}</h3>
            <p><b>${escapeHTML(t('examples.promptLabel', lang))}</b> ${escapeHTML(sourcePrompt)}</p>
          </div>

          <figure class="artifact-preview">
            <img src="${escapeHTML(preview.src)}" alt="${escapeHTML(preview.alt)}" width="1200" height="760" loading="eager" decoding="async">
            <figcaption>${escapeHTML(t('examples.previewCaption', lang))}</figcaption>
          </figure>

          <section class="artifact-section direction-section">
            <h4>${escapeHTML(t('examples.patternLabel', lang))}</h4>
            <p><b>${escapeHTML(appType)}</b></p>
            <p>${escapeHTML(brief.layout || '')}</p>
          </section>

          <section class="artifact-section ux-section">
            <h4>${escapeHTML(t('examples.briefLabel', lang))}</h4>
            <div class="brief-rows">${uxRows(brief)}</div>
          </section>

          <section class="artifact-split">
            <div class="artifact-section">
              <h4>${escapeHTML(t('examples.componentsLabel', lang))}</h4>
              ${list(components)}
            </div>
            <div class="artifact-section">
              <h4>${escapeHTML(t('examples.statesLabel', lang))}</h4>
              ${list(states)}
            </div>
          </section>

          <section class="artifact-section font-artifact">
            <h4>Visual tone</h4>
            <p><b>${escapeHTML(item.fontProfile.family)}</b> · ${escapeHTML(fontReason)}</p>
          </section>
        </article>`;
      })
      .join('');
  }

  function renderFonts(lang) {
    const container = document.getElementById('fontCards');
    if (!container) return;

    const projectLabel = t('fonts.project', lang);
    const cssLabel = t('fonts.css', lang);

    container.innerHTML = fonts
      .map(
        (font) => `<article class="font-card">
          <span class="font-badge">${escapeHTML(localized(font.tag, lang))}</span>
          <h3>${escapeHTML(font.name)}</h3>
          <p>${escapeHTML(localized(font.desc, lang))}</p>
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
      if (translations[key]) node.textContent = t(key, nextLang);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const key = node.dataset.i18nAriaLabel;
      if (translations[key]) node.setAttribute('aria-label', t(key, nextLang));
    });

    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === nextLang));
    });

    renderSkillOutputs(nextLang);
    renderFonts(nextLang);

    if (options.navigate) {
      window.location.assign(targetUrlForLanguage(nextLang));
    }
  }

  document.querySelectorAll('[data-set-lang]').forEach((button) => {
    button.addEventListener('click', () =>
      setLanguage(button.dataset.setLang, { navigate: true }),
    );
  });

  setLanguage(getInitialLanguage());
})();
