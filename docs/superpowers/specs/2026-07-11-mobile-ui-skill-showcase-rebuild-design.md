# Mobile UI Skill and Showcase Rebuild Design

**Date:** 2026-07-11
**Status:** Proposed for user review
**Repository:** `jinyoung89/mobile-ui-generator-skill`

## 1. Purpose

Rebuild the public Mobile UI Generator skill and its GitHub Pages website around one claim that can be demonstrated:

> A developer can ask for a mobile screen and receive a visually aligned, responsive, implementation-ready result with complete runnable code for HTML/CSS, React Native, Flutter, and SwiftUI.

The website must lead with real outputs made by the public skill. It must not use hand-built promotional previews that bypass the skill, and it must not claim quality based only on the presence of pattern names or documentation.

## 2. Problem statement

The current project contains useful taxonomy and pattern documentation, but the generated visual outputs do not reliably preserve mobile layout quality. Observed failure modes include:

- broken alignment and inconsistent shared edges;
- arbitrary margin, padding, and gap values;
- clipped, crowded, or poorly wrapped text;
- missing safe-area and keyboard behavior;
- fixed CTAs covering scrollable content;
- weak small-screen and large-screen adaptation;
- preview assets that are not direct results of the published skill;
- separate language implementations drifting away from one another;
- validators that confirm files and keywords but do not confirm rendered quality;
- public skill metadata that does not pass the official skill validator.

The rebuild must address these failures at the specification, generation, rendering, and publication layers.

## 3. Scope

### 3.1 In scope

- Preserve the private image collection and analysis workflow as an authoring system.
- Reuse the existing private acquisition utility, local image index, curated asset library, and analyzed artifacts where legally and technically appropriate.
- Rebuild the public skill around a canonical, numeric mobile UI specification.
- Generate complete runnable implementations for:
  - HTML/CSS;
  - React Native;
  - Flutter;
  - SwiftUI.
- Build a new output-first GitHub Pages website.
- Publish 80-120 meaningful app-category and UI-pattern combinations in the first complete release.
- Build and launch all four platform implementations before publication. Capture every platform at its default profile, then apply the stress-profile matrix defined in this document.
- Keep original reference images, source identities, local paths, credentials, and collection mechanics private.

### 3.2 Out of scope for the first release

- A public real-time prompt-to-code generation API.
- Publishing or redistributing collected third-party screenshots.
- Supporting every possible cross-product of app category and UI pattern.
- Pixel-identical copies of existing commercial applications.
- A shared component package intended to replace each target platform's native UI system.
- Backend workflows, authentication servers, payments, push delivery, or production data integrations.

## 4. Architectural boundary

The system has three distinct layers.

```text
Private authoring pipeline
  collect -> classify -> analyze -> aggregate -> sanitize -> compile knowledge

Public mobile UI skill
  understand request -> select patterns -> produce canonical spec
  -> generate platform code -> validate -> emit artifacts

Public showcase website
  load verified artifacts -> render preview -> expose code tabs
  -> show metrics and validation evidence -> explain installation
```

The private pipeline may contain provider-specific adapters and original screenshots. The public repository must contain only generalized knowledge, schemas, templates, generated demonstration artifacts, validation tooling, and the website.

## 5. Private authoring pipeline

### 5.1 Inputs

- Existing private acquisition skill available in the local agent environments.
- Local metadata index containing tens of thousands of screen entries.
- Local asset library containing curated mobile UI screenshots.
- Existing local manifests, contact sheets, pattern books, evaluation summaries, and layout metrics.
- Future manually supplied or legally collected reference screens.

### 5.2 Per-screen observation model

Each analyzed screen should produce a private structured observation with:

- source identity and local asset pointer;
- app name and app category;
- inferred domain;
- primary and secondary UI patterns;
- device pixel dimensions and estimated logical viewport;
- top and bottom safe-area treatment;
- horizontal content insets;
- repeated left and right alignment anchors;
- vertical gaps and section spacing;
- typography roles, estimated sizes, weights, and line heights;
- component bounding regions and semantic roles;
- navigation model;
- fixed, sticky, scrollable, modal, and overlay regions;
- input, keyboard, loading, empty, error, success, disabled, and destructive states;
- dominant surface, color, radius, elevation, icon, and asset roles;
- confidence score for every inferred field;
- reviewer status and correction history.

Automated vision results must remain distinguishable from metadata-derived labels and human-reviewed facts.

### 5.3 Aggregation

Observations are grouped by:

1. app category;
2. UI pattern;
3. app category + UI pattern pair;
4. layout archetype;
5. platform and viewport family when known.

Aggregation should produce distributions rather than one unexplained magic value. For example:

```yaml
screen_inset_pt:
  observed_count: 84
  p25: 16
  p50: 20
  p75: 24
  recommended: 20
  allowed_range: [16, 24]
```

### 5.4 Sanitized compilation

Only reusable design knowledge is compiled into the public skill. Public outputs must remove:

- original screenshots and crops;
- provider, origin, endpoint, and account names;
- local paths, cookies, tokens, and request details;
- app-specific copy or trade dress that could imply cloning;
- individual-source traceability.

Public guidance may state generalized observations such as recommended ranges, recurring component structures, state requirements, and anti-patterns.

### 5.5 One-way export and provenance

Private analysis and public artifacts use different provenance schemas.

- Private provenance may contain source IDs, local paths, reviewer identities, and raw observation links.
- Public provenance is allowlist-only and may contain only the public skill commit, schema version, sanitized public reference-set version, request hash, model/runtime identifier, generator/template versions, toolchain lock versions, artifact hashes, and verification results.

Public compilation must write into a clean staging directory that has no read-through links to private assets. Export is performed by explicit field allowlist, never by removing a denylist of known keys from private records. Publication checks must inspect filenames, text, generated source maps, image metadata, URLs, app-specific strings, embedded assets, and archive contents. Derived numeric guidance requires a minimum aggregate sample threshold defined per metric; values below the threshold remain private or are marked as authored platform guidance. Where feasible, public visuals are checked for raw-hash and perceptual similarity against the private source set to prevent accidental source-image publication.

## 6. Taxonomy and coverage model

### 6.1 Two independent axes

The public taxonomy keeps two separate axes:

- `app_category`: what the service does;
- `ui_pattern`: what the screen or functional unit does.

Initial app-category families should cover at least:

- finance and banking;
- commerce and marketplace;
- mobility and transportation;
- delivery, food, and beverage;
- community and social;
- messaging;
- content and media;
- OTT and streaming;
- music and audio;
- travel and booking;
- education and books;
- fitness and health;
- medical and clinical care;
- mental health;
- parenting and childcare;
- pet care;
- real estate;
- beauty and wellness;
- dating;
- recruiting and jobs;
- productivity and business tools;
- AI products;
- IoT and device control;
- games;
- rewards and loyalty;
- utilities and general lifestyle.

Initial UI-pattern families should cover at least:

- splash and launch;
- onboarding and tutorial;
- permissions;
- login, signup, identity verification, and terms;
- home and dashboard;
- bottom tabs, app bars, menus, and profile;
- search, discovery, filtering, sorting, and comparison;
- product/content list and detail;
- saved items, cart, checkout, payment, coupon, and benefits;
- account overview, wallet, transfer, transaction history, investment, and card details;
- map, route, reservation, delivery tracking, and ticketing;
- feed, community, chat, notifications, writing, camera, upload, and viewer;
- recommendation, curation, cross-sell, referral, gifting, and rewards;
- AI assistant, chatbot, voice, audio recording, and generation flows;
- settings, support, FAQ, cancellation, empty, error, loading, and success states.

### 6.2 Coverage matrix

The first complete release targets 80-120 valid category-pattern pairs. It does not generate meaningless combinations solely to fill a Cartesian product. Before batch generation, maintain a versioned `coverage-manifest.json` declaring the exact supported categories, patterns, approved pairs, rationale, layout archetype, risk tier, required states, languages, owner, and release status.

Selection rules:

- every supported app category appears in at least two examples;
- every supported UI-pattern family appears at least once;
- patterns ranked in the top 15 by sanitized aggregate observation count and all high-risk patterns receive multiple category variants;
- each example has a clear user job and realistic state coverage;
- no example is admitted without four runnable platform implementations;
- each example is traceable to a skill invocation, canonical spec, validation record, and rendered preview.

The count is taken from unique approved pair IDs in the manifest. `meaningful` means the pair has a documented user job, is supported by sanitized aggregate knowledge or an approved product rationale, and is accepted by the coverage owner. `frequency_rank` is computed from sanitized aggregate observation counts with a documented tie rule and snapshot version. `high-risk` means identity, finance, health, destructive, legal-consent, or irreversible-action flows. The coverage matrix is machine-readable and reports proposed, approved, generated, build_verified, render_verified, and published states.

State requirements are defined separately in a versioned pattern-to-state matrix. Each pattern/state entry is `required`, `optional`, or `not_applicable`. Every example spec must reference the matrix and include a reason for overrides; acceptance checks apply only to required and explicitly selected optional states.

## 7. Public skill design

### 7.1 Proposed package

```text
skills/mobile-ui-generator/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── taxonomy.md
│   ├── request-routing.md
│   ├── layout-foundations.md
│   ├── responsive-and-safe-area.md
│   ├── accessibility.md
│   ├── quality-gates.md
│   ├── patterns/
│   └── domains/
├── schemas/
│   └── mobile-ui-spec.schema.json
├── scripts/
│   ├── search.py
│   ├── validate_spec.py
│   └── validate_artifact.py
└── templates/
    ├── html-css/
    ├── react-native/
    ├── flutter/
    └── swiftui/
```

If the skill packaging format requires references to remain one directory deep, pattern and domain files should use flat prefixed filenames instead of nested directories.

### 7.2 SKILL.md responsibilities

`SKILL.md` should be short and procedural. It should:

1. classify the request into category, pattern, risk, state, and platform needs;
2. search only the relevant reference files;
3. construct and validate a canonical UI spec;
4. generate requested platform artifacts from the same spec; default mode generates only requested targets, while `showcase/all-platforms` mode requires all four targets;
5. render or build outputs when the environment supports it;
6. revise any output that fails numeric, responsive, accessibility, or visual checks;
7. return artifacts with concise implementation notes.

Detailed pattern content must live in references, not in a monolithic `SKILL.md`.

The skill must distinguish ordinary user delivery from showcase production. Showcase mode records public provenance, uses locked platform harness versions, forbids incomplete snippets, and cannot report success until all required gates pass. Provenance provides traceability, not a promise of byte-for-byte deterministic model output.

### 7.3 Official skill compatibility

- Use only supported frontmatter fields.
- Provide `agents/openai.yaml` with current display metadata.
- Pass the official `quick_validate.py` validator.
- Test installation from a clean checkout.
- Test discovery and triggering using realistic user prompts.

## 8. Canonical mobile UI specification

All visible outputs and platform implementations originate from one versioned canonical spec.

### 8.1 Required top-level fields

```yaml
schema_version: 1
id: commerce-checkout-address
request:
  language: ko
  user_job: Complete an order safely
classification:
  app_category: commerce
  ui_patterns: [checkout, address_selection, payment_method]
  risk_level: medium
platform_policy:
  reference_viewport_width: 390
  supported_width_range: [320, 430]
layout:
typography:
colors:
components:
states:
interactions:
responsive_rules:
accessibility:
content:
assets_and_fallbacks:
fixture_data:
navigation_and_actions:
validation_rules:
focus_and_keyboard:
localization:
themes:
capabilities_and_dependencies:
platform_mappings:
quality_requirements:
```

Version 1 supports complete local screen interactions using fixture data. Network services, real authentication, real payment execution, push delivery, and production backends are outside the runnable contract. Navigation destinations and action outcomes must resolve either to another included local screen, a local modal/state transition, or an explicitly labelled fixture result.

### 8.2 Numeric layout contract

Every visible element must derive its placement from layout primitives rather than arbitrary coordinates.

Required values include:

- reference viewport width;
- supported minimum and maximum width;
- top and bottom safe-area policy;
- screen horizontal inset;
- grid columns and gutters when used;
- shared alignment anchors;
- component, row, and section gaps;
- card and surface padding;
- common control heights;
- corner radii;
- sticky/fixed region height;
- scroll content bottom inset;
- maximum readable line width;
- image aspect ratios and crop behavior.

Values must include units and platform mapping rules. A value may be a token reference, fixed logical unit, bounded responsive formula, or platform-native semantic constant.

Normative units are CSS logical pixels for HTML and logical points/density-independent units for native platforms. The schema defines token resolution order, rounding per target platform, content-driven sizing, minimum/maximum constraints, and conflict precedence. Platform overrides must be explicit and emit a parity/loss report; silent substitution is invalid.

### 8.3 Typography contract

Each text role specifies:

- font family or platform fallback policy;
- size;
- line height;
- weight;
- letter spacing when needed;
- maximum lines;
- truncation or wrapping behavior;
- dynamic type/text scaling policy;
- minimum contrast requirement.

### 8.4 Component contract

Each component specifies:

- stable ID and semantic role;
- parent region and order;
- width and height behavior;
- internal padding and child gaps;
- alignment;
- text and asset roles;
- default and alternate states;
- interaction and focus behavior;
- accessibility label and target size;
- platform-native substitution policy.

### 8.5 Responsive contract

Every spec must define behavior at 320, 375/390, and 430 logical-pixel widths.

Required guarantees:

- no unintended horizontal overflow;
- no overlap at supported widths;
- fixed/sticky content does not cover scroll content;
- keyboard opening preserves the active field and primary action path;
- content wraps or truncates intentionally;
- touch targets meet the platform-specific minimum declared by the target mapping; the cross-platform baseline is never below 44x44 logical units unless an official platform control supplies a larger semantic hit region;
- dynamic type or enlarged text has a documented fallback layout;
- device safe areas are handled through platform APIs, not hard-coded status-bar guesses.

### 8.6 Named verification profiles

Width alone is not sufficient. Every capture and assertion references a named profile containing platform/OS, viewport width and height, pixel ratio, safe-area insets, orientation, theme, locale, text scale, and keyboard state.

Required baseline profiles:

- `compact`: 320x568, portrait, default text scale;
- `standard`: 390x844, portrait, default text scale;
- `large`: 430x932, portrait, default text scale;
- `short-keyboard`: 390x667 with keyboard open and realistic bottom inset;
- `large-text`: 390x844 at the platform's agreed accessibility text scale;
- `dark`: standard geometry with dark theme when the example declares dark-mode support;
- `long-copy-ko` and `long-copy-en`: standard geometry with stress-copy fixtures.

Every example runs `compact`, `standard`, and `large` in HTML. Applicable form, search, and chat examples also run `short-keyboard`; text-bearing archetypes run `large-text` and the relevant long-copy profile. Native stress profiles are required for every layout archetype and every high-risk example, while every native example still receives a default build, launch, and `standard` capture.

Before the proof set, create and version a machine-readable verification-profile registry. Each platform/profile record must pin the toolchain, OS/simulator or browser, viewport width and height, device pixel ratio, safe-area values, orientation, theme, locale, text scale multiplier, keyboard frame/inset, and capture orientation. Descriptive placeholders such as `realistic`, `agreed`, or `designated` are invalid in the registry. An unresolved required field blocks proof-set verification and batch production.

## 9. Platform output contract

Each published example includes a complete screen module for four versioned shared harnesses. A clean checkout contains each harness dependency manifest, locked dependency resolution, assets, fixture data, entry registry, and documented run command. An example is `runnable` only when its module can be selected by ID, built, launched without network or secrets, and exercised with bundled fixture data. Shared harnesses avoid duplicating 80-120 full projects while preserving clean reproducibility.

Every example also has a per-platform delivery manifest containing the immutable harness version and source hash, module entry path, required fixtures and assets, platform capabilities, exact assembly command, and exact run command. Release tooling assembles a standalone runnable bundle from the verified harness plus the example module. The website code viewer exposes the assembled bundle's complete file tree, and its download contains every file needed to reproduce the verified run. A module without its version-pinned harness and assembly manifest is not advertised as complete runnable code.

### 9.1 HTML/CSS

- Semantic HTML and tokenized CSS custom properties.
- Responsive viewport support from 320px to 430px and graceful wider-page framing.
- Safe-area environment variables with fallbacks.
- No horizontal scrolling inside the phone viewport.
- Keyboard and focus behavior for interactive examples.
- Automated browser screenshots at target widths.
- Required pass commands: the repository-defined install command, HTML/CSS validation, browser test command, and static production build, all recorded in verification metadata.

### 9.2 React Native

- Current stable React Native or Expo-compatible project baseline chosen at implementation time.
- `SafeAreaView` or maintained safe-area library policy.
- `KeyboardAvoidingView`/scroll behavior where forms or composers exist.
- StyleSheet or agreed token layer generated from canonical values.
- Locked Expo/React Native harness with an example registry, local fixtures, and explicit iOS and Android run commands.
- Every example must pass type checking, unit/component tests, an Android build, and the selected iOS simulator build on macOS CI or the release Mac.
- Every example must launch and produce a `standard` capture on the designated reference native target. Each layout archetype and high-risk example also runs its applicable stress profiles.

### 9.3 Flutter

- Current stable Flutter baseline chosen at implementation time.
- `SafeArea`, `MediaQuery`, scroll, and keyboard inset handling.
- Shared theme/tokens generated from canonical values.
- No device-specific absolute positioning.
- Locked Flutter harness with an example registry, local fixtures, and explicit simulator/device run commands.
- Every example must pass `flutter analyze`, widget tests, the designated Android build, and the selected iOS simulator build on macOS CI or the release Mac.
- Every example must launch and produce a `standard` capture. Each layout archetype and high-risk example also runs applicable golden/stress profiles.

### 9.4 SwiftUI

- Current stable Xcode/iOS deployment baseline chosen at implementation time.
- Native safe-area and keyboard behavior.
- Dynamic Type support and semantic colors.
- Locked Xcode project or generated project definition with an example registry, local fixtures, and explicit simulator run command.
- Every example must pass the designated `xcodebuild` build and tests against the pinned simulator destination.
- Every example must launch and produce a `standard` simulator capture. Each layout archetype and high-risk example also runs applicable compact, large-text, keyboard, and long-copy profiles.

### 9.5 Cross-platform parity

The four outputs must preserve:

- information hierarchy;
- spacing relationships;
- typography roles;
- component order;
- interaction states;
- visible copy;
- accessibility intent.

They may use platform-native controls and idioms where exact visual identity would reduce usability.

### 9.6 Verification matrix

The release maintains a machine-readable matrix keyed by `example_id x platform x profile x state`. Required cells are generated from the coverage manifest and pattern-to-state matrix. A cell records build status, launch status, source-tree hash, build-artifact hash, capture command, screenshot hash, assertions, reviewer status, and timestamp. The website can display a code tab or preview only when the corresponding source hash matches a passing matrix record.

## 10. Generation and verification workflow

```text
1. Run the published skill with a versioned example request.
2. Record the skill version, request, selected references, and generated spec.
3. Validate the canonical spec schema and numeric constraints.
4. Generate all four platform implementations.
5. Run formatters, linters, type checks, tests, and builds.
6. Render target screens at required widths and states.
7. Run deterministic layout assertions.
8. Perform screenshot-based visual review.
9. Revise through the skill workflow when a check fails.
10. Publish only the immutable verified artifact bundle.
```

Generated demonstration files must include provenance metadata showing that they came from the public skill workflow. The metadata should not expose private source material.

## 11. Quality checks

### 11.1 Spec gate

- Valid schema version.
- Valid category-pattern combination.
- Required numeric layout fields present.
- Typography roles complete.
- Component states and interactions complete.
- Responsive and accessibility policies complete.

### 11.2 Code gate

- All code parses and formats successfully.
- HTML/CSS passes validation and browser smoke tests.
- React Native passes its pinned install, type check, tests, Android build, and iOS simulator build commands.
- Flutter passes its pinned dependency restore, analysis, widget tests, Android build, and iOS simulator build commands.
- SwiftUI passes its pinned project-generation step when used, `xcodebuild` build, and test commands.
- No placeholder imports, missing assets, ellipses, or omitted implementation sections.

### 11.3 Rendered layout gate

Generate required cells from the verification matrix. HTML renders every example in `compact`, `standard`, and `large`; each native platform launches and captures every example in `standard`; applicable stress profiles run by archetype and risk as defined in Section 8.6. Assert:

- no viewport overflow;
- no unexpected overlap;
- no text clipping outside intentional maximum-line rules;
- shared edges remain within tolerance;
- touch target dimensions meet policy;
- CTA and navigation regions stay inside safe areas;
- scroll content includes required fixed-region clearance;
- every state marked required by the pattern-to-state matrix remains legible.

### 11.4 Visual review gate

Automated metrics cannot determine all visual quality. A reviewer must inspect contact sheets or website previews for:

- hierarchy and scan order;
- balanced density;
- typography rhythm;
- repeated alignment;
- realistic content;
- platform appropriateness;
- awkward wrapping or whitespace;
- visually misleading states;
- accidental resemblance to a copied commercial screen.

### 11.5 Skill effectiveness gate

Maintain a prompt evaluation set that includes:

- familiar high-frequency screens;
- rare categories;
- ambiguous requests;
- multi-pattern flows;
- long Korean and English copy;
- small-width stress cases;
- keyboard-heavy forms and chat;
- destructive and high-trust actions.

Score outputs on classification, spec completeness, numeric consistency, build success, visual QA, accessibility, and cross-platform parity.

## 12. New website design

### 12.1 Product principle

The website is an evidence browser, not a long marketing document. The first meaningful viewport should show a real verified mobile UI result.

### 12.2 Information architecture

1. Output-first hero with a verified screen and concise value statement.
2. Example explorer.
3. Example detail view.
4. Code tabs.
5. Layout and verification evidence.
6. Skill installation and usage.
7. Methodology and privacy boundary.

### 12.3 Example explorer

Filters:

- app category;
- UI pattern;
- platform code availability;
- language;
- light/dark mode when supported;
- state type;
- verification status.

Search should match user tasks as well as internal pattern names. The URL should preserve filters and selected example.

### 12.4 Example card

Each card shows:

- rendered mobile screen;
- user job;
- app category;
- UI patterns;
- supported platforms;
- verified viewport sizes;
- state count;
- last verified skill version.

### 12.5 Example detail view

The detail page or panel contains:

- primary rendered preview;
- device-width switcher for 320, 390, and 430;
- state switcher where multiple states exist;
- HTML/CSS, React Native, Flutter, and SwiftUI tabs;
- complete code with file boundaries;
- copy button and downloadable example bundle when practical;
- canonical numeric tokens;
- safe-area and responsive behavior summary;
- build and render verification results;
- the original public prompt used to invoke the skill;
- links to the relevant public skill references.

### 12.6 Installation section

Installation is visible but secondary to results. It should include:

- supported agent environments;
- current installation command verified from a clean environment;
- one minimal example request;
- expected artifact outputs;
- link to the GitHub skill directory.

### 12.7 Website technology

The exact framework should be selected during implementation based on artifact volume and GitHub Pages constraints. The design requires:

- static deployment compatibility;
- prebuilt search/filter index;
- fast image loading and responsive images;
- code splitting or lazy loading for large code samples;
- accessible tabs, filters, dialogs, and copy controls;
- deterministic routes for every example;
- no runtime dependency on a paid generation API.

Website acceptance thresholds for the implementation plan:

- every example has a unique static route that works under the GitHub Pages base path;
- fixture tests verify category, pattern, search, language, state, and platform filters;
- keyboard navigation and accessible-name checks cover every interactive control type;
- automated accessibility audit has no critical or serious findings on the hero, explorer, and every generated example detail route; manual keyboard and screen-reader review covers at least one route per layout archetype, every high-risk class, every theme, both locales, and collectively every interactive control type;
- broken-link and missing-asset checks pass for the full static export;
- production budgets are fixed after the 5-example benchmark, with an initial target of no more than 200 KB compressed route JS and 500 KB initial responsive imagery on an example route;
- code and non-visible platform assets load on demand;
- downloadable bundles are required only if the benchmark proves they fit the repository and deployment budgets; otherwise the site provides complete file-by-file copy controls.

## 13. Artifact model

Each verified example should be stored as a versioned bundle:

```text
examples/<example-id>/
├── request.md
├── spec.json
├── verification.json
├── delivery-manifest.json
├── previews/
│   ├── html/compact/default.png
│   ├── html/standard/default.png
│   ├── react-native/standard/default.png
│   ├── flutter/standard/default.png
│   └── swiftui/standard/default.png
├── html-css/
├── react-native/
├── flutter/
└── swiftui/
```

`verification.json` records public provenance, toolchain versions, commands, results, profile geometry, renderer/platform/OS, checked states, source-tree hash, build-artifact hash, capture command, screenshot hash, skill version, and content hash.

The website consumes a generated catalog derived from these bundles. It must not maintain a separate hand-authored source of truth for example metadata.

## 14. Repository publication boundary

### 14.1 Public

- installable skill package;
- generalized references and numeric contracts;
- schemas and validators;
- platform templates needed by the skill;
- verified example bundles;
- generated website;
- public documentation and license.

### 14.2 Private/local

- acquisition utilities and provider adapters;
- authentication material;
- original screenshots and crops;
- raw manifests and source URLs;
- local asset-library metadata and caches;
- unsanitized observations;
- internal review notes that expose sources.

Automated repository scanning must fail publication when forbidden source identifiers, credentials, private paths, or raw images are detected.

## 15. Migration strategy

### Phase A: Freeze and audit

- Preserve current local uncommitted work.
- Snapshot the current public site and skill for comparison.
- Inventory reusable references, scripts, templates, examples, and private analysis outputs.
- Mark each item as keep, rewrite, archive, or delete.
- Define the one-way sanitized export schema, clean staging directory, fixture-only public tests, and leakage CI before any public knowledge is regenerated.

### Phase B: Replace the skill foundation

- Define the canonical schema and numeric contracts.
- Rewrite `SKILL.md` as a concise workflow.
- Reorganize references by responsibility.
- Add official metadata and validation.
- Establish prompt evaluations and a small cross-platform proof set.

### Phase C: Prove the generation system

- Build 5 representative examples spanning form, feed, map, commerce, and chat archetypes.
- Generate and run all four platform implementations.
- Fix schema, templates, and acceptance checks until the proof set passes.
- Measure repository growth, preview volume, install time, build minutes by platform, macOS runner use, per-example regeneration time, and full-site build time.
- Set release budgets from the measurements and require an explicit go/no-go decision before expanding beyond the proof set.

### Phase D: Expand coverage

- Build the machine-readable coverage matrix.
- Produce the 80-120 meaningful category-pattern examples in batches.
- Review failures by archetype and improve the shared skill rather than patching only individual outputs.

### Phase E: Replace the website

- Remove the existing website implementation after preserving any reusable neutral assets.
- Build the new artifact-driven explorer.
- Load only verified bundles.
- Perform responsive, accessibility, performance, and link checks.

### Phase F: Publish and monitor

- Verify clean skill installation.
- Deploy GitHub Pages.
- Confirm public repository sanitization.
- Record the first release and verification matrix.
- Establish a repeatable update workflow for new observations and examples.

## 16. Failure handling

- If private analysis confidence is low, require human review or omit the metric from public aggregation.
- If a platform build cannot run locally, mark the artifact unverified and block publication.
- If platforms diverge, revise the canonical spec or mapping rules rather than editing website previews independently.
- If an example fails at one viewport or state, block the entire example bundle.
- If reference sanitization fails, stop publication and remove the exposed material before continuing.
- If a generated screen repeatedly needs one-off patches, treat it as a missing shared pattern rule or template defect.

## 17. Success criteria

The first complete release is successful when:

- the public skill passes official validation and installs from a clean checkout;
- 80-120 meaningful examples cover all supported category and pattern families;
- every published example includes complete HTML/CSS, React Native, Flutter, and SwiftUI code;
- every code target satisfies the agreed build or execution gate;
- every published preview is generated from the same verified artifact bundle shown in its code tabs;
- required viewports pass overflow, overlap, clipping, safe-area, and fixed-region checks;
- the website opens with a real skill-produced result and supports category/pattern exploration;
- users can inspect and copy complete platform code;
- private collection sources and original screenshots remain outside the public repository;
- improvements to shared rules measurably reduce failures across multiple examples.

## 18. Design decisions requiring implementation-time confirmation

These decisions should be resolved in the implementation plan using current official documentation and local tool availability:

- website framework and static export strategy;
- exact React Native/Expo baseline;
- exact Flutter and Dart baseline;
- exact Xcode, Swift, and iOS deployment baseline;
- snapshot testing tools for each platform;
- exact shared-harness layout and dependency lockfile policy;
- storage and lazy-loading budgets for 80-120 examples with four code modules each;
- CI runner availability for iOS and mobile build verification.

## 19. Recommended implementation decomposition

This rebuild should be implemented as separate, testable subprojects in this order:

1. One-way sanitized export and leakage checks.
2. Canonical schema and numeric validation.
3. Public skill restructure and official validation.
4. Four-platform shared harnesses and 5-example proof set.
5. Rendered visual QA pipeline and cost/size/time benchmark.
6. Coverage matrix approval and batch artifact production.
7. Artifact-driven website rebuild.
8. Publication, sanitization, and release verification.

Each subproject should have its own implementation plan and acceptance gate. The website should not be rebuilt until the proof-set demonstrates that the new skill can produce stable, runnable results.
