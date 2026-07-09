# Mobile UI Brief Template

Use this template when producing a design brief for a mobile app screen or flow. Fill every section with concrete choices; delete placeholder text before delivery.

## 1. Intent

| Field | Value |
|---|---|
| User job | `<what the user is trying to accomplish>` |
| App type / service category | `<banking / wallet_payment / food_delivery / travel_booking / pet_care / ai_productivity / etc.>` |
| Domain | `<more specific domain if needed>` |
| Flow | `<single screen or multi-step flow>` |
| Risk/trust level | `<low / medium / high_trust / destructive>` |
| Language mode | `<ko / en / mixed-by-request>` |
| Target platform | `<iOS / Android / React Native / Flutter / web-mobile / unspecified>` |

## 2. Pattern system

| Decision | Selection |
|---|---|
| UI pattern filters | `<ui_pattern, ui_pattern>` |
| Primary patterns | `<pattern_id, pattern_id>` |
| Supporting patterns | `<pattern_id, pattern_id>` |
| Layout archetype | `<single_task_form / map_plus_sheet / feed_stream / media_first_detail / list_filter_sheet / chat_thread / calendar_slots / settings_list / dashboard_cards>` |
| Navigation model | `<top app bar / bottom tabs / modal / bottom sheet / stepper / full-screen flow>` |
| CTA model | `<fixed bottom CTA / inline CTA / split primary-secondary / destructive confirmation>` |
| Input model | `<none / text fields / phone-code / search / filters / media capture / map selection>` |

### Pattern rationale

- `<pattern_id>`: `<why this pattern fits the user job>`
- `<pattern_id>`: `<why this supporting pattern is needed>`

### Anti-patterns to avoid

- `<specific anti-pattern>`
- `<specific anti-pattern>`

## 3. Information architecture

1. `<first thing user should notice>`
2. `<second priority>`
3. `<supporting details>`
4. `<action / decision point>`

## 4. Screen structure

### Fixed or sticky regions

- Top: `<top app bar / progress / none>`
- Bottom: `<CTA / tab bar / input composer / none>`
- Overlay: `<sheet / modal / toast / none>`

### Sections

| Order | Section | Purpose | Components |
|---:|---|---|---|
| 1 | `<section name>` | `<purpose>` | `<components>` |
| 2 | `<section name>` | `<purpose>` | `<components>` |
| 3 | `<section name>` | `<purpose>` | `<components>` |

## 5. Component inventory

### Navigation

- `<top_app_bar / back_button / tabs / bottom_nav / breadcrumb / stepper>`

### Inputs and selection

- `<field / chip / selector / calendar / map pin / media picker>`

### Content and cards

- `<card / list row / metric tile / image block / chart / message bubble>`

### Feedback and trust

- `<helper text / error text / legal notice / verification badge / toast / progress>`

### CTA

- Primary: `<label>`
- Secondary: `<label or none>`
- Destructive: `<label or none>`

## 6. State matrix

| Area | States to design |
|---|---|
| Screen | default, loading, empty, error, success |
| Inputs | empty, focused, filled, invalid, disabled |
| CTA | disabled, enabled, pressed, loading, success |
| Network | offline, timeout, retrying |
| Permission | not_requested, granted, denied, ask_later |
| Pattern-specific | `<expired_code / payment_failed / no_results / route_recalculating / failed_to_send / stale_data>` |

## 7. Visual system

| Decision | Direction |
|---|---|
| Style direction | `<minimal_swiss / flat_functional / glass_layered / bento_cards / dark_oled / ai_native / etc.>` |
| Typography | `<font profile, hierarchy, numeric readability>` |
| Color | `<primary / accent / surface / semantic colors>` |
| Spacing | `<4/8pt rhythm, screen gutters, section spacing>` |
| Radius/elevation | `<radius scale, card/sheet elevation>` |
| Motion | `<150-300ms microinteractions, reduced-motion behavior>` |
| Icon/assets | `<icon family, stroke/fill style, image usage>` |

## 8. Visual composition

| Decision | Direction |
|---|---|
| Canvas / safe area | `<target phone size, top/bottom insets, scroll model>` |
| Grid / alignment | `<columns, shared edges, gutters, alignment anchors>` |
| Density | `<low / medium / high, row height minimum, max visible card weights>` |
| Component proportions | `<field heights, card ratios, sheet height, CTA size>` |
| Typography scale | `<title/body/label/numeric sizes and wrapping behavior>` |
| State placement | `<where errors/loading/empty/destructive states appear>` |
| Rendered QA | `<no overlap, no cropped text, no unintended horizontal scroll, no metadata labels>` |

## 9. Copy system

| Type | Copy |
|---|---|
| Title | `<title>` |
| Subtitle/helper | `<helper copy>` |
| Primary CTA | `<cta>` |
| Secondary CTA | `<secondary cta>` |
| Loading | `<loading copy>` |
| Empty | `<empty state copy>` |
| Error | `<error copy with recovery>` |
| Success | `<success copy>` |
| Permission | `<permission copy>` |
| Destructive confirmation | `<confirmation copy if needed>` |

## 10. Accessibility and mobile constraints

- Touch targets: `>=44pt iOS / >=48dp Android`
- Safe areas: `<top/bottom handling>`
- Keyboard behavior: `<avoid fixed CTA overlap, focus first invalid field>`
- Screen reader labels: `<important labels>`
- Color contrast: `<AA target and semantic color support>`
- Reduced motion: `<fallback behavior>`
- Dynamic text: `<wrapping/truncation strategy>`

## 11. Implementation prompt

```text
Create a mobile UI for <domain>/<flow>. Use patterns <pattern_id list>. The screen should use <layout_archetype> with <navigation_model>. Include components <component list>. Cover states <state list>. Visual direction is <style direction>, typography <font>, color <palette>, spacing <scale>, motion <motion>. Avoid <anti-patterns>. UI copy language is <language_mode>.
```

## 12. Quality gate

- [ ] Pattern fit is explicit and concrete.
- [ ] Layout can be implemented without guessing.
- [ ] Visual composition defines grid, density, proportions, and rendered QA.
- [ ] Components and states cover non-happy paths.
- [ ] Visual style matches domain and trust level.
- [ ] Copy includes loading/error/empty/success where relevant.
- [ ] Accessibility and mobile constraints are explicit.
- [ ] No origin/source identifiers, local paths, or underlying reference material are exposed.
- [ ] No internal taxonomy/debug labels are visible in user-facing UI copy.
