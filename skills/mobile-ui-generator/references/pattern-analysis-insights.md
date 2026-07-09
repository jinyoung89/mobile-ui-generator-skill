# Pattern Analysis Insights

This reference records public-safe, generalized updates distilled from curated mobile UI reference analysis. It must never include origin/source names, provider names, raw capture paths, collection commands, credentials, URLs, or screenshots. Use it to keep the skill's reusable pattern guidance aligned with real mobile app conventions while preserving privacy and public repo hygiene.

## How to use this file

Use this file after selecting `app_type` and `ui_patterns` from `taxonomy-filter-model.md`.

1. Pick the insight group that matches the requested screen or flow.
2. Add the relevant component/state requirements to the `pattern_system` and `state_matrix`.
3. Adapt the copy guidance to the output language.
4. If the insight references images/assets, describe the role of the asset generically rather than copying any real screen or brand.

## App-type coverage gaps to keep expanding

The skill should keep first-class support for these app/service categories, not just finance and commerce:

| App type family | Common screens | Design emphasis |
|---|---|---|
| Grocery and daily retail | cart, coupon wallet, delivery slot, reorder | substitution state, delivery freshness, coupon clarity |
| Beauty and fashion | product detail, option selector, review, booking | media-led detail, ingredient/fit trust, before/after caution |
| Career and work | job detail, application wizard, document upload, status tracking | resumable forms, deadline visibility, profile completeness |
| Insurance and legal | claim flow, document review, comparison, support | document status, plain-language risk copy, recovery actions |
| Public and utility | bill alert, usage detail, payment, receipt | deadline, amount, usage reason, proof/receipt access |
| Real estate and housing | search/listing, map, saved comparison, inquiry | trust badges, commute/location, saved state, contact path |
| Smart home and IoT | device dashboard, live status, alerts, automation | device state clarity, permission recovery, offline/failure state |
| Pet and family care | profile, schedule, booking, health/care record | dependent profile context, reminders, safe cancellation |
| Automotive and service | service status, estimate, booking, document review | timeline status, ETA, approval/quote, contact escalation |
| Events and ticketing | ticket detail, QR/pass, transfer, refund policy | time/gate/seat hierarchy, saved pass, offline readiness |
| Fitness and sports | plan dashboard, progress, schedule, coaching | progress visibility, recovery state, next action |
| Creator and AI tools | upload/create, AI draft, media preview, publish schedule | input constraints, generated alternatives, rights/review state |

## Cross-pattern insights from observed mobile screens

### 1. Search and filter screens need both query and scope state

Reusable guidance:

```yaml
pattern_refinement: search_filter_scope
layout:
  - top search input or filter title
  - recent/suggested terms when query is empty
  - filter chips or grouped checkbox sections
  - visible apply/change CTA when filters affect results
  - result, no-results, and keyboard-open variants
required_components:
  - search_field
  - recent_or_suggested_terms
  - filter_group_labels
  - selected_filter_state
  - apply_or_change_cta
states:
  - empty_query
  - typing_keyboard_open
  - filters_selected
  - loading_results
  - no_results
  - results
anti_patterns:
  - hiding selected filters after apply
  - long taxonomy lists with no grouping or search
  - keyboard covering the first actionable result
```

### 2. Payment, points, and benefit screens need transparent calculation

Reusable guidance:

```yaml
pattern_refinement: payment_benefit_calculation
layout:
  - amount or points summary above legal/explanation copy
  - fee/benefit rows grouped by meaning
  - previous/back and next/pay actions visually separated
  - final price/point amount repeated in the sticky CTA when relevant
required_components:
  - amount_summary
  - benefit_or_coupon_rows
  - legal_or_policy_notice
  - payment_method_or_point_source
  - fixed_bottom_cta
states:
  - calculating
  - insufficient_points_or_balance
  - coupon_unavailable
  - payment_loading
  - payment_failed
  - success_receipt
anti_patterns:
  - long policy copy before the amount hierarchy
  - CTA enabled before required selection/consent
  - hiding final amount until after tap
```

### 3. Create/upload flows are often taxonomy-heavy

Reusable guidance:

```yaml
pattern_refinement: create_upload_taxonomy
layout:
  - editor or composer surface
  - category/topic selector as sheet or side panel
  - media preview/upload area
  - metadata fields and publish/schedule CTA
required_components:
  - title_or_body_input
  - category_selector
  - media_picker_or_preview
  - visibility_or_topic_setting
  - submit_or_schedule_cta
states:
  - draft_empty
  - required_fields_missing
  - media_uploading
  - validation_error
  - publishing
  - publish_success
anti_patterns:
  - dumping dozens of categories without search/grouping
  - disabled submit without explaining the missing requirement
  - no recovery for failed media upload
```

### 4. Notifications and support screens are list-first, but need escalation

Reusable guidance:

```yaml
pattern_refinement: notification_support_list
layout:
  - grouped notification/help rows
  - category tabs or shortcut chips
  - timestamp/read state or status label
  - escalation CTA for contact/write inquiry
required_components:
  - row_icon_or_status_marker
  - title_and_preview
  - timestamp_or_status
  - category_filter
  - support_escalation_cta
states:
  - unread
  - read
  - empty
  - loading
  - network_error
  - inquiry_submitted
anti_patterns:
  - notifications with no read/unread distinction
  - FAQ lists without search or contact path
  - floating CTA that hides the final list item
```

### 5. Profile and settings screens should separate identity, metrics, and risk

Reusable guidance:

```yaml
pattern_refinement: profile_settings_grouping
layout:
  - profile or account header
  - metrics/status row when useful
  - grouped menu rows by task
  - destructive or account-exit actions visually separated
required_components:
  - profile_header
  - account_or_service_summary
  - grouped_menu_rows
  - settings_link
  - logout_or_destructive_row_when_relevant
states:
  - signed_out
  - incomplete_profile
  - restricted_account
  - notification_badge
  - destructive_confirmation
anti_patterns:
  - mixing promotional links with security/account controls
  - placing account deletion beside routine settings
  - icon-only rows with unclear labels
```

### 6. Empty and saved-item states need a recovery path

Reusable guidance:

```yaml
pattern_refinement: saved_empty_recovery
layout:
  - low-distraction empty illustration or icon
  - explicit reason why the list is empty
  - one primary recovery action
  - optional browse/search secondary action
required_components:
  - empty_visual
  - empty_reason_copy
  - primary_recovery_cta
  - optional_secondary_link
states:
  - no_saved_items
  - filtered_empty
  - first_use_empty
  - offline_empty
anti_patterns:
  - blank whitespace with no explanation
  - multiple competing empty-state CTAs
  - suggesting content unrelated to the user's filter
```

### 7. Map and location screens need map controls plus list fallback

Reusable guidance:

```yaml
pattern_refinement: map_with_controls_and_fallback
layout:
  - map canvas with search or location context
  - current-location/layer controls
  - markers with status labels when dense
  - bottom sheet or list fallback for detail selection
required_components:
  - map_canvas
  - search_or_place_context
  - marker_cluster_or_pin
  - current_location_control
  - detail_sheet_or_result_list
states:
  - locating
  - permission_denied
  - no_nearby_results
  - route_recalculating
  - stale_location
anti_patterns:
  - map-only UI with no list alternative
  - bottom sheet covering critical map controls
  - no explanation when location permission is denied
```

### 8. AI/generation screens need review and edit affordances

Reusable guidance:

```yaml
pattern_refinement: ai_generation_review
layout:
  - prompt or source-input area
  - suggestion chips/examples
  - generated result preview
  - apply/edit/regenerate actions
  - language/tone/settings only after the task is clear
required_components:
  - prompt_input
  - suggestion_chips
  - generated_preview
  - edit_or_apply_cta
  - regenerate_or_alternative_cta
states:
  - empty_prompt
  - generating
  - generated
  - partial_failure
  - needs_review
  - saved_to_history
anti_patterns:
  - presenting generated content as final without review path
  - hiding source inputs after generation
  - mixing internal prompt labels into user-facing UI
```

### 9. Review/rating screens should separate browsing reviews from writing one

Reusable guidance:

```yaml
pattern_refinement: review_browse_write_split
layout:
  - rating summary or search field
  - review cards with rating, date, and short preview
  - filters for rating/topic/photo when available
  - write-review CTA outside the reading path
required_components:
  - rating_summary_or_review_search
  - review_card_list
  - filter_chips
  - write_review_cta
  - empty_or_no_matching_reviews_state
states:
  - loading_reviews
  - no_reviews
  - filtered_empty
  - writing_review
  - review_submitted
anti_patterns:
  - forcing review writing before showing existing reviews
  - review cards without credibility/date context
  - star rating conveyed by color alone
```

## Asset and image-role guidance

Many mobile screens depend on non-code visual assets, not just layout primitives. A generated spec should name asset roles explicitly without copying any private/local asset.

```yaml
asset_roles_to_specify:
  - app_icon_or_logo
  - hero_media_or_illustration
  - product_or_listing_thumbnail
  - banner_or_card_graphic
  - map_marker_or_status_icon
  - reward_coupon_ticket_visual
  - profile_avatar_or_dependent_avatar
  - generated_media_preview
asset_state_notes:
  - define missing/failed image fallback
  - reserve aspect-ratio to prevent layout shift
  - avoid using decorative assets as the only information carrier
  - pair media with text labels for accessibility
```

## Documentation update rule

When future analysis reveals a repeated pattern:

1. Add the public-safe generalized anatomy here or in `mobile-pattern-library.md`.
2. Add domain-specific adjustments to `domain-playbooks.md` only when they affect decisions.
3. Add component/state requirements to `component-state-checklist.md` if they affect implementation.
4. Add new `app_type` or `ui_pattern` filters to `taxonomy-filter-model.md` only when the axis is reusable across multiple services.
5. Never paste raw images, origin names, local paths, source identifiers, or collection mechanics into the public skill.
