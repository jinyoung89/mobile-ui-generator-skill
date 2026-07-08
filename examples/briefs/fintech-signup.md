# Example Brief: Korean Fintech Signup

## Request

Create a Korean fintech signup screen for phone-number verification.

## Language mode

```yaml
language_mode: ko
```

The generated UI copy should be Korean. Explanatory documentation can be English because this is an English example file.

## Inferred intent

| Field | Value |
|---|---|
| Domain | `fintech` |
| Flow | `signup` |
| Target patterns | `signup`, `phone_verification`, `terms_agreement`, `fixed_bottom_cta` |
| Layout archetype | `single_task_form` |
| Tone | trustworthy, clear, low-friction |

## Pattern system

```yaml
pattern_system:
  layout_archetype: single_task_form
  navigation_model: top_app_bar_with_back
  primary_patterns:
    - signup
    - phone_verification
    - terms_agreement
    - fixed_bottom_cta
  required_components:
    - top_back
    - large_title
    - phone_input
    - verification_code_input
    - timer
    - resend_button
    - terms_checkbox
    - fixed_bottom_cta
  state_matrix:
    screen: [default, loading, error, success]
    phone_input: [empty, focused, filled, invalid, disabled]
    verification_code_input: [empty, focused, invalid, expired, locked]
    cta: [disabled, enabled, loading]
  mobile_constraints:
    - safe_area
    - 44pt_touch_targets
    - keyboard_aware_layout
    - readable_korean_line_breaks
```

## UX/UI structure

- One primary task per screen: verify the user's phone number.
- Phone number field uses `tel` keyboard semantics.
- Verification code field supports timer, resend, expiry, invalid-code, and lockout states.
- Terms/privacy helper copy stays close to the CTA.
- Bottom CTA remains fixed and clear, but disabled until required inputs and terms are valid.
- Trust cues are subtle: security copy, privacy link, and clear error recovery instead of loud badges.
- Avoid playful visuals, unclear fees, or ambiguous legal copy in fintech signup.

## Typography / font profile

```yaml
font_profile:
  family: Pretendard
  css_url: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css
  fallback: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
  confidence: recommended fallback
  reason: Neutral Korean fintech UI with strong numeric readability.
```

## Korean UI copy

```yaml
title: 휴대폰 번호로 시작할게요
subtitle: 안전한 가입을 위해 본인 명의 번호를 확인합니다.
phone_label: 휴대폰 번호
phone_placeholder: 010 1234 5678
code_label: 인증번호
code_placeholder: 6자리 숫자 입력
timer: 02:58
resend: 인증번호 다시 받기
terms: 필수 약관 전체 동의
invalid_code: 인증번호가 일치하지 않아요.
expired_code: 인증 시간이 만료됐어요. 다시 받아주세요.
primary_cta: 다음
```

## Implementation prompt

Create a production-quality native mobile signup verification screen for a Korean fintech app. Use safe-area padding, 44pt+ touch targets, high text contrast, visible labels, inline helper text, timer/resend affordance, invalid/expired/locked code states, and a fixed bottom primary CTA. Use Korean UI copy only for the app screen. The screen should feel trustworthy, numeric-readable, and low-friction.
