# App Type and UI Pattern Taxonomy

Use this reference to separate **what the service is** from **which functional UI units compose the service**.

This distinction is required for filtering, prompt interpretation, dataset coverage planning, and generated UI specs.

## Core distinction

| Axis | Meaning | Example values | Use as filter? |
|---|---|---|---|
| `app_type` | What kind of service/product the app provides | fintech wallet, food delivery, travel booking, pet care, AI productivity | Yes — service/category filter |
| `ui_pattern` | A reusable functional unit inside the service | phone verification, search, PLP, checkout, map bottom sheet, review write | Yes — feature/pattern filter |
| `domain_modifier` | A domain-specific adaptation applied to a pattern | high-trust fintech checkout, healthcare appointment booking, pet profile setup | Optional — pattern adaptation |
| `visual_style` | How the UI should look and feel | minimal_swiss, glass_layered, bento_cards, dark_oled | Optional — visual filter |
| `state_type` | Non-happy-path condition or status | loading, empty, error, success, permission_denied, offline | Optional — state coverage filter |

**Rule:** app type is the service category; UI pattern is the building block. Do not confuse them.

Good:

```yaml
app_type: food_delivery
ui_patterns: [search, PLP, cart, checkout, delivery_tracking, coupon_points]
```

Good:

```yaml
app_type: pet_care
ui_patterns: [pet_profile_setup, reservation_booking, review_write, customer_support]
```

Wrong:

```yaml
app_type: checkout
```

Wrong:

```yaml
ui_pattern: fintech
```

## App type filters

Use these as service/category filters. A single app may have one primary app type and multiple secondary app types.

### Finance and trust services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `banking` | Account balances, transfers, statements | login, identity_verification, transfer, transaction_history, customer_support |
| `wallet_payment` | Stored cards, QR/NFC/payments, coupons | simple_payment, checkout, coupon_points, transaction_history, benefits_hub |
| `card_insurance` | Cards, insurance, claims, benefits | application_request_flow, benefits_hub, customer_support, document_upload |
| `investment_crypto` | Portfolio, trading, market watch | dashboard_cards, analytics_report, search, chart_detail, risk_disclosure |
| `tax_finance_admin` | Refunds, tax filing, document-heavy finance | application_request_flow, identity_verification, document_upload, status_tracking |

### Commerce and local transaction services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `marketplace` | Multi-seller browsing and purchase | home_feed, search, PLP, PDP, cart, checkout, review |
| `fashion_commerce` | Apparel/beauty/style shopping | media_first_detail, option_selector, review, wishlist, checkout |
| `grocery_daily_goods` | Grocery, convenience, recurring purchase | category_grid, cart, coupon_points, delivery_tracking, reorder |
| `food_delivery` | Restaurant discovery and delivery | map_location, search, menu_detail, cart, checkout, delivery_tracking |
| `secondhand_local_trade` | Local listings and chat-based transaction | listing_create, PLP, chat, map_location, trust_badge, report_abuse |

### Mobility, location, and booking services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `mobility_ride` | Taxi, ride-hailing, car sharing | map_location, bottom_sheet_map, route_preview, booking_confirm, payment_cta |
| `maps_local_search` | Places, routes, local discovery | search, filter_sort, map_location, bottom_sheet_map, bookmark_wishlist |
| `travel_booking` | Hotels, flights, tours, itinerary | search, calendar_slots, reservation_booking, checkout, itinerary_view |
| `parking_transport` | Parking, transit, ticketing | map_location, availability_status, reservation_booking, QR_ticket, payment |
| `event_ticketing` | Concert/movie/event ticketing | seat_selection, calendar_slots, checkout, QR_ticket, cancellation_policy |

### Health, wellness, and care services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `clinic_booking` | Hospital/clinic search and appointment | search, doctor_profile, calendar_slots, reservation_booking, intake_form |
| `pharmacy_health_record` | Medication, records, prescriptions | identity_verification, list_detail, reminder, document_viewer, customer_support |
| `fitness_wellness` | Workouts, habit tracking, body metrics | onboarding_goals, progress_dashboard, streaks, media_capture, coaching_card |
| `mental_health` | Mood tracking, counseling, journaling | check_in, chat, content_viewer, privacy_notice, crisis_support |
| `beauty_spa` | Salon/spa reservation and membership | service_menu, staff_profile, calendar_slots, reservation_booking, review_write |
| `pet_care` | Pet profiles, products, vet/grooming/boarding | pet_profile_setup, reservation_booking, product_detail, care_record, review_write |
| `parenting_childcare` | Kids activities, childcare, records | child_profile, calendar_slots, feed, permission_notice, emergency_contact |

### Content, social, and communication services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `messenger` | One-to-one/group messaging | chat, media_capture, notification, profile, failed_message_retry |
| `community_social` | Posts, profiles, comments, groups | feed, write_post, comments, profile, report_abuse, notification |
| `creator_editor` | Image/video/document creation | media_capture, edit_update_flow, generate_create_flow, export_share |
| `music_audio` | Music, podcasts, audio content | media_player, playlist, search, subscription_paywall, lyrics_view |
| `ott_video_webtoon` | Video/webtoon/story consumption | content_home, content_viewer, media_player, bookmark_wishlist, subscription_paywall |
| `news_editorial` | Articles, newsletters, curated content | editorial_feed, content_viewer, curation_feed, save_for_later, notification |

### Productivity, AI, education, and business services

| `app_type` | What it does | Common UI patterns |
|---|---|---|
| `ai_productivity` | AI assistant/generation/workflows | ai_assistant_panel, generate_create_flow, edit_update_flow, recommendation, history |
| `education_learning` | Lessons, quizzes, progress | onboarding_goals, lesson_viewer, quiz, progress_dashboard, streaks |
| `productivity_tools` | Notes, tasks, calendar, collaboration | dashboard_cards, create_edit, search, calendar_slots, notification |
| `business_analytics` | Reports, metrics, dashboards | analytics_report, filter_sort, chart_detail, export_share, stale_data_notice |
| `recruiting_jobs` | Job search, application, resume | search, filter_sort, PDP, application_request_flow, status_tracking |
| `real_estate_property` | Property search, map, inquiry | search, PLP, PDP, map_location, contact_agent, bookmark_wishlist |
| `smart_home_iot` | Device monitoring and control | device_control, status_dashboard, automation_rule, alert, permission_request |
| `game_rewards` | Games, quests, points, rankings | game_lobby, gamification, ranking, daily_reward, points_rewards |

## UI pattern filters

Use these as feature/function filters. UI patterns can appear in many app types.

### Entry, trust, and account

- `splash`
- `onboarding_intro`
- `onboarding_goals`
- `preference_setup`
- `permission_request`
- `tutorial_coachmark`
- `login`
- `signup`
- `phone_verification`
- `identity_verification`
- `terms_agreement`
- `privacy_notice`
- `account_recovery`
- `account_cancellation`
- `settings_list`

### Home, navigation, and discovery

- `main_home`
- `home_feed`
- `bottom_tabs`
- `top_app_bar`
- `category_grid`
- `search`
- `lookup_query_flow`
- `filter_sort`
- `recommendation`
- `curation_feed`
- `notification_center`
- `bookmark_wishlist`

### Listing, detail, and content consumption

- `PLP`
- `PDP`
- `media_first_detail`
- `content_viewer`
- `media_player`
- `lyrics_view`
- `article_viewer`
- `document_viewer`
- `gallery_viewer`
- `review`
- `review_write`
- `comments`

### Commerce, payment, and transaction

- `cart`
- `checkout`
- `simple_payment`
- `coupon_points`
- `price_breakdown`
- `order_success`
- `transaction_history`
- `refund_cancel`
- `subscription_paywall`
- `benefits_hub`
- `cross_sell_upsell`
- `gift_send_receive`
- `invite_referral`

### Booking, location, and logistics

- `map_location`
- `bottom_sheet_map`
- `route_preview`
- `calendar_slots`
- `reservation_booking`
- `availability_status`
- `seat_selection`
- `QR_ticket`
- `delivery_tracking`
- `itinerary_view`
- `contact_agent`

### Creation, communication, and AI

- `write_post`
- `listing_create`
- `media_capture`
- `attachment_upload`
- `chat`
- `failed_message_retry`
- `ai_assistant_panel`
- `generate_create_flow`
- `edit_update_flow`
- `export_share`
- `history`

### Data, dashboard, and control

- `dashboard_cards`
- `analytics_report`
- `chart_detail`
- `progress_dashboard`
- `status_tracking`
- `status_dashboard`
- `device_control`
- `automation_rule`
- `data_freshness_label`
- `stale_data_notice`

### Support, safety, and system states

- `customer_support`
- `faq`
- `chatbot_support`
- `report_abuse`
- `crisis_support`
- `empty_state`
- `error_state`
- `loading_skeleton`
- `success_state`
- `offline_state`
- `permission_denied_recovery`

## Filter composition rules

### Rule 1 — select app type first

Choose the app type to set service expectations, risk level, visual tone, and default navigation model.

```yaml
app_type: travel_booking
```

### Rule 2 — select UI patterns second

Choose the functional units that actually appear in the requested screen or flow.

```yaml
ui_patterns:
  - search
  - calendar_slots
  - reservation_booking
  - checkout
```

### Rule 3 — apply domain modifiers

The same UI pattern changes by app type.

| UI pattern | In fintech | In travel | In healthcare |
|---|---|---|---|
| `checkout` | trust/legal/auth emphasis | price breakdown + cancellation | insurance/payment/privacy |
| `reservation_booking` | rare, usually branch/consult booking | central flow | high trust, doctor/time/intake |
| `profile` | identity/account/security | traveler info/preferences | patient/pet/child profile |
| `review_write` | limited, compliance-sensitive | stay/tour feedback | clinic/provider feedback with caution |

### Rule 4 — never render taxonomy labels as user UI

`app_type`, `ui_pattern`, `risk_level`, `pattern_id`, and `style_id` are design metadata. They belong in specs, code comments, or design QA tables, not in user-facing UI.

Bad visible UI:

```text
High trust · phone_verification
```

Good visible UI:

```text
안전한 본인 확인
```

Bad visible UI:

```text
PDP · checkout · coupon_points
```

Good visible UI:

```text
쿠폰 적용 가능
```

## Output schema additions

For structured specs, include both axes explicitly:

```json
{
  "app_type": "food_delivery",
  "app_type_group": "commerce_and_local_transaction",
  "ui_pattern_filters": ["search", "menu_detail", "cart", "checkout", "delivery_tracking"],
  "domain_modifiers": ["local_availability", "delivery_eta", "coupon_points"],
  "user_facing_labels": ["가까운 매장", "도착 예정", "쿠폰 적용"]
}
```

## Coverage planning checklist

When expanding the skill, check both dimensions:

- [ ] Does the app type exist as a service/category filter?
- [ ] Does each functional unit exist as a UI pattern filter?
- [ ] Can the same UI pattern be reused across several app types?
- [ ] Are domain-specific differences captured as modifiers rather than new duplicate patterns?
- [ ] Are internal labels excluded from visible UI copy?
