# Pattern catalog

Each pattern records layout archetype, navigation, required components, states,
interactions, copy, accessibility, and anti-patterns. Combine patterns; do not
copy an entire screen as an undifferentiated block.

The catalog's **required states** are release obligations, not optional polish.

## Common patterns

| Pattern | Archetype | Required states / checks |
| --- | --- | --- |
| `onboarding_intro` | media plus stepper | skip, next, reduced motion, long copy |
| `signup` | single-task form | empty, focused, invalid, loading, success |
| `phone_verification` | timed form | expired, resend, too many attempts, verified |
| `main_home` | dashboard/feed | loading, empty, stale, retry |
| `search` | query plus results | focused, no results, filtered empty, error |
| `feed` | stream | skeleton, empty, pagination, offline |
| `chat` | thread plus composer | sending, failed, attachment, keyboard, unread |
| `bottom_sheet_map` | map plus sheet | permission, locating, no result, recalculation |
| `checkout` | review plus fixed CTA | address, coupon, payment loading/failure, success |
| `simple_payment` | confirmation form | validation, risk disclosure, cancelled, receipt |
| `settings` | grouped list | toggle, permission denied, destructive confirmation |
| `analytics_report` | chart plus filters | loading, no data, stale, chart error |
| `empty_state` | recovery surface | explanation, primary recovery, support path |

For the full pattern set and domain modifiers, search the existing
`mobile-pattern-library.md` with `scripts/search.py`. A generated component must
declare all states that the selected pattern marks as required.
