import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const read = (relative: string) => readFileSync(path.join(root, relative), "utf8");

test("SwiftUI source contract is pinned and source-only", () => {
  const project = read("harnesses/swiftui/project.yml");
  const app = read("harnesses/swiftui/Sources/App.swift");
  const registry = read("harnesses/swiftui/Sources/Registry.swift");
  const runtime = read("harnesses/swiftui/Sources/Runtime/Runtime.swift");
  const tests = read("harnesses/swiftui/Tests/RuntimeTests.swift");
  const pbxproj = read("harnesses/swiftui/MobileUIShowcase.xcodeproj/project.pbxproj");

  assert.match(project, /deploymentTarget:[\s\S]*iOS:\s*"17\.2"/);
  assert.match(project, /SWIFT_VERSION:\s*"5\.9"/);
  assert.match(project, /Xcode 15\.2/);
  assert.match(project, /Sources/);
  assert.match(project, /Tests/);
  assert.match(app, /@main/);
  assert.match(app, /MobileUIShowcaseApp/);
  assert.match(registry, /iPhone 15/);
  assert.match(registry, /7732B728-22A6-4CCC-A121-C1F2BDC5EC23/);
  assert.match(registry, /nativeBuild: "unverified"/);
  assert.match(runtime, /safeAreaInset/);
  assert.match(runtime, /ScrollView/);
  assert.match(runtime, /FocusState/);
  assert.match(runtime, /DynamicType/);
  assert.match(runtime, /Color\(\.label\)/);
  assert.match(tests, /XCTestCase/);
  assert.match(tests, /safeArea/);
  assert.match(tests, /keyboard/);
  assert.match(pbxproj, /PBXProject/);
  assert.match(pbxproj, /MobileUIShowcaseTests/);
  assert.doesNotMatch(`${app}\n${registry}\n${runtime}`, /https?:\/\//);
});
