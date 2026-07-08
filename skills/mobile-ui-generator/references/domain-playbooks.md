# Mobile Domain Playbooks

Use this reference to adapt mobile UI generation to the product domain. Combine these playbooks with `mobile-pattern-library.md`, `design-principles.md`, and `visual-style-taxonomy.md`.

Each domain playbook defines:

- primary user goals;
- recommended pattern families;
- information hierarchy;
- visual style direction;
- typography/color/motion notes;
- required states;
- anti-patterns.

## Fintech / banking / wallet

```yaml
user_goals:
  - understand money state
  - send/pay/invest safely
  - verify identity
  - review history
recommended_patterns:
  - account_overview
  - transfer
  - transaction_history
  - simple_payment
  - identity_verification
  - phone_verification
  - security_auth
  - card_detail
layout_bias:
  - dashboard_cards
  - single_task_form
  - list_filter_sheet
visual_direction:
  primary_styles: [minimal_swiss, data_dense_professional]
  optional_styles: [glass_layered for premium dashboard, dark_oled for trading]
  colors: navy, trust blue, neutral surfaces, semantic success/danger
  typography: tabular numbers, high numeric contrast, restrained labels
must_include:
  - fee/risk disclosure near decision point
  - confirmation state for transfer/payment
  - masked/unmasked sensitive data behavior
  - clear error recovery
avoid:
  - playful illustration dominating financial decisions
  - color-only gain/loss
  - CTA enabled before required checks
  - vague “failed” messages
```

## Commerce / marketplace / store

```yaml
user_goals:
  - browse products
  - compare options
  - trust price/review/delivery
  - complete checkout
recommended_patterns:
  - search
  - filter_sort
  - PLP
  - PDP
  - cart
  - checkout
  - coupon_points
  - review
  - review_write
  - order_history
  - cross_sell_upsell
layout_bias:
  - list_filter_sheet
  - media_first_detail
  - single_task_form for checkout
visual_direction:
  primary_styles: [flat_functional, bento_cards]
  optional_styles: [premium_luxury for high-end commerce, clay_playful for casual goods]
  colors: brand accent, clear price color, success purchase state
  typography: price/discount hierarchy, readable product names
must_include:
  - option selection states
  - delivery/return policy
  - price breakdown
  - unavailable/out-of-stock states
  - review credibility
avoid:
  - hidden fees
  - preselected add-ons
  - crowded sale badges
  - CTA enabled without required option
```

## Mobility / delivery / maps

```yaml
user_goals:
  - choose location or route
  - track status and ETA
  - adjust booking or delivery
  - contact support when delayed
recommended_patterns:
  - map_location
  - route_navigation
  - bottom_sheet_map
  - reservation_booking
  - delivery_tracking
  - cancellation_flow
  - customer_support
layout_bias:
  - map_plus_sheet
  - dashboard_cards for tracking summary
visual_direction:
  primary_styles: [flat_functional, minimal_swiss]
  optional_styles: [data_dense_professional for logistics]
  colors: map neutrals, ETA accent, route/status colors
  typography: ETA and location hierarchy
must_include:
  - list fallback for map
  - permission denied state
  - ETA uncertainty copy
  - delay and issue reporting states
avoid:
  - map-only interface
  - bottom sheet covering critical map controls
  - no recovery for location permission denial
```

## Healthcare / clinic / booking

```yaml
user_goals:
  - find provider/time
  - understand care context
  - book or manage appointment
  - protect privacy
recommended_patterns:
  - reservation_booking
  - calendar_slots
  - identity_verification
  - inquiry
  - customer_support
  - application_request_flow
  - empty_state
layout_bias:
  - calendar_slots
  - single_task_form
  - settings_list
visual_direction:
  primary_styles: [ethical_accessible, soft_ui_evolution]
  colors: calm blue/green, high contrast, semantic danger for urgent states
  typography: readable 16pt+ body, clear provider names/time slots
must_include:
  - cancellation policy
  - provider trust info
  - privacy-sensitive copy
  - no-slot recovery
  - emergency/urgent guidance if relevant
avoid:
  - neon or high-motion visuals
  - ambiguous medical status
  - hiding privacy implications
```

## Education / learning

```yaml
user_goals:
  - resume learning
  - understand progress
  - practice and recover from mistakes
  - feel motivated
recommended_patterns:
  - onboarding_intro
  - lesson_home
  - quiz
  - gamification
  - quest_progress
  - points_rewards
  - empty_state
layout_bias:
  - dashboard_cards
  - single_task_form for quiz
  - feed_stream for lessons
visual_direction:
  primary_styles: [clay_playful, flat_functional]
  optional_styles: [ethical_accessible for adult/public education]
  colors: friendly progress colors, achievement accents
  typography: large readable lesson text
must_include:
  - progress state
  - resume CTA
  - wrong-answer recovery
  - reward clarity if gamified
avoid:
  - dark-only learning mode
  - punishment-heavy errors
  - unclear learning path
```

## Game / reward / entertainment

```yaml
user_goals:
  - start next action quickly
  - understand rewards/events
  - compare rank/progress
  - claim benefits
recommended_patterns:
  - game_lobby
  - daily_reward
  - quest_progress
  - ranking
  - points_rewards
  - event_promotion
  - benefits_hub
layout_bias:
  - dashboard_cards
  - bento_cards
  - feed_stream for events
visual_direction:
  primary_styles: [high_energy_game, dark_oled]
  optional_styles: [clay_playful for casual/kids]
  colors: vivid accents, rarity colors, strong contrast
  typography: bold numerals, reward labels
must_include:
  - reward condition
  - claim state
  - event time limit
  - current user rank/progress
avoid:
  - unclear reward math
  - motion without feedback meaning
  - static empty reward panels
```

## Messenger / social / community

```yaml
user_goals:
  - read and create content
  - communicate continuously
  - manage profile and notifications
  - feel safe
recommended_patterns:
  - feed
  - chat
  - write_post
  - media_capture
  - profile
  - notification
  - community_hub
  - invite_referral
layout_bias:
  - feed_stream
  - chat_thread
  - media_first_detail
visual_direction:
  primary_styles: [flat_functional, editorial_content]
  optional_styles: [dark_oled for media-first communities]
  colors: content-first neutrals, reaction accents
  typography: readable conversational text, timestamps/captions
must_include:
  - composer keyboard safe area
  - failed-send retry
  - block/report/safety path where relevant
  - notification permission recovery
avoid:
  - tiny reaction targets
  - feed chrome competing with content
  - no draft preservation
```

## Content / OTT / music / media

```yaml
user_goals:
  - discover content
  - consume comfortably
  - save/share/continue
  - manage playback
recommended_patterns:
  - content_viewer
  - media_first_detail
  - curation_feed
  - recommendation
  - bookmark_wishlist
  - audio_recording
  - voice_interaction
layout_bias:
  - media_first_detail
  - feed_stream
  - curation_feed
visual_direction:
  primary_styles: [dark_oled, editorial_content]
  optional_styles: [premium_luxury for high-end editorial]
  colors: media-led accents, dark or paper surfaces
  typography: strong titles, readable body/player labels
must_include:
  - playback/control labels
  - continue/next path
  - saved/offline states if applicable
  - content loading and unavailable states
avoid:
  - hidden player controls
  - low-contrast captions
  - autoplay without user control
```

## Travel / hospitality / reservation

```yaml
user_goals:
  - imagine the experience
  - compare date/price/location
  - book confidently
  - manage cancellation
recommended_patterns:
  - search
  - filter_sort
  - stay_booking
  - reservation_booking
  - map_location
  - review
  - checkout
layout_bias:
  - media_first_detail
  - list_filter_sheet
  - calendar_slots
visual_direction:
  primary_styles: [premium_luxury, editorial_content]
  optional_styles: [soft_ui_evolution for calm booking]
  colors: image-led neutral, sky/warm accent, trust/cancellation colors
  typography: destination/title hierarchy, price clarity
must_include:
  - date/guest summary
  - cancellation confidence
  - price breakdown
  - map/location context
avoid:
  - poor image hierarchy
  - hidden final price
  - cancellation info after payment only
```

## Beauty / wellness / spa

```yaml
user_goals:
  - browse services
  - trust provider/results
  - book a time
  - understand package/benefit
recommended_patterns:
  - reservation_booking
  - review
  - membership
  - benefits_hub
  - gallery_or_before_after
  - inquiry
layout_bias:
  - media_first_detail
  - calendar_slots
  - bento_cards
visual_direction:
  primary_styles: [soft_ui_evolution, premium_luxury]
  colors: warm neutrals, soft pink/sage, gold or muted accent
  typography: elegant but readable
must_include:
  - staff/provider trust
  - service duration/price
  - cancellation policy
  - before/after or review credibility when relevant
avoid:
  - harsh neon
  - unreadable decorative font for body
  - vague booking policies
```

## Pet care

```yaml
user_goals:
  - manage pet profile
  - book care/health services
  - track reminders
  - get support
recommended_patterns:
  - profile
  - reservation_booking
  - health_record_summary
  - notification
  - customer_support
  - community_hub
layout_bias:
  - dashboard_cards
  - calendar_slots
  - feed_stream
visual_direction:
  primary_styles: [clay_playful, soft_ui_evolution]
  colors: warm playful accents, caring blue/green
  typography: friendly sans, clear labels
must_include:
  - pet profile context
  - emergency/support path
  - reminder states
  - health/vaccination info if relevant
avoid:
  - generic human profile UI without pet context
  - hidden emergency action
```

## Real estate / property

```yaml
user_goals:
  - search properties
  - compare price/location
  - save and inquire
  - trust listing quality
recommended_patterns:
  - search
  - filter_sort
  - PLP
  - PDP
  - map_location
  - comparison
  - inquiry
  - bookmark_wishlist
layout_bias:
  - list_filter_sheet
  - map_plus_sheet
  - media_first_detail
visual_direction:
  primary_styles: [premium_luxury, minimal_swiss]
  colors: neutral, trust blue, premium accent
  typography: price/location hierarchy
must_include:
  - map/list toggle
  - saved property state
  - agent/contact path
  - listing metadata and caveats
avoid:
  - weak photo layout
  - hiding location/price constraints
```

## Mental health / wellbeing

```yaml
user_goals:
  - track mood or habit
  - get support safely
  - book or access resources
  - maintain privacy
recommended_patterns:
  - onboarding_intro
  - mood_tracker
  - journal_or_checkin
  - reservation_booking
  - customer_support
  - empty_state
layout_bias:
  - single_task_form
  - dashboard_cards
  - ethical_accessible
visual_direction:
  primary_styles: [ethical_accessible, organic_biophilic, soft_ui_evolution]
  colors: calm low-stimulation palette, high contrast text
  typography: plain, supportive, readable
must_include:
  - privacy reassurance
  - gentle error/recovery copy
  - crisis/escalation path when relevant
  - low-stimulation motion
avoid:
  - gamifying distress
  - intense colors or stressful notifications
  - hidden support route
```

## Recruiting / jobs

```yaml
user_goals:
  - find relevant job
  - compare salary/fit
  - save/apply
  - track application status
recommended_patterns:
  - search
  - filter_sort
  - PLP
  - PDP
  - application_request_flow
  - bookmark_wishlist
  - lookup_query_flow
layout_bias:
  - list_filter_sheet
  - single_task_form
  - dashboard_cards for status
visual_direction:
  primary_styles: [minimal_swiss, flat_functional]
  colors: professional blue, success status, neutral cards
  typography: job title/company/salary hierarchy
must_include:
  - salary/benefit visibility when available
  - application progress
  - saved jobs
  - status and next action
avoid:
  - hiding filters
  - losing application draft
```

## IoT / smart home / device control

```yaml
user_goals:
  - monitor device status
  - control safely
  - automate or schedule
  - recover from offline state
recommended_patterns:
  - device_control
  - analytics_report
  - notification
  - settings_list
  - error_state
layout_bias:
  - dashboard_cards
  - data_dense_professional
visual_direction:
  primary_styles: [minimal_swiss, data_dense_professional, dark_oled]
  colors: status colors, neutral surfaces, alert danger
  typography: status-first labels, readable numbers
must_include:
  - command sent vs device confirmed distinction
  - offline/error state
  - risky action confirmation
  - schedule/automation summary
avoid:
  - optimistic state without recovery
  - tiny controls for critical actions
```

## Business tools / analytics / productivity

```yaml
user_goals:
  - understand status
  - complete work quickly
  - filter/search records
  - act on insights
recommended_patterns:
  - dashboard_cards
  - analytics_report
  - search
  - filter_sort
  - transaction_history
  - edit_update_flow
  - application_request_flow
layout_bias:
  - data_dense_professional
  - list_filter_sheet
  - dashboard_cards
visual_direction:
  primary_styles: [minimal_swiss, data_dense_professional]
  colors: neutral, semantic status, restrained brand accent
  typography: compact but accessible labels, tabular numbers
must_include:
  - role/permission state when relevant
  - export/share path for reports
  - empty data and filtered-empty states
  - audit/history for sensitive edits
avoid:
  - decorative dashboard cards without insight
  - hidden filters
  - cramped rows below touch target minimum
```

## Domain selection checklist

- [ ] Domain selected and risk level stated.
- [ ] 2-5 relevant patterns selected from the pattern library.
- [ ] Style direction chosen from the style taxonomy.
- [ ] Color/typography direction fits domain trust level.
- [ ] Domain-specific anti-patterns named.
- [ ] State matrix covers domain-specific failure modes.
