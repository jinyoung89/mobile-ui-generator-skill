// messenger-chat: 한국어 + English local fixture runtime
const proof = {
  "locales": {
    "ko": {
      "amount": "",
      "confirm_action_label": "이해했고 확인합니다",
      "confirm_label": "",
      "default_body": "로컬 예시를 확인하고 준비되면 계속하세요.",
      "default_title": "준비됐어요",
      "destructive_confirmation_body": "영향을 확인하고 동의한 뒤 신뢰가 필요한 동작을 진행하세요.",
      "destructive_confirmation_title": "계속하기 전에 확인해 주세요",
      "disabled_body": "필수 로컬 입력을 완료하면 동작이 활성화됩니다.",
      "disabled_title": "아직 진행할 수 없어요",
      "empty_body": "아래 기본 동작으로 시작해 보세요.",
      "empty_title": "아직 내용이 없어요",
      "enabled_body": "이 로컬 예시의 기본 동작을 사용할 수 있습니다.",
      "enabled_title": "진행할 준비가 됐어요",
      "error_body": "표시된 정보를 확인하고 다시 시도해 주세요.",
      "error_title": "완료하지 못했어요",
      "field_label": "메시지 입력",
      "filled_body": "로컬 값을 확인할 준비가 됐습니다.",
      "filled_title": "입력이 완료됐어요",
      "focused_body": "활성 입력란은 키보드 위에서 계속 보입니다.",
      "focused_title": "입력란을 선택했어요",
      "item_badge": "온라인",
      "item_body": "키보드가 열려도 최근 메시지와 입력창을 함께 확인합니다.",
      "item_meta": "오후 3:24 · 읽음",
      "item_title": "민서와의 대화",
      "keyboard_body": "스크롤 내용과 기본 동작을 계속 사용할 수 있습니다.",
      "keyboard_title": "키보드가 열렸어요",
      "loading_body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
      "loading_title": "화면을 준비하고 있어요",
      "map_label": "",
      "media_label": "",
      "message_in": "오늘 공유한 화면, 320px에서도 정렬 괜찮았어?",
      "message_out": "응, 긴 한국어 문장까지 줄바꿈 확인했어.",
      "offline_body": "저장된 예시 내용을 확인하거나 기본 상태로 돌아가세요.",
      "offline_title": "오프라인 상태예요",
      "permission_denied_body": "로컬 대체 화면을 사용하거나 권한 안내를 확인하세요.",
      "permission_denied_title": "권한이 허용되지 않았어요",
      "pressed_body": "즉시 피드백으로 로컬 누름 상태를 확인합니다.",
      "pressed_title": "버튼을 눌렀어요",
      "primary_cta": "메시지 보내기",
      "ready_label": "정적 로컬 예시",
      "recover_label": "기본 상태로 돌아가기",
      "risk_notice": "",
      "secondary_label": "최근 대화",
      "subtitle": "온라인 · 알림 켜짐",
      "success_body": "메시지가 로컬 대화에 추가되었습니다.",
      "success_label": "전송됨",
      "success_title": "완료됐어요",
      "switch_language_label": "언어 전환",
      "title": "민서",
      "validation_error_body": "강조된 로컬 값을 수정한 뒤 계속하세요.",
      "validation_error_title": "입력 내용을 확인해 주세요"
    },
    "en": {
      "amount": "",
      "confirm_action_label": "I understand and confirm",
      "confirm_label": "",
      "default_body": "Review the local example and continue when ready.",
      "default_title": "Ready",
      "destructive_confirmation_body": "Review the consequence and acknowledge it before the high-trust action.",
      "destructive_confirmation_title": "Confirm before continuing",
      "disabled_body": "Complete the required local fields to enable this action.",
      "disabled_title": "Action unavailable",
      "empty_body": "Start with the primary action below.",
      "empty_title": "Nothing here yet",
      "enabled_body": "The primary action is ready for this local example.",
      "enabled_title": "Action ready",
      "error_body": "Review the highlighted information and try again.",
      "error_title": "We could not finish that",
      "field_label": "Message",
      "filled_body": "The local value is ready to review.",
      "filled_title": "Input complete",
      "focused_body": "The active field stays visible above the keyboard.",
      "focused_title": "Input focused",
      "item_badge": "Online",
      "item_body": "Recent messages and the composer remain visible with the keyboard open.",
      "item_meta": "3:24 PM · Read",
      "item_title": "Chat with Minseo",
      "keyboard_body": "Scrollable content and the primary action remain reachable.",
      "keyboard_title": "Keyboard open",
      "loading_body": "The local example is loading without a network request.",
      "loading_title": "Preparing your screen",
      "map_label": "",
      "media_label": "",
      "message_in": "Did the screen stay aligned at 320 px?",
      "message_out": "Yes, I checked wrapping with long Korean copy too.",
      "offline_body": "Review cached fixture content or return to the default state.",
      "offline_title": "You are offline",
      "permission_denied_body": "Continue with the local fallback or review permission guidance.",
      "permission_denied_title": "Permission not allowed",
      "pressed_body": "Immediate feedback confirms the local press state.",
      "pressed_title": "Action pressed",
      "primary_cta": "Send message",
      "ready_label": "Static local example",
      "recover_label": "Return to default",
      "risk_notice": "",
      "secondary_label": "Recent conversation",
      "subtitle": "Online · Notifications on",
      "success_body": "The message was added to the local conversation.",
      "success_label": "Sent",
      "success_title": "All set",
      "switch_language_label": "Switch language",
      "title": "Minseo",
      "validation_error_body": "Correct the highlighted local value before continuing.",
      "validation_error_title": "Check this field"
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
  "stateFixtures": {
    "ko": {
      "default": {
        "title": "민서",
        "body": "온라인 · 알림 켜짐",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "default",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "loading": {
        "title": "화면을 준비하고 있어요",
        "body": "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "loading",
        "busy": true,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "empty": {
        "title": "아직 내용이 없어요",
        "body": "아래 기본 동작으로 시작해 보세요.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": "default",
        "kind": "empty",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "error": {
        "title": "완료하지 못했어요",
        "body": "표시된 정보를 확인하고 다시 시도해 주세요.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": "default",
        "kind": "error",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "offline": {
        "title": "오프라인 상태예요",
        "body": "저장된 예시 내용을 확인하거나 기본 상태로 돌아가세요.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": "default",
        "kind": "error",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "success": {
        "title": "완료됐어요",
        "body": "메시지가 로컬 대화에 추가되었습니다.",
        "actionLabel": "전송됨",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "success",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "focused": {
        "title": "입력란을 선택했어요",
        "body": "활성 입력란은 키보드 위에서 계속 보입니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "filled": {
        "title": "입력이 완료됐어요",
        "body": "로컬 값을 확인할 준비가 됐습니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "keyboard": {
        "title": "키보드가 열렸어요",
        "body": "스크롤 내용과 기본 동작을 계속 사용할 수 있습니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "disabled": {
        "title": "아직 진행할 수 없어요",
        "body": "필수 로컬 입력을 완료하면 동작이 활성화됩니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "enabled": {
        "title": "진행할 준비가 됐어요",
        "body": "이 로컬 예시의 기본 동작을 사용할 수 있습니다.",
        "actionLabel": "메시지 보내기",
        "recoveryLabel": "기본 상태로 돌아가기",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      }
    },
    "en": {
      "default": {
        "title": "Minseo",
        "body": "Online · Notifications on",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "default",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "loading": {
        "title": "Preparing your screen",
        "body": "The local example is loading without a network request.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "loading",
        "busy": true,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "empty": {
        "title": "Nothing here yet",
        "body": "Start with the primary action below.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": "default",
        "kind": "empty",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "error": {
        "title": "We could not finish that",
        "body": "Review the highlighted information and try again.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": "default",
        "kind": "error",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "offline": {
        "title": "You are offline",
        "body": "Review cached fixture content or return to the default state.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": "default",
        "kind": "error",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "success": {
        "title": "All set",
        "body": "The message was added to the local conversation.",
        "actionLabel": "Sent",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "success",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "focused": {
        "title": "Input focused",
        "body": "The active field stays visible above the keyboard.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "filled": {
        "title": "Input complete",
        "body": "The local value is ready to review.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "keyboard": {
        "title": "Keyboard open",
        "body": "Scrollable content and the primary action remain reachable.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      },
      "disabled": {
        "title": "Action unavailable",
        "body": "Complete the required local fields to enable this action.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": true,
        "requiresAcknowledgement": false
      },
      "enabled": {
        "title": "Action ready",
        "body": "The primary action is ready for this local example.",
        "actionLabel": "Send message",
        "recoveryLabel": "Return to default",
        "recoverTo": null,
        "kind": "interaction",
        "busy": false,
        "blocksPrimary": false,
        "requiresAcknowledgement": false
      }
    }
  },
  "requiredStates": [
    "default",
    "loading",
    "empty",
    "error",
    "offline",
    "success",
    "focused",
    "filled",
    "keyboard",
    "disabled",
    "enabled"
  ],
  "risk": "medium"
};
const root = document.querySelector('.mobile-screen');
const localeButton = document.querySelector('[data-locale]');
const primary = document.querySelector('[data-primary-action]');
const status = document.querySelector('[data-status]');
const statePanel = document.querySelector('[data-state-panel]');
const stateTitle = document.querySelector('[data-state-title]');
const stateBody = document.querySelector('[data-state-body]');
const recover = document.querySelector('[data-recover]');
const riskCheckbox = document.querySelector('[data-risk-checkbox]');
let locale = 'ko';
let acknowledged = proof.risk !== 'high';
const requestedState = new URLSearchParams(window.location.search).get('state');
let currentState = proof.requiredStates.includes(requestedState) ? requestedState : 'default';
const renderState = (nextState = currentState) => {
  currentState = proof.requiredStates.includes(nextState) ? nextState : 'default';
  const stateModel = proof.stateFixtures[locale][currentState];
  root.dataset.state = currentState;
  statePanel.hidden = currentState === 'default';
  stateTitle.textContent = stateModel.title;
  stateBody.textContent = stateModel.body;
  recover.hidden = !stateModel.recoverTo;
  recover.textContent = stateModel.recoveryLabel;
  recover.dataset.recoverTo = stateModel.recoverTo ?? '';
  status.textContent = stateModel.body;
  primary.textContent = stateModel.actionLabel;
  primary.disabled = stateModel.blocksPrimary || (proof.risk === 'high' && !acknowledged);
  primary.setAttribute('aria-busy', String(stateModel.busy));
};
const renderLocale = () => {
  const copy = proof.locales[locale];
  document.documentElement.lang = locale;
  document.title = copy.title;
  document.querySelectorAll('[data-i18n]').forEach((node) => { const key = node.dataset.i18n; if (key && copy[key]) node.textContent = copy[key]; });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { const key = node.dataset.i18nAria; if (key && copy[key]) node.setAttribute('aria-label', copy[key]); });
  localeButton.textContent = locale === 'ko' ? 'EN' : 'KO';
  renderState(currentState);
};
localeButton.addEventListener('click', () => { locale = locale === 'ko' ? 'en' : 'ko'; renderLocale(); });
primary.addEventListener('click', () => {
  if (proof.risk === 'high' && !acknowledged) { renderState('destructive_confirmation'); return; }
  renderState('loading');
  queueMicrotask(() => renderState('success'));
});
recover.addEventListener('click', () => renderState(recover.dataset.recoverTo || 'default'));
riskCheckbox?.addEventListener('change', () => { acknowledged = riskCheckbox.checked; renderState(acknowledged ? 'default' : 'destructive_confirmation'); });
document.querySelectorAll('[data-local-input]').forEach((input) => {
  input.addEventListener('focus', () => { if (proof.requiredStates.includes('focused')) renderState('focused'); });
  input.addEventListener('input', () => { if (proof.requiredStates.includes('filled')) renderState(input.value ? 'filled' : 'default'); });
});
window.__MOBILE_UI_PROOF__ = { ...proof, renderState };
renderLocale();
