// mobility-map-booking: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "예상 13,800원",
      "confirm_label": "요금과 취소 조건을 확인했습니다",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "탑승 위치",
      "item_badge": "4분 뒤 도착",
      "item_body": "서울역 1번 출구에서 광화문까지 약 12분",
      "item_meta": "예상 12분 · 4.2km",
      "item_title": "스탠다드 · 3명",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "서울역에서 광화문까지의 예시 경로",
      "media_label": "",
      "message_in": "",
      "message_out": "",
      "primary_cta": "차량 예약하기",
      "ready_label": "정적 로컬 예시",
      "risk_notice": "예약 후 2분이 지나면 취소 수수료가 발생할 수 있습니다. 이 예시는 실제 위치 권한이나 차량 호출을 실행하지 않습니다.",
      "secondary_label": "서울역 1번 출구 → 광화문",
      "subtitle": "탑승 위치와 예상 요금, 취소 조건을 확인해 주세요.",
      "success_body": "실제 차량 호출 없이 로컬 예약 상태만 변경했습니다.",
      "success_label": "예약 요청 완료",
      "success_title": "완료됐어요",
      "title": "이 경로로 예약할까요?"
    },
    "en": {
      "amount": "Estimated KRW 13,800",
      "confirm_label": "I reviewed the fare and cancellation terms",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Pickup",
      "item_badge": "Arrives in 4 min",
      "item_body": "About 12 minutes from Seoul Station Exit 1 to Gwanghwamun",
      "item_meta": "About 12 min · 4.2 km",
      "item_title": "Standard · 3 seats",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "Example route from Seoul Station to Gwanghwamun",
      "media_label": "",
      "message_in": "",
      "message_out": "",
      "primary_cta": "Book ride",
      "ready_label": "Static local example",
      "risk_notice": "A cancellation fee may apply after two minutes. This example does not request location access or book a real ride.",
      "secondary_label": "Seoul Station Exit 1 → Gwanghwamun",
      "subtitle": "Review pickup, estimated fare, and cancellation terms.",
      "success_body": "Only the local booking state changed; no ride was requested.",
      "success_label": "Booking requested",
      "success_title": "All set",
      "title": "Book this route?"
    }
  },
  "fixtures": {
    "route_default": {
      "destination": "광화문",
      "distance_km": 4.2,
      "eta_minutes": 12,
      "fare_krw": 13800,
      "origin": "서울역 1번 출구"
    },
    "location_permission": {
      "network": false,
      "status": "local_fixture_granted"
    },
    "high_risk_action": {
      "effect": "local_booking_requested",
      "fixture_only": true,
      "requires_confirmation": true
    }
  },
  "states": {
    "screen": [
      "default",
      "loading",
      "error",
      "success",
      "permission_denied",
      "offline",
      "destructive_confirmation"
    ],
    "inputs": [
      "default",
      "focused",
      "permission_denied",
      "offline"
    ],
    "cta": [
      "enabled",
      "loading",
      "success",
      "destructive_confirmation"
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
