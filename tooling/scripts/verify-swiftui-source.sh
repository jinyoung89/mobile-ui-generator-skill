#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

required=(
  harnesses/swiftui/project.yml
  harnesses/swiftui/MobileUIShowcase.xcodeproj/project.pbxproj
  harnesses/swiftui/Sources/App.swift
  harnesses/swiftui/Sources/Registry.swift
  harnesses/swiftui/Sources/Runtime/Runtime.swift
  harnesses/swiftui/Tests/RuntimeTests.swift
)
for file in "${required[@]}"; do
  test -f "$file" || { echo "missing SwiftUI source: $file" >&2; exit 1; }
done

if find harnesses/swiftui -type d \( -name DerivedData -o -name build -o -name .build \) -print -quit | grep -q .; then
  echo "SwiftUI harness contains generated build output" >&2
  exit 1
fi

if command -v xcrun >/dev/null 2>&1; then
  while IFS= read -r file; do
    xcrun swiftc -parse "$file"
  done < <(find harnesses/swiftui/Sources harnesses/swiftui/Tests -name '*.swift' -print | sort)
else
  echo "xcrun unavailable; SwiftUI parse check not run" >&2
fi

echo "SwiftUI source contract passed (native_build=unverified, native_capture=unverified)"

