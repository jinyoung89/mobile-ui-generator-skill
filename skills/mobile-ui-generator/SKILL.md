---
name: mobile-ui-generator
description: Generate service-aware mobile UX/UI briefs, JSON specs, font profiles, copy systems, and implementation prompts for app screens and flows. Use for onboarding, signup, checkout, account cancellation, home screens, fintech, commerce, games, education, messenger, healthcare, travel, and Korean mobile UI generation.
version: 0.2.0
author: jinyoung89
license: MIT
tags: [mobile-ui, ux-ui, design, prompt-engineering, font-profile, korean-ui]
---

# Mobile UI Generator

Use this skill when a user asks an agent to generate, design, code, or specify a mobile app screen or flow.

The skill is about **UX/UI generation**. It should produce clear design briefs and implementation-ready specs for agent handoff.

## Core outputs

Produce one or more of the following depending on the request:

- `mobile-ui-brief.md` — human-readable UX/UI brief;
- `mobile-ui-brief.json` — machine-readable UI spec;
- `font_profile` — font family, CSS/download URL, fallback stack, and reason;
- `copy_system` — language-specific UI copy guidelines;
- `implementation_prompt` — prompt for a code, Figma, design-system, or image-generation agent.

Do **not** run image generation unless the user explicitly requests image generation.

## 1. Choose language mode first

Ask or infer the output language. If unclear, use the user's language.

Supported modes:

| Mode | Output behavior |
|---|---|
| `en` | English narrative and English UI copy |
| `ko` | Korean narrative and Korean UI copy |

Rules:

- Do not mix English and Korean in the same user-facing output unless the user asks for bilingual output.
- Product names, font names, framework names, and brand names may remain in their original language.
- For Korean UI, prefer natural Korean microcopy over literal translation.

## 2. Identify target domain and screen flow

Extract the app domain and target screen types from the user's request.

Examples:

- `Korean fintech signup phone verification screen` => `fintech`, `signup`, `identity_verification`
- `커머스 상품상세 장바구니 결제 화면` => `commerce`, `product_detail`, `cart`, `checkout`, `payment`
- `모빌리티 지도 예약 결제 화면` => `mobility`, `map_location`, `reservation_booking`, `payment`
- `게임 앱 메인 로비와 출석 보상 화면` => `game`, `home`, `reward`
- `교육 앱 오늘의 학습과 퀴즈 화면` => `education`, `lesson_home`, `quiz`
- `메신저 앱 채팅방과 메시지 입력 화면` => `messenger`, `chat`
- `서비스 탈퇴 전 확인 화면` => `account`, `account_cancellation`

## 3. Screen taxonomy

Use these categories as a starting point and extend them when needed:

| Flow | Screen types |
|---|---|
| Acquisition | `splash`, `onboarding`, `permission`, `preference_setup` |
| Auth | `login`, `signup`, `identity_verification`, `terms` |
| Account | `profile`, `settings`, `notification_permission`, `account_cancellation` |
| Commerce | `product_list`, `product_detail`, `cart`, `checkout`, `payment`, `order_complete` |
| Finance | `account_home`, `transfer`, `wallet`, `investment_portfolio`, `card_detail` |
| Social/content | `feed`, `chat`, `notification`, `creator_profile`, `content_viewer` |
| Mobility/travel | `map_location`, `reservation_booking`, `route`, `stay_booking`, `ticket` |
| Education/game | `lesson_home`, `quiz`, `progress`, `game_lobby`, `reward` |
| Support | `customer_support`, `faq`, `empty_state`, `error_recovery` |

## 4. Domain-specific design guidance

Adapt the interface to the service category:

- **Fintech/banking**: trust, numeric clarity, low-risk CTA wording, strong confirmation states.
- **Commerce/marketplace**: product summary, price hierarchy, coupon/payment rows, legal notice near CTA.
- **Mobility/delivery**: map or route preview, ETA, progress state, contextual support action.
- **Healthcare/booking**: provider trust, schedule clarity, cancellation policy, confirmation step.
- **Education**: progress, module structure, resume CTA, encouraging copy.
- **Game**: high-energy visual hierarchy, rewards, level/progress, limited-time cues.
- **Messenger/social**: readable conversation rhythm, composer affordance, safe-area spacing.
- **Content/media**: media hero, metadata, engagement actions, next-content path.
- **Travel/reservation**: visual appeal, date/guest summary, price, cancellation confidence.
- **Support/help center**: common issue routing, FAQ chips, bot/agent escalation.

## 5. Add a font profile

For real mobile UX/UI work, include typography. If a service-specific font is confirmed by the user or public brand/design docs, use it. Otherwise choose a free/public Korean UI font profile.

Starter profiles:

| Profile | Use when | URL |
|---|---|---|
| Pretendard | neutral Korean app UI, fintech, commerce, productivity | https://github.com/orioncactus/pretendard |
| SUIT | compact modern UI, onboarding/settings/dashboard | https://github.com/sunn-us/SUIT |
| Noto Sans KR | safe Android/Web fallback | https://fonts.google.com/noto/specimen/Noto+Sans+KR |
| IBM Plex Sans KR | tech, AI, analytics, editorial/product UI | https://fonts.google.com/specimen/IBM+Plex+Sans+KR |
| Spoqa Han Sans Neo | friendly consumer/local commerce UI | https://github.com/spoqa/spoqa-han-sans |
| Wanted Sans | SaaS, recruiting, productivity, professional services | https://github.com/wanteddev/wanted-sans |

Recommended shape:

```yaml
font_profile:
  family: Pretendard
  css_url: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css
  fallback: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
  confidence: recommended fallback
  reason: Neutral Korean mobile UI with strong numeric readability.
```

Rules:

- Do not invent service-specific font names.
- Use confirmed brand typography only when the user provides it or public brand/design docs confirm it.
- Include iOS, Android, and Web fallback font stacks.
- Include a license-check note for commercial use.

## 6. Mobile UX constraints

Always consider:

- safe-area insets and bottom navigation/CTA zones;
- 44pt+ touch targets;
- keyboard behavior for forms;
- fixed CTA behavior and scrollable content boundaries;
- readable Korean line breaks and `word-break: keep-all` behavior when relevant;
- contrast, focus states, disabled/loading/error states;
- empty, success, failure, and permission-denied states.

## 7. JSON spec shape

Use this shape when the user asks for structured output:

```json
{
  "language_mode": "ko",
  "domain": "fintech",
  "screen_types": ["signup", "identity_verification"],
  "font_profile": {
    "family": "Pretendard",
    "css_url": "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css",
    "fallback": "-apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Noto Sans KR, sans-serif"
  },
  "layout": {
    "safe_area": true,
    "fixed_bottom_cta": true,
    "sections": ["top_navigation", "headline", "form", "helper_copy", "cta"]
  },
  "components": ["top_back", "phone_input", "verification_code_input", "timer", "resend_button", "primary_cta"],
  "copy": {
    "title": "휴대폰 번호로 시작할게요",
    "primary_cta": "다음"
  },
  "states": ["default", "focused", "invalid", "loading", "success"]
}
```

## Do not

- Do not run image generation unless explicitly requested.
- Do not mix languages unless requested.
- Do not invent real brand fonts or proprietary design facts.
- Do not present implementation mechanics as user-facing product features.
- Do not upload unpublished screenshots, credentials, or project files that the user has not explicitly approved for sharing.
