# Responsive and safe-area rules

## Width profiles

At minimum define contiguous rules for compact (320–374), standard (375–414),
and large (415–430) widths. Each rule states what changes and asserts no
horizontal overflow. Prefer wrapping, stacking, truncation with an intentional
line limit, or scrolling over shrinking touch targets.

## Insets and fixed regions

The canonical safe-area unit is `px`; native mappings convert it to points or
device-independent units. Apply top inset to system bars and bottom inset to the
scroll/fixed-action relationship. A sticky CTA must remain inside the bottom
safe area and its height must be added to scroll content bottom clearance.

## Keyboard and dynamic content

- Forms use a scroll container plus keyboard avoidance; focused fields remain
  visible above the keyboard.
- Chat composers lift with the keyboard and keep the send action reachable.
- Long Korean and English strings are fixtures, not afterthoughts. Exercise
  large text and the long-copy profile before publishing.
- Sheets and modals have explicit collapsed, expanded, and dismiss behavior;
  do not rely on a viewport-specific absolute top offset.

## Stress matrix

For each high-risk or layout-archetype example run compact, standard, large,
short-keyboard, large-text, and long-copy profiles that the coverage manifest
requires. Record logical viewport, pixel ratio, physical capture size, safe-area
values, state, and screenshot hash.
