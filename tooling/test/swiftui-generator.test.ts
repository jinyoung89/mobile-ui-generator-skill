import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample } from "../src/compile-example.js";
import { generateSwiftUIArtifact } from "../src/generators/swiftui.js";

const root = path.resolve(import.meta.dirname, "../..");

test("SwiftUI generator emits a numeric, local-only source artifact", () => {
  const spec = JSON.parse(readFileSync(path.join(root, "examples/proof/commerce-checkout/spec.json"), "utf8")) as Record<string, unknown>;
  const artifact = generateSwiftUIArtifact(compileExample(spec));

  assert.match(artifact.source, /safeAreaInset/);
  assert.match(artifact.source, /ScrollView/);
  assert.match(artifact.source, /FocusState/);
  assert.match(artifact.source, /.keyboard/);
  assert.match(artifact.source, /.dynamicTypeSize/);
  assert.match(artifact.source, /.accessibilityLabel/);
  assert.match(artifact.source, /padding\(16\)/);
  assert.match(artifact.source, /frame\(minHeight: 52/);
  assert.equal(artifact.manifest.platform, "swiftui");
  assert.deepEqual(artifact.manifest.required_fixtures, ["address_default", "payment_card"]);
  assert.deepEqual(artifact.manifest.verification, { native_build: "unverified", native_capture: "unverified" });
  assert.match(artifact.manifest.assembly_command, /swiftui-source/);
  assert.match(artifact.manifest.run_command, /xcodebuild/);
  assert.equal(artifact.manifest.source_hash.length, 64);
});

