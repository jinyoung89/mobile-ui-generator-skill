# Layout foundations

## Numeric contract

Use a token layer and derive placement from parent flow, grid anchors, and
constraints. Do not use arbitrary absolute coordinates for ordinary content.

```yaml
layout:
  tokens: {space_1: 4px, space_2: 8px, space_3: 12px, space_4: 16px, space_6: 24px}
  screen_horizontal_inset: 16px
  component_gap: 12px
  section_gap: 24px
  card_padding: 16px
  control_height: 48px
  corner_radius: 12px
  sticky_region_height: 72px
  scroll_content_bottom_inset: 88px
```

The canonical spec stores measures as `{value, unit}`, `{token}`, or bounded
`{formula, unit, min, max}`. Resolve tokens in declared order, preserve the
constraint precedence `safe_area → fixed_region → min_max → content`, and round
only at the platform boundary. Keep the reference viewport inside the supported
range (normally 320–430 logical pixels).

## Grid and hierarchy

- Establish one leading and one trailing content edge; align titles, fields,
  cards, helper text, and primary actions to those anchors.
- Use a vertical flow with explicit section gaps. A fixed bottom action reserves
  clearance in scroll content rather than covering the last field.
- Use `fill` for regions that may grow and `content` only for bounded text or
  controls. Every image declares an aspect ratio and crop policy.
- Define typography roles with family, size, line height, weight, max lines,
  overflow, text scaling, and minimum contrast. Never encode a font size only in
  a one-off component style.

## Component recipe

For every visible component record `id`, parent, order, width/height behavior,
padding, gap, alignment, state list, default state, interaction kind,
accessibility label/target size, and native substitution. A reviewer should be
able to place it without guessing a number or a parent.
