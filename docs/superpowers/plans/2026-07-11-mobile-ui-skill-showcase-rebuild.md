# Mobile UI Skill and Showcase Rebuild Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public mobile UI skill and output-first GitHub Pages showcase so 80-120 approved examples produce one numeric specification, complete runnable HTML/CSS, React Native, Flutter, and SwiftUI artifacts, and verified previews.

**Architecture:** A one-way sanitized export creates public aggregate knowledge. A versioned canonical JSON schema drives four shared platform harnesses and per-example generated modules. Verification manifests connect source hashes, build results, named device profiles, captures, and website routes so the site can publish only passing artifacts.

**Tech Stack:** Node.js 22, TypeScript, JSON Schema/Ajv, Playwright, vanilla static HTML/CSS/JavaScript, Expo/React Native, Flutter/Dart, SwiftUI/Xcode, Python validation compatibility scripts, GitHub Pages.

**Specification:** `docs/superpowers/specs/2026-07-11-mobile-ui-skill-showcase-rebuild-design.md`

---

## Normative command matrix

The implementation may update pinned versions only through a reviewed toolchain commit. These are the required command shapes and passing evidence:

| Target | RED/validation command | GREEN/release command | Passing evidence |
|---|---|---|---|
| Node unit test | `npm test -- <test-file>` | `npm test` | exit 0, zero failed tests |
| TypeScript | `npm run typecheck` | `npm run typecheck` | exit 0, no diagnostics |
| Public boundary | `npm run validate:boundary -- <fixture>` | `npm run validate:boundary -- $(git archive --format=tar HEAD -o /tmp/public.tar && echo /tmp/public.tar)` | leak fixtures exit 1 with named rule; archive exits 0 |
| Official skill | `python3 /Users/jinyoung/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/mobile-ui-generator` | same | `Skill is valid!` and exit 0 |
| HTML build | `npm --prefix harnesses/html test` | `npm --prefix harnesses/html ci && npm --prefix harnesses/html run build` | exit 0 and `dist/index.html` |
| HTML browser | `npm run test:browser -- --project=chromium` | same | all required profile/state cases pass |
| React Native tests | `npm --prefix harnesses/react-native test -- --runInBand` | `npm --prefix harnesses/react-native run typecheck && npm --prefix harnesses/react-native test -- --runInBand` | exit 0 |
| React Native iOS | `npm --prefix harnesses/react-native run ios:build` | pinned script invoking `xcodebuild` for iPhone 15 / iOS 17.2 | `** BUILD SUCCEEDED **` |
| React Native Android | `npm --prefix harnesses/react-native run android:build` | pinned Gradle assemble command with API 34 | `BUILD SUCCESSFUL` |
| Flutter tests | `flutter test harnesses/flutter/test` | `cd harnesses/flutter && flutter pub get && dart format --output=none --set-exit-if-changed . && flutter analyze && flutter test` | exit 0, `No issues found!`, all tests pass |
| Flutter iOS | `cd harnesses/flutter && flutter build ios --simulator --debug` | same | exit 0 and simulator app exists |
| Flutter Android | `cd harnesses/flutter && flutter build apk --debug` | same | exit 0 and debug APK exists |
| SwiftUI | `xcodebuild -project harnesses/swiftui/MobileUIShowcase.xcodeproj -scheme MobileUIShowcase -destination 'platform=iOS Simulator,id=7732B728-22A6-4CCC-A121-C1F2BDC5EC23' test` | same plus build-for-testing | `** TEST SUCCEEDED **` and `** BUILD SUCCEEDED **` |
| Static site | `npm run build:site && npm run test:site` | same with `BASE_PATH=/mobile-ui-generator-skill/` | exit 0, route manifest complete |
| Clean install | `tmp=/tmp/mobile-ui-clean-checkout && rm -rf "$tmp" && mkdir -p "$tmp" && git archive HEAD \| tar -x -C "$tmp" && mkdir -p "$tmp/codex-home/skills" && cp -R "$tmp/skills/mobile-ui-generator" "$tmp/codex-home/skills/mobile-ui-generator"` | `tmp=/tmp/mobile-ui-clean-checkout && python3 /Users/jinyoung/.codex/skills/.system/skill-creator/scripts/quick_validate.py "$tmp/codex-home/skills/mobile-ui-generator" && python3 "$tmp/codex-home/skills/mobile-ui-generator/scripts/search.py" --pattern chat` | exit 0, official validation succeeds, chat pattern is returned without ignored/local input |
| Release audit | `npm test -- tooling/test/release-audit.test.ts` | `npm run release:audit` | 100% required evidence cells pass |

Native launch/capture commands are also normative:

- Boot iOS: `xcrun simctl boot 7732B728-22A6-4CCC-A121-C1F2BDC5EC23 || true` then `open -a Simulator`; readiness is `xcrun simctl bootstatus 7732B728-22A6-4CCC-A121-C1F2BDC5EC23 -b` exit 0.
- React Native iOS: install the built `.app` with `xcrun simctl install <udid> <app-path>`, launch `xcrun simctl launch <udid> com.jinyoung.mobileuishowcase --args --example-id <id> --profile standard --state default`, then capture `xcrun simctl io <udid> screenshot <preview-path>`; pass when launch returns a PID and PNG dimensions match the profile.
- Flutter iOS: install its built `.app`, launch `com.jinyoung.mobileuishowcase.flutter` with the same example/profile/state arguments, and capture with `simctl io`.
- SwiftUI: install its built `.app`, launch `com.jinyoung.mobileuishowcase.swiftui` with the same arguments, and capture with `simctl io`.
- Boot Android: `source tooling/scripts/toolchain-env.sh && emulator -avd mobile_ui_api34 -no-snapshot -no-audio -no-boot-anim`, then poll `adb shell getprop sys.boot_completed` until `1`.
- React Native Android: `adb install -r <apk-path>`, launch `adb shell am start -W -n com.jinyoung.mobileuishowcase/.MainActivity --es exampleId <id> --es profile standard --es state default`, and capture `adb exec-out screencap -p > <preview-path>`; pass when `Status: ok` and PNG dimensions match.
- Flutter Android: install its APK, launch `com.jinyoung.mobileuishowcase.flutter/.MainActivity` with the same extras, and capture using `adb exec-out screencap -p`.
- Browser: start `npm --prefix harnesses/html run preview -- --host 127.0.0.1 --port 4173`; Playwright opens `http://127.0.0.1:4173/examples/<id>?profile=<profile>&state=<state>` and writes the declared preview path.

Tasks 9-14 must use these commands through checked-in scripts and record the expanded command, exit code, application identifier, PID/status, and screenshot hash.

Every TDD task must first run its targeted command and record the expected missing-module, missing-field, invalid-fixture, or failed-assertion message. A test that passes before implementation must be rewritten until it proves the missing behavior.

## Chunk 1: Public boundary, schema, and skill foundation

### Task 0: Freeze, inventory, and verify all toolchains

**Files:**
- Create: `reports/current-public-inventory.json`
- Create: `reports/current-public-inventory.md`
- Create after Task 1 bootstraps tooling: `tooling/toolchains.json`
- Create after Task 1 bootstraps tooling: `tooling/scripts/toolchain-env.sh`
- Create after Task 1 bootstraps tooling: `tooling/test/toolchain-preflight.test.ts`

- [ ] Inventory every tracked public file as `keep`, `rewrite`, `archive`, or `delete`; explicitly retain `docs/superpowers/**`, `robots.txt`, and neutral license metadata.
- [ ] Snapshot current skill/site hashes and current rendered routes in the inventory report.
- [ ] Run shell-only discovery commands from the normative matrix and record observed paths/versions without changing toolchains.
- [ ] Commit: `docs: freeze current public baseline`.

### Task 1: Bootstrap deterministic public tooling

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `tooling/src/paths.ts`
- Create: `tooling/test/paths.test.ts`
- Create: `tooling/test/toolchain-preflight.test.ts`
- Create: `tooling/toolchains.json`
- Create: `tooling/scripts/toolchain-env.sh`
- Modify: `.gitignore`

- [ ] Create the minimal `package.json`, `tsconfig.json`, test-runner dependency, and `test`/`typecheck` scripts; run `npm install` to create the lockfile. This is tooling configuration, not production behavior.
- [ ] Write a failing Node test proving tooling resolves repository, staging, artifact, and website paths without reading ignored private directories.
- [ ] Run `npm test -- tooling/test/paths.test.ts`; expect `ERR_MODULE_NOT_FOUND` for `tooling/src/paths.ts`.
- [ ] Add the minimal path helpers and remaining package scripts: `validate`, `build:site`, and `verify`.
- [ ] Pin dependencies and commit `package-lock.json`.
- [ ] Run `npm test` and `npm run typecheck`; expect pass.
- [ ] Write a failing preflight test requiring pinned Node, npm, Python, Flutter, Dart, Xcode, Swift, iOS simulator, Android SDK, ADB, emulator, API 34 image, and a loadable Android AVD; expect `mobile_ui_api34 missing`.
- [ ] Create `toolchain-env.sh` exporting `ANDROID_HOME="$HOME/Library/Android/sdk"` and the SDK PATH; run `source tooling/scripts/toolchain-env.sh && echo no | avdmanager create avd -n mobile_ui_api34 -k 'system-images;android-34;google_apis;arm64-v8a' -d pixel_7`, then boot with `emulator -avd mobile_ui_api34 -no-snapshot -no-audio -no-boot-anim` and wait until `adb shell getprop sys.boot_completed` returns `1`.
- [ ] Run `npm test -- tooling/test/toolchain-preflight.test.ts`; expect every required cell `ready`. Proof work is blocked until it passes.
- [ ] Commit: `build: bootstrap tooling and pin mobile toolchains`.

### Task 2: Define the one-way sanitized export contract

**Files:**
- Create: `tooling/schemas/private-observation-fixture.schema.json`
- Create: `tooling/schemas/public-knowledge.schema.json`
- Create: `tooling/src/export-public-knowledge.ts`
- Create: `tooling/fixtures/private/observations.json`
- Create: `tooling/fixtures/private/README.fixture.md`
- Create: `tooling/test/export-public-knowledge.test.ts`
- Create: `public-knowledge/.gitkeep`

- [ ] Write a failing test with private-only keys and confirm the export contains only allowlisted aggregate fields.
- [ ] Mark all repository fixtures as synthetic and non-source-derived; the exporter accepts external private input only through an explicit CLI path and writes only to a newly emptied staging directory.
- [ ] Add failing cases for local paths, URLs, credentials, source IDs, insufficient sample counts, and embedded private metadata.
- [ ] Run the targeted test; expect missing exporter failures.
- [ ] Implement allowlist-only export into a clean temporary staging directory.
- [ ] Require minimum aggregate counts and label authored platform guidance separately.
- [ ] Run targeted and full tests; expect pass.
- [ ] Commit: `feat: add one-way public knowledge export`.

### Task 3: Add repository leakage verification

**Files:**
- Create: `tooling/src/check-public-boundary.ts`
- Create: `tooling/test/check-public-boundary.test.ts`
- Create: `tooling/fixtures/leaks/`
- Create: `tooling/src/check-image-similarity.ts`
- Create: `tooling/test/check-image-similarity.test.ts`
- Modify: `package.json`
- Modify: `scripts/validate_site.py`

- [ ] Write failing fixtures for forbidden text, absolute paths, URL-bearing metadata, archive members, source maps, and image metadata.
- [ ] Run the targeted test and confirm each fixture fails for the intended reason.
- [ ] Implement the boundary scanner using an explicit public-root allowlist.
- [ ] Make `npm run validate:boundary` scan the complete tracked tree, a fresh `git archive`, every assembled download archive, generated site output, source maps, and image metadata.
- [ ] Add synthetic exact-hash and perceptual-similarity fixtures and verify near-source public images fail. If the private set cannot be accessed in CI, require a signed local release-audit record rather than silently skipping the check.
- [ ] Keep the Python public-copy validator as a compatibility layer and add a test ensuring both validators agree on shared fixtures.
- [ ] Run all boundary checks; expect pass on the repository and fail on every leak fixture.
- [ ] Commit: `test: enforce public publication boundary`.

### Task 4: Define the canonical mobile UI schema

**Files:**
- Create: `skills/mobile-ui-generator/schemas/mobile-ui-spec.schema.json`
- Create: `tooling/src/validate-spec.ts`
- Create: `tooling/test/validate-spec.test.ts`
- Create: `examples/proof/commerce-checkout/spec.json`

- [ ] Write failing tests for missing viewport, safe-area policy, numeric units, typography, component states, responsive rules, fixtures, navigation outcomes, localization, accessibility, and platform mappings.
- [ ] Write a valid commerce checkout fixture and confirm it fails before the schema exists.
- [ ] Implement schema version 1 with strict unknown-key handling and cross-field invariants.
- [ ] Implement token-resolution, unit, rounding, and constraint-precedence validation.
- [ ] Run `npm test -- tooling/test/validate-spec.test.ts`; expect pass.
- [ ] Commit: `feat: define canonical mobile UI specification`.

### Task 5: Define coverage, states, and verification profiles

**Files:**
- Create: `catalog/coverage-manifest.json`
- Create: `catalog/pattern-state-matrix.json`
- Create: `catalog/verification-profiles.json`
- Create: `tooling/schemas/coverage-manifest.schema.json`
- Create: `tooling/schemas/pattern-state-matrix.schema.json`
- Create: `tooling/schemas/verification-profiles.schema.json`
- Create: `tooling/src/validate-catalog.ts`
- Create: `tooling/test/validate-catalog.test.ts`

- [ ] Write failing tests for duplicate pair IDs, unsupported patterns, missing rationale, absent owner, invalid state applicability, and placeholder profile values.
- [ ] Require sanitized-knowledge snapshot or approved product-rationale basis, coverage-owner acceptance, frequency snapshot version, deterministic tie rule, and legal state transitions `proposed -> approved -> generated -> build_verified -> render_verified -> published`.
- [ ] Add concrete web and iOS 17.2 simulator profiles for compact, standard, large, short-keyboard, large-text, and long-copy cases.
- [ ] Add Android profiles only after an installed emulator target is identified; unresolved required Android fields must fail the release validator.
- [ ] Seed five proof pairs covering form, commerce, map, feed, and chat archetypes.
- [ ] Implement catalog validation and run tests.
- [ ] Commit: `feat: add coverage and verification registries`.

### Task 6: Rebuild the public skill package

**Files:**
- Rewrite: `skills/mobile-ui-generator/SKILL.md`
- Create: `skills/mobile-ui-generator/agents/openai.yaml`
- Create: `skills/mobile-ui-generator/references/request-routing.md`
- Create: `skills/mobile-ui-generator/references/layout-foundations.md`
- Create: `skills/mobile-ui-generator/references/responsive-and-safe-area.md`
- Create: `skills/mobile-ui-generator/references/accessibility.md`
- Create: `skills/mobile-ui-generator/references/acceptance-checks.md`
- Create: `skills/mobile-ui-generator/references/taxonomy.md`
- Create: `skills/mobile-ui-generator/references/pattern-catalog.md`
- Create: `skills/mobile-ui-generator/references/domain-guides.md`
- Create: `skills/mobile-ui-generator/scripts/validate_spec.py`
- Create: `skills/mobile-ui-generator/scripts/validate_artifact.py`
- Create: `skills/mobile-ui-generator/templates/html-css/index.html.tpl`
- Create: `skills/mobile-ui-generator/templates/html-css/styles.css.tpl`
- Create: `skills/mobile-ui-generator/templates/html-css/app.js.tpl`
- Create: `skills/mobile-ui-generator/templates/react-native/Screen.tsx.tpl`
- Create: `skills/mobile-ui-generator/templates/react-native/fixtures.ts.tpl`
- Create: `skills/mobile-ui-generator/templates/flutter/screen.dart.tpl`
- Create: `skills/mobile-ui-generator/templates/flutter/fixtures.dart.tpl`
- Create: `skills/mobile-ui-generator/templates/swiftui/Screen.swift.tpl`
- Create: `skills/mobile-ui-generator/templates/swiftui/Fixtures.swift.tpl`
- Modify: `skills/mobile-ui-generator/scripts/search.py`
- Modify: `scripts/validate_patterns.py`

- [ ] Add a failing official `quick_validate.py` invocation to the verification script and reproduce the current frontmatter failure.
- [ ] Reduce `SKILL.md` to request routing, reference search, spec creation, requested-target generation, showcase mode, and revision workflow.
- [ ] Move detailed reusable knowledge into focused references with direct links from `SKILL.md`.
- [ ] Inventory every existing reference/template as keep, merge, rewrite, or delete and preserve only non-duplicated public knowledge.
- [ ] Generate valid `agents/openai.yaml` from the current skill metadata tool.
- [ ] Update search areas and public validators.
- [ ] Run official quick validation, pattern validation, boundary validation, and search smoke tests.
- [ ] Commit: `feat: rebuild installable mobile UI skill`.

### Task 6B: Add realistic skill-effectiveness evaluations

**Files:**
- Create: `evaluations/prompts.json`
- Create: `evaluations/scoring.schema.json`
- Create: `tooling/src/evaluate-skill.ts`
- Create: `tooling/test/evaluate-skill.test.ts`
- Create: `reports/skill-evaluation.json`
- Create: `reports/skill-evaluation.md`

- [ ] Write a failing evaluator test for familiar screens, rare categories, ambiguous requests, multi-pattern flows, long Korean/English copy, compact widths, keyboard-heavy chat/forms, and destructive/high-trust actions.
- [ ] Score classification, spec completeness, numeric consistency, required states, accessibility, platform mapping, build readiness, and visible acceptance requirements.
- [ ] Run `npm test -- tooling/test/evaluate-skill.test.ts`; expect missing evaluator failure.
- [ ] Implement the evaluator and a versioned prompt corpus with expected invariant ranges rather than copied screen answers.
- [ ] Run `npm run evaluate:skill`; require every blocking dimension to meet its declared threshold before the proof set.
- [ ] Commit: `test: add mobile UI skill effectiveness evaluation`.

## Chunk 2: Four-platform proof harness and rendering checks

### Task 7: Build the platform-neutral compiler

**Files:**
- Create: `tooling/src/compile-example.ts`
- Create: `tooling/src/tokens.ts`
- Create: `tooling/src/content-fixtures.ts`
- Create: `tooling/src/platform-mapping-report.ts`
- Create: `tooling/test/compile-example.test.ts`

- [ ] Write a failing test that compiles one canonical spec into a normalized intermediate representation.
- [ ] Assert stable resolved tokens, component order, states, fixtures, navigation outcomes, and parity warnings.
- [ ] Implement the minimal compiler and deterministic content fixture resolution.
- [ ] Run targeted tests and snapshot the normalized output.
- [ ] Commit: `feat: compile canonical UI specs`.

### Task 8: Create the HTML/CSS harness

**Files:**
- Create: `harnesses/html/package.json`
- Create: `harnesses/html/package-lock.json`
- Create: `harnesses/html/src/runtime.ts`
- Create: `harnesses/html/src/styles.css`
- Create: `harnesses/html/src/examples.ts`
- Create: `harnesses/html/test/runtime.test.ts`
- Create: `tooling/src/generators/html.ts`

- [ ] Write a failing compiler test for semantic markup, CSS tokens, safe-area variables, fixed-region clearance, and responsive formulas.
- [ ] Implement generated HTML/CSS modules and a local fixture runtime.
- [ ] Add keyboard/focus behavior for applicable patterns.
- [ ] Build and serve the checkout proof example.
- [ ] Run browser assertions at compact, standard, and large profiles.
- [ ] Commit: `feat: add runnable HTML CSS harness`.

### Task 9: Create the React Native harness

**Files:**
- Create: `harnesses/react-native/package.json`
- Create: `harnesses/react-native/package-lock.json`
- Create: `harnesses/react-native/app.json`
- Create: `harnesses/react-native/App.tsx`
- Create: `harnesses/react-native/src/registry.ts`
- Create: `harnesses/react-native/src/runtime/`
- Create: `harnesses/react-native/test/runtime.test.tsx`
- Create: `tooling/src/generators/react-native.ts`

- [ ] Pin a current Expo/React Native baseline compatible with Node 22 and the installed Xcode after checking official documentation.
- [ ] Write failing generator and component tests for safe area, keyboard avoidance, scroll ownership, dynamic type, and fixture actions.
- [ ] Implement the shared runtime and generated example module.
- [ ] Run typecheck and component tests.
- [ ] Build and launch the checkout example on the pinned iOS simulator.
- [ ] Capture the standard profile and record hashes.
- [ ] Build, install, launch, and capture on `mobile_ui_api34`; any Android failure blocks proof-set completion.
- [ ] Commit: `feat: add runnable React Native harness`.

### Task 10: Create the Flutter harness

**Files:**
- Create: `harnesses/flutter/pubspec.yaml`
- Create: `harnesses/flutter/pubspec.lock`
- Create: `harnesses/flutter/lib/main.dart`
- Create: `harnesses/flutter/lib/registry.dart`
- Create: `harnesses/flutter/lib/runtime/`
- Create: `harnesses/flutter/test/runtime_test.dart`
- Create: `tooling/src/generators/flutter.ts`

- [ ] Pin the installed stable Flutter/Dart baseline and record it in the delivery manifest.
- [ ] Write failing generator and widget tests for SafeArea, MediaQuery, keyboard insets, scrolling, themes, and text scaling.
- [ ] Implement the runtime and generated checkout module.
- [ ] Run formatter, analysis, and widget tests.
- [ ] Build and launch on the pinned iOS simulator, then capture the standard profile.
- [ ] Build, install, launch, and capture on `mobile_ui_api34`; any Android failure blocks proof-set completion.
- [ ] Commit: `feat: add runnable Flutter harness`.

### Task 11: Create the SwiftUI harness

**Files:**
- Create: `harnesses/swiftui/project.yml`
- Create: `harnesses/swiftui/MobileUIShowcase.xcodeproj/project.pbxproj`
- Create when dependencies exist: `harnesses/swiftui/MobileUIShowcase.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- Create: `harnesses/swiftui/Sources/App.swift`
- Create: `harnesses/swiftui/Sources/Registry.swift`
- Create: `harnesses/swiftui/Sources/Runtime/`
- Create: `harnesses/swiftui/Tests/RuntimeTests.swift`
- Create: `tooling/src/generators/swiftui.ts`

- [ ] Pin Xcode 15.2, Swift 5.9.2, iOS 17.2, and a concrete iPhone 15 simulator profile for the proof set.
- [ ] Write failing generator and XCTest cases for safe area, Dynamic Type, scrolling, focus, keyboard, semantic colors, and local actions.
- [ ] Implement the runtime and generated checkout module.
- [ ] Generate/open the project, run `xcodebuild` build and tests, and launch the example.
- [ ] Capture the standard profile and record hashes.
- [ ] Commit: `feat: add runnable SwiftUI harness`.

### Task 12: Assemble standalone delivery bundles

**Files:**
- Create: `tooling/src/assemble-bundle.ts`
- Create: `tooling/schemas/delivery-manifest.schema.json`
- Create: `tooling/test/assemble-bundle.test.ts`
- Create: `examples/proof/commerce-checkout/delivery-manifest.json`

- [ ] Write a failing test proving a bundle contains the immutable harness hash, module, fixtures, assets, lock data, assembly command, and run command.
- [ ] Implement per-platform standalone assembly without network or secrets after dependency installation.
- [ ] Rebuild each proof bundle in a clean temporary directory.
- [ ] Execute the recorded run/test command from each assembled bundle.
- [ ] Commit: `feat: assemble standalone example bundles`.

### Task 13: Add rendered verification and provenance

**Files:**
- Create: `tooling/src/verify-example.ts`
- Create: `tooling/src/capture-browser.ts`
- Create: `tooling/src/capture-simulator.ts`
- Create: `tooling/schemas/verification.schema.json`
- Create: `tooling/test/verify-example.test.ts`
- Create: `examples/proof/commerce-checkout/verification.json`
- Create: `reports/contact-sheets/<batch-id>.png`
- Create: `reports/visual-review/<batch-id>.json`
- Create: `tooling/schemas/visual-review.schema.json`

- [ ] Write failing tests for missing matrix cells, hash mismatch, overflow, overlap, clipping, shared-edge tolerance, undersized touch targets, unintended max-line truncation, unsafe fixed regions, illegible required states, and incomplete public provenance.
- [ ] Implement profile-driven build, launch, assertion, and capture orchestration.
- [ ] Namespace screenshots by platform/profile/state.
- [ ] Generate contact sheets and a reviewer matrix covering hierarchy, density, typography rhythm, alignment, realistic content, platform appropriateness, wrapping, whitespace, misleading states, and accidental source resemblance.
- [ ] Block release when any required reviewer cell is missing or not approved.
- [ ] Record source-tree, build-artifact, command, and screenshot hashes.
- [ ] Run the full checkout matrix on all pinned web, iOS, and Android targets; no required cell may remain incomplete.
- [ ] Commit: `feat: verify rendered mobile artifacts`.

## Chunk 3: Proof set, scale benchmark, and approved coverage

### Task 14: Generate the five-example proof set

**Files:**
- Create: `examples/proof/fintech-signup/`
- Create: `examples/proof/commerce-checkout/`
- Create: `examples/proof/mobility-map-booking/`
- Create: `examples/proof/social-feed/`
- Create: `examples/proof/messenger-chat/`
- Create: `tooling/test/proof-set.test.ts`

Every proof directory must contain this authoritative tree:

```text
request.md
spec.json
public-provenance.json
delivery-manifest.json
verification.json
previews/<platform>/<profile>/<state>.png
html-css/index.html
html-css/styles.css
html-css/app.js
react-native/Screen.tsx
react-native/fixtures.ts
flutter/screen.dart
flutter/fixtures.dart
swiftui/Screen.swift
swiftui/Fixtures.swift
```

Harness lock policy: `harnesses/html/package-lock.json`, `harnesses/react-native/package-lock.json`, `harnesses/flutter/pubspec.lock`, and the committed Swift/Xcode project generation input plus resolved package state when dependencies exist. Every delivery manifest pins these hashes and lists generated registry/module paths.

- [ ] Write failing coverage tests for five archetypes, required states, both languages, high-risk handling, and four platform delivery manifests.
- [ ] Invoke the rebuilt public skill in showcase mode for each versioned request.
- [ ] Validate and revise each canonical spec before compiling code.
- [ ] Generate, build, launch, capture, and review all required matrix cells.
- [ ] Store only passing public artifacts; leave incomplete examples unpublished.
- [ ] Commit each example separately with its verification record.

### Task 15: Benchmark scale feasibility

**Files:**
- Create: `tooling/src/benchmark-proof-set.ts`
- Create: `reports/proof-set-benchmark.json`
- Create: `reports/proof-set-benchmark.md`
- Create: `tooling/test/benchmark-proof-set.test.ts`

- [ ] Write a failing test for required metrics: repository growth, preview volume, dependency install time, build minutes per platform, macOS usage, per-example regeneration time, and site build time.
- [ ] Measure the five-example proof set on the release Mac.
- [ ] Set explicit release budgets and projections for 80, 100, and 120 examples.
- [ ] Record a go/no-go result. If no-go, improve shared harness/storage architecture before continuing; do not reduce the 80-example minimum.
- [ ] Commit: `docs: record proof set scale benchmark`.

### Task 16: Approve the 80-120 pair coverage matrix

**Files:**
- Modify: `catalog/coverage-manifest.json`
- Create: `catalog/coverage-report.md`
- Modify: `tooling/test/validate-catalog.test.ts`

- [ ] Add tests requiring every supported category at least twice, every pattern family at least once, top-15 frequency patterns multiple times, and all high-risk patterns multiple times.
- [ ] Require 80-120 unique approved pair IDs, recompute the ranked frequency list from its versioned sanitized snapshot, and reject skipped state transitions.
- [ ] Populate 80-120 valid pairs with rationale, archetype, risk, states, language, and owner.
- [ ] Run catalog validation and review the human-readable report.
- [ ] Commit: `feat: approve mobile UI coverage matrix`.

### Task 17: Batch-produce and verify approved examples

**Files:**
- Create: `tooling/src/generate-approved-examples.ts`
- Create: `tooling/src/verify-approved-examples.ts`
- Create: `tooling/src/artifact-paths.ts`
- Create: `tooling/test/artifact-paths.test.ts`
- Generate for every approved ID from `catalog/coverage-manifest.json`: `examples/generated/{approved-id}/request.md`, `spec.json`, `public-provenance.json`, `delivery-manifest.json`, `verification.json`, the exact nine platform module files from Task 14, and `previews/{platform}/{profile}/{state}.png`
- Create: `reports/coverage-verification.json`

Each generated directory uses the same authoritative bundle tree and lock/hash linkage defined in Task 14; a directory placeholder is not an accepted artifact.

- [ ] Write a failing resumability test so interrupted batches never overwrite passing artifacts.
- [ ] Generate specs in showcase mode from the public skill.
- [ ] Validate, compile, build, launch, capture, and review in archetype batches.
- [ ] Fix shared skill/reference/template defects when failures repeat; do not patch website previews independently.
- [ ] Require all approved matrix cells before setting an example to `published`.
- [ ] Commit verified batches by archetype.

## Chunk 4: Artifact-driven website and release

### Task 18: Replace the existing website shell

**Files:**
- Replace: `docs/index.html`
- Replace: `docs/ko/index.html`
- Replace: `docs/app.js`
- Replace: `docs/styles.css`
- Replace: `docs/site-data.js`
- Delete after inventory approval: `docs/assets/examples/*.svg`
- Retain unless inventory disproves use: `docs/robots.txt`, `docs/llms.txt`, `docs/sitemap.xml`, `docs/assets/og.png`, `docs/assets/og.svg`, `docs/assets/readme-banner.svg`, `docs/superpowers/**`
- Create: `site/index.html`
- Create: `site/src/app.ts`
- Create: `site/src/styles.css`
- Create: `site/src/catalog.ts`
- Create: `site/src/methodology.ts`
- Create: `site/test/catalog.test.ts`
- Create: `tooling/src/build-site.ts`

- [ ] Write failing tests proving the site catalog is derived only from passing verification records.
- [ ] Implement static routes for hero, explorer, and every verified example.
- [ ] Make the first meaningful viewport show a real verified result.
- [ ] Build the static site to `docs/` for GitHub Pages.
- [ ] Add methodology and privacy-boundary content without exposing private acquisition details.
- [ ] Commit: `feat: rebuild output-first showcase shell`.

### Task 19: Build filters and example detail routes

**Files:**
- Create: `site/src/explorer.ts`
- Create: `site/src/example-detail.ts`
- Create: `site/src/code-viewer.ts`
- Create: `site/src/example-card.ts`
- Create: `site/src/evidence-panel.ts`
- Create: `site/test/explorer.test.ts`
- Create: `site/test/example-detail.test.ts`

- [ ] Write failing fixtures for category, pattern, language, state, platform, theme, and verification filters.
- [ ] Implement URL-preserving filters and search by user job.
- [ ] Implement platform/profile/state preview selectors.
- [ ] Test every example card field: rendered screen, user job, category, patterns, platforms, verified sizes, state count, and skill version.
- [ ] Test every detail evidence field: numeric tokens, safe-area/responsive summary, original public request, build/capture results, and relevant public skill links.
- [ ] Implement complete assembled file-tree tabs for HTML/CSS, React Native, Flutter, and SwiftUI.
- [ ] Add complete file-by-file copy controls. Enable verified bundle downloads only when the proof benchmark confirms repository and Pages budgets; otherwise explain that the visible version-pinned file tree is the reproduction surface.
- [ ] Run unit and browser tests.
- [ ] Commit: `feat: add showcase explorer and runnable code tabs`.

### Task 20: Add website accessibility, performance, and link verification

**Files:**
- Create: `site/test/accessibility.spec.ts`
- Create: `site/test/responsive.spec.ts`
- Create: `site/test/links.spec.ts`
- Create: `site/test/performance.spec.ts`
- Modify: `scripts/validate_site.py`

- [ ] Write failing tests for GitHub Pages base paths, unique routes, keyboard behavior, accessible names, broken assets, responsive overflow, and route budgets.
- [ ] Implement lazy code/preview loading and responsive images.
- [ ] Audit every detail route automatically and manually review the required archetype/risk/control matrix.
- [ ] Meet the benchmark-adjusted JS and image budgets.
- [ ] Run the full static-site verification suite.
- [ ] Commit: `test: verify showcase accessibility and performance`.

### Task 21: Rewrite public README and installation guidance

**Files:**
- Rewrite: `README.md`
- Rewrite: `README.ko.md`
- Modify: `docs/llms.txt`
- Modify: `docs/sitemap.xml`

- [ ] Add a failing link/install smoke test for every documented command and path.
- [ ] Lead with verified outputs, coverage, code targets, and actual validation status.
- [ ] Keep installation secondary but concise and reproducible.
- [ ] Remove claims not proven by verification manifests.
- [ ] Run link, boundary, and install tests.
- [ ] Commit: `docs: rewrite skill documentation around verified outputs`.

### Task 22: Run the final completion audit

**Files:**
- Create: `reports/release-audit.json`
- Create: `reports/release-audit.md`
- Create: `tooling/src/release-audit.ts`
- Create: `tooling/schemas/release-audit.schema.json`
- Create: `tooling/test/release-audit.test.ts`
- Create after local implementation evidence is green and explicit publication authority is confirmed: `.github/workflows/pages.yml`

- [ ] Write a failing release-audit test covering every design success criterion and every required verification matrix cell.
- [ ] Run `npm test -- tooling/test/release-audit.test.ts`; expect missing audit implementation failure.
- [ ] Derive every requirement from the approved design and map it to authoritative evidence.
- [ ] Verify official skill validation and clean-checkout installation.
- [ ] Verify the public boundary from a Git archive, not only the working tree.
- [ ] Verify 80-120 approved examples and enumerate HTML, React Native iOS, React Native Android, Flutter iOS, Flutter Android, and SwiftUI required build/test cells plus required platform/profile/state captures.
- [ ] Verify code-tab and preview source hashes, reviewer approvals, coverage state transitions, and public provenance.
- [ ] Verify website route/filter/code/bundle/accessibility/performance/link checks.
- [ ] Verify GitHub Pages output locally under the repository base path.
- [ ] Run the full local suite and obtain explicit publication authority before adding deployment configuration.
- [ ] Add the Pages workflow, stage the complete release tree, and commit: `release: verify rebuilt mobile UI skill showcase`.
- [ ] Run `npm run verify`, Python compatibility validators, every platform test/build/capture command, and `npm run release:audit` against that exact committed `HEAD`.
- [ ] Inspect `git archive HEAD`, every downloadable archive, and the committed Pages output with boundary and similarity checks; require the audit report to name the audited commit hash.
- [ ] Push only the audited commit, deploy Pages from it, and verify live repository base-path routes and asset hashes match the audited output.

---

## Execution rules

- Use @superpowers:test-driven-development for every behavior change.
- Use @superpowers:systematic-debugging for every unexpected failure.
- Use @superpowers:verification-before-completion before each completion claim.
- Use @superpowers:requesting-code-review after each chunk.
- Preserve the user's original dirty working tree; work only in the isolated worktree.
- Never copy private collection material into this worktree.
- Do not publish, push, or deploy until the implementation and release audit pass and external publication authority is confirmed.
