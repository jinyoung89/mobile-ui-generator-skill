---
name: mobile-ui-generator
description: Generate service-aware mobile UX/UI briefs, JSON specs, pattern systems, font profiles, copy systems, and implementation prompts for app screens and flows. Use for onboarding, signup, checkout, account cancellation, home screens, fintech, commerce, games, education, messenger, healthcare, travel, Korean mobile UI generation, and mobile UI pattern design.
version: 0.3.1
author: jinyoung89
license: MIT
tags: [mobile-ui, ux-ui, design, mobile-patterns, prompt-engineering, font-profile, korean-ui]
---

# Mobile UI Generator

Use this skill when a user asks an agent to generate, design, code, or specify a mobile app screen or flow.

This skill is about **mobile UX/UI generation**. It should produce clear design briefs, pattern-aware UI specs, and implementation-ready prompts for agent handoff.

The skill should not merely name a screen type. It must translate the requested app domain and screen flow into concrete mobile design decisions: layout archetype, navigation model, component inventory, states, interactions, copy, typography, and handoff constraints.

## Reference files

- `references/mobile-pattern-library.md` — public-safe mobile UI pattern library distilled from observed mobile screen structures. Use this file when choosing patterns, required components, state matrices, interactions, copy requirements, and anti-patterns.

The reference library intentionally contains **generalized design knowledge only**. It must not include non-public source material, collection mechanics, provider names, or source-specific identifiers.

## Pattern coverage loop

When a new or under-modeled mobile pattern is discovered:

1. Capture it in a private/local backlog first. Do not publish source-specific identifiers or collection mechanics.
2. Normalize it into a generic pattern ID, e.g. `gift_send_receive`, `analytics_report`, `voice_interaction`, or `device_control`.
3. Add the public-safe checklist to `references/mobile-pattern-library.md` with `user_intent`, `layout`, `required_components`, `states`, `interactions`, `copy_requirements`, `accessibility`, and `anti_patterns`.
4. If it changes the always-needed process, update this `SKILL.md`; otherwise keep the detail in the reference file.
5. Run `python3 scripts/validate_patterns.py` and `python3 scripts/validate_site.py` before publishing.

Completion criterion: every newly added pattern has a concrete state matrix and at least one anti-pattern, and no public file exposes non-public source material.

## Core outputs

Produce one or more of the following depending on the request:

- `mobile-ui-brief.md` — human-readable UX/UI generation brief;
- `mobile-ui-brief.json` — machine-readable UI spec;
- `pattern_system` — screen pattern groups, layout archetype, components, interactions, and states;
- `font_profile` — font family, CSS/download URL, fallback stack, and reason;
- `copy_system` — language-specific UI copy guidelines;
- `implementation_prompt` — prompt for a code, Figma, design-system, or image-generation agent.

Do **not** run image generation unless the user explicitly requests image generation.

## 1. Start from product intent, screen flow, and UI patterns

Do **not** start by choosing language. Start by understanding the product task and the mobile UI pattern that solves it.

Extract these design inputs first:

1. **User job** — what the user is trying to complete now.
2. **Domain** — fintech, commerce, mobility, education, game, messenger, healthcare, travel, content, support, etc.
3. **Screen flow** — onboarding, signup, home, search, list, detail, checkout, booking, chat, settings, cancellation, etc.
4. **Primary UI pattern group** — concrete pattern such as `phone_verification`, `bottom_sheet_map`, `PLP_filter_sort`, `review_write`, `points_rewards`, `empty_state_recovery`, etc.
5. **Risk/trust level** — money, health, identity, privacy, destructive action, or casual browsing.
6. **Completion state** — what success, failure, loading, empty, and recovery look like.

Examples:

- `한국 핀테크 앱 회원가입 휴대폰 인증 화면` => `fintech`, `signup`, `identity_verification`, `phone_verification`, `terms_agreement`, `fixed_bottom_cta`, high trust.
- `커머스 상품상세 장바구니 결제 화면` => `commerce`, `product_detail`, `cart`, `checkout`, `coupon_payment`, `legal_notice`, `amount_cta`, purchase confidence.
- `모빌리티 지도 예약 결제 화면` => `mobility`, `map_location`, `reservation_booking`, `bottom_sheet_map`, `eta_price_card`, `payment_cta`, location clarity.
- `게임 앱 메인 로비와 출석 보상 화면` => `game`, `home`, `game_lobby`, `daily_reward`, `quest_progress`, `ranking`, motivation/reward.
- `교육 앱 오늘의 학습과 퀴즈 화면` => `education`, `lesson_home`, `progress`, `quiz`, `resume_learning`, `wrong_answer_review`, learning recovery.
- `메신저 앱 채팅방과 메시지 입력 화면` => `messenger`, `chat`, `message_bubbles`, `composer`, `attachment_menu`, `safe_area_keyboard`, continuous conversation.
- `서비스 탈퇴 전 확인 화면` => `account`, `account_cancellation`, `risk_disclosure`, `benefit_loss`, `destructive_cta`, irreversible action.

## 2. Build the pattern system before writing copy

For any non-trivial request, consult `references/mobile-pattern-library.md` and select 2-5 relevant patterns.

For each selected pattern, specify:

- `layout_archetype` — e.g. `single_task_form`, `map_plus_sheet`, `feed_stream`, `media_first_detail`, `list_filter_sheet`, `chat_thread`.
- `navigation_model` — top app bar, bottom tabs, modal, bottom sheet, stepper, or full-screen flow.
- `required_components` — only the components needed for the selected pattern.
- `state_matrix` — default, loading, empty, error, success, disabled, permission, network, destructive, etc.
- `interaction_model` — gestures, keyboard behavior, bottom-sheet states, form validation, confirmation, retry, undo.
- `visual_hierarchy` — what must be seen first, second, and last.
- `mobile_constraints` — safe area, 44pt+ touch targets, keyboard-aware layout, fixed CTA, reduced motion.
- `anti_patterns` — concrete mistakes to avoid.

Completion criterion: the brief should let a design/code agent build a screen without guessing the main layout, components, states, or interactions.

## 3. Mobile UI pattern catalog

Use this catalog as the quick index, then consult `references/mobile-pattern-library.md` for the detailed checklist. Extend it when the user describes a more specific service.

### Acquisition / onboarding

| Pattern | Use for | Required design decisions |
|---|---|---|
| `splash` | app launch, brand impression | brand mark, loading duration, fallback state, transition into onboarding/home |
| `onboarding_intro` | first-run value explanation | 1 idea per screen, illustration/media slot, skip/next affordance, progress dots |
| `preference_setup` | personalization | chips, multi-select state, progressive disclosure, default recommendations |
| `permission_request` | notification/location/camera access | explain why before OS prompt, allow later path, denied state |
| `tutorial_coachmark` | explaining new feature | overlay hierarchy, dismiss target, never block core task for too long |

### Auth / identity / terms

| Pattern | Use for | Required design decisions |
|---|---|---|
| `login` | returning users | social login, phone/email login, password reset, biometric option |
| `signup` | new users | minimal fields, trust copy, progress state, duplicate account handling |
| `phone_verification` | SMS verification | tel keyboard, timer, resend, code error state, auto-submit behavior |
| `identity_verification` | fintech/regulated apps | legal copy, security reassurance, document/phone/certificate route |
| `terms_agreement` | legal consent | required vs optional groups, expand detail, all-agree behavior |
| `account_cancellation` | withdrawal/delete account | benefit loss, irreversible warnings, reason field, cooling-off or rejoin policy, destructive CTA hierarchy |

### Home / navigation / menu

| Pattern | Use for | Required design decisions |
|---|---|---|
| `main_home` | app landing after login | primary metric/task, shortcuts, personalized module, banner, re-entry path |
| `bottom_tabs` | main app navigation | 3-5 tabs, active state, badge count, safe-area spacing |
| `top_app_bar` | contextual navigation | back/title/actions, search entry, sticky/collapsing behavior |
| `menu_drawer` | secondary navigation | grouped menu, account area, settings/support access |
| `my_page` | user profile/account hub | profile summary, benefits, orders/history, settings, support, logout |
| `membership` | loyalty/subscription hub | tier, benefits, points, renewal/upgrade CTA |

### Search / discovery / listing

| Pattern | Use for | Required design decisions |
|---|---|---|
| `search` | keyword discovery | search field, recent terms, suggestions, voice/camera option if relevant |
| `filter_sort` | list refinement | filter chips, sort, applied count, reset, bottom-sheet filter on mobile |
| `category_browse` | browsing hierarchy | category chips/grid, selected state, horizontal scroll, empty category state |
| `PLP` | product/listing page | card density, image ratio, price/rating badges, wishlist, pagination/infinite scroll |
| `comparison` | compare products/plans | sticky headers, 2-4 item limit, difference highlighting |
| `nearby` | local discovery | map/list toggle, distance, open status, location permission fallback |

### Detail / content / viewer

| Pattern | Use for | Required design decisions |
|---|---|---|
| `PDP` | product detail | media gallery, price, options, delivery/return, reviews, sticky purchase CTA |
| `content_viewer` | article/video/audio | media hero, progress, metadata, engagement actions, next content path |
| `image_video_viewer` | photo/video browsing | full-screen mode, gestures, caption, share/save actions |
| `bookmark_wishlist` | saved items | saved state, folders/collections, remove undo, empty state |
| `announcement` | notices | priority badge, date, read/unread, attachment/link handling |

### Commerce / payment / order

| Pattern | Use for | Required design decisions |
|---|---|---|
| `cart` | pre-checkout | item edit, quantity, shipping, coupon, price summary |
| `checkout` | purchase confirmation | address, payment method, coupon/points, legal copy, total amount CTA |
| `simple_payment` | one-tap/easy pay | saved method, biometric/auth step, failure recovery, receipt |
| `coupon_points` | discounts/loyalty | available vs unavailable, apply all, expiration, constraints |
| `order_complete` | success | receipt summary, next action, delivery tracking, share/save |
| `order_history` | purchase history | status filters, reorder, refund/exchange, invoice/receipt |
| `review` | review browsing | rating summary, photo reviews, filter by rating/topic |
| `review_write` | review creation | star rating, text/photo upload, incentive note, validation |

### Finance / wallet / records

| Pattern | Use for | Required design decisions |
|---|---|---|
| `account_overview` | balance/asset home | masked balances, account cards, primary actions, security state |
| `transfer` | send money | recipient, amount keypad, fee, memo, confirmation, fraud warning |
| `transaction_history` | 내역/history | date grouping, category, search/filter, receipt/detail drilldown |
| `card_detail` | card/wallet | spending, benefits, limits, lock/report lost, card art |
| `investment_portfolio` | holdings | gain/loss color semantics, chart, risk notice, asset allocation |
| `security_auth` | finance auth | biometric/PIN/certificate, timeout, retry lock, fallback support |

### Booking / map / mobility / travel

| Pattern | Use for | Required design decisions |
|---|---|---|
| `map_location` | map-first UX | current location, marker clustering, search, permission denied state |
| `route_navigation` | directions/길찾기 | origin/destination, ETA, route options, step preview |
| `reservation_booking` | booking slot | calendar, time slot state, provider/resource, cancellation policy |
| `bottom_sheet_map` | map + details | collapsed/half/full states, drag handle, CTA pinned in sheet |
| `delivery_tracking` | order/rider/package | ETA, progress timeline, map, contact/support, issue report |
| `stay_booking` | hotel/travel | date/guest summary, room card, price breakdown, cancellation confidence |

### Social / messaging / creation

| Pattern | Use for | Required design decisions |
|---|---|---|
| `feed` | social/content feed | content card hierarchy, reactions, comments, save/share, infinite scroll |
| `chat` | messaging | bubble alignment, timestamps, composer, attachments, keyboard safe area |
| `notification` | alerts | read/unread, grouping, actionability, permission re-entry |
| `profile` | user/creator page | avatar, stats, follow/message, content tabs |
| `write_post` | 글쓰기/content creation | title/body/media, draft save, visibility, validation, publish CTA |
| `media_capture` | camera/recording/upload | permission, preview, retake, progress, compression/error |

### Engagement / rewards / game

| Pattern | Use for | Required design decisions |
|---|---|---|
| `gamification` | habit, education, commerce, games | progress, levels, streak, feedback animation, reward clarity |
| `ranking` | leaderboard | rank delta, period filter, current user highlight, fairness note |
| `points_rewards` | loyalty/rewards | earn/burn, expiration, tier, reward redemption CTA |
| `event_promotion` | 기획전/이벤트 | hero banner, period, benefit, participation CTA, terms |
| `quest_progress` | game/learning tasks | task list, completion state, reward preview, claim CTA |

### Support / help / system states

| Pattern | Use for | Required design decisions |
|---|---|---|
| `customer_support` | help entry | FAQ chips, bot/agent route, recent inquiry, escalation path |
| `faq` | self-service | category, search, expand/collapse, helpful feedback |
| `inquiry` | 문의하기 | category, attachments, contact info, response time expectation |
| `empty_state` | no content/search result | cause, helpful copy, alternate path, primary recovery action |
| `error_state` | failure | what happened, retry, fallback, support link, avoid blame copy |
| `loading_skeleton` | async content | skeleton matching final layout, avoid spinner-only for long loads |
| `success_state` | task complete | confirmation, summary, next best action, receipt/share if relevant |

## 4. Layout archetypes

Choose one or more archetypes and explain why:

| Archetype | Best for | Notes |
|---|---|---|
| `single_task_form` | signup, verification, transfer | one task, strong title, visible labels, fixed bottom CTA |
| `feed_stream` | social/content/home | repeated cards, pagination/infinite scroll, content actions |
| `dashboard_cards` | finance/home/health | summary metric, cards, shortcuts, alerts |
| `map_plus_sheet` | mobility/nearby/delivery | map context + draggable bottom sheet + pinned CTA |
| `media_first_detail` | PDP/content/travel | image/video hero + detail sections + sticky CTA |
| `list_filter_sheet` | PLP/history/search | list with chip filters and bottom-sheet refinement |
| `chat_thread` | messenger/support | message list, composer, keyboard-safe bottom area |
| `calendar_slots` | booking/healthcare | date strip, slot states, provider/resource info |
| `settings_list` | settings/account/help | grouped list, toggles, destructive actions separated |
| `empty_recovery` | empty/error/no result | illustration, plain explanation, alternate path |

## 5. Component inventory checklist

When generating a screen, include only the components that fit the selected pattern.

- Navigation: status bar, top app bar, back button, close button, bottom tabs, segmented tabs.
- Inputs: text field, phone field, search field, amount keypad, checkbox, radio, toggle, picker, slider.
- Selection: chips, category grid, filter sheet, sort menu, option cards, plan cards.
- Commerce: product card, price row, coupon row, payment method, order summary, receipt.
- Social/content: feed card, avatar, reaction buttons, comment entry, share/save, media viewer.
- Map/booking: map marker, route card, ETA, calendar strip, time slot, bottom sheet.
- Feedback: toast, snackbar, inline error, banner alert, skeleton, progress bar, empty state.
- Trust/legal: terms link, privacy helper, risk notice, fee disclosure, cancellation policy.
- CTA: primary, secondary, destructive, disabled, loading, sticky/fixed bottom.

## 6. State matrix requirements

For each important component, specify states. At minimum:

```yaml
states:
  screen: [default, loading, empty, error, success]
  input: [empty, focused, filled, invalid, disabled]
  cta: [enabled, disabled, loading, destructive]
  network: [offline, retrying, timeout]
  permission: [not_requested, granted, denied, ask_later]
```

Examples:

- `phone_verification`: invalid code, timer expired, resend available, too many attempts, auto-submit success.
- `checkout`: coupon unavailable, payment failed, address missing, terms unchecked, order success.
- `map_location`: permission denied, GPS loading, no nearby results, route recalculating.
- `chat`: sending, failed to send, attachment uploading, keyboard open, unread separator.

## 7. Domain-specific design guidance

Adapt the interface to the service category:

- **Fintech/banking**: trust, numeric clarity, low-risk CTA wording, strong confirmation states, security cues, fee/risk disclosure.
- **Commerce/marketplace**: product summary, price hierarchy, coupon/payment rows, review/social proof, legal notice near CTA.
- **Mobility/delivery**: map or route preview, ETA, status timeline, bottom sheet, contextual support action.
- **Healthcare/booking**: provider trust, schedule clarity, cancellation policy, privacy-sensitive copy, confirmation step.
- **Education**: progress, module structure, encouragement, resume CTA, quiz/wrong-answer recovery.
- **Game**: high-energy visual hierarchy, rewards, level/progress, ranking, limited-time cues, strong feedback.
- **Messenger/social**: readable conversation rhythm, composer affordance, media attachments, safe-area spacing.
- **Content/media**: media hero, metadata, engagement actions, next-content path, viewer controls.
- **Travel/reservation**: visual appeal, date/guest summary, price, cancellation confidence, itinerary state.
- **Support/help center**: common issue routing, FAQ chips, bot/agent escalation, response time expectation.

## 8. Output language and UI copy system

Choose language mode only after the design pattern and flow are clear. Language mode controls the narrative language and UI microcopy; it is not the first design decision.

| Mode | Output behavior |
|---|---|
| `en` | English narrative and English UI copy |
| `ko` | Korean narrative and Korean UI copy |

Rules:

- Do not mix English and Korean in the same user-facing output unless the user asks for bilingual output.
- Product names, font names, framework names, and brand names may remain in their original language.
- For Korean UI, prefer natural Korean microcopy over literal translation.
- Tie copy to the selected pattern: verification copy differs from checkout copy, map copy, review copy, support copy, and destructive-action copy.
- Include error, empty, loading, success, and permission copy when those states exist.

## 9. Typography / font profile

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

## 10. Mobile UX constraints

Always consider:

- safe-area insets and bottom navigation/CTA zones;
- 44pt+ touch targets;
- keyboard behavior for forms and chat composer;
- fixed CTA behavior and scrollable content boundaries;
- readable Korean line breaks and `word-break: keep-all` behavior when relevant;
- contrast, focus states, disabled/loading/error states;
- empty, success, failure, and permission-denied states;
- haptic/animation notes when useful, with reduced-motion fallback.

## 11. Output format

For a substantial screen request, produce this structure:

```markdown
# Mobile UI Brief

## Intent
- domain:
- flow:
- target_patterns:
- language_mode:

## Pattern system
- layout_archetype:
- navigation_model:
- primary_components:
- state_matrix:
- interaction_model:

## Screen spec
- hierarchy:
- sections:
- fixed/sticky regions:
- empty/error/loading states:

## Copy system
- title:
- helper copy:
- CTA:
- error/success messages:

## Visual system
- font_profile:
- color direction:
- spacing/radius/elevation:
- icon/asset guidance:

## Implementation prompt
...
```

Machine-readable shape:

```json
{
  "domain": "fintech",
  "flow": "signup",
  "target_patterns": ["signup", "phone_verification", "terms_agreement", "fixed_bottom_cta"],
  "language_mode": "ko",
  "layout_archetype": "single_task_form",
  "navigation_model": "top_app_bar_with_back",
  "font_profile": {
    "family": "Pretendard",
    "css_url": "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css",
    "fallback": "-apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Noto Sans KR, sans-serif"
  },
  "components": [
    "top_back",
    "large_title",
    "phone_input",
    "verification_code_input",
    "timer",
    "resend_button",
    "terms_checkbox",
    "fixed_bottom_cta"
  ],
  "state_matrix": {
    "screen": ["default", "loading", "error", "success"],
    "verification_code_input": ["empty", "focused", "invalid", "expired", "locked"],
    "cta": ["disabled", "enabled", "loading"]
  },
  "copy": {
    "title": "휴대폰 번호로 시작할게요",
    "subtitle": "안전한 가입을 위해 본인 명의 번호를 확인합니다.",
    "primary_cta": "다음"
  },
  "mobile_constraints": ["safe_area", "44pt_touch_targets", "keyboard_aware_layout", "fixed_bottom_cta"]
}
```

## Do not

- Do not run image generation unless explicitly requested.
- Do not mix languages unless requested.
- Do not invent real brand fonts or proprietary design facts.
- Do not output generic UI advice without selecting concrete patterns.
- Do not describe generated designs as being based on non-public collection or analysis. Use the generalized pattern library instead.
- Do not skip states; mobile UI quality depends on empty/loading/error/success/permission states.
- Do not present implementation mechanics as user-facing product features.
- Do not upload unpublished screenshots, credentials, or project files that the user has not explicitly approved for sharing.
