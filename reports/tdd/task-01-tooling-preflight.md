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

The three passing checks establish host command agreement with the registry, Android SDK/API 34/AVD agreement, and readiness of every required registry cell.

## Android API 34 boot readiness

The emulator was started with:

```sh
emulator -avd mobile_ui_api34 -no-snapshot -no-audio -no-boot-anim
```

`adb shell getprop sys.boot_completed` was polled in a bounded loop of at most 60 attempts with two seconds between attempts. After boot, the API level was read with `adb shell getprop ro.build.version.sdk`; shutdown used `adb emu kill` and a bounded device-removal poll.

Exit status: `0`

Relevant output:

```text
BOOT_COMPLETED attempt=7
34
OK: killing emulator, bye bye
OK
EMULATOR_SHUTDOWN attempt=4
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
