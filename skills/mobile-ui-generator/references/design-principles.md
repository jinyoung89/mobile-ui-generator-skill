# Mobile Design Principles

Use this reference to make design decisions before writing UI copy or implementation prompts. It focuses on mobile app screens and flows.

## Decision order

1. **User job** — what action or decision should the user complete now?
2. **Risk level** — casual browse, money, health, privacy, identity, or destructive action?
3. **Pattern fit** — which known mobile pattern solves this job?
4. **Information hierarchy** — what must be seen first, second, and last?
5. **Interaction model** — tap, swipe, drag, sheet, keyboard, scan, voice, or upload?
6. **State model** — default, loading, empty, error, success, disabled, permission, offline.
7. **Visual system** — typography, color, spacing, radius, icon, elevation, motion.
8. **Platform constraints** — iOS/Android safe areas, back behavior, dynamic type, reduced motion.

## Visual hierarchy

Every screen needs a clear reading order:

| Layer | Question | Design guidance |
|---|---|---|
| Primary task | What is this screen for? | One strong title or status summary; avoid competing hero blocks. |
| Decision data | What does the user need to decide? | Put price, time, recipient, location, balance, status, or risk near the CTA. |
| Action | What should happen next? | One primary CTA; secondary actions visually lower. |
| Confidence | Why can the user trust this? | Surface policy, fee, privacy, security, review, or status copy where relevant. |
| Recovery | What if it fails? | Retry, edit, undo, contact support, reset filter, ask later. |

## Layout rhythm

Use a consistent 4/8pt rhythm.

| Token | Typical value | Use |
|---|---:|---|
| `space_1` | 4 | icon/text micro gap |
| `space_2` | 8 | chip gap, compact row gap |
| `space_3` | 12 | form helper gap, card inner gap |
| `space_4` | 16 | screen side padding on compact phones |
| `space_5` | 20 | list/card padding |
| `space_6` | 24 | section spacing |
| `space_8` | 32 | major vertical separation |
| `space_12` | 48 | hero/major module separation |

Rules:

- Use 16–20pt horizontal screen padding for phone screens.
- Reserve bottom content inset when bottom tab or fixed CTA exists.
- Avoid nested scroll regions unless the pattern needs a map sheet, chat, or tabbed view.
- Lists need consistent row heights and predictable dividers or spacing.

## Mobile layout archetypes

| Archetype | Use for | Structure |
|---|---|---|
| `single_task_form` | signup, verification, transfer, application | top app bar → title → fields → helper/trust copy → fixed CTA |
| `dashboard_cards` | finance, health, productivity home | summary card → shortcuts → alerts → personalized modules |
| `feed_stream` | social, content, community | top/filter → repeated content cards → engagement row → infinite scroll |
| `media_first_detail` | commerce PDP, travel, content | media hero → title/metadata → decision sections → sticky CTA |
| `map_plus_sheet` | mobility, delivery, nearby | map canvas → marker/search controls → draggable bottom sheet |
| `list_filter_sheet` | PLP, search, history | query/category → chips/sort → list/cards → bottom-sheet filters |
| `chat_thread` | messenger, support, AI assistant | header → message list → composer → keyboard-safe bottom area |
| `calendar_slots` | healthcare, beauty, travel booking | date selector → slot grid/list → provider/resource summary → CTA |
| `settings_list` | account, permission, support | grouped rows → toggles/actions → destructive actions separated |
| `empty_recovery` | empty, no result, permission denied | illustration/icon → clear reason → recovery CTA → alternative path |

## Typography system

Design typography as roles, not arbitrary sizes.

| Role | Mobile size guidance | Use |
|---|---:|---|
| Display/hero | 28–34 | onboarding, marketing-like hero, major state |
| Screen title | 22–28 | main page title, key flow title |
| Section title | 17–20 | module headers, grouped content |
| Body | 15–17 | readable explanations and content |
| Label | 12–14 | field labels, metadata, tab labels |
| Caption | 11–13 | timestamps, constraints, helper text |
| Numeric emphasis | 24–40 | balance, price, ETA, score, timer |

Rules:

- Use tabular numbers for timers, balances, rankings, prices, and charts.
- Avoid body text below 14pt; default body should be around 16pt.
- Korean UI needs enough line height and `keep-all` behavior on web.
- Use weight for hierarchy before adding more colors.
- If a brand font is unknown, use a safe public Korean UI font profile.

## Color system

Define semantic roles before choosing raw colors.

| Token | Purpose |
|---|---|
| `primary` | main action and brand emphasis |
| `on_primary` | text/icon on primary |
| `surface` | page/card/sheet backgrounds |
| `surface_variant` | secondary cards and grouped rows |
| `text_primary` | high-emphasis text |
| `text_secondary` | metadata/helper text |
| `border` | separators and outlines |
| `success` | completed/positive state |
| `warning` | caution or expiring state |
| `danger` | destructive/error state |
| `info` | neutral informative state |
| `focus_ring` | keyboard/accessibility focus |

Rules:

- Do not communicate status with color alone; add text/icon/shape.
- Finance gain/loss colors must include sign/text; do not rely on red/blue or red/green only.
- Dark mode is not simple inversion; tune surfaces, borders, and state colors separately.
- Low-risk consumer flows can use vivid accents; regulated flows need calmer palettes and stronger hierarchy.

## Elevation, radius, and surface

| Element | Guidance |
|---|---|
| Buttons | radius 10–16; pressed state visible; no layout shift |
| Cards | radius 16–24; shadow subtle; avoid random shadow values |
| Bottom sheets | radius 20–28 top corners; drag handle; strong foreground separation |
| Modals | scrim 40–60%; close affordance; avoid modal for primary navigation |
| Chips | radius full; selected state not color-only |
| Input fields | clear label, error, focus border, helper text |

## Motion and feedback

| Motion | Timing | Use |
|---|---:|---|
| Tap feedback | 80–150ms | every tappable control |
| Micro transition | 150–250ms | button, chip, row state |
| Sheet/modal | 220–350ms | spatial transition |
| Page transition | 250–400ms | navigation continuity |
| Reward/celebration | 400–900ms | only for low-risk positive moments |

Rules:

- Use transform/opacity for performance.
- Respect reduced motion.
- Motion should explain cause/effect: sheet expands, item saved, message sent, reward claimed.
- Do not block user input with decorative animation.

## Accessibility baseline

- Touch targets: 44pt iOS / 48dp Android target area.
- Text contrast: 4.5:1 for body, 3:1 for large or non-text UI where applicable.
- Visible labels for inputs; placeholders are not labels.
- Focus order follows visual order.
- Icon-only controls require accessible names.
- Dynamic type/text scaling should not break layout.
- Provide non-gesture alternatives for critical actions.
- Avoid color-only status, icon-only error, or image-only explanation.

## Mobile platform constraints

- Respect safe area top/bottom and gesture bar.
- Fixed bottom CTA must not cover scroll content.
- Chat/input flows must be keyboard-aware.
- Back behavior must preserve input, filters, scroll, and previous state where possible.
- Permission-denied states need settings/deferred path.
- Offline states need retry and saved/draft clarity.

## Design output checklist

A generated design brief is not complete until it names:

- [ ] user job and risk level;
- [ ] selected mobile UI patterns;
- [ ] layout archetype and navigation model;
- [ ] visual hierarchy;
- [ ] component inventory;
- [ ] state matrix;
- [ ] interaction model;
- [ ] typography and color direction;
- [ ] accessibility constraints;
- [ ] anti-patterns to avoid.
