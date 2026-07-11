// commerce-checkout-address: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "48,900원",
      "confirm_label": "",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "배송지",
      "item_badge": "내일 도착",
      "item_body": "오프화이트 · M · 수량 1",
      "item_meta": "일시불 · 결제 실행 없음",
      "item_title": "데일리 코튼 셔츠",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "",
      "media_label": "상품 미리보기",
      "message_in": "",
      "message_out": "",
      "primary_cta": "48,900원 결제하기",
      "ready_label": "정적 로컬 예시",
      "risk_notice": "",
      "secondary_label": "Visa ···· 4242",
      "subtitle": "배송 정보와 결제 금액을 마지막으로 확인하면 주문이 완료됩니다.",
      "success_body": "주문이 로컬 성공 상태로 변경되었습니다.",
      "success_label": "주문 완료",
      "success_title": "완료됐어요",
      "title": "주문을 확인해 주세요"
    },
    "en": {
      "amount": "KRW 48,900",
      "confirm_label": "",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Delivery address",
      "item_badge": "Arrives tomorrow",
      "item_body": "Off white · M · Quantity 1",
      "item_meta": "One-time · No payment execution",
      "item_title": "Daily cotton shirt",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "",
      "media_label": "Product preview",
      "message_in": "",
      "message_out": "",
      "primary_cta": "Pay KRW 48,900",
      "ready_label": "Static local example",
      "risk_notice": "",
      "secondary_label": "Visa ···· 4242",
      "subtitle": "Confirm delivery details and the final total before placing the order.",
      "success_body": "The order moved to a local success state.",
      "success_label": "Order complete",
      "success_title": "All set",
      "title": "Review your order"
    }
  },
  "fixtures": {
    "order_summary": {
      "quantity": 1,
      "sku": "shirt-001",
      "total_krw": 48900
    },
    "address_default": {
      "label": "서울시 중구 세종대로 1",
      "selected": true
    },
    "payment_card": {
      "brand": "Visa",
      "execution": "disabled",
      "last4": "4242"
    }
  },
  "states": {
    "screen": [
      "default",
      "loading",
      "error",
      "success"
    ],
    "inputs": [
      "empty",
      "focused",
      "filled",
      "validation_error",
      "keyboard",
      "disabled"
    ],
    "cta": [
      "disabled",
      "enabled",
      "pressed",
      "loading",
      "success"
    ]
  }
};
const root = document.querySelector('.mobile-screen');
const localeButton = document.querySelector('[data-locale]');
const primary = document.querySelector('[data-primary-action]');
const status = document.querySelector('[data-status]');
let locale = 'ko';
const renderLocale = () => {
  const copy = proof.locales[locale];
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-i18n]').forEach((node) => { const key = node.dataset.i18n; if (key && copy[key]) node.textContent = copy[key]; });
  localeButton.textContent = locale === 'ko' ? 'EN' : 'KO';
  localeButton.setAttribute('aria-label', locale === 'ko' ? 'English' : '한국어');
  status.textContent = copy.ready_label;
};
localeButton.addEventListener('click', () => { locale = locale === 'ko' ? 'en' : 'ko'; renderLocale(); });
primary.addEventListener('click', () => {
  root.dataset.state = 'loading';
  primary.setAttribute('aria-busy', 'true');
  queueMicrotask(() => { root.dataset.state = 'success'; primary.removeAttribute('aria-busy'); primary.textContent = proof.locales[locale].success_label; status.textContent = proof.locales[locale].success_body; });
});
window.__MOBILE_UI_PROOF__ = proof;
renderLocale();
