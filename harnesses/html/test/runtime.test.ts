import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample } from "../../../tooling/src/compile-example.js";
import { generateHtmlArtifact } from "../../../tooling/src/generators/html.js";
import { exampleRegistry, getExampleArtifactManifest } from "../src/examples.js";
import { resolveProfile, profileTable, fixtureAction, type BrowserProfile } from "../src/runtime.js";

const root = path.resolve(import.meta.dirname, "../../..");
const spec = JSON.parse(readFileSync(path.join(root, "examples/proof/commerce-checkout/spec.json"), "utf8")) as Record<string, unknown>;

test("profile registry resolves required viewport, safe-area, and keyboard contracts", () => {
  assert.deepEqual(Object.keys(profileTable), ["compact", "standard", "large", "short-keyboard", "large-text"]);
  const compact = resolveProfile("compact");
  assert.deepEqual(compact.viewport, { width: 320, height: 568 });
  assert.equal(compact.safeArea.bottom, 34);
  assert.equal(compact.keyboard.open, false);
  const keyboard = resolveProfile("short-keyboard");
  assert.equal(keyboard.keyboard.open, true);
  assert.equal(keyboard.keyboard.inset, 291);
  assert.throws(() => resolveProfile("invalid"), /unknown browser profile/i);
});

test("HTML generator emits semantic markup, CSS tokens, safe-area variables, and fixed-region clearance", () => {
  const artifact = generateHtmlArtifact(compileExample(spec));
  assert.match(artifact.html, /<main[^>]+aria-labelledby=/);
  assert.match(artifact.html, /<label[^>]+for="address-field"/);
  assert.match(artifact.html, /<input[^>]+id="address-field"/);
  assert.match(artifact.html, /<button[^>]+data-action="submit-payment"/);
  assert.match(artifact.css, /--screen-inset:\s*16px/);
  assert.match(artifact.css, /env\(safe-area-inset-top/);
  assert.match(artifact.css, /padding-bottom:[^;]*var\(--sticky-region-height/);
  assert.match(artifact.css, /overflow-x:\s*hidden/);
  assert.equal(artifact.manifest.example_id, "commerce-checkout-address");
  assert.equal(artifact.manifest.platform, "html_css");
  assert.ok(artifact.manifest.source_hash.length >= 16);
});

test("fixture runtime handles local submit outcome and keeps navigation fixture-only", () => {
  assert.deepEqual(fixtureAction("submit-payment", "press", { state: "default" }), { state: "success", outcome: "local_state" });
  assert.deepEqual(fixtureAction("unknown", "press", { state: "default" }), { state: "default", outcome: "ignored" });
  assert.deepEqual(fixtureAction("submit-payment", "press", { state: "success" }), { state: "success", outcome: "local_state" });
});

test("example registry exposes a complete checkout artifact manifest", () => {
  assert.ok(exampleRegistry.some((entry) => entry.id === "commerce-checkout-address"));
  const manifest = getExampleArtifactManifest("commerce-checkout-address");
  assert.deepEqual(manifest.required_fixtures, ["address_default", "payment_card"]);
  assert.equal(manifest.capabilities.fixture_only, true);
  assert.match(manifest.assembly_command, /npm --prefix harnesses\/html/);
});

test("browser profile type remains structurally complete", () => {
  const profile: BrowserProfile = resolveProfile("standard");
  assert.equal(profile.orientation, "portrait");
  assert.equal(profile.pixelRatio, 1);
  assert.equal(profile.theme, "light");
  assert.equal(profile.locale, "ko");
  assert.equal(profile.textScale, 1);
});
