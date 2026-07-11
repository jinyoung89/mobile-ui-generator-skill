:root {
  --space-screen: {{SCREEN_INSET_PX}}px;
  --space-component: {{COMPONENT_GAP_PX}}px;
  --space-section: {{SECTION_GAP_PX}}px;
  --control-height: {{CONTROL_HEIGHT_PX}}px;
  --radius-control: {{CONTROL_RADIUS_PX}}px;
  --safe-top: env(safe-area-inset-top, {{SAFE_TOP_PX}}px);
  --safe-bottom: env(safe-area-inset-bottom, {{SAFE_BOTTOM_PX}}px);
  --color-surface: {{SURFACE_COLOR}};
  --color-text: {{TEXT_COLOR}};
  --color-action: {{ACTION_COLOR}};
}

* { box-sizing: border-box; }
html, body { min-width: 0; min-height: 100%; margin: 0; }
body { background: var(--color-surface); color: var(--color-text); font-family: {{FONT_FAMILY}}, system-ui, sans-serif; }
#app { min-height: 100svh; padding-top: var(--safe-top); display: flex; flex-direction: column; }
.app-bar, .screen-content { width: min(100%, {{MAX_CONTENT_WIDTH_PX}}px); margin-inline: auto; padding-inline: var(--space-screen); }
.app-bar { padding-block: {{APP_BAR_VERTICAL_PX}}px; }
.screen-content { flex: 1; display: flex; flex-direction: column; gap: var(--space-section); padding-bottom: calc({{BOTTOM_CLEARANCE_PX}}px + var(--safe-bottom)); overflow-wrap: anywhere; }
.fixed-action { position: sticky; bottom: 0; padding: {{CTA_PADDING_PX}}px var(--space-screen) calc({{CTA_PADDING_PX}}px + var(--safe-bottom)); background: color-mix(in srgb, var(--color-surface) 94%, transparent); }
.primary-action { min-height: var(--control-height); width: 100%; border: 0; border-radius: var(--radius-control); background: var(--color-action); color: {{ACTION_TEXT_COLOR}}; font-size: {{BODY_FONT_SIZE_PX}}px; font-weight: {{ACTION_FONT_WEIGHT}}; }
.primary-action:focus-visible { outline: {{FOCUS_RING_PX}}px solid {{FOCUS_COLOR}}; outline-offset: 2px; }
@media (min-width: 415px) { .screen-content { gap: calc(var(--space-section) + 4px); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; } }
