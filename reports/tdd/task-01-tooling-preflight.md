# Task 01: Tooling Preflight TDD Evidence

This report records the RED/GREEN evidence observed during Task 1. Each RED command below was run before its corresponding implementation was added in the task session.

## Repository path helpers

### RED

Command:

```sh
npm test -- tooling/test/paths.test.ts
```

Exit status: `1`

Relevant output:

```text
Error: Cannot find module '../src/paths.js'
code: 'MODULE_NOT_FOUND'
# tests 1
# pass 0
# fail 1
```

### GREEN

Command:

```sh
npm test -- tooling/test/paths.test.ts
```

Exit status: `0`

Relevant output:

```text
# tests 3
# pass 3
# fail 0
```

The three passing checks cover the public output roots, rejection of private/local-only paths, and rejection of paths outside the repository.

## Toolchain preflight

### RED

Command:

```sh
node --import tsx --test tooling/test/toolchain-preflight.test.ts
```

Exit status: `1`

Relevant output:

```text
error: 'toolchain registry not ready'
# tests 3
# pass 0
# fail 3
```

### GREEN

Command:

```sh
node --import tsx --test tooling/test/toolchain-preflight.test.ts
```

Exit status: `0`

Relevant output:

```text
# tests 3
# pass 3
# fail 0
```

The three passing checks establish host command agreement with the registry, Android SDK/API 34/AVD agreement, and the installed/configured state of every required registry cell. Installed/configured is not treated as proof that a simulator or emulator can boot.

## Checked-in mobile runtime verification

Command:

```sh
npm run preflight:mobile
```

This invokes the checked-in `tooling/scripts/verify-mobile-targets.sh`. It boots the pinned iOS target and requires `xcrun simctl bootstatus <pinned-udid> -b` to complete under an external timeout before verifying iOS 17.2. It allocates an unoccupied even Android emulator port from a bounded range, captures the launched PID, verifies that the new serial reports the pinned AVD and API 34, and waits for only that owned process during shutdown. It emits a JSON success record only after both targets are shut down.

Exit status: `0`

Relevant output:

```text
IOS_BOOT_COMPLETED bootstatus=ready runtime=17.2
ANDROID_BOOT_COMPLETED attempt=9 api=34 serial=emulator-5580 pid=39213
{"status":"ok","ios":{"runtime":"17.2","udid":"7732B728-22A6-4CCC-A121-C1F2BDC5EC23","verified":true},"android":{"api":34,"avd":"mobile_ui_api34","serial":"emulator-5580","port":5580,"verified":true}}
```

The JSON record is runtime verification evidence. The `installed` and `configured` fields in `tooling/toolchains.json` intentionally make no boot-readiness claim.

## Hardening RED/GREEN evidence

The hardening tests were added and run before the corresponding resolver, registry, script, and npm command changes.

Path-boundary RED command:

```sh
node --import tsx --test tooling/test/paths.test.ts
```

Exit status: `1`

Relevant output:

```text
# tests 6
# pass 2
# fail 4
```

The failures covered the public staging location/allowlist, disallowed root config access, sensitive case variants, and an allowed-root symlink escaping the repository.

Path-boundary GREEN command:

```sh
npm test -- tooling/test/paths.test.ts
```

Exit status: `0`

Relevant output:

```text
# tests 6
# pass 6
# fail 0
```

The npm output named only `tooling/test/paths.test.ts`; no toolchain tests ran in the targeted command.

An additional ignored-root expansion was also test-first. The same targeted command exited `1` with 6 tests, 5 passes, and 1 failure (`Missing expected exception: docs/.idea/workspace.xml`) before the ignored private/editor/cache patterns were implemented; the GREEN result remained 6/6.

Mobile/configuration contract RED command:

```sh
node --import tsx --test tooling/test/mobile-preflight-contract.test.ts tooling/test/toolchain-preflight.test.ts
```

Exit status: `1`

Relevant output:

```text
# tests 5
# pass 2
# fail 3
```

The failures reported the missing mobile preflight command, missing baseline validation contract, and absent installed/configured registry state.

Owned-readiness RED command:

```sh
npm test -- tooling/test/mobile-preflight-contract.test.ts
```

Exit status: `1`

Relevant output:

```text
# tests 3
# pass 1
# fail 2
```

The two failures required bounded `simctl bootstatus -b` readiness and safe Android port/PID ownership. The same command then exited `0` with 3/3 tests passing after implementation.

A fresh runtime gate then exposed that `kill -0` can remain true for an exited, unreaped child. A follow-up targeted RED exited `1` with 3 tests, 2 passes, and 1 failure requiring `wait_for_owned_process "$SHUTDOWN_TIMEOUT_SECONDS" "$emulator_pid"`; the GREEN run passed 3/3 and the real preflight emitted JSON status `ok`.

Hardening full-suite command:

```sh
npm test
```

Exit status: `0`

Relevant output:

```text
# tests 12
# pass 12
# fail 0
```

## Full verification

Command:

```sh
npm test
```

Exit status: `0`

Relevant output:

```text
# tests 6
# pass 6
# fail 0
```

Command:

```sh
npm run typecheck
```

Exit status: `0`

Relevant output:

```text
> tsc --noEmit
```

Command:

```sh
python3 scripts/validate_patterns.py
```

Exit status: `0`

Relevant output:

```text
pattern validation passed: 62 patterns, 10 domain modifiers, 10 reference files, 4 support files
```

Command:

```sh
python3 scripts/validate_site.py
```

Exit status: `0`

Relevant output:

```text
site validation passed
```
