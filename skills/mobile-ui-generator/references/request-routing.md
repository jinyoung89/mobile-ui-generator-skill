# Request routing

## Route before styling

Extract these fields before choosing colors or code:

| Field | Required decision |
| --- | --- |
| `user_job` | What the user is trying to finish or understand |
| `app_category` | Service category such as commerce, finance, chat, health, travel, or productivity |
| `ui_patterns` | Functional units that compose the screen, usually 2–5 |
| `risk_level` | `low`, `medium`, or `high`; trust and confirmation increase with risk |
| `states` | Default plus applicable loading, empty, error, success, disabled, permission, and recovery states |
| `targets` | Requested platform(s); default is requested-only, showcase is all four |
| `language` | User language for narrative and visible copy |

Do not confuse a service category with a UI pattern. `commerce` is a category;
`checkout`, `cart`, and `address_selection` are patterns. A request such as
“chat attachment flow” routes to a messenger category plus `chat`,
`media_capture`, `upload_progress`, and `safe_area_keyboard`.

## Delivery modes

- **Design brief:** return classification, pattern anatomy, visual composition,
  state matrix, copy, and a spec-ready handoff.
- **Target artifact:** produce one canonical spec and only the requested platform
  source unless the user asks for comparison.
- **`showcase/all-platforms`:** produce HTML/CSS, React Native, Flutter, and
  SwiftUI from the same spec, with complete local fixtures, provenance, and all
  acceptance gates passing.
- **Review/revision:** inspect the failing spec or rendered artifact first;
  change the shared rule that explains the failure.

## Ambiguity handling

If a request names a screen but not a category, infer only from the user job and
state the assumption in metadata. If it names a category but no pattern, choose
the smallest pattern set that completes the job and expose the choice. If the
platform is omitted, use the user's existing stack when known; otherwise return a
platform-neutral spec and ask for a target before writing native code.
