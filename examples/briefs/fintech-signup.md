# Example Brief: Korean Fintech Signup

## Request

한국 핀테크 앱 회원가입 휴대폰 인증 화면

## Inferred Intent

| Field | Value |
|---|---|
| Screen type | 본인인증 / `identity_verification` |
| Target screens | `signup`, `identity_verification` |
| Domain | 핀테크 / `fintech` |
| Layout | top navigation, large title, phone input, verification code input, timer/resend, fixed bottom CTA |

## Reference-backed structure

- Large Korean headline with one task per screen
- Phone number field uses `tel` keyboard semantics
- Verification code field appears as next step or disabled preview
- Terms/privacy helper copy stays close to CTA
- Bottom CTA remains fixed and clear
- Trust cues are subtle, not visually loud

## Code/Figma prompt

Create a production-quality native mobile signup verification screen for a Korean fintech app. Use safe-area padding, 44pt+ touch targets, high text contrast, visible labels, inline helper text, timer/resend affordance, and a fixed bottom primary CTA. Prefer exact Korean UI copy over placeholder text.
