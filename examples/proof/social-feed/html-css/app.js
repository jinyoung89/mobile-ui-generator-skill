// social-feed: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "",
      "confirm_label": "",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "게시물 작성",
      "item_badge": "팔로잉",
      "item_body": "작은 화면일수록 정보의 순서와 여백이 제품의 목소리를 더 또렷하게 만든다고 느꼈어요.",
      "item_meta": "12분 전",
      "item_title": "지영 · 모바일 디자인",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "",
      "media_label": "보라색과 회색으로 구성된 모바일 UI 스터디 이미지",
      "message_in": "",
      "message_out": "",
      "primary_cta": "새 글 쓰기",
      "ready_label": "정적 로컬 예시",
      "risk_notice": "",
      "secondary_label": "댓글 24개",
      "subtitle": "관심 있는 사람들의 새 소식을 편안하게 둘러보세요.",
      "success_body": "로컬 작성 상태로 전환했습니다.",
      "success_label": "작성 화면 열림",
      "success_title": "완료됐어요",
      "title": "오늘의 커뮤니티"
    },
    "en": {
      "amount": "",
      "confirm_label": "",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Create post",
      "item_badge": "Following",
      "item_body": "On a small screen, information order and spacing make the product voice much clearer.",
      "item_meta": "12 min ago",
      "item_title": "Jiyoung · Mobile design",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "",
      "media_label": "Purple and gray mobile UI study",
      "message_in": "",
      "message_out": "",
      "primary_cta": "Write a post",
      "ready_label": "Static local example",
      "risk_notice": "",
      "secondary_label": "24 comments",
      "subtitle": "Browse new posts from people and topics you care about.",
      "success_body": "The example moved to its local compose state.",
      "success_label": "Composer opened",
      "success_title": "All set",
      "title": "Today's community"
    }
  },
  "fixtures": {
    "feed_default": {
      "author": "지영",
      "comments": 24,
      "media_fallback": "gradient-card",
      "network": false,
      "reactions": 128
    }
  },
  "states": {
    "screen": [
      "default",
      "loading",
      "empty",
      "error",
      "success"
    ],
    "inputs": [
      "default",
      "focused"
    ],
    "cta": [
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
