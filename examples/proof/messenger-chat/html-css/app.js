// messenger-chat: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "",
      "confirm_label": "",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "메시지 입력",
      "item_badge": "온라인",
      "item_body": "키보드가 열려도 최근 메시지와 입력창을 함께 확인합니다.",
      "item_meta": "오후 3:24 · 읽음",
      "item_title": "민서와의 대화",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "",
      "media_label": "",
      "message_in": "오늘 공유한 화면, 320px에서도 정렬 괜찮았어?",
      "message_out": "응, 긴 한국어 문장까지 줄바꿈 확인했어.",
      "primary_cta": "메시지 보내기",
      "ready_label": "정적 로컬 예시",
      "risk_notice": "",
      "secondary_label": "최근 대화",
      "subtitle": "온라인 · 알림 켜짐",
      "success_body": "메시지가 로컬 대화에 추가되었습니다.",
      "success_label": "전송됨",
      "success_title": "완료됐어요",
      "title": "민서"
    },
    "en": {
      "amount": "",
      "confirm_label": "",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Message",
      "item_badge": "Online",
      "item_body": "Recent messages and the composer remain visible with the keyboard open.",
      "item_meta": "3:24 PM · Read",
      "item_title": "Chat with Minseo",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "",
      "media_label": "",
      "message_in": "Did the screen stay aligned at 320 px?",
      "message_out": "Yes, I checked wrapping with long Korean copy too.",
      "primary_cta": "Send message",
      "ready_label": "Static local example",
      "risk_notice": "",
      "secondary_label": "Recent conversation",
      "subtitle": "Online · Notifications on",
      "success_body": "The message was added to the local conversation.",
      "success_label": "Sent",
      "success_title": "All set",
      "title": "Minseo"
    }
  },
  "fixtures": {
    "conversation_default": {
      "delivery": "read",
      "messages": 2,
      "network": false,
      "offline_queue": false,
      "participant": "민서"
    }
  },
  "states": {
    "screen": [
      "default",
      "loading",
      "empty",
      "error",
      "offline",
      "success"
    ],
    "inputs": [
      "empty",
      "focused",
      "filled",
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
