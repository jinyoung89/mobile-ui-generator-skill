import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample, stableStringify } from "../src/compile-example.js";
import { buildProofBundle, verifyProofSources } from "../src/generate-proof-set.js";
import { validateSpec } from "../src/validate-spec.js";

type JsonObject = Record<string, unknown>;

const root = path.resolve(import.meta.dirname, "../..");
const proofRoot = path.join(root, "examples/proof");
const sourceFiles = [
  "html-css/index.html",
  "html-css/styles.css",
  "html-css/app.js",
  "react-native/Screen.tsx",
  "react-native/fixtures.ts",
  "flutter/screen.dart",
  "flutter/fixtures.dart",
  "swiftui/Screen.swift",
  "swiftui/Fixtures.swift",
] as const;
const requiredFiles = ["request.md", "spec.json", "compiled-ir.json", "public-provenance.json", "static-verification.json", ...sourceFiles] as const;

const expected = {
  "fintech-signup": {
    specId: "fintech-signup",
    category: "finance-fintech",
    risk: "high",
    states: ["default", "loading", "error", "success", "focused", "validation_error", "keyboard"],
  },
  "commerce-checkout": {
    specId: "commerce-checkout-address",
    category: "commerce",
    risk: "medium",
    states: ["default", "loading", "error", "success", "focused", "validation_error", "keyboard"],
  },
  "mobility-map-booking": {
    specId: "mobility-map-booking",
    category: "mobility-transportation",
    risk: "high",
    states: ["default", "loading", "error", "success", "permission_denied", "offline", "destructive_confirmation"],
  },
  "social-feed": {
    specId: "social-feed",
    category: "social-community",
    risk: "low",
    states: ["default", "loading", "empty", "error"],
  },
  "messenger-chat": {
    specId: "messenger-chat",
    category: "messaging",
    risk: "medium",
    states: ["default", "loading", "empty", "error", "focused", "keyboard", "offline"],
  },
} as const;

const readJson = (file: string): JsonObject => JSON.parse(readFileSync(file, "utf8")) as JsonObject;
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

test("five proof archetypes contain the complete static showcase tree", () => {
  assert.deepEqual(Object.keys(expected), ["fintech-signup", "commerce-checkout", "mobility-map-booking", "social-feed", "messenger-chat"]);
  for (const id of Object.keys(expected)) {
    for (const relative of requiredFiles) {
      assert.equal(existsSync(path.join(proofRoot, id, relative)), true, `${id}/${relative}`);
    }
  }
});

for (const [id, contract] of Object.entries(expected)) {
  test(`${id} has a strict bilingual canonical spec and required states`, () => {
    const dir = path.join(proofRoot, id);
    const spec = readJson(path.join(dir, "spec.json"));
    const result = validateSpec(spec);
    assert.deepEqual(result.errors, [], result.errors.join("\n"));
    assert.equal(result.valid, true);

    const classification = spec.classification as JsonObject;
    assert.equal(spec.id, contract.specId);
    assert.equal(classification.app_category, contract.category);
    assert.equal(classification.risk_level, contract.risk);
    const localization = spec.localization as JsonObject;
    assert.deepEqual(localization.supported_languages, ["ko", "en"]);
    const locales = (spec.content as JsonObject).locales as JsonObject;
    assert.ok(locales.ko && locales.en, `${id} must contain Korean and English copy`);

    const states = spec.states as JsonObject;
    const allStates = new Set(Object.values(states).flatMap((value) => value as string[]));
    for (const state of contract.states) assert.ok(allStates.has(state), `${id} missing state ${state}`);

    const compiled = compileExample(spec);
    assert.equal(compiled.parity.warnings.length, 0);
    assert.equal(stableStringify(compiled), stableStringify(compileExample(JSON.parse(JSON.stringify(spec)) as JsonObject)));
    assert.ok(Object.values(compiled.tokens.layout).every((measure) => typeof measure.value === "number" && measure.source.length > 0));
    assert.equal(readFileSync(path.join(dir, "compiled-ir.json"), "utf8"), `${stableStringify(compiled)}\n`);

    if (contract.risk === "high") {
      for (const language of ["ko", "en"]) {
        const copy = locales[language] as JsonObject;
        assert.equal(typeof copy.risk_notice, "string", `${id}/${language} needs explicit high-risk guidance`);
        assert.equal(typeof copy.confirm_label, "string", `${id}/${language} needs an explicit confirmation label`);
      }
      const highRisk = (spec.fixture_data as JsonObject).high_risk_action as JsonObject;
      assert.equal(highRisk.requires_confirmation, true);
      assert.equal(highRisk.fixture_only, true);
    }
  });

  test(`${id} source files and verification hashes derive from the canonical IR`, () => {
    const dir = path.join(proofRoot, id);
    const specText = readFileSync(path.join(dir, "spec.json"), "utf8");
    const spec = JSON.parse(specText) as JsonObject;
    const compiled = compileExample(spec);
    const verification = readJson(path.join(dir, "static-verification.json"));
    const provenance = readJson(path.join(dir, "public-provenance.json"));

    assert.equal(provenance.generated_by, "mobile-ui-generator");
    assert.equal(provenance.mode, "showcase/all-platforms");
    assert.equal(provenance.source_kind, "public-generalized-guidance");
    assert.deepEqual(provenance.languages, ["ko", "en"]);
    assert.equal(verification.status, "passed");
    assert.equal(verification.spec_valid, true);
    assert.equal(verification.source_static_valid, true);
    assert.equal(verification.native_build, "not_run_not_required");
    assert.equal(verification.native_execution, "not_run_not_required");
    assert.equal(verification.canonical_ir_sha256, sha256(`${stableStringify(compiled)}\n`));
    assert.equal(verification.spec_sha256, sha256(specText));

    const hashes = verification.source_sha256 as JsonObject;
    const regenerated = buildProofBundle(specText, readFileSync(path.join(dir, "request.md"), "utf8"));
    for (const relative of sourceFiles) {
      const source = readFileSync(path.join(dir, relative), "utf8");
      assert.equal(hashes[relative], sha256(source), `${id}/${relative} hash drift`);
      assert.equal(regenerated.files[relative], source, `${id}/${relative} is not reproducible from canonical IR`);
      assert.doesNotMatch(source, /\{\{[^}]+\}\}|TODO|PLACEHOLDER/i, `${id}/${relative} contains an unresolved placeholder`);
      assert.match(source, /[가-힣]/, `${id}/${relative} must expose Korean fixture copy`);
      assert.match(source, /[A-Za-z]{3,}/, `${id}/${relative} must expose English fixture copy or code semantics`);
    }

    assert.match(readFileSync(path.join(dir, "react-native/Screen.tsx"), "utf8"), /from ['"]\.\/fixtures['"]/);
    const flutter = readFileSync(path.join(dir, "flutter/screen.dart"), "utf8");
    assert.match(flutter, /import 'fixtures\.dart'/);
    assert.match(flutter, /SafeArea/);
    assert.match(flutter, /MediaQuery/);
    assert.match(flutter, /SingleChildScrollView/);
    assert.doesNotMatch(flutter, /Container\([^)]*,\s*SizedBox\(height:/, `${id} Flutter Container arguments were corrupted`);
    assert.doesNotMatch(flutter, /_Card\([^)]*,\s*SizedBox\(height:/, `${id} Flutter card arguments were corrupted`);
    assert.doesNotMatch(flutter, /BoxDecoration\([^)]*,\s*SizedBox\(height:/, `${id} Flutter decoration arguments were corrupted`);
    const swift = readFileSync(path.join(dir, "swiftui/Screen.swift"), "utf8");
    assert.match(swift, /proofFixtures|fixture/);
    assert.match(swift, /safeAreaInset/);
    assert.match(swift, /FocusState/);
    assert.match(readFileSync(path.join(dir, "request.md"), "utf8"), /showcase\/all-platforms/);
    assert.deepEqual(regenerated.provenance, provenance);
    assert.deepEqual(regenerated.verification, verification);

    const declaredStates = [...new Set(Object.values(spec.states as JsonObject).flatMap((value) => value as string[]))];
    const targetSources = {
      html_css: `${regenerated.files["html-css/index.html"]}\n${regenerated.files["html-css/app.js"]}`,
      react_native: `${regenerated.files["react-native/Screen.tsx"]}\n${regenerated.files["react-native/fixtures.ts"]}`,
      flutter: `${regenerated.files["flutter/screen.dart"]}\n${regenerated.files["flutter/fixtures.dart"]}`,
      swiftui: `${regenerated.files["swiftui/Screen.swift"]}\n${regenerated.files["swiftui/Fixtures.swift"]}`,
    };
    for (const [target, source] of Object.entries(targetSources)) {
      for (const state of declaredStates) assert.match(source, new RegExp(`['"]${state}['"]`), `${id}/${target} missing fixture-backed state ${state}`);
    }

    const html = regenerated.files["html-css/index.html"];
    for (const match of html.matchAll(/<([a-z][^>]*)>([^<]*[가-힣][^<]*)<\//gi)) {
      assert.match(match[1] ?? "", /data-i18n=/, `${id} Korean visible copy is not locale-bound: ${match[2]}`);
    }
    for (const match of html.matchAll(/<([a-z][^>]*aria-label="[^"]*[가-힣][^"]*"[^>]*)>/gi)) {
      assert.match(match[1] ?? "", /data-i18n-aria=/, `${id} Korean ARIA copy is not locale-bound`);
    }
    assert.match(regenerated.files["html-css/app.js"], /data-i18n-aria/);
    assert.match(regenerated.files["html-css/app.js"], /renderState/);
    assert.match(regenerated.files["html-css/app.js"], /stateFixtures/);

    for (const [fixturePath, localePattern] of [
      ["react-native/fixtures.ts", /ko[\s\S]*[가-힣][\s\S]*en[\s\S]*[A-Za-z]{4}/],
      ["flutter/fixtures.dart", /'ko'[\s\S]*[가-힣][\s\S]*'en'[\s\S]*[A-Za-z]{4}/],
      ["swiftui/Fixtures.swift", /"ko"[\s\S]*[가-힣][\s\S]*"en"[\s\S]*[A-Za-z]{4}/],
    ] as const) assert.match(regenerated.files[fixturePath], localePattern, `${id}/${fixturePath} lacks meaningful bilingual fixtures`);

    assert.match(regenerated.files["react-native/Screen.tsx"], /initialState/);
    assert.match(regenerated.files["react-native/Screen.tsx"], /stateFixtures/);
    assert.match(regenerated.files["react-native/Screen.tsx"], /recoverTo/);
    assert.match(regenerated.files["flutter/screen.dart"], /initialState/);
    assert.match(regenerated.files["flutter/screen.dart"], /stateFixtures/);
    assert.match(regenerated.files["flutter/screen.dart"], /recoverTo/);
    assert.match(regenerated.files["swiftui/Screen.swift"], /initialState/);
    assert.match(regenerated.files["swiftui/Screen.swift"], /stateFixtures/);
    assert.match(regenerated.files["swiftui/Screen.swift"], /recoverTo/);

    const computed = verifyProofSources(compiled, regenerated.files);
    assert.equal(computed.status, "passed");
    assert.ok(computed.checks.length >= 8);
    assert.ok(computed.checks.every((check) => check.status === "passed"));
    assert.deepEqual(verification.checks, computed.checks);

    if (contract.risk === "high") {
      assert.match(html, /data-risk-confirm/);
      assert.match(regenerated.files["html-css/app.js"], /acknowledged/);
      assert.match(regenerated.files["react-native/Screen.tsx"], /acknowledged/);
      assert.match(regenerated.files["react-native/Screen.tsx"], /disabled=\{!acknowledged/);
      assert.match(regenerated.files["flutter/screen.dart"], /CheckboxListTile/);
      assert.match(regenerated.files["flutter/screen.dart"], /acknowledged \?/);
      assert.match(regenerated.files["swiftui/Screen.swift"], /Toggle/);
      assert.match(regenerated.files["swiftui/Screen.swift"], /\.disabled\(!acknowledged\)/);
    }
  });
}

test("computed static verification fails when a target loses a required state", () => {
  const dir = path.join(proofRoot, "messenger-chat");
  const specText = readFileSync(path.join(dir, "spec.json"), "utf8");
  const bundle = buildProofBundle(specText, readFileSync(path.join(dir, "request.md"), "utf8"));
  const compiled = compileExample(JSON.parse(specText) as JsonObject);
  const broken = { ...bundle.files, "react-native/fixtures.ts": bundle.files["react-native/fixtures.ts"].replaceAll('"offline"', '"removed-state"') };
  const result = verifyProofSources(compiled, broken);
  assert.equal(result.status, "failed");
  assert.ok(result.checks.some((check) => check.id === "states-react-native" && check.status === "failed"));
});
