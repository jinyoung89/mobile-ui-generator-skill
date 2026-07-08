# Mobile UI Quality Review Checklist

Use this reference before delivering a generated brief, JSON spec, implementation prompt, or code review. The goal is to prevent generic or visually weak UI output.

## Review levels

| Level | Question |
|---|---|
| Product fit | Does the design solve the user job and domain risk? |
| Pattern fit | Are the selected mobile UI patterns correct? |
| Visual system | Are typography, color, spacing, surface, icon, and motion coherent? |
| Interaction | Are gestures, keyboard, sheets, forms, and CTAs specified? |
| States | Are empty/loading/error/success/disabled/permission states designed? |
| Accessibility | Are touch, contrast, labels, motion, and screen reader requirements covered? |
| Handoff | Can a design/code agent build it without guessing? |

## 1. Product and pattern fit

- [ ] User job is stated in one sentence.
- [ ] Domain and risk level are stated.
- [ ] 2-5 relevant patterns are selected from `mobile-pattern-library.md`.
- [ ] Layout archetype matches the patterns.
- [ ] Primary CTA matches the user job.
- [ ] Secondary and destructive actions are separated.
- [ ] Anti-patterns are named for the selected domain/pattern.

Red flags:

- Pattern names are generic only, e.g. “modern app screen”.
- Design starts with color or language before user job and pattern.
- The screen tries to do too many unrelated tasks.

## 2. Information hierarchy

- [ ] First visible element communicates purpose/status.
- [ ] Decision-critical data is near the action: price, amount, ETA, date, recipient, risk, policy.
- [ ] Supporting content is grouped into scannable sections.
- [ ] Empty/error states explain cause and next action.
- [ ] Legal/trust copy is close enough to the risky decision but not visually overwhelming.

Red flags:

- Banner or illustration pushes the primary task below the fold.
- CTA is visible before the user has enough decision information.
- All cards/rows have equal visual weight.

## 3. Typography quality

- [ ] Type roles are defined: title, section, body, label, caption, numeric emphasis.
- [ ] Body text is readable on mobile, ideally around 15–17pt.
- [ ] Numeric UI uses tabular figures where useful.
- [ ] Korean copy has enough line height and avoids awkward particle breaks.
- [ ] Font choice matches domain: trust, playful, editorial, premium, technical, etc.
- [ ] Font license or public fallback is noted.

Red flags:

- Body text below 14pt.
- Too many weights or font families.
- Decorative font used for dense content or form labels.

## 4. Color and contrast quality

- [ ] Semantic color roles are defined.
- [ ] Main text contrast meets 4.5:1 guidance.
- [ ] Error/success/warning/info states include text/icon, not color alone.
- [ ] Dark mode, if included, is independently tuned.
- [ ] Domain-specific color expectations are respected.

Red flags:

- Raw hex values without roles.
- Low-contrast gray on gray.
- Finance/health status conveyed only through color.
- Generic AI purple gradient used as the whole visual idea.

## 5. Layout and spacing quality

- [ ] Safe-area top/bottom is respected.
- [ ] Fixed CTA/header/tab bar reserves scroll inset.
- [ ] 4/8pt spacing rhythm is used.
- [ ] Touch targets are at least 44pt/48dp target area.
- [ ] Small-phone and large-phone behavior is considered.
- [ ] Lists/cards do not require horizontal scrolling unless pattern-specific carousel is intended.

Red flags:

- Content hidden behind sticky footer.
- Bottom sheet covers key map controls.
- Dense rows are too small to tap.

## 6. Interaction and motion quality

- [ ] Tap/press feedback is specified.
- [ ] Bottom sheet/modal states are specified where used.
- [ ] Keyboard behavior is specified for forms/chat/search.
- [ ] Retry, undo, cancel, edit, and confirmation paths are present where relevant.
- [ ] Motion has a purpose and reduced-motion fallback.

Red flags:

- Gesture-only critical action.
- Long blocking animation.
- No loading feedback on async CTA.
- No unsaved-changes guard for edit forms.

## 7. State coverage

Check every screen for applicable states:

```yaml
required_state_review:
  screen: [default, loading, empty, error, success]
  input: [empty, focused, filled, invalid, disabled]
  cta: [disabled, enabled, pressed, loading, success]
  network: [offline, timeout, retrying]
  permission: [not_requested, granted, denied, ask_later]
  data: [fresh, stale, no_data, filtered_empty]
```

Red flags:

- Happy path only.
- Empty state with no recovery.
- Error state without cause or retry.
- Disabled CTA without explanation when reason is not obvious.

## 8. Accessibility quality

- [ ] Icon-only controls have accessible names.
- [ ] Inputs have visible labels and programmatic labels.
- [ ] Focus order follows visual order.
- [ ] Selected/expanded/disabled states are announced where relevant.
- [ ] Dynamic type/text scaling does not break layout.
- [ ] Reduced motion is respected.
- [ ] Charts/maps/media have text alternatives or summaries.

Red flags:

- Removing focus rings.
- Placeholder-only forms.
- Color-only selected/error state.
- Map-only UI without list fallback.

## 9. Domain-specific review prompts

| Domain | Ask before delivery |
|---|---|
| Fintech | Are fees, recipient, amount, risk, and confirmation clear? |
| Commerce | Are price, options, delivery, returns, and reviews visible before CTA? |
| Mobility | Can the user recover from denied location or delayed ETA? |
| Healthcare | Is privacy/cancellation/provider trust clear? |
| Education | Is progress and wrong-answer recovery clear? |
| Game/rewards | Are reward conditions and claim state unambiguous? |
| Social/chat | Are composer, failed-send, block/report, and notification states covered? |
| Travel | Are date, guests, location, price, and cancellation clear? |
| AI/generation | Can the user stop, retry, edit, or apply generated output safely? |
| Analytics | Is there a text insight and accessible chart summary? |

## 10. Output quality gate

A generated answer should include, at minimum:

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

Reject or revise output if:

- It only gives generic visual adjectives.
- It lacks states.
- It lacks component inventory.
- It lacks domain-specific risk/trust decisions.
- It does not reference relevant patterns.
- It uses image generation without explicit request.

## Final self-check

Before final response, verify:

- [ ] Did I use pattern names, not just screen names?
- [ ] Did I specify what changes for this domain?
- [ ] Did I define the visual system beyond “modern/minimal”?
- [ ] Did I include states and accessibility?
- [ ] Did I avoid inventing proprietary brand facts?
- [ ] Did I avoid exposing origin/source identifiers, local paths, or underlying reference material?
