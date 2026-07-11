import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { validateSpec } from "../src/validate-spec.js";

const root = path.resolve(import.meta.dirname, "../..");
const fixturePath = path.join(root, "examples/proof/commerce-checkout/spec.json");

function fixture(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

test("validates the canonical commerce fixture", () => {
  const result = validateSpec(fixture());
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
});

test("rejects missing numeric viewport, safe-area, typography, states, and platform mappings", () => {
  const value = fixture();
  delete value.platform_policy;
  delete value.typography;
  delete value.states;
  delete value.platform_mappings;
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /platform_policy/);
  assert.match(result.errors.join("\n"), /typography/);
  assert.match(result.errors.join("\n"), /states/);
  assert.match(result.errors.join("\n"), /platform_mappings/);
});

test("rejects unknown keys at every strict schema boundary", () => {
  const value = fixture();
  (value as Record<string, unknown>).unknown = true;
  (((value.layout as Record<string, unknown>).tokens as Record<string, unknown>).space_1 as Record<string, unknown>).oops = true;
  ((value.components as Array<Record<string, unknown>>)[0].accessibility as Record<string, unknown>).mystery = true;
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /unknown/);
  assert.match(result.errors.join("\n"), /layout\.tokens/);
  assert.match(result.errors.join("\n"), /accessibility/);
});

test("enforces token resolution, units, rounding, and constraint precedence", () => {
  const value = fixture();
  const layout = value.layout as Record<string, unknown>;
  const tokens = layout.tokens as Record<string, unknown>;
  tokens.space_4 = { token: "missing" };
  const policy = value.platform_policy as Record<string, unknown>;
  (policy.rounding as Record<string, unknown>).html_css = "truncate";
  (layout.constraints as Record<string, unknown>).precedence = ["content"];
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /token|resolution/i);
  assert.match(result.errors.join("\n"), /rounding/i);
  assert.match(result.errors.join("\n"), /precedence|constraint/i);
});

test("enforces responsive width coverage and cross-field references", () => {
  const value = fixture();
  value.responsive_rules = (value.responsive_rules as Array<Record<string, unknown>>).filter(
    (rule) => (rule.width as Record<string, unknown>).min !== 320,
  );
  const components = value.components as Array<Record<string, unknown>>;
  components[0].parent = "missing-region";
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /320|responsive/i);
  assert.match(result.errors.join("\n"), /parent|missing-region/i);
});

test("requires navigation outcomes, localization, accessibility, and explicit native substitutions", () => {
  const value = fixture();
  const navigation = value.navigation_and_actions as Array<Record<string, unknown>>;
  (navigation[0].outcome as Record<string, unknown>).kind = "network";
  const localization = value.localization as Record<string, unknown>;
  localization.supported_languages = ["en"];
  const mappings = value.platform_mappings as Record<string, unknown>;
  delete (mappings.swiftui as Record<string, unknown>).safe_area;
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /outcome|local|language|network/i);
  assert.match(result.errors.join("\n"), /swiftui|safe.?area|mapping/i);
});
