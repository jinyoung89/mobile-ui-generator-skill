# Task 09 React Native harness evidence

## Scope boundary

This task delivers the source harness, local fixture runtime, generator, registry, and deterministic unit/component checks. Native simulator and ADB build/capture cells are intentionally marked **unverified** for this bounded delivery; the release gate must not advertise those cells as proven until a later platform verification task runs them.

## Pinned baseline

- Node.js `22.15.0` (repository toolchain pin)
- Expo SDK `51.0.39`
- React Native `0.74.7`
- React `18.2.0`
- `react-native-safe-area-context` `4.10.5`
- Xcode `15.2`, iOS runtime `17.2`, Android API `34` are detected locally but not used as proof in this task.
- Expo's SDK 51 reference documents React Native `0.74` and minimum Node `20.18.x`; Node 22 satisfies that floor. See <https://docs.expo.dev/versions/v51.0.0/>.

## TDD evidence

1. RED: `npm test -- --runInBand` failed before runtime implementation because `src/registry` was absent.
2. GREEN: after implementation, `npm test -- --runInBand` passed 5/5 tests.
3. Typecheck: `npm run typecheck` passed with exit code 0.
4. Root typecheck: `npm run typecheck` passed with exit code 0 and includes `tooling/src/generators/react-native.ts`.

The tests assert profile-safe-area and keyboard metrics, one-owner scrolling with fixed CTA clearance, dynamic type props, fixture-only actions, registry capabilities, and rendered checkout semantics.

## Native verification status

- `expo prebuild` and CocoaPods dependency resolution were exercised during development, but native build/capture was stopped when scope changed to source-only verification.
- iOS and Android build/capture hashes are intentionally absent. Any release manifest must represent them as `unverified`, not `passed`.
