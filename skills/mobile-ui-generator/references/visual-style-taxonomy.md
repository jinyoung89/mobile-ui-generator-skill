# Visual Style Taxonomy for Mobile UI

Use this reference to select an appropriate visual style for generated mobile app screens. Style must support the product task, not decorate it.

## Style selection rule

Pick a style by crossing:

1. **Domain trust level** — regulated, transactional, social, entertainment, creative, utility.
2. **Task pressure** — quick task, browsing, learning, purchase, booking, high-risk confirmation.
3. **Content density** — form, card feed, data dashboard, media-first, map-first, chat.
4. **Brand personality** — calm, professional, playful, premium, technical, editorial, immersive.
5. **Accessibility/performance risk** — contrast, motion intensity, transparency, dense data.

Do not mix styles randomly. If two styles are combined, name the primary and secondary style and explain each role.

## Mobile style catalog

### `minimal_swiss`

```yaml
mood: clean, structured, calm, precise
best_for:
  - fintech
  - productivity
  - settings
  - documentation
  - healthcare admin
visual_tokens:
  typography: strong hierarchy, sans-serif, medium labels
  color: neutral surfaces, one restrained accent
  radius: 8-16
  elevation: low
  spacing: generous, grid-based
motion: subtle 150-220ms state transitions
avoid:
  - overly decorative gradients
  - multiple accent colors
  - weak hierarchy from too much gray
```

### `flat_functional`

```yaml
mood: direct, fast, utilitarian, approachable
best_for:
  - MVP mobile apps
  - tools
  - settings
  - forms
  - order/history lists
visual_tokens:
  typography: readable sans, clear labels
  color: semantic tokens, simple fills
  radius: 10-16
  elevation: none or minimal
motion: quick feedback, no complex choreography
avoid:
  - lifeless white screens without hierarchy
  - disabled states that look enabled
```

### `soft_ui_evolution`

```yaml
mood: calm, comfortable, friendly, premium-lite
best_for:
  - wellness
  - healthcare booking
  - beauty
  - pet care
  - habit tracking
visual_tokens:
  typography: rounded/friendly sans or gentle serif headings
  color: warm neutrals, soft blue/green/pink accents
  radius: 18-28
  elevation: soft shadows, subtle surface contrast
motion: gentle 200-300ms transitions
avoid:
  - low contrast from over-soft surfaces
  - decorative softness on data-critical screens
```

### `glass_layered`

```yaml
mood: modern, layered, premium, atmospheric
best_for:
  - AI assistants
  - finance dashboards with dark mode
  - music/media
  - premium travel
  - futuristic product surfaces
visual_tokens:
  typography: crisp sans, strong numeric readability
  color: dark/gradient background with translucent surfaces
  radius: 20-28
  elevation: blur + border + controlled shadow
motion: sheet/modal transitions, depth-preserving motion
avoid:
  - transparency that hurts text contrast
  - excessive blur on low-performance devices
  - using glass on every component
```

### `clay_playful`

```yaml
mood: tactile, friendly, playful, soft
best_for:
  - education
  - kids/family
  - pet care
  - casual rewards
  - onboarding
visual_tokens:
  typography: rounded, friendly, high readability
  color: warm/vivid but not neon-heavy
  radius: 20-32
  elevation: soft raised cards
motion: press feedback, reward micro-interactions
avoid:
  - childish tone for regulated domains
  - thick shadows that reduce density
```

### `bento_cards`

```yaml
mood: modular, organized, modern, product-led
best_for:
  - home dashboards
  - SaaS/productivity mobile home
  - feature discovery
  - benefit/membership hubs
visual_tokens:
  typography: strong card headings, concise body
  color: neutral base with per-card accents
  radius: 20-28
  elevation: card separation via surface and border
motion: card reveal, reordering, subtle hover/press
avoid:
  - too many equal-weight cards
  - random card sizes without information hierarchy
```

### `dark_oled`

```yaml
mood: immersive, focused, high-contrast
best_for:
  - music
  - video/OTT
  - gaming
  - developer tools
  - finance trading dashboards
visual_tokens:
  typography: bright primary text, toned secondary text
  color: near-black surfaces, vivid controlled accents
  radius: 12-24
  elevation: glow only for active/emphasis states
motion: atmospheric but reduced-motion safe
avoid:
  - pure black with low-contrast gray text
  - neon everywhere
  - red/green-only data states
```

### `ai_native`

```yaml
mood: intelligent, adaptive, calm, conversational
best_for:
  - AI assistant
  - generation flow
  - automation
  - recommendation
  - search/copilot
visual_tokens:
  typography: conversational, readable, clear hierarchy
  color: neutral surfaces with one adaptive accent
  radius: 16-28
  elevation: layered response/result cards
motion: streaming text, thinking state, result reveal
avoid:
  - generic purple gradients as the only AI signal
  - replacing user decisions without confirmation
  - unclear confidence or review requirement
```

### `editorial_content`

```yaml
mood: readable, curated, content-first
best_for:
  - article viewer
  - magazine/blog
  - travel content
  - curation feed
  - knowledge apps
visual_tokens:
  typography: strong title/body pairing, comfortable line height
  color: paper/neutral surfaces, restrained accent
  radius: 8-20
  elevation: minimal
motion: reading progress and content transition only
avoid:
  - tiny body text
  - excessive cards interrupting reading
  - low-contrast captions
```

### `premium_luxury`

```yaml
mood: refined, sparse, confident, aspirational
best_for:
  - luxury commerce
  - premium travel
  - beauty/spa
  - real estate
  - high-end membership
visual_tokens:
  typography: elegant serif or high-quality sans pairing
  color: black/cream/white with gold or muted accent
  radius: 12-24
  elevation: restrained, image-led hierarchy
motion: slow but responsive reveal, gallery polish
avoid:
  - discount-heavy visual language
  - crowded badges
  - cheap gradients or playful icons
```

### `high_energy_game`

```yaml
mood: energetic, reward-driven, immersive
best_for:
  - game lobby
  - rewards
  - ranking
  - event missions
  - entertainment campaigns
visual_tokens:
  typography: bold, high-impact, numeric emphasis
  color: vivid palette, rarity colors, high contrast
  radius: 14-24
  elevation: glowing highlights for rewards and active states
motion: reward reveal, progress feedback, claim animation
avoid:
  - static reward states
  - unclear reward conditions
  - overwhelming low-value animations
```

### `ethical_accessible`

```yaml
mood: trustworthy, inclusive, clear, public-service-like
best_for:
  - healthcare
  - mental health
  - government/public utility
  - senior care
  - safety/SOS
visual_tokens:
  typography: large readable text, plain labels
  color: high contrast, calm blue/green, semantic danger
  radius: 8-18
  elevation: minimal, clarity-first
motion: minimal and optional
avoid:
  - bright neon
  - motion-heavy feedback
  - hidden support or crisis route
```

### `data_dense_professional`

```yaml
mood: analytical, precise, trustworthy
best_for:
  - finance dashboard
  - analytics report
  - business tools
  - IoT monitoring
  - admin mobile views
visual_tokens:
  typography: tabular numbers, compact labels, clear section titles
  color: semantic status palette, neutral surfaces
  radius: 8-16
  elevation: low; density controlled with dividers and spacing
motion: number updates, chart transitions, alert pulse only when meaningful
avoid:
  - decorative charts
  - color-only status
  - cramped rows under 44pt touch target
```

### `organic_biophilic`

```yaml
mood: natural, grounded, calm, sustainable
best_for:
  - wellness
  - plant care
  - sustainability
  - agriculture
  - mental health light modes
visual_tokens:
  typography: humanist sans or soft serif
  color: earth greens, warm neutrals, sky/water accents
  radius: 18-32
  elevation: soft natural shadows
motion: breathing, growth, progress; always reduced-motion safe
avoid:
  - greenwashing visual clichés without useful data
  - low-contrast pastel text
```

## Style combination patterns

| Combination | Use when | Guardrail |
|---|---|---|
| `minimal_swiss + data_dense_professional` | finance/productivity dashboard | keep chart labels and data accessible |
| `soft_ui_evolution + ethical_accessible` | healthcare/mental health | prioritize contrast over softness |
| `glass_layered + dark_oled` | premium finance/media | check blur and dark contrast carefully |
| `clay_playful + high_energy_game` | kids learning/rewards | do not over-animate core learning tasks |
| `premium_luxury + editorial_content` | travel/real estate/beauty | avoid crowding imagery with badges |
| `ai_native + bento_cards` | AI productivity home | separate suggestion cards by purpose |
| `flat_functional + minimal_swiss` | utility/tools | add enough hierarchy to avoid blandness |

## Color mood by domain

| Domain | Good color direction | Avoid |
|---|---|---|
| Fintech/banking | navy, blue, neutral, semantic success/danger | playful candy palette, unclear fee colors |
| Commerce | brand accent, price emphasis, success green | too many sale badges, low-contrast price |
| Mobility/delivery | map neutrals, ETA accent, status colors | map UI overloaded with decoration |
| Healthcare | calm blue/green, high contrast, privacy cues | neon, aggressive red except urgent states |
| Education | friendly blue/green/yellow, progress colors | dark-only mode for children/learning |
| Game | vivid rarity colors, dark or high-energy backgrounds | static flat rewards |
| Messenger/social | content-first neutrals, reaction accents | heavy chrome competing with content |
| Travel/real estate | image-led neutrals, premium accent | poor image hierarchy, noisy badges |
| Support/help | calm neutrals, clear status colors | chatbot-only dead ends |
| AI/generation | neutral surfaces, one adaptive accent | generic purple gradient as sole idea |

## Visual anti-patterns

- Choosing style before product task.
- Mixing multiple decorative effects without hierarchy.
- Using emoji as structural icons.
- Overusing glass blur or glow where text must be read.
- Using tiny labels to fit dense content instead of restructuring.
- Designing only the happy path; no empty/error/disabled/loading states.
- Applying dark mode without contrast review.
- Using color-only status for finance, health, ranking, or errors.
- Using a playful style for identity, money, health, or destructive actions unless intentionally moderated.
