# Taxonomy

## Two axes

`app_category` describes the service: commerce, finance, mobility, healthcare,
education, games, messaging, travel, media, AI, support, productivity,
utilities, or another justified category. `ui_patterns` describe reusable
functional units: onboarding, login, signup, home, search, feed, chat, map,
checkout, settings, analytics, and their states.

Filter by category first when the user wants domain guidance; filter by pattern
first when the user wants a component or flow. Preserve both fields in the spec
and never render the IDs as user-facing labels by accident.

## Selection rules

Choose 2–5 patterns that cover the user job. Add a state pattern for high-risk,
network, permission, or destructive behavior. Explain unusual combinations in
the rationale. Use the public `search.py --pattern <id>` lookup to inspect the
pattern anatomy before implementation.
