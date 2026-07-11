#!/bin/sh

set -eu

IOS_BOOT_TIMEOUT_SECONDS=120
ANDROID_BOOT_TIMEOUT_SECONDS=120
SHUTDOWN_TIMEOUT_SECONDS=20
ANDROID_PORT_MIN=5580
ANDROID_PORT_MAX=5680
ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)

. "$ROOT/tooling/scripts/toolchain-env.sh"

registry_values=$(node -e '
  const registry = require(process.argv[1]);
  console.log([
    registry.apple.iosRuntime,
    registry.apple.simulator.udid,
    registry.android.platformApi,
    registry.android.avd.name,
  ].join("\t"));
' "$ROOT/tooling/toolchains.json")
IFS="$(printf '\t')" read -r IOS_RUNTIME IOS_UDID ANDROID_API ANDROID_AVD <<EOF
$registry_values
EOF

ios_started=0
android_started=0
emulator_pid=""
emulator_log=$(mktemp "${TMPDIR:-/tmp}/mobile-ui-emulator.XXXXXX")

run_with_timeout() {
  timeout_seconds=$1
  shift
  "$@" &
  command_pid=$!
  (
    sleep "$timeout_seconds"
    kill -TERM "$command_pid" >/dev/null 2>&1 || true
  ) &
  watchdog_pid=$!

  command_status=0
  wait "$command_pid" || command_status=$?
  kill "$watchdog_pid" >/dev/null 2>&1 || true
  wait "$watchdog_pid" >/dev/null 2>&1 || true
  return "$command_status"
}

wait_for_owned_process() {
  timeout_seconds=$1
  owned_pid=$2
  timeout_marker=$(mktemp "${TMPDIR:-/tmp}/mobile-ui-wait-timeout.XXXXXX")
  (
    sleep "$timeout_seconds"
    printf 'timeout\n' >"$timeout_marker"
    kill -TERM "$owned_pid" >/dev/null 2>&1 || true
    sleep 2
    kill -KILL "$owned_pid" >/dev/null 2>&1 || true
  ) &
  watchdog_pid=$!

  wait "$owned_pid" >/dev/null 2>&1 || true
  kill "$watchdog_pid" >/dev/null 2>&1 || true
  wait "$watchdog_pid" >/dev/null 2>&1 || true
  if [ -s "$timeout_marker" ]; then
    rm -f "$timeout_marker"
    return 1
  fi
  rm -f "$timeout_marker"
  return 0
}

allocate_android_port() {
  port=$ANDROID_PORT_MIN
  while [ "$port" -le "$ANDROID_PORT_MAX" ]; do
    candidate_serial="emulator-$port"
    adb_port=$((port + 1))
    if ! adb devices | grep -q "^${candidate_serial}[[:space:]]" && \
       ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && \
       ! lsof -nP -iTCP:"$adb_port" -sTCP:LISTEN >/dev/null 2>&1; then
      printf '%s\n' "$port"
      return 0
    fi
    port=$((port + 2))
  done
  echo "No free Android emulator port in range ${ANDROID_PORT_MIN}-${ANDROID_PORT_MAX}" >&2
  return 1
}

cleanup() {
  if [ "$android_started" -eq 1 ]; then
    if [ -n "$emulator_pid" ] && kill -0 "$emulator_pid" >/dev/null 2>&1; then
      adb -s "$ANDROID_SERIAL" emu kill >/dev/null 2>&1 || kill -TERM "$emulator_pid" >/dev/null 2>&1 || true
      wait "$emulator_pid" >/dev/null 2>&1 || true
    fi
  fi
  if [ "$ios_started" -eq 1 ]; then
    xcrun simctl shutdown "$IOS_UDID" >/dev/null 2>&1 || true
  fi
  rm -f "$emulator_log"
}
trap cleanup EXIT INT TERM

xcrun simctl shutdown "$IOS_UDID" >/dev/null 2>&1 || true
xcrun simctl boot "$IOS_UDID"
ios_started=1
if ! run_with_timeout "$IOS_BOOT_TIMEOUT_SECONDS" xcrun simctl bootstatus "$IOS_UDID" -b; then
  echo "iOS boot timed out after ${IOS_BOOT_TIMEOUT_SECONDS}s" >&2
  exit 1
fi
ios_runtime=$(xcrun simctl getenv "$IOS_UDID" SIMULATOR_RUNTIME_VERSION)
if [ "$ios_runtime" != "$IOS_RUNTIME" ]; then
  echo "iOS runtime mismatch: expected $IOS_RUNTIME, got $ios_runtime" >&2
  exit 1
fi
echo "IOS_BOOT_COMPLETED bootstatus=ready runtime=$ios_runtime" >&2
xcrun simctl shutdown "$IOS_UDID"
ios_started=0

android_port=$(allocate_android_port)
ANDROID_SERIAL="emulator-$android_port"
emulator -avd "$ANDROID_AVD" -port "$android_port" -no-window -no-snapshot -no-audio -no-boot-anim >"$emulator_log" 2>&1 &
emulator_pid=$!
android_started=1
android_attempts=$((ANDROID_BOOT_TIMEOUT_SECONDS / 2))
android_attempt=1
while [ "$android_attempt" -le "$android_attempts" ]; do
  if ! kill -0 "$emulator_pid" >/dev/null 2>&1; then
    echo "Owned Android emulator process exited before boot" >&2
    tail -40 "$emulator_log" >&2
    exit 1
  fi
  boot_completed=$(adb -s "$ANDROID_SERIAL" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
  if [ "$boot_completed" = "1" ]; then
    break
  fi
  sleep 2
  android_attempt=$((android_attempt + 1))
done
if [ "$android_attempt" -gt "$android_attempts" ]; then
  echo "Android boot timed out after ${ANDROID_BOOT_TIMEOUT_SECONDS}s" >&2
  tail -40 "$emulator_log" >&2
  exit 1
fi
android_api=$(adb -s "$ANDROID_SERIAL" shell getprop ro.build.version.sdk | tr -d '\r')
android_avd=$(adb -s "$ANDROID_SERIAL" emu avd name | sed -n '1s/\r$//p')
if ! kill -0 "$emulator_pid" >/dev/null 2>&1 || [ "$android_avd" != "$ANDROID_AVD" ]; then
  echo "Android serial ownership mismatch for $ANDROID_SERIAL" >&2
  exit 1
fi
if [ "$android_api" != "$ANDROID_API" ]; then
  echo "Android API mismatch: expected $ANDROID_API, got $android_api" >&2
  exit 1
fi
echo "ANDROID_BOOT_COMPLETED attempt=$android_attempt api=$android_api serial=$ANDROID_SERIAL pid=$emulator_pid" >&2
adb -s "$ANDROID_SERIAL" emu kill >/dev/null
if ! wait_for_owned_process "$SHUTDOWN_TIMEOUT_SECONDS" "$emulator_pid"; then
  echo "Android shutdown timed out after ${SHUTDOWN_TIMEOUT_SECONDS}s" >&2
  exit 1
fi
android_started=0

printf '{"status":"ok","ios":{"runtime":"%s","udid":"%s","verified":true},"android":{"api":%s,"avd":"%s","serial":"%s","port":%s,"verified":true}}\n' \
  "$ios_runtime" "$IOS_UDID" "$android_api" "$ANDROID_AVD" "$ANDROID_SERIAL" "$android_port"
