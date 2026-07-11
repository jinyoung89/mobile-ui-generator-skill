# Current Public Baseline Inventory

Baseline: `717ad41902522963e29ea3161cae8694d77cae79`

This freeze records the tracked public tree before reconstruction. The authoritative per-file classification is `current-public-inventory.json`: 45 tracked files, split into 7 keep, 24 rewrite, 5 archive, and 9 delete decisions. No ignored or private input was read to create the inventory.

## Decisions

- Keep the approved specification and implementation plan, license, Pages policy, and neutral artwork pending final audit.
- Rewrite the public skill, references, compatibility validators, README files, and Pages application.
- Archive legacy examples and templates that predate the canonical schema.
- Delete the legacy generated screen previews and their generator after replacement artifacts pass verification.
- Never delete `docs/superpowers/**` as part of the website replacement.

## Baseline routes

- `/mobile-ui-generator-skill/`
- `/mobile-ui-generator-skill/ko/`

## Toolchain snapshot

Node 22.15.0, npm 10.9.2, Python 3.14.3, Dart 3.9.2, Xcode 15.2, Swift 5.9.2, and iOS 17.2 simulators are available. Android SDK, ADB 35.0.2, emulator 35.2.10, and an API 34 ARM image exist under `$HOME/Library/Android/sdk` but are not on the default PATH. The existing AVD is invalid, so the implementation must create the dedicated pinned AVD before proof work.

## Verification

Set equality is verified by comparing sorted `git ls-files` output with the sorted `files[].path` values in the JSON. The expected result is zero missing paths, zero extra paths, 45 unique entries, and summary counts equal to the action totals. Existing pattern and site validators must remain green after this report is added.
