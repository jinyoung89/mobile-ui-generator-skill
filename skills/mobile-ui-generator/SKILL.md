---
name: mobile-ui-generator
description: Use when generating, designing, specifying, reviewing, or handing off mobile app UX/UI screens and flows. Produces pattern-aware mobile UI briefs, JSON specs, design-system guidance, component/state matrices, font profiles, copy systems, and implementation prompts for fintech, commerce, mobility, healthcare, education, games, messaging, travel, AI, support, and Korean mobile UI.
version: 0.4.0
author: jinyoung89
license: MIT
tags: [mobile-ui, ux-ui, design, mobile-patterns, design-system, font-profile, korean-ui]
---

# Mobile UI Generator

## Overview

Use this skill when a user asks an agent to generate, design, code, review, or specify a **mobile app screen or flow**.

This is a design-first skill. It should not produce generic “modern mobile UI” advice. It must choose concrete mobile UI patterns, define layout and interaction decisions, specify component/state coverage, and produce implementation-ready handoff artifacts.

Do **not** run image generation unless the user explicitly asks for image generation.

## Reference files

Use these files as the skill's design knowledge base:

| Reference | Use for |
|---|---|
| `references/design-principles.md` | Core mobile design decision order, hierarchy, layout, typography, color, motion, accessibility |
| `references/mobile-pattern-library.md` | 60+ detailed mobile UI patterns with components, states, interactions, copy requirements, accessibility, anti-patterns |
| `references/visual-style-taxonomy.md` | Mobile visual styles, color moods, style combinations, and style anti-patterns |
| `references/domain-playbooks.md` | Domain-specific pattern, style, typography, color, trust, and anti-pattern guidance |
| `references/component-state-checklist.md` | Component inventories and state matrices for navigation, inputs, commerce, finance, maps, feedback, CTAs |
| `references/quality-review-checklist.md` | Pre-delivery quality gate for pattern fit, visual system, interaction, states, accessibility, and handoff |

Load only the references needed for the task, but for substantial design generation use at least:

1. `design-principles.md`
2. `mobile-pattern-library.md`
3. `component-state-checklist.md`
4. `quality-review-checklist.md`

Add `visual-style-taxonomy.md` when style, visual identity, color, typography, mood, or polish matters.
Add `domain-playbooks.md` when the request names a domain or app category.

## Workflow

### 1. Start from product intent and mobile pattern fit

Do **not** start with language, colors, or fonts. Start by extracting:

- user job;
- app domain;
- target screen/flow;
- primary UI pattern group;
- risk/trust level;
- completion, failure, empty, loading, and recovery states.

Examples:

| Request | Pattern interpretation |
|---|---|
| Korean fintech signup phone verification | `fintech`, `signup`, `phone_verification`, `terms_agreement`, `fixed_bottom_cta`, high trust |
| Commerce product detail to checkout | `commerce`, `PDP`, `cart`, `checkout`, `coupon_points`, `review`, purchase confidence |
| Mobility map booking | `mobility`, `map_location`, `bottom_sheet_map`, `reservation_booking`, `payment_cta`, location clarity |
| Game lobby with attendance reward | `game`, `game_lobby`, `daily_reward`, `quest_progress`, `ranking`, motivation/reward |
| Chat room with media attachments | `messenger`, `chat`, `media_capture`, `safe_area_keyboard`, continuous conversation |
| Account cancellation | `account_cancellation`, `risk_disclosure`, `benefit_loss`, `destructive_cta`, irreversible action |

Completion criterion: the selected patterns should make the screen's layout, components, interactions, and states predictable.

### 2. Build the pattern system before writing copy

For any non-trivial request, select 2-5 relevant patterns from `references/mobile-pattern-library.md`.

For each selected pattern, specify:

- `layout_archetype` — e.g. `single_task_form`, `map_plus_sheet`, `feed_stream`, `media_first_detail`, `list_filter_sheet`, `chat_thread`, `calendar_slots`, `settings_list`;
- `navigation_model` — top app bar, bottom tabs, modal, bottom sheet, stepper, full-screen flow;
- `required_components` — components actually needed by the pattern;
- `state_matrix` — default, loading, empty, error, success, disabled, permission, network, destructive, stale data;
- `interaction_model` — gestures, keyboard behavior, sheet states, validation, confirmation, retry, undo;
- `visual_hierarchy` — what the user sees first, second, and last;
- `mobile_constraints` — safe area, touch targets, keyboard-aware layout, fixed CTA, reduced motion;
- `anti_patterns` — concrete mistakes to avoid.

Completion criterion: a design/code agent can build the screen without guessing the main UI structure.

### 3. Choose domain and visual direction

When the app category is known, consult `references/domain-playbooks.md`.

When visual polish or style is requested, consult `references/visual-style-taxonomy.md` and define:

```yaml
visual_system:
  style_direction:
  typography_direction:
  color_direction:
  spacing_radius_elevation:
  motion_direction:
  icon_asset_guidance:
  anti_patterns:
```

Style should serve the domain and task:

- fintech/health/identity/destructive actions need clarity and trust over decoration;
- education/games/rewards can use more playful visual feedback;
- content/media/travel can be more image-led;
- analytics/business tools need data clarity and tabular numbers;
- AI/generation flows need transparent progress, edit/apply paths, and review affordances.

Completion criterion: the style choice includes what to use and what to avoid.

### 4. Define components and states

Consult `references/component-state-checklist.md`.

Every substantial spec should include:

```yaml
component_inventory:
  navigation:
  inputs:
  selection:
  content_or_cards:
  feedback:
  trust_or_legal:
  cta:
state_matrix:
  screen: [default, loading, empty, error, success]
  input: [empty, focused, filled, invalid, disabled]
  cta: [disabled, enabled, pressed, loading, success]
  network: [offline, timeout, retrying]
  permission: [not_requested, granted, denied, ask_later]
```

Adapt states to the pattern:

- `phone_verification`: invalid code, expired timer, resend available, too many attempts, verified;
- `checkout`: missing address, coupon unavailable, payment failed, payment loading, order success;
- `map_location`: permission denied, locating, no nearby results, route recalculating;
- `chat`: sending, failed to send, attachment uploading, keyboard open, unread separator;
- `analytics_report`: loading, no data, filtered empty, stale data, chart error.

Completion criterion: no important component exists only in the happy path.

### 5. Set output language and copy after the design model

Language mode is a copy/output setting, not the first design decision.

| Mode | Behavior |
|---|---|
| `en` | English narrative and English UI copy |
| `ko` | Korean narrative and Korean UI copy |

Rules:

- Use the user's language if not specified.
- Do not mix English and Korean in user-facing UI copy unless explicitly requested.
- Product names, font names, framework names, and brand names may remain in their original language.
- Korean UI copy should be natural, short, and pattern-aware.
- Include state copy for errors, empty states, loading, success, permissions, destructive actions, and support paths.

### 6. Add typography and font profile

If a service-specific font is confirmed by the user or public brand/design docs, use it. Otherwise choose a safe public Korean UI font profile.

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
  family:
  css_url:
  fallback:
  confidence:
  reason:
  license_note:
```

Do not invent proprietary brand fonts.

### 7. Run quality review before final output

Use `references/quality-review-checklist.md` before finalizing.

Minimum quality gate:

```yaml
quality_gate:
  selected_patterns: present
  layout_archetype: present
  component_inventory: present
  state_matrix: present
  visual_system: present
  interaction_model: present
  accessibility_notes: present
  anti_patterns: present
  implementation_prompt: present_when_requested
```

Revise the answer if it only contains generic visual adjectives, lacks states, lacks component inventory, or lacks domain-specific decisions.

## Output formats

### Markdown brief

```markdown
# Mobile UI Brief

## Intent
- user_job:
- domain:
- flow:
- target_patterns:
- risk_level:
- language_mode:

## Pattern system
- layout_archetype:
- navigation_model:
- primary_components:
- state_matrix:
- interaction_model:
- anti_patterns:

## Screen spec
- visual_hierarchy:
- sections:
- fixed/sticky regions:
- empty/error/loading/success states:

## Visual system
- style_direction:
- typography_direction:
- color_direction:
- spacing/radius/elevation:
- motion_direction:
- icon/asset guidance:

## Copy system
- title:
- helper copy:
- CTA:
- error/success/empty/loading/permission copy:

## Accessibility and mobile constraints
- safe area:
- touch targets:
- keyboard behavior:
- reduced motion:
- screen reader labels:

## Implementation prompt
...
```

### JSON spec

```json
{
  "domain": "fintech",
  "flow": "signup",
  "target_patterns": ["signup", "phone_verification", "terms_agreement", "fixed_bottom_cta"],
  "risk_level": "high_trust",
  "language_mode": "ko",
  "layout_archetype": "single_task_form",
  "navigation_model": "top_app_bar_with_back",
  "visual_system": {
    "style_direction": "minimal_swiss + data_dense_professional",
    "typography_direction": "numeric-readable Korean UI sans",
    "color_direction": "navy, trust blue, neutral surfaces, semantic error/success",
    "motion_direction": "subtle 150-250ms validation and submit feedback"
  },
  "font_profile": {
    "family": "Pretendard",
    "css_url": "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css",
    "fallback": "-apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Noto Sans KR, sans-serif"
  },
  "component_inventory": [
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
  "mobile_constraints": ["safe_area", "44pt_touch_targets", "keyboard_aware_layout", "fixed_bottom_cta"],
  "anti_patterns": ["playful_visual_tone", "ambiguous_legal_copy", "happy_path_only"]
}
```

## Common pitfalls

1. **Starting with language, font, or color.** Start with user job, domain, flow, and pattern fit.
2. **Generic modern UI.** Always name concrete patterns and anti-patterns.
3. **Happy-path-only output.** Include loading, empty, error, success, disabled, and permission states where relevant.
4. **No component inventory.** A spec without components is not implementation-ready.
5. **Visual style without domain fit.** Style must match trust level and task pressure.
6. **Copy without state coverage.** Include state-specific copy.
7. **Unverified brand claims.** Do not invent proprietary brand fonts, design systems, or private facts.
8. **Unrequested image generation.** Never generate images unless explicitly requested.

## Verification checklist

- [ ] Relevant reference files consulted.
- [ ] User job, domain, flow, pattern group, and risk level stated.
- [ ] Pattern system includes layout, navigation, components, states, interactions, and anti-patterns.
- [ ] Visual system includes style, typography, color, spacing/elevation, motion, and icon/asset guidance.
- [ ] Component-state matrix covers non-happy paths.
- [ ] Accessibility and mobile constraints are explicit.
- [ ] Output language is selected after design structure.
- [ ] Final answer passes the quality gate.
- [ ] No non-public source material, collection mechanics, or source-specific identifiers are exposed.
