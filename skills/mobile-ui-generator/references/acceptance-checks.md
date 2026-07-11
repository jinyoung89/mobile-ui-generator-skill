# Acceptance checks

## Source gate

Run `validate_spec.py` and `validate_artifact.py`. Reject unresolved template
markers, TODO/TBD text, omitted sections, placeholder imports, external network
calls, missing fixture states, missing provenance, and platform code that cannot
be parsed. Every action outcome must resolve to a local state, screen, modal, or
fixture result.

## Build and interaction gate

- HTML/CSS: parse the document, run a browser smoke test, and exercise every
  declared state at compact, standard, and large widths.
- React Native: format, type-check, test, build Android, build the pinned iOS
  simulator target, launch, and capture the standard profile.
- Flutter: format, analyze, widget-test, build Android, build the pinned iOS
  simulator target, launch, and capture the standard profile.
- SwiftUI: format/check the source, run `xcodebuild` build and tests against the
  pinned simulator, launch, and capture the standard profile.

Use local fixture data only. A build that silently skips a target is unverified.

## Render gate

Inspect contact sheets or equivalent captures. Assert no overflow, unexpected
overlap, text clipping, broken shared edges, unsafe fixed regions, or touch
targets below policy. Check loading, empty, error, success, disabled, permission,
keyboard, and destructive states required by the pattern matrix.

## Showcase gate

Showcase mode publishes only an immutable bundle whose manifest points to the
same spec ID, source hashes, platform, profile, and passing verification record.
Code tabs and previews must be loaded from that bundle. If one target or state
fails, block the whole example and revise the shared rule.
