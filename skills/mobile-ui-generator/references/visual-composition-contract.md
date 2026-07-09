# Visual Composition Contract

Use this reference whenever the output will be seen as a UI screen, screenshot, SVG preview, Figma frame, HTML/CSS mock, or image-generation prompt. It bridges private/local screen analysis into concrete visual composition rules so generated UI does not stop at abstract pattern names.

This file is public-safe. It must not include origin names, underlying reference images, local paths, URLs, source identifiers, or app-specific traceability.

## Why this exists

Pattern references can say that a screen needs a `checkout`, `bottom_sheet_map`, or `phone_verification` pattern, but that is not enough for visual quality. A generated UI is not acceptable until it also defines:

- alignment anchors;
- spacing rhythm;
- density level;
- component proportions;
- typography roles;
- safe-area behavior;
- state placement;
- visible hierarchy.

If these are missing, the result may be logically correct but visually broken.

## Required `visual_composition` block

Every substantial UI generation output should include a visual composition block before handoff:

```yaml
visual_composition:
  canvas:
    target_device: "compact_phone | standard_phone | large_phone | responsive_web_preview"
    safe_area: "top and bottom insets reserved"
    scroll_model: "single_scroll | fixed_cta_with_scroll_inset | map_with_sheet | chat_keyboard_safe"
  grid:
    columns: "1 | 2 | card_grid | map_overlay"
    horizontal_padding: "16-20pt on phone"
    vertical_rhythm: "4/8pt based"
    alignment_anchor: "left_edge | center_phone | baseline_grid | card_edges"
  density:
    level: "low | medium | high"
    row_height_min: "44pt iOS / 48dp Android target"
    max_primary_actions: 1
    max_visible_card_weights: "1 dominant + supporting modules"
  typography:
    display: "28-34pt only for major state or page hero"
    title: "22-28pt"
    body: "15-17pt"
    label: "12-14pt"
    numeric_emphasis: "24-40pt with tabular figures when useful"
    line_length: "avoid long unwrapped Korean or English lines"
  surface_model:
    base_surface: "screen background"
    elevated_surface: "cards/sheets"
    border_shadow: "subtle and consistent"
    radius_scale: "inputs 10-16, cards 16-24, sheets 20-28"
  state_placement:
    errors: "near the field or CTA they affect"
    loading: "does not erase decision-critical data"
    empty: "reason + one recovery CTA"
    destructive: "visually separated from normal actions"
  visual_qa:
    no_overlap: true
    no_cropped_text: true
    no_unintended_horizontal_scroll: true
    no_internal_metadata_visible: true
    language_consistency: true
```

## Screen-analysis to output mapping

When converting private/local observations into public references, do not stop at component names. Extract public-safe visual rules:

| Observed trait | Convert into |
|---|---|
| Repeated card edges line up | `alignment_anchor` and grid rule |
| Dense rows remain tappable | `row_height_min` and density rule |
| CTA stays visible but not covering content | `scroll_model` and bottom inset |
| Key number/price/time dominates | `typography.numeric_emphasis` and hierarchy rule |
| Error copy sits beside affected control | `state_placement.errors` |
| Map/list screen keeps route context | `scroll_model: map_with_sheet` and sheet height range |
| Destructive flow lowers visual enthusiasm | calmer palette, separated danger CTA, support path |

## Visual breakage red flags

Reject or revise output if any of these appear:

- Components are placed with arbitrary absolute coordinates and no shared alignment grid.
- Text blocks have different left edges without intentional hierarchy.
- Cards use different padding/radius values for the same role.
- A generated preview shows specs, debug labels, or taxonomy labels instead of user-facing UI.
- Important text is too small to read at phone scale.
- A phone mock mixes app UI, analysis labels, and explanatory copy inside the same frame.
- Empty rectangles or placeholder blocks remain visible in the final preview.
- Korean text wraps awkwardly because line length and `keep-all` behavior were not considered.
- A fixed CTA covers content or floats without reserved bottom inset.
- The page/example layout passes static validation but looks visually unbalanced in browser QA.

## Public showcase and preview rule

For public documentation pages, visual examples must prioritize the generated UI result:

1. Show the input prompt near the preview, but outside the app screen.
2. The app screen itself must look like a plausible mobile product screen.
3. Do not use the app screen to display JSON, debug labels, implementation prompts, or taxonomy IDs.
4. Prefer reusable layout components over hand-positioned SVG text.
5. If SVG is used, use a shared template with fixed padding, component slots, and text wrapping; do not hand-tune each label coordinate independently.
6. Browser QA must verify image load, no overflow, no unexpected horizontal scroll, and no visibly clipped/crowded text.

## Visual QA checklist

Before delivery, answer yes to all:

- [ ] Is there one dominant visual focus per screen?
- [ ] Do cards, fields, and CTAs align to a consistent edge or grid?
- [ ] Are repeated components using the same spacing, radius, and height?
- [ ] Is the main CTA reachable and not visually competing with secondary actions?
- [ ] Are error/loading/empty states placed where the user can act on them?
- [ ] Is body text readable at mobile scale?
- [ ] Does the output avoid internal metadata as visible UI copy?
- [ ] Did browser or screenshot QA inspect the actual rendered result, not just the code/spec?

## Minimum acceptance rule

If the output is meant to be visual, it is incomplete until both are present:

```yaml
pattern_system: present
visual_composition: present
```

Pattern correctness without visual composition is not enough.
