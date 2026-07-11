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

Node 22.15.0, npm 10.9.2, Python 3.14.3, Flutter 3.35.3 stable, Dart 3.9.2, Xcode 15.2, Swift 5.9.2, and iOS 17.2 simulators are available. Android SDK, ADB 35.0.2, emulator 35.2.10, and an API 34 ARM image exist under `$HOME/Library/Android/sdk` but are not on the default PATH. The existing AVD is invalid, so the implementation must create the dedicated pinned AVD before proof work.

## Verification

Set equality is verified with `diff -u <(git ls-tree -r --name-only 717ad41902522963e29ea3161cae8694d77cae79 | sort) <(jq -r '.files[].path' reports/current-public-inventory.json | sort)`. The observed result is exit 0, zero missing paths, zero extra paths, and 45 unique entries. Action totals are verified separately with the `verification.action_count_command` stored in the JSON; it exits 0 only when computed counts match the summary. The baseline tree object is `4ee73bacb471c78c02400f26c8890851bc1ccbd8`. Existing pattern and site validators must remain green after this report is added.
