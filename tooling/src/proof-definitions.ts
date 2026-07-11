#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeProofBundle } from "./generate-proof-set.js";

type JsonObject = Record<string, unknown>;
type Risk = "low" | "medium" | "high";
type ComponentDefinition = { id: string; role: string; states: string[]; defaultState: string; focusable?: boolean; native: string; height?: number };
type Definition = {
  directory: string;
  specId: string;
  category: string;
  patterns: string[];
  risk: Risk;
  userJob: string;
  requestKo: string;
  requestEn: string;
  screenStates: string[];
  inputStates: string[];
  ctaStates: string[];
  components: ComponentDefinition[];
  primaryComponent: string;
  colors: { primary: string; danger: string };
  ko: Record<string, string>;
  en: Record<string, string>;
  fixtureData: Record<string, JsonObject>;
};

const commonEnglish = {
  loading_title: "Preparing your screen",
  loading_body: "The local example is loading without a network request.",
  error_title: "We could not finish that",
  error_body: "Review the highlighted information and try again.",
  empty_title: "Nothing here yet",
  empty_body: "Start with the primary action below.",
  success_title: "All set",
  ready_label: "Static local example",
};
const commonKorean = {
  loading_title: "화면을 준비하고 있어요",
  loading_body: "네트워크 요청 없이 로컬 예시를 불러오고 있습니다.",
  error_title: "완료하지 못했어요",
  error_body: "표시된 정보를 확인하고 다시 시도해 주세요.",
  empty_title: "아직 내용이 없어요",
  empty_body: "아래 기본 동작으로 시작해 보세요.",
  success_title: "완료됐어요",
  ready_label: "정적 로컬 예시",
};

export const proofDefinitions: Definition[] = [
  {
    directory: "fintech-signup",
    specId: "fintech-signup",
    category: "finance-fintech",
    patterns: ["login-signup", "identity-verification", "fixed-bottom-action"],
    risk: "high",
    userJob: "Verify a phone number and understand consent before opening a financial account",
    requestKo: "금융 계정 가입을 위해 휴대폰 번호와 인증번호를 확인하고 필수 동의를 명확히 보여주는 화면을 만들어 주세요.",
    requestEn: "Create a financial signup screen that verifies a phone number and clearly explains required consent.",
    screenStates: ["default", "loading", "error", "success"],
    inputStates: ["empty", "focused", "filled", "validation_error", "keyboard", "disabled"],
    ctaStates: ["disabled", "enabled", "loading", "success"],
    components: [
      { id: "phone-field", role: "text_field", states: ["empty", "focused", "filled", "validation_error", "disabled"], defaultState: "empty", focusable: true, native: "native_phone_field" },
      { id: "code-field", role: "text_field", states: ["empty", "focused", "filled", "validation_error", "disabled"], defaultState: "empty", focusable: true, native: "native_numeric_field" },
      { id: "consent-card", role: "risk_notice", states: ["default", "error"], defaultState: "default", native: "semantic_information_group" },
      { id: "signup-button", role: "primary_action", states: ["disabled", "enabled", "loading", "success"], defaultState: "disabled", focusable: true, native: "native_button" },
    ],
    primaryComponent: "signup-button",
    colors: { primary: "#1457D9", danger: "#B42318" },
    ko: {
      ...commonKorean,
      title: "휴대폰 번호로 시작할게요",
      subtitle: "본인 명의 번호를 확인하면 안전하게 계정을 만들 수 있어요.",
      field_label: "휴대폰 번호",
      secondary_label: "인증번호 6자리",
      primary_cta: "확인하고 계속",
      success_label: "본인 확인 완료",
      success_body: "휴대폰 본인 확인이 완료되었습니다.",
      item_badge: "보안 확인",
      item_title: "내 정보 확인",
      item_body: "입력한 정보는 이 화면의 로컬 예시에만 사용됩니다.",
      item_meta: "02:58 남음",
      amount: "",
      risk_notice: "계좌 개설 전 이름과 휴대폰 명의가 일치하는지 확인하세요. 실제 인증이나 계좌 개설은 실행하지 않습니다.",
      confirm_label: "필수 약관과 본인 확인 내용에 동의합니다",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "",
    },
    en: {
      ...commonEnglish,
      title: "Start with your phone number",
      subtitle: "Verify a number in your name to create the account safely.",
      field_label: "Phone number",
      secondary_label: "6-digit verification code",
      primary_cta: "Confirm and continue",
      success_label: "Identity confirmed",
      success_body: "Phone verification is complete.",
      item_badge: "Security check",
      item_title: "Review your details",
      item_body: "Entered data stays inside this local screen example.",
      item_meta: "02:58 remaining",
      amount: "",
      risk_notice: "Confirm that the account name and phone ownership match. This example does not perform identity verification or open an account.",
      confirm_label: "I agree to the required terms and identity check",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "",
    },
    fixtureData: {
      phone_verification: { phone: "010-1234-5678", code: "482913", expires_in_seconds: 178, verified: false },
      high_risk_action: { requires_confirmation: true, fixture_only: true, effect: "local_identity_confirmed" },
    },
  },
  {
    directory: "commerce-checkout",
    specId: "commerce-checkout-address",
    category: "commerce",
    patterns: ["checkout", "address-selection", "payment-method"],
    risk: "medium",
    userJob: "Review an order, confirm delivery details, and submit a fixture-only payment",
    requestKo: "주문 상품, 배송지, 결제 수단과 최종 금액을 한 화면에서 확인하는 모바일 결제 화면을 만들어 주세요.",
    requestEn: "Create a mobile checkout that reviews the order, delivery address, payment method, and final total.",
    screenStates: ["default", "loading", "error", "success"],
    inputStates: ["empty", "focused", "filled", "validation_error", "keyboard", "disabled"],
    ctaStates: ["disabled", "enabled", "pressed", "loading", "success"],
    components: [
      { id: "order-summary", role: "summary_card", states: ["default", "loading", "error"], defaultState: "default", native: "semantic_summary_group" },
      { id: "address-field", role: "text_field", states: ["empty", "focused", "filled", "validation_error", "disabled"], defaultState: "filled", focusable: true, native: "native_address_field" },
      { id: "payment-card", role: "payment_method", states: ["default", "focused", "disabled"], defaultState: "default", focusable: true, native: "native_selection_row" },
      { id: "pay-button", role: "primary_action", states: ["disabled", "enabled", "pressed", "loading", "success"], defaultState: "enabled", focusable: true, native: "native_button" },
    ],
    primaryComponent: "pay-button",
    colors: { primary: "#2563EB", danger: "#B42318" },
    ko: {
      ...commonKorean,
      title: "주문을 확인해 주세요",
      subtitle: "배송 정보와 결제 금액을 마지막으로 확인하면 주문이 완료됩니다.",
      field_label: "배송지",
      secondary_label: "Visa ···· 4242",
      primary_cta: "48,900원 결제하기",
      success_label: "주문 완료",
      success_body: "주문이 로컬 성공 상태로 변경되었습니다.",
      item_badge: "내일 도착",
      item_title: "데일리 코튼 셔츠",
      item_body: "오프화이트 · M · 수량 1",
      item_meta: "일시불 · 결제 실행 없음",
      amount: "48,900원",
      risk_notice: "",
      confirm_label: "",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "상품 미리보기",
    },
    en: {
      ...commonEnglish,
      title: "Review your order",
      subtitle: "Confirm delivery details and the final total before placing the order.",
      field_label: "Delivery address",
      secondary_label: "Visa ···· 4242",
      primary_cta: "Pay KRW 48,900",
      success_label: "Order complete",
      success_body: "The order moved to a local success state.",
      item_badge: "Arrives tomorrow",
      item_title: "Daily cotton shirt",
      item_body: "Off white · M · Quantity 1",
      item_meta: "One-time · No payment execution",
      amount: "KRW 48,900",
      risk_notice: "",
      confirm_label: "",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "Product preview",
    },
    fixtureData: {
      order_summary: { sku: "shirt-001", quantity: 1, total_krw: 48900 },
      address_default: { label: "서울시 중구 세종대로 1", selected: true },
      payment_card: { brand: "Visa", last4: "4242", execution: "disabled" },
    },
  },
  {
    directory: "mobility-map-booking",
    specId: "mobility-map-booking",
    category: "mobility-transportation",
    patterns: ["map-route", "reservation-ticketing", "location-permission"],
    risk: "high",
    userJob: "Confirm pickup, route, fare, and cancellation terms before booking a ride",
    requestKo: "출발지와 목적지, 예상 시간, 요금과 취소 조건을 지도와 함께 확인하는 차량 예약 화면을 만들어 주세요.",
    requestEn: "Create a ride booking screen with a map, pickup and destination, ETA, fare, and cancellation terms.",
    screenStates: ["default", "loading", "error", "success", "permission_denied", "offline", "destructive_confirmation"],
    inputStates: ["default", "focused", "permission_denied", "offline"],
    ctaStates: ["enabled", "loading", "success", "destructive_confirmation"],
    components: [
      { id: "route-map", role: "map", states: ["default", "loading", "error", "permission_denied", "offline"], defaultState: "default", native: "local_map_fallback" , height: 280 },
      { id: "booking-card", role: "booking_summary", states: ["default", "loading", "error"], defaultState: "default", native: "semantic_summary_group" },
      { id: "book-button", role: "primary_action", states: ["enabled", "loading", "success", "destructive_confirmation"], defaultState: "enabled", focusable: true, native: "native_button" },
    ],
    primaryComponent: "book-button",
    colors: { primary: "#146C5A", danger: "#B42318" },
    ko: {
      ...commonKorean,
      title: "이 경로로 예약할까요?",
      subtitle: "탑승 위치와 예상 요금, 취소 조건을 확인해 주세요.",
      field_label: "탑승 위치",
      secondary_label: "서울역 1번 출구 → 광화문",
      primary_cta: "차량 예약하기",
      success_label: "예약 요청 완료",
      success_body: "실제 차량 호출 없이 로컬 예약 상태만 변경했습니다.",
      item_badge: "4분 뒤 도착",
      item_title: "스탠다드 · 3명",
      item_body: "서울역 1번 출구에서 광화문까지 약 12분",
      item_meta: "예상 12분 · 4.2km",
      amount: "예상 13,800원",
      risk_notice: "예약 후 2분이 지나면 취소 수수료가 발생할 수 있습니다. 이 예시는 실제 위치 권한이나 차량 호출을 실행하지 않습니다.",
      confirm_label: "요금과 취소 조건을 확인했습니다",
      message_in: "",
      message_out: "",
      map_label: "서울역에서 광화문까지의 예시 경로",
      media_label: "",
    },
    en: {
      ...commonEnglish,
      title: "Book this route?",
      subtitle: "Review pickup, estimated fare, and cancellation terms.",
      field_label: "Pickup",
      secondary_label: "Seoul Station Exit 1 → Gwanghwamun",
      primary_cta: "Book ride",
      success_label: "Booking requested",
      success_body: "Only the local booking state changed; no ride was requested.",
      item_badge: "Arrives in 4 min",
      item_title: "Standard · 3 seats",
      item_body: "About 12 minutes from Seoul Station Exit 1 to Gwanghwamun",
      item_meta: "About 12 min · 4.2 km",
      amount: "Estimated KRW 13,800",
      risk_notice: "A cancellation fee may apply after two minutes. This example does not request location access or book a real ride.",
      confirm_label: "I reviewed the fare and cancellation terms",
      message_in: "",
      message_out: "",
      map_label: "Example route from Seoul Station to Gwanghwamun",
      media_label: "",
    },
    fixtureData: {
      route_default: { origin: "서울역 1번 출구", destination: "광화문", distance_km: 4.2, eta_minutes: 12, fare_krw: 13800 },
      location_permission: { status: "local_fixture_granted", network: false },
      high_risk_action: { requires_confirmation: true, fixture_only: true, effect: "local_booking_requested" },
    },
  },
  {
    directory: "social-feed",
    specId: "social-feed",
    category: "social-community",
    patterns: ["feed-community", "content-card", "bottom-tabs"],
    risk: "low",
    userJob: "Scan a community feed and understand post context before reacting",
    requestKo: "프로필, 본문, 이미지, 반응 수와 작성 시간을 빠르게 훑을 수 있는 커뮤니티 피드 화면을 만들어 주세요.",
    requestEn: "Create a community feed where profiles, posts, media, reactions, and timestamps are easy to scan.",
    screenStates: ["default", "loading", "empty", "error", "success"],
    inputStates: ["default", "focused"],
    ctaStates: ["enabled", "loading", "success"],
    components: [
      { id: "story-row", role: "horizontal_list", states: ["default", "loading", "empty"], defaultState: "default", native: "native_horizontal_list" },
      { id: "feed-list", role: "feed_list", states: ["default", "loading", "empty", "error"], defaultState: "default", native: "native_lazy_list" },
      { id: "compose-button", role: "primary_action", states: ["enabled", "loading", "success"], defaultState: "enabled", focusable: true, native: "native_button" },
    ],
    primaryComponent: "compose-button",
    colors: { primary: "#7C3AED", danger: "#B42318" },
    ko: {
      ...commonKorean,
      title: "오늘의 커뮤니티",
      subtitle: "관심 있는 사람들의 새 소식을 편안하게 둘러보세요.",
      field_label: "게시물 작성",
      secondary_label: "댓글 24개",
      primary_cta: "새 글 쓰기",
      success_label: "작성 화면 열림",
      success_body: "로컬 작성 상태로 전환했습니다.",
      item_badge: "팔로잉",
      item_title: "지영 · 모바일 디자인",
      item_body: "작은 화면일수록 정보의 순서와 여백이 제품의 목소리를 더 또렷하게 만든다고 느꼈어요.",
      item_meta: "12분 전",
      amount: "",
      risk_notice: "",
      confirm_label: "",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "보라색과 회색으로 구성된 모바일 UI 스터디 이미지",
    },
    en: {
      ...commonEnglish,
      title: "Today's community",
      subtitle: "Browse new posts from people and topics you care about.",
      field_label: "Create post",
      secondary_label: "24 comments",
      primary_cta: "Write a post",
      success_label: "Composer opened",
      success_body: "The example moved to its local compose state.",
      item_badge: "Following",
      item_title: "Jiyoung · Mobile design",
      item_body: "On a small screen, information order and spacing make the product voice much clearer.",
      item_meta: "12 min ago",
      amount: "",
      risk_notice: "",
      confirm_label: "",
      message_in: "",
      message_out: "",
      map_label: "",
      media_label: "Purple and gray mobile UI study",
    },
    fixtureData: {
      feed_default: { author: "지영", reactions: 128, comments: 24, media_fallback: "gradient-card", network: false },
    },
  },
  {
    directory: "messenger-chat",
    specId: "messenger-chat",
    category: "messaging",
    patterns: ["chat", "message-composer", "conversation-list"],
    risk: "medium",
    userJob: "Read recent context and send a message without the keyboard covering the conversation",
    requestKo: "최근 대화 맥락과 전송 상태를 확인하면서 키보드가 열려도 입력창이 가려지지 않는 채팅 화면을 만들어 주세요.",
    requestEn: "Create a chat screen that preserves recent context and keeps the composer visible when the keyboard opens.",
    screenStates: ["default", "loading", "empty", "error", "offline", "success"],
    inputStates: ["empty", "focused", "filled", "keyboard", "disabled"],
    ctaStates: ["disabled", "enabled", "loading", "success"],
    components: [
      { id: "message-list", role: "message_list", states: ["default", "loading", "empty", "error", "offline"], defaultState: "default", native: "native_inverted_lazy_list" },
      { id: "message-composer", role: "text_field", states: ["empty", "focused", "filled", "keyboard", "disabled"], defaultState: "empty", focusable: true, native: "native_multiline_field" },
      { id: "send-button", role: "primary_action", states: ["disabled", "enabled", "loading", "success"], defaultState: "disabled", focusable: true, native: "native_button" },
    ],
    primaryComponent: "send-button",
    colors: { primary: "#0F766E", danger: "#B42318" },
    ko: {
      ...commonKorean,
      title: "민서",
      subtitle: "온라인 · 알림 켜짐",
      field_label: "메시지 입력",
      secondary_label: "최근 대화",
      primary_cta: "메시지 보내기",
      success_label: "전송됨",
      success_body: "메시지가 로컬 대화에 추가되었습니다.",
      item_badge: "온라인",
      item_title: "민서와의 대화",
      item_body: "키보드가 열려도 최근 메시지와 입력창을 함께 확인합니다.",
      item_meta: "오후 3:24 · 읽음",
      amount: "",
      risk_notice: "",
      confirm_label: "",
      message_in: "오늘 공유한 화면, 320px에서도 정렬 괜찮았어?",
      message_out: "응, 긴 한국어 문장까지 줄바꿈 확인했어.",
      map_label: "",
      media_label: "",
    },
    en: {
      ...commonEnglish,
      title: "Minseo",
      subtitle: "Online · Notifications on",
      field_label: "Message",
      secondary_label: "Recent conversation",
      primary_cta: "Send message",
      success_label: "Sent",
      success_body: "The message was added to the local conversation.",
      item_badge: "Online",
      item_title: "Chat with Minseo",
      item_body: "Recent messages and the composer remain visible with the keyboard open.",
      item_meta: "3:24 PM · Read",
      amount: "",
      risk_notice: "",
      confirm_label: "",
      message_in: "Did the screen stay aligned at 320 px?",
      message_out: "Yes, I checked wrapping with long Korean copy too.",
      map_label: "",
      media_label: "",
    },
    fixtureData: {
      conversation_default: { participant: "민서", messages: 2, delivery: "read", offline_queue: false, network: false },
    },
  },
];

function component(id: string, definition: ComponentDefinition, screenId: string, order: number): JsonObject {
  const isAction = definition.role === "primary_action";
  return {
    id,
    role: definition.role,
    parent: screenId,
    order,
    layout: {
      width: "fill",
      height: definition.height ? { value: definition.height, unit: "px" } : isAction || definition.role === "text_field" ? { token: "control_height" } : "content",
      padding: { token: isAction ? "space_3" : "space_4" },
      gap: { token: "space_2" },
      alignment: isAction ? "primary-cta" : "screen-leading",
    },
    states: definition.states,
    default_state: definition.defaultState,
    text_roles: isAction ? ["label"] : ["body", "label"],
    interaction: { kind: isAction ? "button" : definition.role === "text_field" ? "text_input" : "content", ...(definition.focusable ? { focusable: true } : {}) },
    accessibility: { label: id.replaceAll("-", " "), target_size: { width: 44, height: 44, unit: "px" } },
    platform_native_substitution: definition.native,
  };
}

export function buildProofSpec(baseInput: JsonObject, definition: Definition): JsonObject {
  const spec = structuredClone(baseInput);
  const screenId = `${definition.specId}-screen`;
  spec.id = definition.specId;
  spec.request = { language: "ko", user_job: definition.userJob };
  spec.classification = { app_category: definition.category, ui_patterns: definition.patterns, risk_level: definition.risk };
  const colors = spec.colors as JsonObject;
  colors.tokens = { text: "#111827", surface: "#FFFFFF", primary: definition.colors.primary, danger: definition.colors.danger };
  colors.contrast_pairs = [
    { foreground: "text", background: "surface", minimum_ratio: 4.5 },
    { foreground: "surface", background: "primary", minimum_ratio: 4.5 },
  ];
  spec.components = [
    {
      id: screenId,
      role: "screen",
      parent: null,
      order: 0,
      layout: { width: "fill", height: "content", padding: { token: "space_4" }, gap: { token: "space_3" }, alignment: "screen-leading" },
      states: definition.screenStates,
      default_state: "default",
      text_roles: ["title", "body"],
      interaction: { kind: "screen" },
      accessibility: { label: definition.ko.title, target_size: { width: 44, height: 44, unit: "px" } },
      platform_native_substitution: "safe_area_scroll_container",
    },
    ...definition.components.map((entry, index) => component(entry.id, entry, screenId, index + 1)),
  ];
  spec.states = { screen: definition.screenStates, inputs: definition.inputStates, cta: definition.ctaStates };
  spec.interactions = [{ id: `${definition.specId}-primary-action`, source: definition.primaryComponent, event: "press", action: "resolve_fixture_state" }];
  spec.content = { locales: { ko: definition.ko, en: definition.en }, fixtures: Object.keys(definition.fixtureData) };
  spec.fixture_data = definition.fixtureData;
  const outcomeState = definition.screenStates.includes("success") ? "success" : "default";
  spec.navigation_and_actions = [{ id: `${definition.specId}-primary-action`, source_component: definition.primaryComponent, outcome: { kind: "local_state", state: outcomeState } }];
  spec.focus_and_keyboard = {
    focusable_components: definition.components.filter((entry) => entry.focusable).map((entry) => entry.id),
    keyboard_behavior: definition.patterns.includes("chat") ? "resize_keep_composer_above_keyboard_and_preserve_message_context" : "resize_and_scroll_active_field_above_keyboard",
    primary_action_visible: true,
  };
  spec.localization = { default_language: "ko", supported_languages: ["ko", "en"], fallback_language: "en", long_copy_profiles: ["long-copy-ko", "long-copy-en"] };
  spec.themes = { supported: ["light", "dark"], default: "light" };
  spec.capabilities_and_dependencies = { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true };
  spec.assets_and_fallbacks = { assets: [], fallback_policy: "system_shapes_and_text_fallbacks" };
  spec.quality_requirements = { numeric_spec_validated: true, responsive_profiles: [320, 390, 430], all_states_fixture_backed: true, platform_parity_report: true };
  return spec;
}

export function requestMarkdown(definition: Definition): string {
  return `# ${definition.specId}\n\n## Original public request\n\n${definition.requestKo}\n\n${definition.requestEn}\n\n## Skill invocation\n\n- Mode: \`showcase/all-platforms\`\n- Category: \`${definition.category}\`\n- Patterns: ${definition.patterns.map((pattern) => `\`${pattern}\``).join(", ")}\n- Risk: \`${definition.risk}\`\n- Languages: \`ko\`, \`en\`\n- Targets: HTML/CSS, React Native, Flutter, SwiftUI\n\n## Required behavior\n\nUse one strict numeric canonical spec for all targets. Include safe-area handling, 320/390/430 responsive rules, local fixtures, required states, accessible 44px/dp/pt targets, and explicit recovery copy. Do not perform network, authentication, payment, permission, booking, posting, or messaging operations.\n`;
}

export function writeProofSet(proofRoot: string): void {
  const commercePath = path.join(proofRoot, "commerce-checkout/spec.json");
  const base = JSON.parse(readFileSync(commercePath, "utf8")) as JsonObject;
  for (const definition of proofDefinitions) {
    const directory = path.join(proofRoot, definition.directory);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, "request.md"), requestMarkdown(definition), "utf8");
    writeFileSync(path.join(directory, "spec.json"), `${JSON.stringify(buildProofSpec(base, definition), null, 2)}\n`, "utf8");
  }
  for (const definition of proofDefinitions) writeProofBundle(path.join(proofRoot, definition.directory));
}

function runCli(): void {
  const proofRoot = path.resolve(process.argv[2] ?? path.resolve(import.meta.dirname, "../../examples/proof"));
  writeProofSet(proofRoot);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
