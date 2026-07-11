#!/bin/sh

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/tools/bin:$PATH"

java_major=0
if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  java_major=$("$JAVA_HOME/bin/java" -version 2>&1 | sed -n '1s/.*version "\([0-9][0-9]*\).*/\1/p')
fi

if [ "${java_major:-0}" -lt 17 ]; then
  android_studio_java_home="${ANDROID_STUDIO_JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
  if [ -x "$android_studio_java_home/bin/java" ]; then
    export JAVA_HOME="$android_studio_java_home"
  fi
fi
