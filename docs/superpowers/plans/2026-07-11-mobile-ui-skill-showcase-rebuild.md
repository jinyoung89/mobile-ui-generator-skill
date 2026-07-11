# Mobile UI Skill and Showcase Rebuild Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public mobile UI skill and output-first GitHub Pages showcase so 80-120 approved examples produce one numeric specification, complete implementation-ready HTML/CSS, React Native, Flutter, and SwiftUI source, and representative reviewed previews.

**Architecture:** A one-way sanitized export creates public aggregate knowledge. A versioned canonical JSON schema drives four source generators and a canonical HTML preview renderer. Source manifests connect spec hashes, static-validation results, representative preview hashes, and website routes so the site publishes only internally consistent artifacts without requiring native builds or device execution.

**Tech Stack:** Node.js 22, TypeScript, JSON Schema/Ajv, Playwright/Chromium for representative previews, vanilla static HTML/CSS/JavaScript, platform source templates for React Native, Flutter, and SwiftUI, Python validation compatibility scripts, GitHub Pages.

**Specification:** `docs/superpowers/specs/2026-07-11-mobile-ui-skill-showcase-rebuild-design.md`

---

## Normative command matrix

These are the required first-release command shapes and passing evidence:

| Target | RED/validation command | GREEN/release command | Passing evidence |
|---|---|---|---|
| Node unit test | `npm test -- <test-file>` | `npm test` | exit 0, zero failed tests |
| TypeScript | `npm run typecheck` | `npm run typecheck` | exit 0, no diagnostics |
| Public boundary | `npm run validate:boundary -- <fixture>` | `git archive --format=tar HEAD -o /tmp/public.tar && npm run validate:boundary -- --git-archive /tmp/public.tar` | leak fixtures exit 1 with named rule; explicit Git archive mode exits 0 |
| Official skill | `python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" skills/mobile-ui-generator` | same | `Skill is valid!` and exit 0 |
| Canonical specs | `npm test -- tooling/test/validate-spec.test.ts` | `npm run validate:specs` | every published spec passes schema and numeric invariants |
| Four-target source | `npm test -- tooling/test/validate-generated-source.test.ts` | `npm run validate:examples` | complete files, declared dependencies, required platform constructs, token parity, and no placeholders |
| Representative previews | `npm run previews:proof && npm run test:browser -- --project=chromium` | `npm run previews:all && npm run test:browser -- --project=chromium` | required HTML profile/state cells pass and preview hashes are recorded |
| Static site | `npm run build:site && npm run test:site` | same with `BASE_PATH=/mobile-ui-generator-skill/` | exit 0, route manifest complete |
| Clean install | `tmp=/tmp/mobile-ui-clean-checkout && rm -rf "$tmp" && mkdir -p "$tmp" && git archive HEAD \| tar -x -C "$tmp" && mkdir -p "$tmp/codex-home/skills" && cp -R "$tmp/skills/mobile-ui-generator" "$tmp/codex-home/skills/mobile-ui-generator"` | `tmp=/tmp/mobile-ui-clean-checkout && python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" "$tmp/codex-home/skills/mobile-ui-generator" && python3 "$tmp/codex-home/skills/mobile-ui-generator/scripts/search.py" --pattern chat` | exit 0, official validation succeeds, chat pattern is returned without ignored/local input |
| Release audit | `npm test -- tooling/test/release-audit.test.ts` | `npm run release:audit` | 100% of first-release source, preview, website, skill, and boundary evidence passes |

Native dependency restore, build, install, simulator/emulator/device launch, ADB/`simctl`, native screenshot capture, and standalone native bundle execution are explicitly deferred. Existing preflight/toolchain work remains useful optional groundwork, but it is not a release gate and must not be reported as a failed requirement.

Every TDD task must first run its targeted command and record the expected missing-module, missing-field, invalid-fixture, or failed-assertion message. A test that passes before implementation must be rewritten until it proves the missing behavior.

## Chunk 1: Public boundary, schema, and skill foundation

### Task 0: Freeze and inventory the public baseline

**Files:**
- Create: `reports/current-public-inventory.json`
- Create: `reports/current-public-inventory.md`

- [ ] Inventory every tracked public file as `keep`, `rewrite`, `archive`, or `delete`; explicitly retain `docs/superpowers/**`, `robots.txt`, and neutral license metadata.
- [ ] Snapshot current skill/site hashes and current rendered routes in the inventory report.
- [ ] Preserve any recorded mobile toolchain discovery as historical, optional future-native-verification evidence.
- [ ] Commit: `docs: freeze current public baseline`.

### Task 1: Bootstrap deterministic public tooling

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `tooling/src/paths.ts`
- Create: `tooling/test/paths.test.ts`
- Modify: `.gitignore`

- [ ] Create the minimal `package.json`, `tsconfig.json`, test-runner dependency, and `test`/`typecheck` scripts; run `npm install` to create the lockfile. This is tooling configuration, not production behavior.
- [ ] Write a failing Node test proving tooling resolves repository, staging, artifact, and website paths without reading ignored private directories.
- [ ] Run `npm test -- tooling/test/paths.test.ts`; expect `ERR_MODULE_NOT_FOUND` for `tooling/src/paths.ts`.
- [ ] Add the minimal path helpers and remaining package scripts: `validate`, `build:site`, and `verify`.
- [ ] Pin dependencies and commit `package-lock.json`.
- [ ] Run `npm test` and `npm run typecheck`; expect pass.
- [ ] Keep already-created mobile preflight files outside `npm run verify` and document them as optional future-native-verification utilities.
- [ ] Commit: `build: bootstrap deterministic public tooling`.

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

### Task 5: Define coverage, states, and layout profiles

**Files:**
- Create: `catalog/coverage-manifest.json`
- Create: `catalog/pattern-state-matrix.json`
- Create: `catalog/layout-profiles.json`
- Create: `tooling/schemas/coverage-manifest.schema.json`
- Create: `tooling/schemas/pattern-state-matrix.schema.json`
- Create: `tooling/schemas/layout-profiles.schema.json`
- Create: `tooling/src/validate-catalog.ts`
- Create: `tooling/test/validate-catalog.test.ts`

- [ ] Write failing tests for duplicate pair IDs, unsupported patterns, missing rationale, absent owner, invalid state applicability, and placeholder profile values.
- [ ] Require sanitized-knowledge snapshot or approved product-rationale basis, coverage-owner acceptance, frequency snapshot version, deterministic tie rule, and legal state transitions `proposed -> approved -> generated -> source_validated -> preview_reviewed -> published`.
- [ ] Add concrete logical profiles for compact, standard, large, short-keyboard, large-text, and long-copy cases; profile values describe the cross-platform contract and HTML preview geometry, not a simulator target.
- [ ] Seed five proof pairs covering form, commerce, map, feed, and chat archetypes.
- [ ] Implement catalog validation and run tests.
- [ ] Commit: `feat: add coverage and layout registries`.

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
- [ ] Score classification, spec completeness, numeric consistency, required states, accessibility, static platform mapping, source completeness, and visible acceptance requirements.
- [ ] Run `npm test -- tooling/test/evaluate-skill.test.ts`; expect missing evaluator failure.
- [ ] Implement the evaluator and a versioned prompt corpus with expected invariant ranges rather than copied screen answers.
- [ ] Run `npm run evaluate:skill`; require every blocking dimension to meet its declared threshold before the proof set.
- [ ] Commit: `test: add mobile UI skill effectiveness evaluation`.

## Chunk 2: Four-target source generation and representative preview checks

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

### Task 8: Create the canonical HTML/CSS preview renderer

**Files:**
- Create: `tooling/src/preview-html.ts`
- Create: `tooling/test/preview-html.test.ts`
- Create: `tooling/src/generators/html.ts`

- [ ] Write a failing compiler test for semantic markup, CSS tokens, safe-area variables, fixed-region clearance, and responsive formulas.
- [ ] Implement generated HTML/CSS modules and a deterministic local preview renderer.
- [ ] Add keyboard/focus behavior for applicable patterns.
- [ ] Render and serve the checkout proof example.
- [ ] Run browser assertions at compact, standard, and large profiles.
- [ ] Commit: `feat: add canonical HTML CSS preview renderer`.

### Task 9: Create the React Native source generator

**Files:**
- Create: `tooling/src/generators/react-native.ts`
- Create: `tooling/test/generate-react-native.test.ts`

- [ ] Declare the intended React Native/Expo source compatibility assumptions without installing a native toolchain.
- [ ] Write failing generator tests for complete imports, safe area, keyboard avoidance, scroll ownership, dynamic type, fixture actions, canonical token coverage, and forbidden placeholders.
- [ ] Implement the complete generated example source and static source validator.
- [ ] Run TypeScript tests and cross-target numeric parity checks; do not build or launch a native app.
- [ ] Commit: `feat: generate complete React Native source`.

### Task 10: Create the Flutter source generator

**Files:**
- Create: `tooling/src/generators/flutter.ts`
- Create: `tooling/test/generate-flutter.test.ts`

- [ ] Declare the intended Flutter/Dart source compatibility assumptions without installing or invoking the SDK.
- [ ] Write failing generator tests for complete imports, `SafeArea`, `MediaQuery`, keyboard insets, scrolling, themes, text scaling, canonical token coverage, and forbidden placeholders.
- [ ] Implement the complete generated widget and fixture source plus static source validator.
- [ ] Run repository-owned tests and cross-target numeric parity checks; do not restore packages, build, or launch a native app.
- [ ] Commit: `feat: generate complete Flutter source`.

### Task 11: Create the SwiftUI source generator

**Files:**
- Create: `tooling/src/generators/swiftui.ts`
- Create: `tooling/test/generate-swiftui.test.ts`

- [ ] Declare SwiftUI/iOS availability assumptions in generated source comments and metadata without generating an Xcode project.
- [ ] Write failing generator tests for complete imports, safe area, Dynamic Type, scrolling, focus, keyboard, semantic colors, local actions, canonical token coverage, and forbidden placeholders.
- [ ] Implement the complete generated view and fixture source plus static source validator.
- [ ] Run repository-owned tests and cross-target numeric parity checks; do not invoke Xcode or a simulator.
- [ ] Commit: `feat: generate complete SwiftUI source`.

### Task 12: Create source manifests and optional source archives

**Files:**
- Create: `tooling/src/create-source-manifest.ts`
- Create: `tooling/schemas/source-manifest.schema.json`
- Create: `tooling/test/create-source-manifest.test.ts`
- Create: `examples/proof/commerce-checkout/source-manifest.json`

- [ ] Write a failing test proving the manifest contains the canonical spec hash, generator/template versions, every emitted source file, fixtures, assets/fallbacks, declared dependencies, compatibility assumptions, and static-validation hashes.
- [ ] Implement deterministic source-manifest generation and optional source-only archive creation.
- [ ] Recreate each proof artifact set in a clean temporary directory and compare source hashes.
- [ ] Do not assemble or execute native application bundles.
- [ ] Commit: `feat: create example source manifests`.

### Task 13: Add source validation, representative preview review, and provenance

**Files:**
- Create: `tooling/src/verify-example.ts`
- Create: `tooling/src/capture-browser.ts`
- Create: `tooling/schemas/verification.schema.json`
- Create: `tooling/test/verify-example.test.ts`
- Create: `examples/proof/commerce-checkout/verification.json`
- Create: `reports/contact-sheets/<batch-id>.png`
- Create: `reports/visual-review/<batch-id>.json`
- Create: `tooling/schemas/visual-review.schema.json`

- [ ] Write failing tests for missing source/HTML-preview cells, hash mismatch, incomplete source, token drift, overflow, overlap, clipping, shared-edge tolerance, undersized touch targets, unintended max-line truncation, unsafe fixed regions, illegible required states, and incomplete public provenance.
- [ ] Implement four-target static source checks plus profile-driven HTML assertion and preview capture orchestration.
- [ ] Namespace representative previews by HTML profile/state.
- [ ] Generate contact sheets and a reviewer matrix covering hierarchy, density, typography rhythm, alignment, realistic content, platform appropriateness, wrapping, whitespace, misleading states, and accidental source resemblance.
- [ ] Block release when any required reviewer cell is missing or not approved.
- [ ] Record spec, source-tree, validation-command, and HTML preview hashes.
- [ ] Run the full checkout source matrix and required HTML profile/state previews; no required cell may remain incomplete.
- [ ] Commit: `feat: validate mobile source and previews`.

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
source-manifest.json
validation.json
previews/html/<profile>/<state>.png
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

Source-manifest policy: every manifest pins the canonical spec, generator/template versions, emitted file hashes, declared external packages, assets/fallbacks, compatibility assumptions, and static-validation results. It must not claim native compilation or execution.

- [ ] Write failing coverage tests for five archetypes, required states, both languages, high-risk handling, and four target source manifests.
- [ ] Invoke the rebuilt public skill in showcase mode for each versioned request.
- [ ] Validate and revise each canonical spec before compiling code.
- [ ] Generate and statically validate all four source targets; render and review all required HTML preview cells.
- [ ] Store only passing public artifacts; leave incomplete examples unpublished.
- [ ] Commit each example separately with its verification record.

### Task 15: Benchmark scale feasibility

**Files:**
- Create: `tooling/src/benchmark-proof-set.ts`
- Create: `reports/proof-set-benchmark.json`
- Create: `reports/proof-set-benchmark.md`
- Create: `tooling/test/benchmark-proof-set.test.ts`

- [ ] Write a failing test for required metrics: repository growth, preview volume, per-example generation time, static-validation time, preview time, and site build time.
- [ ] Measure the five-example proof set on the release Mac.
- [ ] Set explicit release budgets and projections for 80, 100, and 120 examples.
- [ ] Record a go/no-go result. If no-go, improve generator/preview storage architecture before continuing; do not reduce the 80-example minimum.
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
- Generate for every approved ID from `catalog/coverage-manifest.json`: `examples/generated/{approved-id}/request.md`, `spec.json`, `public-provenance.json`, `source-manifest.json`, `validation.json`, the exact nine target source files from Task 14, and `previews/html/{profile}/{state}.png`
- Create: `reports/coverage-verification.json`

Each generated directory uses the same authoritative artifact tree and source-manifest/hash linkage defined in Task 14; a directory placeholder is not an accepted artifact.

- [ ] Write a failing resumability test so interrupted batches never overwrite passing artifacts.
- [ ] Generate specs in showcase mode from the public skill.
- [ ] Validate, compile, statically check all four target sources, and render/review representative HTML previews in archetype batches.
- [ ] Fix shared skill/reference/template defects when failures repeat; do not patch website previews independently.
- [ ] Require all source-validation cells and applicable HTML preview-review cells before setting an example to `published`.
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

- [ ] Write failing tests proving the site catalog is derived only from passing source-validation and preview-review records.
- [ ] Implement static routes for hero, explorer, and every verified example.
- [ ] Make the first meaningful viewport show a real skill-produced, reviewed representative result.
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
- [ ] Test every example card field: rendered screen, user job, category, patterns, source targets, previewed sizes, state count, and skill version.
- [ ] Test every detail evidence field: numeric tokens, safe-area/responsive summary, original public request, static-validation/preview results, and relevant public skill links.
- [ ] Implement complete source-file tabs for HTML/CSS, React Native, Flutter, and SwiftUI.
- [ ] Add complete file-by-file copy controls. Enable source-archive downloads only when the proof benchmark confirms repository and Pages budgets; otherwise keep the visible versioned files as the copy surface.
- [ ] Run unit and browser tests.
- [ ] Commit: `feat: add showcase explorer and complete code tabs`.

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
- [ ] Lead with skill-produced outputs, coverage, code targets, and the actual static-validation/native-execution boundary.
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

- [ ] Write a failing release-audit test covering every design success criterion and every required static source/HTML preview matrix cell.
- [ ] Run `npm test -- tooling/test/release-audit.test.ts`; expect missing audit implementation failure.
- [ ] Derive every requirement from the approved design and map it to authoritative evidence.
- [ ] Verify official skill validation and clean-checkout installation.
- [ ] Verify the public boundary from a Git archive, not only the working tree.
- [ ] Verify 80-120 approved examples and enumerate complete HTML/CSS, React Native, Flutter, and SwiftUI source cells plus required HTML profile/state preview cells.
- [ ] Verify code-tab/source-manifest and preview/spec hashes, reviewer approvals, coverage state transitions, and public provenance.
- [ ] Verify website route/filter/code/source-archive/accessibility/performance/link checks.
- [ ] Verify GitHub Pages output locally under the repository base path.
- [ ] Run the full local suite and obtain explicit publication authority before adding deployment configuration.
- [ ] Add the Pages workflow, stage the complete release tree, and commit: `release: verify rebuilt mobile UI skill showcase`.
- [ ] Run `npm run verify`, Python compatibility validators, four-target static source checks, HTML preview checks, and `npm run release:audit` against that exact committed `HEAD`.
- [ ] Inspect `git archive HEAD`, every downloadable source archive, and the committed Pages output with boundary and similarity checks; require the audit report to name the audited commit hash.
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
