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
| Screen types | `signup`, `identity_verification` |
| Tone | trustworthy, clear, low-friction |
| Layout | top navigation, large title, phone input, verification code input, timer/resend, fixed bottom CTA |

## UX/UI structure

- One primary task per screen: verify the user's phone number.
- Phone number field uses `tel` keyboard semantics.
- Verification code field supports timer and resend behavior.
- Terms/privacy helper copy stays close to the CTA.
- Bottom CTA remains fixed and clear.
- Trust cues are subtle, not visually loud.
- Include default, focused, invalid, loading, and success states.

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
code_label: 인증번호
code_placeholder: 6자리 숫자 입력
terms: 필수 약관 전체 동의
primary_cta: 다음
```

## Implementation prompt

Create a production-quality native mobile signup verification screen for a Korean fintech app. Use safe-area padding, 44pt+ touch targets, high text contrast, visible labels, inline helper text, timer/resend affordance, and a fixed bottom primary CTA. Use Korean UI copy only for the app screen.
