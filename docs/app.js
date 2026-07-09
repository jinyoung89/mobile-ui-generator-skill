(() => {
  'use strict';

  const data = window.MobileUIGeneratorData;
  if (!data) return;

  const {
    translations = {},
    examples = [],
    fontBySlug = {},
    fonts = [],
    appCategories = [],
    uiPatternCategories = [],
    skillOutputs = [],
    previewVersion = '',
  } = data;

  let selectedAppType = 'all';
  let selectedPattern = 'all';

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

  function withAssetVersion(src) {
    if (!previewVersion) return src;
    return `${src}${src.includes('?') ? '&' : '?'}v=${encodeURIComponent(previewVersion)}`;
  }

  const list = (items, className = 'ui-list') =>
    `<div class="${className}">${(items || [])
      .map((item) => `<div>${escapeHTML(item)}</div>`)
      .join('')}</div>`;

  const chips = (items, className = 'chip-row') =>
    `<div class="${className}">${(items || [])
      .map((item) => `<span>${escapeHTML(item)}</span>`)
      .join('')}</div>`;

  function matchesAppType(example, id) {
    return id === 'all' || example.appCategories.includes(id);
  }

  function matchesPattern(example, id) {
    return id === 'all' || example.uiPatterns.includes(id);
  }

  function visibleExamples() {
    return examples.filter(
      (example) => matchesAppType(example, selectedAppType) && matchesPattern(example, selectedPattern),
    );
  }

  function countFor(axis, id) {
    return examples.filter((example) => {
      const appOk = axis === 'app' ? matchesAppType(example, id) : matchesAppType(example, selectedAppType);
      const patternOk = axis === 'pattern' ? matchesPattern(example, id) : matchesPattern(example, selectedPattern);
      return appOk && patternOk;
    }).length;
  }

  function renderExampleSummary(lang) {
    const summary = document.getElementById('exampleSummary');
    if (!summary) return;

    const visibleCount = visibleExamples().length;
    const fontCount = new Set(examples.map((example) => fontBySlug[example.slug]?.label).filter(Boolean)).size;
    summary.textContent = `${translations['views.summary.showing'][lang]} ${visibleCount} / ${examples.length} · ${appCategories.length - 1} ${translations['views.summary.apps'][lang]} · ${uiPatternCategories.length - 1} ${translations['views.summary.patterns'][lang]} · ${fontCount} ${translations['views.summary.fonts'][lang]}`;
  }

  function renderFilterGroup(lang, axis, categories, selectedValue) {
    const container = document.getElementById(axis === 'app' ? 'exampleAppFilters' : 'examplePatternFilters');
    if (!container) return;

    container.innerHTML = categories
      .map((category) => {
        const count = category.id === 'all'
          ? (axis === 'app'
              ? examples.filter((example) => matchesPattern(example, selectedPattern)).length
              : examples.filter((example) => matchesAppType(example, selectedAppType)).length)
          : countFor(axis, category.id);
        if (category.id !== 'all' && count === 0 && selectedValue !== category.id) return '';
        return `<button type="button" class="category-chip" data-${axis}="${escapeHTML(category.id)}" aria-pressed="${String(selectedValue === category.id)}">
          <span>${escapeHTML(category.label[lang])}</span>
          <em>${count}</em>
        </button>`;
      })
      .join('');

    container.querySelectorAll(`[data-${axis}]`).forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (axis === 'app') selectedAppType = button.dataset.app || 'all';
        if (axis === 'pattern') selectedPattern = button.dataset.pattern || 'all';
        renderFilters(lang);
        renderExamples(lang);
      });
    });
  }

  function renderFilters(lang) {
    renderFilterGroup(lang, 'app', appCategories, selectedAppType);
    renderFilterGroup(lang, 'pattern', uiPatternCategories, selectedPattern);
  }

  function phoneFrame(example, lang, inner) {
    const copy = example.copy[lang];
    const font = fontBySlug[example.slug] || fontBySlug['fintech-auth'];
    return `<article class="phone-card" aria-label="${escapeHTML(copy.cardTitle)}" data-app-types="${escapeHTML(example.appCategories.join(' '))}" data-ui-patterns="${escapeHTML(example.uiPatterns.join(' '))}" data-layout="${escapeHTML(example.layout)}" data-mode="${escapeHTML(example.mode)}">
      <div class="phone ${escapeHTML(example.theme)} ${escapeHTML(font.className)}" lang="${escapeHTML(lang)}">
        <div class="status"><span>9:41</span><span>●●●</span></div>
        ${inner}
      </div>
      <h3>${escapeHTML(copy.cardTitle)}</h3>
      <p>${escapeHTML(copy.cardDesc)}</p>
    </article>`;
  }

  function renderAuth(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong><small>1/3</small></div>
      <main class="screen auth-screen">
        <span class="semantic-badge">${escapeHTML(c.note)}</span>
        <h3>${escapeHTML(c.title)}</h3>
        <p>${escapeHTML(c.sub)}</p>
        <label>${escapeHTML(c.fields[0])}</label><div class="field filled">010 2345 6789</div>
        <label>${escapeHTML(c.fields[1])}</label><div class="field focus">128 4<span>02:58</span></div>
        <div class="check-row"><i></i>${escapeHTML(c.fields[2])}</div>
      </main>
      <button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderOnboarding(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen onboarding-screen">
      <div class="orbital"><i></i><i></i><i></i></div>
      <h3>${escapeHTML(c.title)}</h3>
      <p>${escapeHTML(c.sub)}</p>
      ${chips(c.chips)}
      <div class="step-list">${(c.steps || []).map((step, index) => `<div><b>${index + 1}</b>${escapeHTML(step)}</div>`).join('')}</div>
    </main>
    <button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderCheckout(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div>
      <main class="screen checkout-screen">
        <div class="checkout-hero"><small>${escapeHTML(c.total)}</small><b>${escapeHTML(c.title)}</b></div>
        <p>${escapeHTML(c.sub)}</p>
        ${list(c.rows, 'summary-list')}
        <div class="legal-note">✓ Secure payment · clear cancellation</div>
      </main>
      <button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderHome(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div>
      <main class="screen home-dashboard-screen">
        <section class="balance-card"><small>${escapeHTML(c.title)}</small><b>${escapeHTML(c.metric)}</b><p>${escapeHTML(c.sub)}</p></section>
        <div class="action-grid">${(c.actions || []).map((item) => `<button>${escapeHTML(item)}</button>`).join('')}</div>
        ${list(c.feed, 'feed-list')}
      </main>
      <button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }

  function renderDelivery(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="delivery-map"><div class="route-line"></div><strong>${escapeHTML(c.eta)}</strong></div>
      <section class="delivery-sheet">
        <h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>
        <div class="timeline">${(c.steps || []).map((step) => `<div><i></i><span>${escapeHTML(step)}</span></div>`).join('')}</div>
        <button>${escapeHTML(c.cta)}</button>
      </section>`);
  }

  function renderMap(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="map-canvas"><button>${escapeHTML(c.nav)}</button><i></i></div>
      <section class="map-sheet"><span></span><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.routes, 'route-options')}<button>${escapeHTML(c.cta)}</button></section>`);
  }

  function renderTransfer(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar darkbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div>
      <main class="screen transfer-screen"><p>${escapeHTML(c.receiver)}</p><h3>${escapeHTML(c.amount)}</h3><small>${escapeHTML(c.sub)}</small>${chips(c.quick, 'amount-row')}<div class="keypad"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>00</span><span>0</span><span>⌫</span></div></main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderDanger(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen danger-screen"><div class="warning-icon">!</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.impacts, 'danger-list')}<textarea aria-label="reason" placeholder="Reason"></textarea></main><button class="phone-cta danger">${escapeHTML(c.cta)}</button>`);
  }

  function renderSlots(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen slots-screen"><div class="provider-card"><b>${escapeHTML(c.provider)}</b><span>★ 4.8</span></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.dates, 'date-row')}<div class="slot-grid">${(c.slots || []).map((slot, index) => `<button class="${index === 0 ? 'active' : ''}">${escapeHTML(slot)}</button>`).join('')}</div></main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderFeed(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen feed-screen"><div class="story-row"><i></i><i></i><i></i><i></i></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${(c.posts || []).map((post) => `<article><b>${escapeHTML(post)}</b><span>♡ 128 · 댓글 24</span></article>`).join('')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderGame(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen game-screen"><div class="character"></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.stats, 'game-stats')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderLearning(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen learning-screen"><div class="progress-ring"><b>${escapeHTML(c.progress)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.lessons, 'lesson-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderChat(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen chat-screen">${(c.messages || []).map((message, index) => `<div class="bubble ${index === 1 ? 'mine' : ''} ${index === 2 ? 'failed' : ''}">${escapeHTML(message)}</div>`).join('')}</main><div class="composer"><button>＋</button><span>${escapeHTML(lang === 'ko' ? '메시지 입력' : 'Message')}</span><button>${escapeHTML(c.cta)}</button></div>`);
  }

  function renderPlayer(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen player-screen"><div class="album-art"></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="player-controls"><span>◁</span><b>Ⅱ</b><span>▷</span></div>${list(c.tracks, 'track-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderItinerary(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen itinerary-screen"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="weather-card">24° · Sunny</div>${list(c.days, 'itinerary-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderPaywall(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen paywall-screen"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="price-pill">${escapeHTML(c.price)}</div>${list(c.benefits, 'benefit-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderSettings(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen settings-screen"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${(c.groups || []).map((item, index) => `<div class="setting-row"><span>${escapeHTML(item)}</span><i>${index === 2 ? 'Off' : 'On'}</i></div>`).join('')}</main><button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }

  function renderSupport(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen support-screen"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="search-box">${escapeHTML(lang === 'ko' ? '문제 검색' : 'Search help')}</div>${list(c.faqs, 'faq-list')}</main><button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }

  function renderEmpty(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen empty-screen"><div class="empty-graphic"></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.suggestions, 'suggestion-row')}</main><button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }


  function renderProductDetail(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen product-detail-screen"><div class="product-hero"><b>${escapeHTML(c.hero)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.options, 'option-row')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderCartReview(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen cart-review-screen"><div class="cart-total"><small>${escapeHTML(lang === 'ko' ? '예상 결제금액' : 'Estimated total')}</small><b>${escapeHTML(c.total)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.rows, 'cart-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderCouponWallet(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen coupon-screen"><div class="coupon-meter"><small>${escapeHTML(c.title)}</small><b>${escapeHTML(c.metric)}</b></div><p>${escapeHTML(c.sub)}</p>${list(c.offers, 'coupon-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderReviewSheet(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen review-screen"><div class="score-card"><b>${escapeHTML(c.score)}</b><span>★★★★★</span></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.tags, 'review-tags')}${list(c.reviews, 'review-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderSearchResults(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen search-results-screen"><div class="search-box">${escapeHTML(c.query)}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.results, 'result-list')}</main><button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }

  function renderAddressPicker(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="map-canvas address-canvas"><button>${escapeHTML(c.nav)}</button><i></i></div><section class="map-sheet address-sheet"><span></span><strong>${escapeHTML(c.note)}</strong><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.places, 'route-options')}<button>${escapeHTML(c.cta)}</button></section>`);
  }

  function renderFormWizard(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen form-wizard-screen"><div class="wizard-steps">${(c.steps || []).map((step, index) => `<span class="${index === 0 ? 'active' : ''}">${index + 1}</span>`).join('')}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.fields, 'form-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderDocumentReview(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen document-screen"><div class="doc-status">${escapeHTML(c.status)}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.documents, 'document-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderAlertCenter(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen alert-screen"><div class="alert-hero"><b>${escapeHTML(c.metric)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.alerts, 'alert-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderSmartControl(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen smart-control-screen"><div class="device-orb"><b>${escapeHTML(c.metric)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.devices, 'device-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderScheduleTimeline(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen schedule-screen"><div class="provider-card"><b>${escapeHTML(c.provider)}</b><span>♥</span></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.dates, 'date-row')}${list(c.slots, 'schedule-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderServiceStatus(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen service-status-screen"><div class="service-eta">${escapeHTML(c.eta)}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="timeline">${(c.steps || []).map((step, index) => `<div><i class="${index < 2 ? 'done' : ''}"></i><span>${escapeHTML(step)}</span></div>`).join('')}</div></main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderTicketPass(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen ticket-screen"><div class="ticket-card"><small>${escapeHTML(c.nav)}</small><h3>${escapeHTML(c.title)}</h3><b>${escapeHTML(c.code)}</b></div><p>${escapeHTML(c.sub)}</p>${list(c.details, 'ticket-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderMediaUpload(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen upload-screen"><div class="upload-drop"><b>${escapeHTML(c.note)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.assets, 'asset-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderAICompose(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen ai-compose-screen"><div class="prompt-card"><small>${escapeHTML(c.nav)}</small><b>${escapeHTML(c.prompt)}</b></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${chips(c.suggestions, 'suggestion-row')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderComparison(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen comparison-screen"><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p><div class="comparison-options">${(c.options || []).map((option, index) => `<div class="${index === 1 ? 'recommended' : ''}">${escapeHTML(option)}</div>`).join('')}</div></main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderReferral(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<main class="screen referral-screen"><div class="gift-card">${chips(c.chips, 'referral-chips')}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${list(c.steps, 'referral-list')}</main><button class="phone-cta">${escapeHTML(c.cta)}</button>`);
  }

  function renderProfileSecurity(example, lang) {
    const c = example.copy[lang];
    return phoneFrame(example, lang, `<div class="topbar"><span></span><strong>${escapeHTML(c.nav)}</strong></div><main class="screen profile-security-screen"><div class="avatar-lock"></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.sub)}</p>${(c.groups || []).map((item, index) => `<div class="setting-row"><span>${escapeHTML(item)}</span><i>${index === 2 ? 'Off' : 'On'}</i></div>`).join('')}</main><button class="phone-cta subtle">${escapeHTML(c.cta)}</button>`);
  }

  const renderers = {
    'auth-form': renderAuth,
    'onboarding-chips': renderOnboarding,
    'checkout-summary': renderCheckout,
    'home-dashboard': renderHome,
    'delivery-tracker': renderDelivery,
    'map-sheet': renderMap,
    'transfer-keypad': renderTransfer,
    'danger-confirm': renderDanger,
    'booking-slots': renderSlots,
    'social-feed': renderFeed,
    'game-lobby': renderGame,
    'learning-progress': renderLearning,
    'chat-thread': renderChat,
    'media-player': renderPlayer,
    'travel-itinerary': renderItinerary,
    'paywall': renderPaywall,
    'settings-list': renderSettings,
    'support-faq': renderSupport,
    'empty-state': renderEmpty,
    'product-detail': renderProductDetail,
    'cart-review': renderCartReview,
    'coupon-wallet': renderCouponWallet,
    'review-sheet': renderReviewSheet,
    'search-results': renderSearchResults,
    'address-picker': renderAddressPicker,
    'form-wizard': renderFormWizard,
    'document-review': renderDocumentReview,
    'alert-center': renderAlertCenter,
    'smart-control': renderSmartControl,
    'schedule-timeline': renderScheduleTimeline,
    'service-status': renderServiceStatus,
    'ticket-pass': renderTicketPass,
    'media-upload': renderMediaUpload,
    'ai-compose': renderAICompose,
    'comparison-table': renderComparison,
    'referral-card': renderReferral,
    'profile-security': renderProfileSecurity,
    'fitness-progress': renderLearning,
  };

  function renderExamples(lang) {
    const container = document.getElementById('exampleCards');
    if (!container) return;

    container.innerHTML = visibleExamples()
      .map((example) => (renderers[example.layout] || renderHome)(example, lang))
      .join('');
    renderExampleSummary(lang);
  }


  function renderFeaturedOutputs(lang) {
    const container = document.getElementById('featuredSkillOutputs');
    if (!container) return;

    container.innerHTML = skillOutputs
      .map((item) => {
        const title = localized(item.title, lang);
        const sourcePrompt = localized(item.sourcePrompt, lang);
        const appType = localized(item.appType, lang);
        const states = localized(item.states, lang);
        const preview = localized(item.preview, lang);
        const stateText = Array.isArray(states) ? states.slice(0, 4).join(' · ') : '';

        return `<article class="featured-output-card" aria-label="${escapeHTML(title)}">
          <figure class="featured-preview">
            <img src="${escapeHTML(withAssetVersion(preview.src))}" alt="${escapeHTML(preview.alt)}" width="1200" height="760" loading="eager" decoding="async">
          </figure>
          <div class="featured-copy">
            <span>${escapeHTML(t('examples.generatedLabel', lang))}</span>
            <h3>${escapeHTML(title)}</h3>
            <p><b>${escapeHTML(appType)}</b> · ${escapeHTML(sourcePrompt)}</p>
            <small>${escapeHTML(stateText)}</small>
          </div>
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
      if (translations[key]) node.textContent = t(key, nextLang);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      const key = node.dataset.i18nAriaLabel;
      if (translations[key]) node.setAttribute('aria-label', t(key, nextLang));
    });

    document.querySelectorAll('[data-set-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === nextLang));
    });

    renderFilters(nextLang);
    renderExamples(nextLang);
    renderFeaturedOutputs(nextLang);
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
