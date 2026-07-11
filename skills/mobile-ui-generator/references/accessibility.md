# Accessibility baseline

- Use semantic controls and visible labels; expose state changes to a screen
  reader instead of relying on color or animation.
- Keep interactive targets at least 44×44 logical units and provide spacing that
  prevents accidental activation. Do not make a whole card a hidden button.
- Meet a 4.5:1 minimum contrast for normal text (3:1 for large text where the
  platform policy allows it). Pair text and surface tokens explicitly.
- Support Dynamic Type or text scaling. Long labels wrap or scroll without
  clipping and never move a destructive action into an ambiguous position.
- Honor reduced-motion settings. Loading and success must have a non-motion
  fallback; errors include a recovery action and concise explanation.
- Keep focus order aligned with visual order. On web use keyboard-visible focus;
  on native platforms map labels, hints, traits, and values to native semantics.
- Permission, payment, identity, and deletion flows state what happens before
  the action and require confirmation for irreversible outcomes.
