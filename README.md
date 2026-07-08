<p align="center">
  <img src="docs/assets/readme-banner.svg" alt="Mobile UI Generator Skill" width="100%" />
</p>

# Mobile UI Generator Skill

<p align="center">
  <em>Service-aware mobile UX/UI briefs, JSON specs, font profiles, and implementation prompts for AI agents.</em>
</p>

<p align="center">
  <a href="https://jinyoung89.github.io/mobile-ui-generator-skill/">Website</a>
  · <a href="README.ko.md">한국어</a>
  · <a href="skills/mobile-ui-generator/SKILL.md">Skill</a>
  · <a href="examples/briefs/fintech-signup.md">Example brief</a>
</p>

---

## What it is

**Mobile UI Generator Skill** helps AI agents create better mobile UX/UI outputs for real product flows.

It focuses on generation-ready structure:

1. choose the target app domain and screen flow;
2. define layout, hierarchy, components, states, and CTAs;
3. write locale-appropriate UI copy;
4. choose a language mode: English or Korean;
5. add a service-appropriate font profile;
6. produce Markdown briefs and JSON UI specs for design, code, Figma, or image-generation agents.

The skill does **not** run image generation unless the user explicitly asks for it.

## Language modes

Default public docs are English. Generated output should use **one selected language mode**:

| Mode | Use when | Rule |
|---|---|---|
| `en` | English product or documentation output | Use English narrative and English UI copy. |
| `ko` | Korean product output | Use Korean narrative and Korean UI copy. |

Do not mix English and Korean in the same user-facing output unless the user requests bilingual output or a brand/product name requires it.

## Screen taxonomy

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

## Service domains

The skill can adapt tone, layout, CTA hierarchy, and font choices for domains such as:

- fintech and banking;
- commerce and marketplace;
- mobility and delivery;
- healthcare and booking;
- education and learning;
- games and entertainment;
- messenger and social community;
- media/content apps;
- travel and reservation;
- SaaS/productivity;
- customer support and help centers.

## Font profiles

Typography is part of the generated UI. If a real brand font is confirmed by the user or public brand/design materials, use it. If the exact font is unknown, use a safe free/public Korean UI font profile.

| Font profile | Good for | Public URL |
|---|---|---|
| Pretendard | neutral Korean app UI, fintech, commerce, productivity | https://github.com/orioncactus/pretendard |
| SUIT | compact modern UI, onboarding, settings, dashboards | https://github.com/sunn-us/SUIT |
| Noto Sans KR | safe Android/Web fallback | https://fonts.google.com/noto/specimen/Noto+Sans+KR |
| IBM Plex Sans KR | tech, AI, analytics, editorial/product screens | https://fonts.google.com/specimen/IBM+Plex+Sans+KR |
| Spoqa Han Sans Neo | friendly consumer services, local commerce, food/lifestyle | https://github.com/spoqa/spoqa-han-sans |
| Wanted Sans | SaaS, recruiting, productivity, professional services | https://github.com/wanteddev/wanted-sans |

Example field:

```yaml
font_profile:
  family: Pretendard
  css_url: https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css
  fallback: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif
  confidence: recommended fallback
  reason: Neutral Korean mobile UI with strong numeric readability.
```

Rules:

- Do not invent a service-specific font name.
- Use confirmed brand fonts only when the user provides them or public brand/design docs confirm them.
- Always include a fallback stack for iOS, Android, and Web.
- Check each font license before commercial use.

## What the skill produces

| Output | Purpose |
|---|---|
| `mobile-ui-brief.md` | Human-readable UX/UI generation brief |
| `mobile-ui-brief.json` | Machine-readable UI spec |
| `font_profile` | Font family, CSS URL, fallback stack, and reason |
| `copy_system` | Locale-specific UI copy guidelines |
| `implementation_prompt` | Prompt for code, Figma, design-system, or image-generation agents |

## Example mobile views

The website includes nineteen HTML/CSS mobile UI demos. They are not uploaded app screenshots and not generated images. The examples are shown as a horizontal carousel on desktop and mobile.

Included flows:

- onboarding / preference setup;
- signup / identity verification;
- account cancellation;
- main home;
- checkout / payment;
- delivery tracking;
- booking and reservation;
- settings and permissions;
- empty state and search recovery.

Included domains:

- fintech / transfer;
- commerce / checkout;
- mobility / map booking;
- healthcare / appointment booking;
- game / lobby and rewards;
- education / lesson progress;
- messenger / chat;
- content / media viewer;
- travel / stay booking;
- subscription / paywall;
- customer support / chatbot.

Open the showcase:

```text
https://jinyoung89.github.io/mobile-ui-generator-skill/
```

## Repository layout

```text
skills/mobile-ui-generator/SKILL.md
examples/briefs/                  # public sample briefs
examples/specs/                   # public sample UI specs
docs/index.html                   # static showcase page
docs/assets/                      # public SVG artwork
```

## License

MIT
