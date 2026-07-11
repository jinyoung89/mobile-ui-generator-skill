import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { compileExample, stableStringify } from "../src/compile-example.js";

const root = path.resolve(import.meta.dirname, "../..");
const fixturePath = path.join(root, "examples/proof/commerce-checkout/spec.json");

function fixture(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

test("compiles the canonical checkout spec into a deterministic normalized IR", () => {
  const first = compileExample(fixture());
  const second = compileExample(JSON.parse(JSON.stringify(fixture())) as Record<string, unknown>);

  assert.equal(first.schema_version, 1);
  assert.equal(first.example_id, "commerce-checkout-address");
  assert.deepEqual(first.tokens.layout.space_4, { value: 16, unit: "px", source: "layout.tokens.space_4" });
  assert.deepEqual(first.tokens.layout.control_height, { value: 52, unit: "px", source: "layout.tokens.control_height" });
  assert.deepEqual(first.components.map((component) => component.id), ["checkout-screen", "address-field", "pay-button"]);
  assert.deepEqual(first.components.map((component) => component.order), [0, 1, 2]);
  assert.deepEqual(first.state_matrix, {
    screen: ["default", "loading", "error", "success"],
    inputs: ["empty", "focused", "filled", "invalid", "disabled"],
    cta: ["disabled", "enabled", "pressed", "loading", "success"],
  });
  assert.deepEqual(Object.keys(first.fixtures), ["address_default", "payment_card"]);
  assert.deepEqual(first.navigation, [{
    id: "submit-payment",
    source_component: "pay-button",
    outcome: { kind: "local_state", state: "success" },
  }]);
  assert.deepEqual(first.parity.warnings, []);
  assert.equal(stableStringify(first), stableStringify(second));
});

test("resolves bounded formulas at the reference viewport while retaining their constraints", () => {
  const value = fixture();
  const layout = value.layout as Record<string, unknown>;
  const tokens = layout.tokens as Record<string, unknown>;
  tokens.responsive_inset = { formula: "viewport * 0.05", unit: "px", min: 12, max: 24 };
  layout.screen_horizontal_inset = { token: "responsive_inset" };

  const compiled = compileExample(value);
  assert.deepEqual(compiled.tokens.layout.responsive_inset, {
    value: 19.5,
    unit: "px",
    source: "layout.tokens.responsive_inset",
    formula: "viewport * 0.05",
    min: 12,
    max: 24,
  });
  assert.deepEqual(compiled.layout.screen_horizontal_inset, compiled.tokens.layout.responsive_inset);
});

test("reports explicit parity warnings when platform contracts diverge", () => {
  const value = fixture();
  const mappings = value.platform_mappings as Record<string, unknown>;
  (mappings.flutter as Record<string, unknown>).native_substitutions_explicit = false;

  const compiled = compileExample(value, { validate: false });
  assert.ok(compiled.parity.warnings.some((warning) => warning.includes("flutter") && warning.includes("native substitutions")));
});

test("reports unit and rounding parity drift when validation is intentionally bypassed", () => {
  const value = fixture();
  const mappings = value.platform_mappings as Record<string, unknown>;
  const flutter = mappings.flutter as Record<string, unknown>;
  flutter.unit = "pt";
  flutter.rounding = "floor";
  const compiled = compileExample(value, { validate: false });
  assert.ok(compiled.parity.warnings.some((warning) => warning.includes("flutter") && warning.includes("canonical")));
  assert.ok(compiled.parity.warnings.some((warning) => warning.includes("flutter") && warning.includes("rounding")));
});

test("rejects a spec with unresolved content fixtures before producing IR", () => {
  const value = fixture();
  (value.content as Record<string, unknown>).fixtures = ["missing_fixture"];
  assert.throws(() => compileExample(value), /missing fixture_data\.missing_fixture|invalid canonical spec/i);
});
