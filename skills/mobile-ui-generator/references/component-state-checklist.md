# Component and State Checklist

Use this reference to make generated mobile UI specs implementation-ready. Every screen should include component inventory and state matrix appropriate to its selected patterns.

## Global state matrix

At minimum, decide which of these states apply:

```yaml
screen_states:
  - default
  - loading
  - empty
  - error
  - success
  - offline
  - permission_denied
  - restricted
  - refreshing
  - destructive_confirmation
component_states:
  - enabled
  - disabled
  - focused
  - pressed
  - selected
  - expanded
  - collapsed
  - invalid
  - loading
  - completed
```

## Navigation components

### Top app bar

```yaml
required_decisions:
  - title behavior: fixed, dynamic, or collapsed
  - leading action: back, close, menu, none
  - trailing actions: search, share, settings, overflow
  - scroll behavior: sticky, transparent-to-solid, hidden-on-scroll
states:
  - default
  - scrolled
  - loading
  - action_badge
accessibility:
  - icon actions have labels
  - back/close behavior is predictable
anti_patterns:
  - multiple equal-priority trailing actions
  - back button that discards unsaved work without warning
```

### Bottom tabs

```yaml
required_decisions:
  - 3 to 5 top-level destinations
  - labels plus icons
  - active state
  - badge rules
states:
  - active
  - inactive
  - badge
  - disabled_unavailable
accessibility:
  - selected tab announced
  - labels remain available
anti_patterns:
  - more than 5 tabs
  - icon-only unfamiliar navigation
```

### Bottom sheet

```yaml
required_decisions:
  - collapsed/half/full heights
  - drag handle
  - dismiss behavior
  - fixed CTA location
  - background interaction rules
states:
  - collapsed
  - half
  - full
  - loading
  - error
  - unsaved_changes
accessibility:
  - provide controls for expand/collapse, not drag only
  - focus stays inside modal sheet when blocking
anti_patterns:
  - sheet covering the only critical map/control area
  - no close affordance
```

## Input components

### Text field

```yaml
required_decisions:
  - visible label
  - placeholder as hint only
  - helper text
  - validation timing
  - keyboard type
states:
  - empty
  - focused
  - filled
  - invalid
  - disabled
  - readonly
  - loading_validation
accessibility:
  - label connected to field
  - error announced and placed near field
anti_patterns:
  - placeholder-only labels
  - validation on every keystroke for long input
```

### Phone / code input

```yaml
required_decisions:
  - number formatting
  - paste handling
  - timer behavior
  - resend behavior
  - auto-submit or manual CTA
states:
  - empty
  - partial
  - complete
  - invalid
  - expired
  - too_many_attempts
  - verified
anti_patterns:
  - disabled resend with no visible timer
  - unclear masked destination
```

### Search field

```yaml
required_decisions:
  - recent search chips
  - suggestions
  - clear button
  - submit behavior
  - voice/camera option when relevant
states:
  - empty
  - typing
  - loading
  - results
  - no_results
  - offline
anti_patterns:
  - no recovery from no-results state
  - generic placeholder unrelated to domain
```

## Selection components

### Chips

```yaml
required_decisions:
  - single vs multi-select
  - selected count
  - reset behavior
  - horizontal scroll vs wrap
states:
  - unselected
  - selected
  - disabled
  - overflow
accessibility:
  - selected state not color-only
anti_patterns:
  - chip labels too vague
  - applied filters hidden off-screen
```

### Option cards

```yaml
required_decisions:
  - title, description, price/status if relevant
  - selected state
  - unavailable reason
  - comparison fields
states:
  - default
  - selected
  - unavailable
  - recommended
  - loading
anti_patterns:
  - recommended badge without reason
  - selected state only by border color
```

## Commerce components

### Product/listing card

```yaml
required_decisions:
  - image ratio
  - title length
  - price/key metric
  - badge/rating
  - save/wishlist
states:
  - default
  - saved
  - out_of_stock
  - sponsored_or_promoted
  - loading_skeleton
anti_patterns:
  - price hierarchy weaker than metadata
  - dense cards with tiny tap targets
```

### Price summary

```yaml
required_decisions:
  - subtotal
  - discount/coupon
  - fee/shipping/tax
  - final total
  - legal or policy note
states:
  - discount_applied
  - fee_updated
  - missing_info
  - ready
anti_patterns:
  - hidden final fee
  - unclear final CTA amount
```

### Review summary

```yaml
required_decisions:
  - average rating
  - count
  - rating distribution
  - photo reviews
  - verified/user filters
states:
  - loading
  - no_reviews
  - filtered_empty
  - populated
anti_patterns:
  - stars without text labels
  - rating without count
```

## Finance/data components

### Balance / numeric card

```yaml
required_decisions:
  - masked/unmasked behavior
  - currency formatting
  - primary actions
  - alert or insight
states:
  - loading
  - masked
  - visible
  - error
  - stale_data
accessibility:
  - tabular numerals
  - color not only indicator
anti_patterns:
  - decorative chart before core number
```

### Transaction row

```yaml
required_decisions:
  - date grouping
  - merchant/counterparty
  - amount sign
  - category/status
  - detail drilldown
states:
  - pending
  - completed
  - failed
  - refunded
anti_patterns:
  - debit/credit expressed by color only
  - rows below touch target minimum
```

### Chart / report block

```yaml
required_decisions:
  - chart type
  - text insight summary
  - date range
  - legend and units
  - drilldown/export
states:
  - loading
  - no_data
  - filtered_empty
  - populated
  - error
accessibility:
  - provide textual data summary
  - chart colors meet contrast
anti_patterns:
  - decorative charts without insight
```

## Feedback components

### Toast / snackbar

```yaml
required_decisions:
  - message
  - duration
  - action/undo
  - aria-live behavior on web
states:
  - success
  - error
  - undo_available
anti_patterns:
  - long critical messages in transient toast
  - toast that steals focus
```

### Empty state

```yaml
required_decisions:
  - cause
  - next action
  - alternative suggestion
  - reset/filter/create path
states:
  - first_time_empty
  - filtered_empty
  - search_no_result
  - permission_empty
anti_patterns:
  - cute message without recovery
```

### Error state

```yaml
required_decisions:
  - what happened
  - what remains safe/saved
  - retry or edit path
  - support fallback
states:
  - network_error
  - timeout
  - validation_error
  - permission_error
  - server_error
anti_patterns:
  - generic “Something went wrong” only
```

## CTA rules

| CTA type | Use | Rules |
|---|---|---|
| Primary | main next action | one per screen region; clear verb; enabled only when valid |
| Secondary | lower-priority option | visually subordinate; never compete with primary |
| Destructive | delete/cancel/leave | separated, explicit label, confirmation if irreversible |
| Sticky/fixed | checkout, booking, forms | reserve content inset; safe-area padding |
| Inline | list/card action | clear label and touch target |

CTA states:

```yaml
cta_states:
  - disabled
  - enabled
  - pressed
  - loading
  - success
  - destructive_confirmation
```

## Handoff checklist

Before generating final spec, verify:

- [ ] Every selected pattern has required components.
- [ ] Every form/input has labels, helper/error text, and keyboard behavior.
- [ ] Every CTA has enabled/disabled/loading states.
- [ ] Every async area has loading, error, and empty states.
- [ ] Every destructive action has clear copy and confirmation/undo when appropriate.
- [ ] Every map/chart/media component has a text fallback or summary.
- [ ] Fixed headers/footers reserve safe-area and scroll insets.
