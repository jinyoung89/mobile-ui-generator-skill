#!/bin/sh

set -eu

IOS_BOOT_TIMEOUT_SECONDS=120
ANDROID_BOOT_TIMEOUT_SECONDS=120
SHUTDOWN_TIMEOUT_SECONDS=20
ANDROID_SERIAL=emulator-5580
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
emulator_log=$(mktemp "${TMPDIR:-/tmp}/mobile-ui-emulator.XXXXXX")

cleanup() {
  if [ "$android_started" -eq 1 ]; then
    adb -s "$ANDROID_SERIAL" emu kill >/dev/null 2>&1 || true
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
ios_attempts=$((IOS_BOOT_TIMEOUT_SECONDS / 2))
ios_attempt=1
while [ "$ios_attempt" -le "$ios_attempts" ]; do
  if xcrun simctl list devices | grep "$IOS_UDID" | grep -q '(Booted)'; then
    break
  fi
  sleep 2
  ios_attempt=$((ios_attempt + 1))
done
if [ "$ios_attempt" -gt "$ios_attempts" ]; then
  echo "iOS boot timed out after ${IOS_BOOT_TIMEOUT_SECONDS}s" >&2
  exit 1
fi
ios_runtime=$(xcrun simctl getenv "$IOS_UDID" SIMULATOR_RUNTIME_VERSION)
if [ "$ios_runtime" != "$IOS_RUNTIME" ]; then
  echo "iOS runtime mismatch: expected $IOS_RUNTIME, got $ios_runtime" >&2
  exit 1
fi
echo "IOS_BOOT_COMPLETED attempt=$ios_attempt runtime=$ios_runtime" >&2
xcrun simctl shutdown "$IOS_UDID"
ios_started=0

emulator -avd "$ANDROID_AVD" -port 5580 -no-window -no-snapshot -no-audio -no-boot-anim >"$emulator_log" 2>&1 &
android_started=1
android_attempts=$((ANDROID_BOOT_TIMEOUT_SECONDS / 2))
android_attempt=1
while [ "$android_attempt" -le "$android_attempts" ]; do
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
if [ "$android_api" != "$ANDROID_API" ]; then
  echo "Android API mismatch: expected $ANDROID_API, got $android_api" >&2
  exit 1
fi
echo "ANDROID_BOOT_COMPLETED attempt=$android_attempt api=$android_api" >&2
adb -s "$ANDROID_SERIAL" emu kill >/dev/null
shutdown_attempts=$SHUTDOWN_TIMEOUT_SECONDS
shutdown_attempt=1
while [ "$shutdown_attempt" -le "$shutdown_attempts" ]; do
  if ! adb devices | grep -q "^${ANDROID_SERIAL}[[:space:]]"; then
    android_started=0
    break
  fi
  sleep 1
  shutdown_attempt=$((shutdown_attempt + 1))
done
if [ "$android_started" -eq 1 ]; then
  echo "Android shutdown timed out after ${SHUTDOWN_TIMEOUT_SECONDS}s" >&2
  exit 1
fi

printf '{"status":"ok","ios":{"runtime":"%s","udid":"%s","verified":true},"android":{"api":%s,"avd":"%s","verified":true}}\n' \
  "$ios_runtime" "$IOS_UDID" "$android_api" "$ANDROID_AVD"
