# Pattern Observation Template

Use this template for private/local analysis notes before updating public references. Keep this file public-safe as a blank template only. Filled observations should stay in ignored local folders unless fully sanitized.

## Observation metadata

| Field | Value |
|---|---|
| Generic pattern ID | `<checkout / search / phone_verification / etc.>` |
| Domain bucket | `<fintech / commerce / mobility / etc.>` |
| Evidence level | `<label_only / metadata / layout_observed / state_observed / cross_domain>` |
| Sample count | `<number>` |
| Public-safe summary ready? | `<yes / no>` |

## Layout observations

- `<repeated layout trait>`
- `<navigation or sheet structure>`
- `<primary CTA location>`
- `<scroll/fixed region behavior>`

## Component observations

| Component | Role | Repetition / confidence |
|---|---|---|
| `<component>` | `<what it does>` | `<low / medium / high>` |

## State observations

| State | Observed behavior | Public-safe rule |
|---|---|---|
| default | `` | `` |
| loading | `` | `` |
| empty | `` | `` |
| error | `` | `` |
| success | `` | `` |
| permission | `` | `` |
| disabled | `` | `` |

## Visual observations

- Color/surface pattern: `<public-safe description>`
- Typography pattern: `<public-safe description>`
- Spacing/density: `<public-safe description>`
- Alignment/grid: `<shared edges, column model, anchor behavior>`
- Component proportions: `<row heights, card aspect, sheet height, CTA size>`
- Text wrapping/line length: `<where copy wraps well or breaks>`
- Safe-area/fixed-region behavior: `<top/bottom inset, keyboard, sticky CTA>`
- Radius/elevation: `<public-safe description>`
- Motion/feedback: `<public-safe description>`
- Icon/asset style: `<public-safe description>`

## Copy observations

- Title pattern: `<generic copy structure>`
- Helper pattern: `<generic copy structure>`
- CTA pattern: `<generic copy structure>`
- Error/recovery pattern: `<generic copy structure>`

## Anti-patterns observed

- `<generic anti-pattern>`
- `<generic anti-pattern>`

## Public reference update candidate

```yaml
pattern_id: ""
user_intent: ""
layout: []
required_components: []
optional_components: []
states: []
interactions: []
copy_requirements: []
accessibility: []
anti_patterns: []
evidence_strength: ""
```

## Sanitization checklist

- [ ] No origin/source identifiers.
- [ ] No URLs or local paths.
- [ ] No app-specific traceability unless explicitly public and necessary.
- [ ] No underlying reference images.
- [ ] Public rule works without knowing the source.
