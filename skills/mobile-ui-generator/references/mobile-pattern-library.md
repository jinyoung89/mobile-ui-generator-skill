# Mobile Pattern Library

This reference distills mobile UI observations into public-safe design patterns. It intentionally avoids non-public source material, collection mechanics, provider names, or source-specific identifiers. Use it as a pattern checklist when generating mobile UI briefs and specs.

## How to use this file

1. Identify the user's domain and flow.
2. Select 2-5 relevant patterns from the catalog.
3. For each selected pattern, include:
   - user intent;
   - layout structure;
   - component inventory;
   - state matrix;
   - interaction details;
   - copy requirements;
   - accessibility and mobile constraints;
   - anti-patterns to avoid.
4. Output the selected patterns in `pattern_system`.

## Pattern anatomy

Every pattern should be represented with this shape:

```yaml
pattern:
  id:
  user_intent:
  layout:
  required_components: []
  optional_components: []
  states: []
  interactions: []
  copy_requirements: []
  accessibility: []
  anti_patterns: []
```

---

## 1. Acquisition and onboarding

### `splash`

```yaml
user_intent: Understand that the app is launching and recognize the brand.
layout:
  - centered brand mark or app symbol
  - optional short tagline
  - loading/progress only when meaningful
required_components:
  - brand_mark
  - launch_background
  - transition_target
states:
  - default
  - loading
  - delayed
  - offline_or_error
interactions:
  - auto_transition_to_onboarding_or_home
copy_requirements:
  - keep tagline short
  - avoid legal or marketing-heavy copy
accessibility:
  - sufficient contrast for logo/background
  - avoid motion-heavy intros by default
anti_patterns:
  - long unskippable animation
  - spinner without fallback
```

### `onboarding_intro`

```yaml
user_intent: Learn the app value before committing to setup or signup.
layout:
  - illustration_or_media_area
  - single focused headline
  - short supporting copy
  - progress dots
  - next/skip controls
required_components:
  - headline
  - value_copy
  - progress_indicator
  - primary_next_cta
optional_components:
  - skip_button
  - login_link
  - permission_preview
states:
  - first_slide
  - middle_slide
  - final_slide
interactions:
  - horizontal_swipe
  - next_button
  - skip_to_auth_or_home
copy_requirements:
  - one idea per screen
  - concrete benefit instead of generic slogans
accessibility:
  - do not rely only on illustration
  - keep CTA visible above safe area
anti_patterns:
  - five-plus slides before value is clear
  - mixed language copy
```

### `preference_setup`

```yaml
user_intent: Personalize recommendations or initial content.
layout:
  - title and explanation
  - selectable chips/cards
  - selected count or progress
  - fixed bottom CTA
required_components:
  - choice_grid_or_chips
  - selected_state
  - skip_or_later_option
  - fixed_bottom_cta
states:
  - none_selected
  - partially_selected
  - max_selected
  - loading_recommendations
interactions:
  - tap_to_select
  - tap_to_unselect
  - continue_after_minimum_selection
copy_requirements:
  - explain why choices improve experience
  - state whether selection can be changed later
accessibility:
  - selected state must not be color-only
  - 44pt touch targets
anti_patterns:
  - hiding skip when setup is optional
  - unclear max/min selection rules
```

### `permission_request`

```yaml
user_intent: Understand why the app needs access before OS permission.
layout:
  - explanatory icon/visual
  - benefit-focused title
  - primary allow CTA
  - secondary later CTA
required_components:
  - permission_reason
  - allow_cta
  - later_or_skip_cta
  - denied_recovery_path
states:
  - pre_prompt
  - system_prompt_open
  - granted
  - denied
  - ask_later
interactions:
  - show_custom_explanation_before_system_prompt
  - deep_link_to_settings_if_denied
copy_requirements:
  - name the exact value to user
  - avoid coercive language
accessibility:
  - CTA labels must be explicit
anti_patterns:
  - triggering OS prompt without explanation
  - blocking all app usage after denial when not essential
```

---

## 2. Auth, identity, and consent

### `login`

```yaml
user_intent: Return quickly and securely.
layout:
  - app identity
  - primary login method
  - alternate login methods
  - account recovery link
required_components:
  - identifier_input_or_social_login
  - password_or_code_input
  - login_cta
  - signup_link
  - forgot_password_link
optional_components:
  - biometric_login
  - recent_account_hint
states:
  - empty
  - focused
  - invalid_credentials
  - locked
  - loading
  - success
interactions:
  - keyboard_next
  - biometric_prompt
  - password_visibility_toggle
copy_requirements:
  - plain error messages
  - avoid exposing whether account exists when security-sensitive
accessibility:
  - visible labels, not placeholder-only
anti_patterns:
  - too many equal-weight login methods
  - hidden recovery path
```

### `signup`

```yaml
user_intent: Create an account with minimal friction.
layout:
  - progress indication when multi-step
  - minimal fields per screen
  - trust/privacy helper
  - fixed bottom CTA
required_components:
  - title
  - input_fields
  - validation_helper
  - primary_cta
optional_components:
  - social_signup
  - referral_code
  - login_link
states:
  - empty
  - field_valid
  - field_invalid
  - duplicate_account
  - loading
  - success
interactions:
  - field_validation_on_blur_or_submit
  - keyboard_aware_cta
copy_requirements:
  - tell what happens next
  - keep legal copy close but not dominant
accessibility:
  - error text connected to field
anti_patterns:
  - asking for nonessential data upfront
```

### `phone_verification`

```yaml
user_intent: Verify ownership of a phone number or account.
layout:
  - phone number input or masked number
  - verification code input
  - timer and resend
  - fixed bottom CTA
required_components:
  - phone_input_or_masked_phone
  - code_input
  - countdown_timer
  - resend_button
  - primary_cta
states:
  - code_empty
  - code_focused
  - invalid_code
  - timer_expired
  - resend_available
  - too_many_attempts
  - auto_submit_loading
  - verified
interactions:
  - numeric_keyboard
  - paste_code
  - auto_advance_or_auto_submit_when_complete
  - resend_after_timer
copy_requirements:
  - make retry path obvious
  - state what number received the code
accessibility:
  - timer should not be the only indicator
  - avoid auto-focus loops that trap keyboard users
anti_patterns:
  - disabled resend with no timer
  - vague error such as “failed”
```

### `terms_agreement`

```yaml
user_intent: Understand and complete required consent.
layout:
  - all-agree control
  - required/optional grouping
  - expandable details
  - CTA state tied to required terms
required_components:
  - all_agree_checkbox
  - required_terms
  - optional_terms
  - detail_links
  - primary_cta
states:
  - none_checked
  - required_checked
  - all_checked
  - detail_open
interactions:
  - all_agree_toggle
  - expand_term_detail
copy_requirements:
  - label required vs optional clearly
  - do not bundle marketing consent invisibly
accessibility:
  - checkbox labels must be tappable
anti_patterns:
  - hidden optional consent
  - CTA enabled before required terms
```

### `account_cancellation`

```yaml
user_intent: Leave or delete account while understanding consequences.
layout:
  - consequence summary
  - retained/lost benefits
  - reason selection if needed
  - support or alternative path
  - separated destructive CTA
required_components:
  - warning_summary
  - benefit_loss_list
  - reason_picker_or_text
  - alternative_cta
  - destructive_cta
states:
  - default
  - reason_selected
  - confirmation_required
  - loading
  - completed
interactions:
  - confirm_destructive_action
  - offer_pause_or_support_if_relevant
copy_requirements:
  - precise, non-manipulative warning
  - name irreversible data loss if true
accessibility:
  - destructive CTA visually distinct and textually explicit
anti_patterns:
  - dark-pattern friction
  - hiding final action in misleading wording
```

---

## 3. Home, navigation, and account hub

### `main_home`

```yaml
user_intent: Resume the most important task quickly.
layout:
  - personalized greeting or primary status
  - main action card
  - shortcut grid
  - contextual modules
  - bottom navigation
required_components:
  - status_or_summary_card
  - shortcut_actions
  - personalized_section
  - bottom_tabs
states:
  - first_time
  - personalized
  - loading
  - empty_module
  - alert_present
interactions:
  - shortcut_tap
  - module_carousel_or_scroll
copy_requirements:
  - task-oriented labels
  - avoid vague marketing headlines
accessibility:
  - bottom tabs with labels
  - badges must have text equivalents
anti_patterns:
  - banner overload above primary task
```

### `my_page`

```yaml
user_intent: Manage profile, benefits, activity, settings, and support.
layout:
  - profile summary
  - membership/benefit status
  - activity shortcuts
  - grouped settings/support list
required_components:
  - avatar_or_initial
  - profile_name
  - benefit_summary
  - order_or_activity_shortcuts
  - settings_links
  - support_link
states:
  - logged_in
  - profile_incomplete
  - membership_active
  - membership_none
interactions:
  - edit_profile
  - view_history
  - open_settings
copy_requirements:
  - use concrete nouns for menu items
accessibility:
  - list rows with clear hit targets
anti_patterns:
  - mixing destructive actions with regular menu items
```

### `bottom_tabs`

```yaml
user_intent: Move between primary app sections.
layout:
  - 3 to 5 fixed tabs
  - icon + label
  - active indicator
  - safe-area padding
required_components:
  - tab_items
  - active_state
  - optional_badge
states:
  - active
  - inactive
  - badge
  - disabled_if_section_unavailable
interactions:
  - tap_switch
  - preserve_scroll_per_tab_when_possible
copy_requirements:
  - short labels, one line if possible
accessibility:
  - selected tab announced
anti_patterns:
  - icon-only tabs for unfamiliar actions
  - more than 5 primary tabs
```

---

## 4. Search, list, and discovery

### `search`

```yaml
user_intent: Find a known or discoverable item.
layout:
  - prominent search field
  - recent searches
  - suggestions/autocomplete
  - results or empty recovery
required_components:
  - search_input
  - clear_button
  - recent_or_suggested_terms
  - result_list
  - empty_state
states:
  - empty_query
  - typing
  - loading
  - results
  - no_results
  - network_error
interactions:
  - focus_opens_keyboard
  - submit_query
  - clear_query
  - tap_suggestion
copy_requirements:
  - placeholder should be specific to domain
  - no-result copy should suggest alternatives
accessibility:
  - search field has label
  - result count announced when useful
anti_patterns:
  - empty no-result page with no next action
```

### `filter_sort`

```yaml
user_intent: Narrow a list to a manageable set.
layout:
  - horizontal filter chips
  - sort selector
  - applied count
  - bottom-sheet advanced filter
required_components:
  - filter_chips
  - sort_button
  - reset_button
  - result_count
states:
  - none_applied
  - filters_applied
  - no_matching_results
  - loading_filtered_results
interactions:
  - tap_chip
  - open_filter_sheet
  - apply_filters
  - reset_filters
copy_requirements:
  - name filters using user language, not database fields
accessibility:
  - chip selected state not color-only
anti_patterns:
  - no way to reset filters
  - hidden applied filters
```

### `PLP`

```yaml
user_intent: Browse and compare items before detail view.
layout:
  - category or search context
  - filter/sort row
  - item card grid/list
  - wishlist/save action
required_components:
  - product_or_item_cards
  - image_thumbnail
  - title
  - price_or_key_metric
  - rating_or_badge_if_relevant
  - wishlist_button
states:
  - loading_skeleton
  - populated
  - no_results
  - filtered_empty
interactions:
  - card_tap_to_detail
  - quick_save
  - infinite_scroll_or_pagination
copy_requirements:
  - card text must prioritize decision criteria
accessibility:
  - image alt/label should describe item role
anti_patterns:
  - dense cards with unreadable price/hierarchy
```

### `comparison`

```yaml
user_intent: Decide between multiple options.
layout:
  - selected item columns
  - sticky attribute headers
  - differences highlighted
  - remove/add item controls
required_components:
  - comparison_table_or_cards
  - sticky_header
  - difference_highlight
  - remove_item
states:
  - one_item
  - two_to_four_items
  - max_items
  - missing_attribute
interactions:
  - add_item
  - remove_item
  - scroll_attributes
copy_requirements:
  - label missing values clearly
accessibility:
  - avoid horizontal-only table without labels
anti_patterns:
  - comparing too many items on a phone screen
```

---

## 5. Detail, content, and viewer

### `PDP`

```yaml
user_intent: Understand an item and decide whether to purchase/save.
layout:
  - media gallery
  - title and price
  - options
  - delivery/return/trust info
  - reviews
  - sticky purchase CTA
required_components:
  - media_gallery
  - title
  - price
  - option_selector
  - delivery_or_policy_info
  - review_summary
  - sticky_cta
states:
  - option_unselected
  - option_selected
  - out_of_stock
  - loading_reviews
  - added_to_cart
interactions:
  - swipe_gallery
  - choose_option
  - add_to_cart_or_buy
copy_requirements:
  - surface shipping/return constraints before CTA
accessibility:
  - options must have text labels
anti_patterns:
  - CTA enabled without required option
```

### `content_viewer`

```yaml
user_intent: Consume media or article content comfortably.
layout:
  - media/header area
  - title and metadata
  - content body/player
  - engagement actions
  - next content path
required_components:
  - title
  - metadata
  - body_or_player
  - save_share_actions
  - next_content
states:
  - loading
  - playing_or_reading
  - paused
  - completed
  - error
interactions:
  - scroll_or_playback
  - save
  - share
  - continue_next
copy_requirements:
  - metadata should aid decision, not clutter
accessibility:
  - media controls labelled
anti_patterns:
  - hiding playback controls
  - poor reading contrast
```

### `bookmark_wishlist`

```yaml
user_intent: Save, organize, and return to items.
layout:
  - saved item list/grid
  - collection/folder control
  - empty state
  - remove undo
required_components:
  - saved_items
  - collection_selector
  - remove_action
  - empty_state
states:
  - saved
  - unsaved
  - removed_with_undo
  - empty
interactions:
  - save_toggle
  - move_to_collection
  - undo_remove
copy_requirements:
  - use user-friendly collection names
accessibility:
  - toggle announces saved/unsaved
anti_patterns:
  - instant permanent delete with no undo
```

---

## 6. Commerce, payment, and order

### `cart`

```yaml
user_intent: Review items and prepare checkout.
layout:
  - cart item list
  - quantity/edit controls
  - coupon/points entry
  - price summary
  - checkout CTA
required_components:
  - item_rows
  - quantity_control
  - remove_or_save_for_later
  - price_summary
  - checkout_cta
states:
  - populated
  - empty
  - item_unavailable
  - price_changed
  - loading
interactions:
  - update_quantity
  - remove_item
  - apply_coupon
copy_requirements:
  - explain price changes and unavailable items
accessibility:
  - quantity buttons labelled
anti_patterns:
  - hidden fees until checkout
```

### `checkout`

```yaml
user_intent: Confirm purchase with confidence.
layout:
  - address or recipient
  - delivery/pickup option
  - payment method
  - coupon/points
  - legal agreement
  - total amount fixed CTA
required_components:
  - address_card
  - payment_method
  - coupon_points
  - price_breakdown
  - legal_notice
  - total_amount_cta
states:
  - missing_required_info
  - ready_to_pay
  - payment_loading
  - payment_failed
  - success
interactions:
  - edit_address
  - select_payment
  - apply_discount
  - confirm_payment
copy_requirements:
  - CTA should include amount when useful
  - legal notice near final action
accessibility:
  - error summary if multiple missing fields
anti_patterns:
  - enabling payment with incomplete required fields
```

### `simple_payment`

```yaml
user_intent: Pay quickly using a saved method.
layout:
  - selected payment method
  - amount summary
  - authentication step
  - result/receipt
required_components:
  - saved_method_card
  - amount
  - auth_prompt
  - receipt_or_success
states:
  - ready
  - auth_required
  - auth_failed
  - payment_failed
  - paid
interactions:
  - biometric_or_pin_auth
  - retry_payment
copy_requirements:
  - distinguish auth failure from payment failure
accessibility:
  - support non-biometric fallback
anti_patterns:
  - ambiguous failure message
```

### `review_write`

```yaml
user_intent: Leave useful feedback with minimal effort.
layout:
  - star/rating control
  - text field
  - photo upload
  - guidance chips
  - submit CTA
required_components:
  - rating_input
  - review_text_input
  - photo_upload_optional
  - submit_cta
states:
  - rating_empty
  - text_empty
  - photo_uploading
  - validation_error
  - submitted
interactions:
  - tap_rating
  - add_photo
  - save_draft_if_long
copy_requirements:
  - explain reward/incentive if offered
  - state public visibility
accessibility:
  - rating control usable with labels
anti_patterns:
  - forcing long text for low-value reviews
```

### `order_history`

```yaml
user_intent: Revisit previous orders or transactions.
layout:
  - status filter
  - date grouping
  - order cards
  - detail/reorder/support actions
required_components:
  - filter_tabs
  - order_card
  - status_badge
  - detail_link
states:
  - populated
  - empty
  - filtered_empty
  - loading
interactions:
  - filter_by_status
  - open_detail
  - reorder_or_refund
copy_requirements:
  - status labels must be clear and actionable
accessibility:
  - status cannot be color-only
anti_patterns:
  - hiding support/refund path
```

---

## 7. Finance, wallet, and records

### `account_overview`

```yaml
user_intent: Check money state and start common actions.
layout:
  - balance/asset summary
  - account/card carousel
  - primary action buttons
  - alerts/insights
required_components:
  - balance_summary
  - account_cards
  - transfer_or_pay_cta
  - security_or_alert_banner
states:
  - masked
  - unmasked
  - loading
  - alert_present
  - empty_account
interactions:
  - reveal_or_hide_balance
  - swipe_account_cards
  - tap_primary_action
copy_requirements:
  - numeric hierarchy must be unambiguous
  - warnings should be specific
accessibility:
  - color semantics for gain/loss not color-only
anti_patterns:
  - decorative charts without numeric clarity
```

### `transfer`

```yaml
user_intent: Send money safely and confidently.
layout:
  - recipient
  - amount keypad/input
  - fee/memo
  - confirmation screen
required_components:
  - recipient_card
  - amount_input
  - numeric_keypad
  - fee_or_limit_notice
  - confirm_cta
states:
  - recipient_missing
  - amount_empty
  - limit_exceeded
  - fraud_warning
  - confirming
  - success
interactions:
  - select_recipient
  - enter_amount
  - confirm_twice_if_high_risk
copy_requirements:
  - clear recipient and amount before final confirm
accessibility:
  - keypad accessible labels
anti_patterns:
  - hiding fees/limits
  - weak final confirmation
```

### `transaction_history`

```yaml
user_intent: Understand past activity and find a record.
layout:
  - date group sections
  - transaction rows
  - search/filter
  - detail drilldown
required_components:
  - date_group_header
  - transaction_row
  - amount
  - category_or_counterparty
  - search_filter
states:
  - populated
  - no_transactions
  - filtered_empty
  - loading
interactions:
  - tap_row_detail
  - filter_by_date_or_category
copy_requirements:
  - make debit/credit distinction explicit
accessibility:
  - plus/minus or labels with color
anti_patterns:
  - relying only on red/blue amount colors
```

---

## 8. Booking, maps, mobility, and travel

### `map_location`

```yaml
user_intent: Choose or understand a location.
layout:
  - map canvas
  - search field
  - current location button
  - markers
  - bottom sheet preview
required_components:
  - map
  - search_location
  - current_location
  - markers
  - preview_sheet
states:
  - permission_unknown
  - permission_denied
  - locating
  - markers_loaded
  - no_nearby_results
interactions:
  - pan_zoom
  - tap_marker
  - recenter
copy_requirements:
  - explain location permission value
accessibility:
  - provide list alternative to map
anti_patterns:
  - map-only UI with no list fallback
```

### `bottom_sheet_map`

```yaml
user_intent: Inspect contextual details without losing map context.
layout:
  - map background
  - draggable bottom sheet
  - collapsed/half/full states
  - CTA pinned within sheet
required_components:
  - drag_handle
  - summary_row
  - detail_content
  - pinned_cta
states:
  - collapsed
  - half
  - expanded
  - loading_detail
interactions:
  - drag_sheet
  - tap_marker_updates_sheet
  - CTA_from_current_selection
copy_requirements:
  - summary must fit collapsed state
accessibility:
  - sheet content reachable without drag-only interaction
anti_patterns:
  - CTA outside safe area
  - sheet hiding key map controls
```

### `reservation_booking`

```yaml
user_intent: Pick a time/resource and understand terms.
layout:
  - date selector
  - available slots
  - provider/resource card
  - policy summary
  - booking CTA
required_components:
  - calendar_strip
  - time_slots
  - provider_or_resource_summary
  - cancellation_policy
  - booking_cta
states:
  - no_slots
  - slot_available
  - slot_selected
  - slot_unavailable
  - booking_loading
  - confirmed
interactions:
  - select_date
  - select_slot
  - confirm_booking
copy_requirements:
  - show timezone/date context when relevant
  - cancellation policy before CTA
accessibility:
  - selected slot not color-only
anti_patterns:
  - hiding unavailable reason
```

### `delivery_tracking`

```yaml
user_intent: Know where the order/package is and what to do if delayed.
layout:
  - status timeline
  - ETA
  - map or route preview
  - contact/support actions
required_components:
  - status_stepper
  - eta
  - map_or_route
  - support_action
states:
  - preparing
  - picked_up
  - arriving
  - delayed
  - delivered
  - issue_reported
interactions:
  - refresh_status
  - contact_driver_or_support
  - report_issue
copy_requirements:
  - distinguish estimate from guarantee
accessibility:
  - timeline has text labels
anti_patterns:
  - map without text ETA/status
```

---

## 9. Social, messaging, and creation

### `feed`

```yaml
user_intent: Browse updates and act on interesting content.
layout:
  - feed cards
  - author metadata
  - media/text body
  - engagement row
required_components:
  - feed_card
  - author_info
  - content_preview
  - reaction_actions
  - comments_or_share
states:
  - loading
  - populated
  - empty_following
  - offline
interactions:
  - infinite_scroll
  - like_save_share
  - open_detail
copy_requirements:
  - metadata should clarify recency/source
accessibility:
  - reaction controls labelled
anti_patterns:
  - tiny tap targets in dense action rows
```

### `chat`

```yaml
user_intent: Read and send messages continuously.
layout:
  - message list
  - day separators
  - composer
  - attachment controls
  - keyboard-safe bottom area
required_components:
  - message_bubbles
  - timestamp
  - composer_input
  - send_button
  - attachment_button
states:
  - sending
  - sent
  - failed_to_send
  - unread_separator
  - keyboard_open
  - attachment_uploading
interactions:
  - type_message
  - send
  - retry_failed_message
  - attach_media
copy_requirements:
  - system messages should be concise
accessibility:
  - composer labelled
  - failed messages announced
anti_patterns:
  - composer hidden behind keyboard
```

### `write_post`

```yaml
user_intent: Create content and publish safely.
layout:
  - title/body input
  - media attachment
  - visibility setting
  - draft/save indicator
  - publish CTA
required_components:
  - text_inputs
  - media_attach
  - visibility_selector
  - draft_state
  - publish_cta
states:
  - empty
  - draft_saved
  - validation_error
  - uploading
  - published
interactions:
  - autosave
  - attach_media
  - change_visibility
copy_requirements:
  - clarify who can see the post
accessibility:
  - input labels and error text
anti_patterns:
  - losing draft on navigation
```

---

## 10. Engagement, rewards, and gamification

### `gamification`

```yaml
user_intent: Understand progress and feel motivated.
layout:
  - current level/progress
  - tasks/quests
  - reward preview
  - feedback animation area
required_components:
  - progress_bar_or_ring
  - task_list
  - reward_preview
  - claim_or_continue_cta
states:
  - not_started
  - in_progress
  - completed
  - reward_claimed
interactions:
  - complete_task
  - claim_reward
copy_requirements:
  - reward conditions must be clear
accessibility:
  - animation not required to understand completion
anti_patterns:
  - unclear reward rules
```

### `ranking`

```yaml
user_intent: Compare performance or popularity.
layout:
  - rank list
  - current user highlight
  - period/category filter
  - rank delta
required_components:
  - leaderboard_rows
  - current_user_row
  - period_filter
  - rank_delta
states:
  - populated
  - not_ranked
  - loading
  - tie_or_equal_rank
interactions:
  - change_period
  - open_profile_or_detail
copy_requirements:
  - explain ranking criteria if not obvious
accessibility:
  - rank changes not color-only
anti_patterns:
  - hiding user's own position
```

### `points_rewards`

```yaml
user_intent: Understand benefits and redeem rewards.
layout:
  - points balance
  - earning rules
  - reward catalog
  - expiration notice
required_components:
  - points_balance
  - tier_or_level
  - reward_cards
  - expiration_info
  - redeem_cta
states:
  - enough_points
  - insufficient_points
  - expiring_soon
  - redeemed
interactions:
  - view_reward_detail
  - redeem
copy_requirements:
  - show constraints before redemption
accessibility:
  - don't rely on badge color alone
anti_patterns:
  - hiding expiration or conditions
```

---

## 11. Support and system states

### `customer_support`

```yaml
user_intent: Resolve a problem quickly.
layout:
  - search or issue chips
  - FAQ shortcuts
  - recent inquiry
  - contact/escalation route
required_components:
  - issue_category_chips
  - faq_links
  - contact_support_cta
  - response_time_hint
states:
  - default
  - searching
  - faq_match
  - no_match
  - agent_unavailable
interactions:
  - select_issue
  - open_faq
  - start_chat_or_inquiry
copy_requirements:
  - set response expectations
accessibility:
  - support route usable without chatbot only
anti_patterns:
  - chatbot dead-end with no escalation
```

### `faq`

```yaml
user_intent: Self-serve an answer.
layout:
  - category tabs/chips
  - search field
  - accordion list
  - helpful feedback
required_components:
  - category_filter
  - search_input
  - faq_accordion
  - helpful_feedback
states:
  - collapsed
  - expanded
  - no_results
interactions:
  - expand_answer
  - search
  - mark_helpful
copy_requirements:
  - question wording should match user vocabulary
accessibility:
  - accordion announces expanded/collapsed
anti_patterns:
  - long unstructured FAQ list
```

### `empty_state`

```yaml
user_intent: Understand why nothing is shown and what to do next.
layout:
  - simple illustration/icon
  - plain explanation
  - recovery action
  - optional alternative link
required_components:
  - empty_title
  - empty_description
  - primary_recovery_cta
optional_components:
  - secondary_action
  - suggestion_chips
states:
  - first_time_empty
  - filtered_empty
  - search_no_result
  - permission_empty
interactions:
  - reset_filter
  - create_first_item
  - browse_suggestions
copy_requirements:
  - state cause and next step
accessibility:
  - don't rely on illustration alone
anti_patterns:
  - cute message with no action
```

### `error_state`

```yaml
user_intent: Recover from a failed action or network issue.
layout:
  - clear problem statement
  - retry CTA
  - fallback/support action
  - technical details hidden unless useful
required_components:
  - error_title
  - error_description
  - retry_cta
  - support_or_fallback
states:
  - network_error
  - timeout
  - permission_error
  - server_error
  - validation_error
interactions:
  - retry
  - change_input_or_permission
  - contact_support
copy_requirements:
  - avoid blaming user
  - explain what remains safe/saved
accessibility:
  - error focus/announcement when form submit fails
anti_patterns:
  - generic “Something went wrong” only
```


## 12. Creation, application, recommendation, and growth patterns

### `application_request_flow`

```yaml
user_intent: Apply, submit, or request something with confidence.
layout:
  - requirement summary
  - form or stepper
  - attachment/proof area if needed
  - review screen
  - submit CTA
required_components:
  - eligibility_or_requirement_summary
  - required_fields
  - optional_attachments
  - review_before_submit
  - submit_cta
states:
  - draft
  - validation_error
  - missing_required_document
  - submitting
  - submitted
  - rejected_or_needs_revision
interactions:
  - save_draft
  - attach_file_or_photo
  - review_submission
  - submit_request
copy_requirements:
  - state what happens after submission
  - show expected response time
accessibility:
  - error summary for long forms
anti_patterns:
  - ambiguous submit result
  - losing draft on back navigation
```

### `generate_create_flow`

```yaml
user_intent: Generate or create a new asset, document, design, image, post, playlist, or recommendation.
layout:
  - input prompt or seed selection
  - option controls
  - generation progress
  - result preview
  - regenerate/edit/save actions
required_components:
  - creation_input
  - option_controls
  - progress_state
  - result_preview
  - save_or_publish_cta
states:
  - empty_prompt
  - ready
  - generating
  - partial_result
  - failed
  - completed
interactions:
  - submit_generation
  - cancel_generation
  - regenerate
  - edit_result
copy_requirements:
  - set expectation for wait time and output limits
  - clarify whether content is public or private
accessibility:
  - progress should be text-readable
anti_patterns:
  - infinite spinner with no cancel or retry
  - hiding edit path after generation
```

### `lookup_query_flow`

```yaml
user_intent: Look up a record, status, account, reservation, policy, package, or result.
layout:
  - query input or identifier card
  - validation helper
  - result summary
  - detail drilldown
required_components:
  - query_input
  - helper_copy
  - lookup_cta
  - result_card
  - empty_or_not_found_state
states:
  - empty
  - invalid_identifier
  - loading
  - found
  - not_found
  - restricted
interactions:
  - submit_lookup
  - scan_or_paste_identifier_if_relevant
  - open_result_detail
copy_requirements:
  - explain acceptable identifier format
  - distinguish not found from permission denied
accessibility:
  - input format guidance linked to field
anti_patterns:
  - generic no-result message with no recovery path
```

### `edit_update_flow`

```yaml
user_intent: Edit existing information without losing context.
layout:
  - current value summary
  - editable fields
  - save/cancel controls
  - unsaved changes warning
required_components:
  - editable_fields
  - save_cta
  - cancel_or_back
  - unsaved_changes_guard
states:
  - unchanged
  - dirty
  - validation_error
  - saving
  - saved
  - conflict
interactions:
  - edit_field
  - save_changes
  - discard_changes
copy_requirements:
  - label changed values clearly
  - explain whether changes apply immediately
accessibility:
  - focus first invalid field after save failure
anti_patterns:
  - silent autosave with no status
  - losing unsaved edits on navigation
```

### `recommendation`

```yaml
user_intent: Discover relevant items selected for them.
layout:
  - reason or context label
  - recommended cards
  - feedback controls
  - refresh or see more
required_components:
  - recommendation_section_title
  - recommended_cards
  - reason_label_or_context
  - feedback_action
states:
  - personalized
  - generic_fallback
  - no_recommendations
  - loading
interactions:
  - open_recommendation
  - hide_or_not_interested
  - refresh_recommendations
copy_requirements:
  - explain why recommendation appears when useful
accessibility:
  - recommendation reason available as text
anti_patterns:
  - black-box recommendation with no control
```

### `curation_feed`

```yaml
user_intent: Browse curated collections or editorial picks.
layout:
  - curated section title
  - collection cards
  - editor/context note
  - save/share actions
required_components:
  - collection_card
  - curation_reason
  - save_action
  - see_all_link
states:
  - curated_content_loaded
  - empty_collection
  - loading
interactions:
  - open_collection
  - save_collection
  - follow_topic
copy_requirements:
  - use editorial labels that match the audience
accessibility:
  - cards need descriptive labels beyond images
anti_patterns:
  - decorative collection with unclear next step
```

### `cross_sell_upsell`

```yaml
user_intent: Consider an add-on, bundle, upgrade, or related item without feeling tricked.
layout:
  - current context
  - recommended add-on/bundle
  - clear price/benefit
  - accept/skip controls
required_components:
  - offer_card
  - benefit_summary
  - price_or_cost_delta
  - accept_cta
  - skip_or_not_now
states:
  - eligible
  - not_eligible
  - accepted
  - dismissed
interactions:
  - accept_offer
  - dismiss_offer
  - view_details
copy_requirements:
  - be explicit about added cost or subscription change
accessibility:
  - skip path must be reachable
anti_patterns:
  - preselected add-ons
  - hiding price changes
```

### `invite_referral`

```yaml
user_intent: Invite others or accept an invitation.
layout:
  - benefit or purpose explanation
  - invite code/link
  - contact/share options
  - status of invited users
required_components:
  - invite_link_or_code
  - share_actions
  - invitee_status
  - terms_or_reward_condition
states:
  - no_invites
  - invite_sent
  - accepted
  - expired
  - reward_pending
interactions:
  - copy_link
  - share_to_contact
  - accept_invite
copy_requirements:
  - clarify reward or permission implications
accessibility:
  - copy confirmation announced
anti_patterns:
  - uploading contacts without clear consent
```

### `gift_send_receive`

```yaml
user_intent: Send or receive a gift, coupon, item, or benefit.
layout:
  - gift item summary
  - recipient selector
  - message field
  - delivery method
  - confirmation
required_components:
  - gift_summary
  - recipient_input
  - optional_message
  - send_cta
  - received_state
states:
  - composing
  - recipient_invalid
  - sending
  - sent
  - received
  - expired
interactions:
  - choose_recipient
  - add_message
  - send_gift
  - redeem_gift
copy_requirements:
  - show expiry, refund, and delivery constraints
accessibility:
  - recipient validation text connected to field
anti_patterns:
  - unclear who receives the gift or when
```

### `benefits_hub`

```yaml
user_intent: Understand available benefits, coupons, perks, and eligibility.
layout:
  - benefit summary
  - available benefits list
  - eligibility/status
  - redeem/use CTA
required_components:
  - benefit_cards
  - eligibility_label
  - expiration_or_condition
  - use_cta
states:
  - available
  - locked
  - expiring
  - used
  - empty
interactions:
  - view_benefit_detail
  - redeem_or_use
  - filter_available
copy_requirements:
  - expose conditions before redemption
accessibility:
  - status must not be color-only
anti_patterns:
  - hiding expiration or usage limits
```

---

## 13. AI, automation, device, and data-heavy patterns

### `ai_assistant_panel`

```yaml
user_intent: Ask for help, summarize, generate, or automate within the app.
layout:
  - assistant entry point
  - prompt/suggestion chips
  - conversation or result panel
  - apply/copy actions
required_components:
  - assistant_prompt
  - suggested_prompts
  - response_area
  - apply_or_copy_action
states:
  - empty
  - thinking
  - streaming
  - completed
  - failed
interactions:
  - submit_prompt
  - stop_generation
  - apply_suggestion
copy_requirements:
  - disclose uncertainty or review needs when appropriate
accessibility:
  - streaming response should remain readable
anti_patterns:
  - assistant output replacing user data without confirmation
```

### `chatbot_support`

```yaml
user_intent: Resolve an issue conversationally with escalation if needed.
layout:
  - chat thread
  - quick reply chips
  - input composer
  - agent escalation path
required_components:
  - bot_messages
  - quick_replies
  - composer
  - escalation_action
states:
  - bot_greeting
  - collecting_context
  - answer_found
  - handoff_needed
  - unavailable
interactions:
  - choose_quick_reply
  - type_message
  - escalate_to_human_or_ticket
copy_requirements:
  - set expectations about bot vs human
accessibility:
  - messages and quick replies accessible by keyboard/screen reader
anti_patterns:
  - no escape hatch from bot loop
```

### `audio_recording`

```yaml
user_intent: Record, preview, and submit voice/audio.
layout:
  - record button
  - waveform/timer
  - pause/stop
  - preview playback
  - submit/delete controls
required_components:
  - record_control
  - timer
  - waveform_or_level_indicator
  - playback_preview
  - submit_cta
states:
  - idle
  - recording
  - paused
  - preview
  - uploading
  - failed
interactions:
  - start_recording
  - pause_resume
  - stop
  - preview
  - delete_or_submit
copy_requirements:
  - explain mic permission and max duration
accessibility:
  - recording state conveyed with text, not just color/waveform
anti_patterns:
  - no clear stop/delete control
```

### `voice_interaction`

```yaml
user_intent: Use voice to search, command, dictate, or control.
layout:
  - microphone entry
  - listening state
  - recognized text
  - confirm/edit action
required_components:
  - mic_button
  - listening_indicator
  - transcript
  - confirm_or_retry
states:
  - idle
  - permission_needed
  - listening
  - processing
  - recognized
  - no_speech
interactions:
  - tap_to_speak
  - stop_listening
  - edit_transcript
copy_requirements:
  - tell users when listening starts/stops
accessibility:
  - provide non-voice alternative
anti_patterns:
  - auto-listening without explicit action
```

### `device_control`

```yaml
user_intent: Monitor and control connected devices or settings.
layout:
  - device status card
  - primary control
  - secondary controls
  - automation/schedule
required_components:
  - device_status
  - primary_toggle_or_control
  - feedback_state
  - offline_state
states:
  - online
  - offline
  - updating
  - error
  - scheduled
interactions:
  - toggle_or_adjust
  - confirm_risky_action
  - schedule_automation
copy_requirements:
  - distinguish command sent from device confirmed
accessibility:
  - control state announced clearly
anti_patterns:
  - optimistic state with no failure recovery
```

### `analytics_report`

```yaml
user_intent: Understand trends, performance, or personal stats.
layout:
  - headline insight
  - chart or metric cards
  - date range/filter
  - drilldown details
required_components:
  - key_metric
  - trend_chart_or_cards
  - date_filter
  - insight_summary
states:
  - loading
  - populated
  - no_data
  - filtered_empty
interactions:
  - change_date_range
  - tap_metric_detail
  - export_or_share_if_relevant
copy_requirements:
  - explain metric definitions and units
accessibility:
  - chart data available as text summary
anti_patterns:
  - decorative charts without actionable insight
```

---

## 14. Domain modifiers to combine with patterns

Use domain modifiers when the user asks for a domain that changes tone, trust, or component emphasis.

| Modifier | Apply to | Design implications |
|---|---|---|
| `pet_care_domain` | booking, health records, commerce, community | friendly tone, pet profile, vaccination/health info, emergency contact |
| `real_estate_domain` | search, map, PDP, inquiry | map/list toggle, price/location hierarchy, saved properties, agent inquiry |
| `beauty_wellness_domain` | booking, gallery, review, membership | before/after media, staff/provider trust, reservation policy, soft visual tone |
| `dating_domain` | profile, feed, chat, safety | profile cards, match state, block/report, privacy and consent copy |
| `mental_health_domain` | onboarding, journal, booking, support | calm tone, privacy reassurance, crisis path, low-stimulation visuals |
| `recruiting_domain` | search, application, profile, status | job filters, salary/benefits, application progress, saved jobs |
| `parenting_childcare_domain` | booking, community, notifications | child profile, safety credentials, guardian permissions, activity updates |
| `music_audio_domain` | content viewer, discovery, recording | player controls, waveform, queue, offline/download states |
| `fitness_health_domain` | dashboard, progress, booking, rewards | goal progress, streak, workout plan, wearable/device integration |
| `business_tool_domain` | dashboard, report, settings, collaboration | dense data, role permissions, export, audit/history |


## 15. Backfilled core patterns

### `tutorial_coachmark`

```yaml
user_intent: Learn a new feature or changed interaction without reading a manual.
layout:
  - dimmed overlay or contextual highlight
  - short explanation
  - next/done/skip controls
  - target element highlight
required_components:
  - highlighted_target
  - explanation_bubble
  - progress_or_step_count
  - dismiss_or_skip
states:
  - first_step
  - intermediate_step
  - last_step
  - dismissed
interactions:
  - next_step
  - previous_step_if_needed
  - dismiss
  - tap_highlighted_target
copy_requirements:
  - one instruction per step
  - use action verbs tied to the highlighted element
accessibility:
  - overlay must not trap focus permanently
  - explanation must be available as text
anti_patterns:
  - blocking essential tasks with long tours
  - explaining obvious controls
```

### `identity_verification`

```yaml
user_intent: Prove identity for regulated, sensitive, or high-trust flows.
layout:
  - trust/security explanation
  - verification method choices
  - required document or phone route
  - progress/status
  - support fallback
required_components:
  - reason_and_privacy_copy
  - method_selector
  - input_or_document_capture
  - verification_progress
  - support_or_retry
states:
  - not_started
  - method_selected
  - capturing
  - submitted
  - pending_review
  - failed
  - verified
interactions:
  - choose_method
  - capture_or_submit
  - retry_failed_step
  - contact_support
copy_requirements:
  - explain why verification is needed
  - state how information is protected or used
accessibility:
  - provide non-camera fallback when possible
anti_patterns:
  - vague security copy
  - no recovery path after verification failure
```

### `coupon_points`

```yaml
user_intent: Apply available discounts, coupons, or points correctly.
layout:
  - available benefits list
  - input/register coupon option
  - applied discount summary
  - unavailable reason labels
required_components:
  - coupon_or_points_list
  - apply_button
  - applied_summary
  - unavailable_reason
  - expiration_label
states:
  - none_available
  - available
  - applied
  - unavailable
  - expired
  - insufficient_points
interactions:
  - apply_one
  - apply_best
  - remove_applied
  - view_conditions
copy_requirements:
  - show why a discount cannot be used
  - make expiration and minimum spend visible
accessibility:
  - applied/unavailable state not color-only
anti_patterns:
  - hiding restrictions until payment
  - applying low-value coupon over better option without explanation
```

### `review`

```yaml
user_intent: Judge quality or trust from other users' feedback.
layout:
  - rating summary
  - review filters
  - photo/media reviews
  - review list
  - write review entry when eligible
required_components:
  - rating_summary
  - review_filter
  - review_cards
  - helpful_or_report_action
states:
  - loading
  - populated
  - no_reviews
  - filtered_empty
  - write_eligible
interactions:
  - filter_by_rating_or_topic
  - open_photo_review
  - mark_helpful
  - report_review
copy_requirements:
  - distinguish verified reviews if used
  - state review count and average clearly
accessibility:
  - star ratings need text labels
anti_patterns:
  - fake precision without review count
  - image-only reviews with no text alternative
```

### `media_capture`

```yaml
user_intent: Capture or upload a photo/video as part of a task.
layout:
  - camera or upload entry
  - permission explanation
  - preview
  - retake/delete controls
  - upload/progress state
required_components:
  - capture_or_upload_button
  - permission_reason
  - preview_area
  - retake_or_delete
  - submit_or_attach_cta
states:
  - permission_needed
  - capturing
  - preview
  - uploading
  - upload_failed
  - attached
interactions:
  - open_camera_or_picker
  - capture
  - retake
  - attach
  - remove
copy_requirements:
  - explain accepted formats or quality requirements
  - show upload progress and failure reason
accessibility:
  - provide file picker alternative where possible
anti_patterns:
  - forcing camera when upload is sufficient
  - losing captured media after failed upload
```

## Cross-pattern rules

- Always include `default`, `loading`, `empty`, `error`, and `success` where relevant.
- Prefer mobile-native behaviors: safe area, fixed bottom CTA, keyboard-aware layout, pull-to-refresh only when appropriate.
- Use bottom sheets for secondary choices, maps, filters, and contextual detail — but provide non-drag alternatives.
- Keep destructive actions separated from regular actions.
- Make selected/active/disabled/error states visible through text, icon, shape, or label, not color alone.
- For Korean UI, use natural short microcopy and avoid line breaks that split particles awkwardly.
- Never claim a specific brand's proprietary design system unless confirmed by the user or public docs.
