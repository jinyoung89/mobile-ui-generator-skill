import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample } from "../src/compile-example.js";
import { generateFlutterArtifact } from "../src/generators/flutter.js";

const root = path.resolve(import.meta.dirname, "../..");

test("Flutter generator emits a numeric, local-only artifact manifest", () => {
  const spec = JSON.parse(readFileSync(path.join(root, "examples/proof/commerce-checkout/spec.json"), "utf8")) as Record<string, unknown>;
  const artifact = generateFlutterArtifact(compileExample(spec));

  assert.match(artifact.source, /SafeArea/);
  assert.match(artifact.source, /MediaQuery/);
  assert.match(artifact.source, /viewInsets/);
  assert.match(artifact.source, /SingleChildScrollView/);
  assert.match(artifact.source, /TextScaler/);
  assert.match(artifact.source, /padding: const EdgeInsets\.all\(16\)/);
  assert.match(artifact.source, /minHeight: 52/);
  assert.equal(artifact.manifest.platform, "flutter");
  assert.deepEqual(artifact.manifest.required_fixtures, ["address_default", "payment_card"]);
  assert.deepEqual(artifact.manifest.verification, { native_build: "unverified", native_capture: "unverified" });
  assert.match(artifact.manifest.assembly_command, /flutter pub get/);
  assert.match(artifact.manifest.run_command, /flutter run/);
  assert.equal(artifact.manifest.source_hash.length, 64);
});
