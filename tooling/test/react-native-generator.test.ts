import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample } from "../src/compile-example.js";
import { generateReactNativeArtifact } from "../src/generators/react-native.js";

const root = path.resolve(import.meta.dirname, "../..");

test("React Native generator emits canonical numeric layout and local-only manifest", () => {
  const spec = JSON.parse(readFileSync(path.join(root, "examples/proof/commerce-checkout/spec.json"), "utf8")) as Record<string, unknown>;
  const artifact = generateReactNativeArtifact(compileExample(spec));
  assert.match(artifact.source, /SafeAreaView/);
  assert.match(artifact.source, /KeyboardAvoidingView/);
  assert.match(artifact.source, /keyboardShouldPersistTaps="handled"/);
  assert.match(artifact.source, /paddingBottom: 218/);
  assert.match(artifact.source, /minHeight: 52/);
  assert.equal(artifact.manifest.platform, "react_native");
  assert.deepEqual(artifact.manifest.required_fixtures, ["address_default", "payment_card"]);
  assert.deepEqual(artifact.manifest.verification, { native_build: "unverified", native_capture: "unverified" });
  assert.match(artifact.manifest.assembly_command, /npm --prefix harnesses\/react-native ci/);
  assert.match(artifact.manifest.run_command, /start -- --offline/);
  assert.equal(artifact.manifest.source_hash.length, 64);
});
