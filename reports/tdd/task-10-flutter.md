# Task 10 Flutter source verification

The Flutter harness is pinned to Flutter 3.35.3 and Dart 3.9.2. The public proof is source-only in this delivery scope; native simulator and Android package builds/captures remain explicitly unverified in each artifact manifest.

## Red/green checks

- Generator contract: `npm test -- tooling/test/flutter-generator.test.ts` — pass.
- Dart formatter: `dart format --output=none --set-exit-if-changed .` — pass.
- Static analysis: `flutter analyze` — `No issues found!`.
- Widget tests: `flutter test` — all tests passed.
- Combined source check: `npm run verify:flutter-source` — pass.

The widget suite covers profile metrics, `SafeArea`, `MediaQuery` safe-area and keyboard insets, one scroll owner, fixed action clearance, Material theme, `TextScaler`, and local fixture state transitions.
