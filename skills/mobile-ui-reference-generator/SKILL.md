---
name: mobile-ui-reference-generator
description: Build reference-backed mobile UI generation briefs from a local, authorized mobile UI corpus. Use for signup, onboarding, checkout, fintech, commerce, mobility, social, and Korean mobile UI design/code prompts.
version: 0.1.1
author: jinyoung89
license: MIT
tags: [mobile-ui, ui-reference, assets, prompt-engineering, qa]
---

# Mobile UI Reference Generator

Use this skill when a user asks for a mobile UI screen/flow and wants the output grounded in a local reference corpus rather than generic model memory.

## Data boundary

The public skill does **not** contain raw media, private connector details, API endpoints, credentials, or private crawler code. It expects any private corpus and manifests to already exist locally.

## Core idea

Do **not** generate an image by default. Instead:

1. retrieve relevant mobile UI references from a local manifest/index;
2. retrieve related assets from the local asset manifest;
3. compile a Markdown brief and JSON UI spec;
4. run quality gates to check integrity, coverage, reference relevance, and asset fit;
5. hand the brief/spec to a design, code, or Figma-capable agent.

## Expected local inputs

Use generic local paths unless the user/project specifies otherwise:

```text
data/reference-manifest.jsonl
data/asset-manifest.jsonl
output/mobile-ui-brief.md
output/mobile-ui-brief.json
output/quality-report.md
```

Raw/private collection outputs should remain ignored and must not be uploaded by default.

## Recommended workflow

### 1. Clarify target flow

Identify domain and target screen types from the user's request.

Examples:

- `한국 핀테크 앱 회원가입 휴대폰 인증 화면` => `fintech`, `signup`, `identity_verification`
- `커머스 상품상세 장바구니 결제 화면` => `commerce`, `product_detail`, `cart`, `payment`
- `모빌리티 지도 예약 결제 화면` => `mobility`, `map_location`, `reservation_booking`, `payment`
- `게임 앱 메인 로비와 출석 보상 화면` => `game`, `home`, `points_rewards`
- `교육 앱 오늘의 학습과 퀴즈 화면` => `education`, `home`, `lesson`, `quiz`
- `메신저 앱 채팅방과 메시지 입력 화면` => `messenger`, `chat`
- `서비스 탈퇴 전 확인 화면` => `account`, `cancellation`, `terms`

### 2. Retrieve references and assets

Search the local reference manifest by domain, screen type, app/category diversity, and pattern labels. Prefer balanced evidence over a single dominant app/source.

### 3. Generate a brief

A good brief includes:

- inferred domain and target screen types;
- reference evidence table;
- asset references with colors/local paths;
- font profile with source/download URL and fallback stack;
- image/code/Figma prompt text;
- negative prompt;
- valid JSON UI spec;
- quality score report.


### 5. Add a font profile

For real mobile UX/UI work, include typography in the brief. If a service-specific font is confirmed by the user, public brand docs, or design assets, use it. Otherwise choose a free/public Korean UI font profile and include the URL.

Starter font profiles:

| Profile | Use when | URL |
|---|---|---|
| Pretendard | neutral Korean app UI, fintech, commerce, productivity | https://github.com/orioncactus/pretendard |
| SUIT | compact modern UI, onboarding/settings/dashboard | https://github.com/sunn-us/SUIT |
| Noto Sans KR | safe Android/Web fallback | https://fonts.google.com/noto/specimen/Noto+Sans+KR |
| IBM Plex Sans KR | tech, AI, analytics, editorial/product UI | https://fonts.google.com/specimen/IBM+Plex+Sans+KR |
| Spoqa Han Sans Neo | friendly consumer/local commerce UI | https://github.com/spoqa/spoqa-han-sans |
| Wanted Sans | SaaS, recruiting, productivity, professional services | https://github.com/wanteddev/wanted-sans |

Recommended `font_profile` shape:

```yaml
font_profile:
  family: Pretendard
  css_url: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css
  fallback: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
  confidence: recommended fallback
  reason: Neutral Korean mobile UI with strong numeric readability.
```

### 6. Quality gate

Score or manually check:

- reference integrity;
- domain/screen coverage;
- multi-step query relevance;
- asset fit;
- native mobile constraints;
- Korean UI copy quality;
- valid JSON spec.

## Retrieval rules

- Detect multiple target screen types in one query. Example: `회원가입과 결제` => `signup`, `payment`.
- If enough matching references exist, exclude unrelated screens from the brief.
- Select assets from the same target screen types or same reference apps before falling back.
- Keep MP4/SVG/JSON/Lottie-like media as media metadata; do not force them through image-only analysis.
- Keep private connector details out of public briefs unless the user explicitly asks to include them.
- Do not invent service-specific font names; use confirmed brand typography or a declared fallback font profile.
- Include iOS/Android/Web fallback font stacks and license-check notes for any downloadable font.

## Do not

- Do not run image generation unless explicitly requested.
- Do not upload raw private reference data by default.
- Do not publish private connector names, endpoints, credentials, or private connector code.
- Do not let a single app dominate a dataset; use per-app and per-screen caps.
