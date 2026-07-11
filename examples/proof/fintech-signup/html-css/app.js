// fintech-signup: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "",
      "confirm_label": "필수 약관과 본인 확인 내용에 동의합니다",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "휴대폰 번호",
      "item_badge": "보안 확인",
      "item_body": "입력한 정보는 이 화면의 로컬 예시에만 사용됩니다.",
      "item_meta": "02:58 남음",
      "item_title": "내 정보 확인",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "",
      "media_label": "",
      "message_in": "",
      "message_out": "",
      "primary_cta": "확인하고 계속",
      "ready_label": "정적 로컬 예시",
      "risk_notice": "계좌 개설 전 이름과 휴대폰 명의가 일치하는지 확인하세요. 실제 인증이나 계좌 개설은 실행하지 않습니다.",
      "secondary_label": "인증번호 6자리",
      "subtitle": "본인 명의 번호를 확인하면 안전하게 계정을 만들 수 있어요.",
      "success_body": "휴대폰 본인 확인이 완료되었습니다.",
      "success_label": "본인 확인 완료",
      "success_title": "완료됐어요",
      "title": "휴대폰 번호로 시작할게요"
    },
    "en": {
      "amount": "",
      "confirm_label": "I agree to the required terms and identity check",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Phone number",
      "item_badge": "Security check",
      "item_body": "Entered data stays inside this local screen example.",
      "item_meta": "02:58 remaining",
      "item_title": "Review your details",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "",
      "media_label": "",
      "message_in": "",
      "message_out": "",
      "primary_cta": "Confirm and continue",
      "ready_label": "Static local example",
      "risk_notice": "Confirm that the account name and phone ownership match. This example does not perform identity verification or open an account.",
      "secondary_label": "6-digit verification code",
      "subtitle": "Verify a number in your name to create the account safely.",
      "success_body": "Phone verification is complete.",
      "success_label": "Identity confirmed",
      "success_title": "All set",
      "title": "Start with your phone number"
    }
  },
  "fixtures": {
    "phone_verification": {
      "code": "482913",
      "expires_in_seconds": 178,
      "phone": "010-1234-5678",
      "verified": false
    },
    "high_risk_action": {
      "effect": "local_identity_confirmed",
      "fixture_only": true,
      "requires_confirmation": true
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
