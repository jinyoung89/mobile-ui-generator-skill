import assert from "node:assert/strict";
import Ajv2020Module from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { validateSpec } from "../src/validate-spec.js";

type JsonSchemaValidator = ((value: unknown) => boolean) & { errors?: unknown };
type AjvConstructor = new (options?: Record<string, unknown>) => { compile(schema: unknown): JsonSchemaValidator };

const root = path.resolve(import.meta.dirname, "../..");
const fixturePath = path.join(root, "examples/proof/commerce-checkout/spec.json");
const schemaPath = path.join(root, "skills/mobile-ui-generator/schemas/mobile-ui-spec.schema.json");

function fixture(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

test("validates the canonical commerce fixture", () => {
  const result = validateSpec(fixture());
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
});

test("canonical fixture validates against the published JSON Schema", () => {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as Record<string, unknown>;
  const ajv = new (Ajv2020Module as unknown as AjvConstructor)({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const valid = validate(fixture());
  assert.equal(valid, true, JSON.stringify(validate.errors));

  const invalid = fixture();
  invalid.unknown = true;
  assert.equal(validate(invalid), false, "additional top-level keys must fail JSON Schema validation");
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

test("resolves text roles, interactions, and navigation states against declared IDs", () => {
  const value = fixture();
  const component = (value.components as Array<Record<string, unknown>>)[0];
  component.text_roles = ["missing-role"];
  (value.interactions as Array<Record<string, unknown>>)[0].source = "missing-component";
  (value.navigation_and_actions as Array<Record<string, unknown>>)[0].outcome = { kind: "local_state", state: "missing-state" };
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /text_roles|missing-role|interaction|source|missing-component|state/i);
});

test("rejects token cycles and requires every component state to have a matrix entry", () => {
  const value = fixture();
  const tokens = (value.layout as Record<string, unknown>).tokens as Record<string, unknown>;
  tokens.space_1 = { token: "space_2" };
  tokens.space_2 = { token: "space_1" };
  (value.states as Record<string, unknown>).inputs = ["empty"];
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /cycle/i);
  assert.match(result.errors.join("\n"), /state.*matrix|declared|states/i);
});

test("requires contiguous responsive coverage from the supported minimum to maximum", () => {
  const value = fixture();
  value.responsive_rules = [
    { width: { min: 320, max: 374 }, changes: ["stack"], no_horizontal_overflow: true, fixed_regions_preserve_inset: true },
    { width: { min: 380, max: 430 }, changes: ["wide"], no_horizontal_overflow: true, fixed_regions_preserve_inset: true },
  ];
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /contiguous|gap|coverage/i);
});

test("enforces canonical safe-area and platform unit/rounding parity", () => {
  const value = fixture();
  (value.platform_policy as Record<string, unknown>).safe_area = { top: 47, bottom: 34, unit: "pt", mode: "system_insets" };
  (value.platform_mappings as Record<string, unknown>).flutter = { unit: "pt", safe_area: "SafeArea", rounding: "floor", native_substitutions_explicit: true };
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /safe.?area.*unit|canonical/i);
  assert.match(result.errors.join("\n"), /flutter|unit|rounding|parity/i);
});

test("requires non-empty state matrices, valid target-size units, and known contrast tokens", () => {
  const value = fixture();
  (value.states as Record<string, unknown>).cta = [];
  ((value.components as Array<Record<string, unknown>>)[0].accessibility as Record<string, unknown>).target_size = { width: 44, height: 44, unit: "ratio" };
  ((value.colors as Record<string, unknown>).contrast_pairs as Array<Record<string, unknown>>)[0].foreground = "missing-color";
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /states\.cta|non-empty/i);
  assert.match(result.errors.join("\n"), /target_size.*unit|unit/i);
  assert.match(result.errors.join("\n"), /contrast|missing-color/i);
});

test("requires supported localization and fallback language coverage", () => {
  const value = fixture();
  const localization = value.localization as Record<string, unknown>;
  localization.supported_languages = [];
  localization.fallback_language = "ja";
  const result = validateSpec(value);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /supported_languages|non-empty|request\.language/i);
  assert.match(result.errors.join("\n"), /fallback|supported/i);
});

test("keeps validator strictness aligned with the published JSON schema", () => {
  const cases: Array<[string, (value: Record<string, unknown>) => void, RegExp]> = [
    ["uppercase id", (value) => { value.id = "Commerce-Checkout"; }, /id.*pattern|lowercase|format/i],
    ["empty tokens", (value) => { (value.layout as Record<string, unknown>).tokens = {}; }, /layout\.tokens.*(required|empty|token)/i],
    ["empty anchors", (value) => { (value.layout as Record<string, unknown>).alignment_anchors = []; }, /alignment_anchors.*non-empty/i],
    ["empty components", (value) => { value.components = []; }, /components.*non-empty/i],
    ["empty component states", (value) => { ((value.components as Array<Record<string, unknown>>)[0]).states = []; }, /components\[0\]\.states.*non-empty/i],
    ["empty typography roles", (value) => { (value.typography as Record<string, unknown>).roles = []; }, /typography\.roles.*non-empty/i],
    ["out of range typography weight", (value) => { (((value.typography as Record<string, unknown>).roles as Array<Record<string, unknown>>)[0]).weight = 1001; }, /weight.*1000/i],
    ["empty interactions", (value) => { value.interactions = []; }, /interactions.*non-empty/i],
    ["empty responsive changes", (value) => { ((value.responsive_rules as Array<Record<string, unknown>>)[0]).changes = []; }, /responsive_rules\[0\]\.changes.*non-empty/i],
    ["too few responsive rules", (value) => { value.responsive_rules = [(value.responsive_rules as unknown[])[0]]; }, /responsive_rules.*three|3|coverage/i],
    ["empty locale copy", (value) => { ((value.content as Record<string, unknown>).locales as Record<string, unknown>).ko = {}; }, /content\.locales\.ko.*non-empty|copy/i],
    ["non-string asset", (value) => { (value.assets_and_fallbacks as Record<string, unknown>).assets = [1]; }, /assets.*string/i],
    ["empty focusable components", (value) => { (value.focus_and_keyboard as Record<string, unknown>).focusable_components = []; }, /focusable_components.*non-empty/i],
    ["empty content fixtures", (value) => { (value.content as Record<string, unknown>).fixtures = []; }, /content\.fixtures.*non-empty/i],
    ["empty theme list", (value) => { (value.themes as Record<string, unknown>).supported = []; }, /themes\.supported.*non-empty/i],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    mutate(value);
    const result = validateSpec(value);
    assert.equal(result.valid, false, `${name} unexpectedly passed`);
    assert.match(result.errors.join("\n"), expected, name);
  }
});

test("enforces array uniqueness, ID references, and fixture/profile shapes", () => {
  const cases: Array<[string, (value: Record<string, unknown>) => void, RegExp]> = [
    ["empty patterns", (value) => { (value.classification as Record<string, unknown>).ui_patterns = []; }, /ui_patterns.*non-empty/i],
    ["duplicate patterns", (value) => { (value.classification as Record<string, unknown>).ui_patterns = ["checkout", "checkout"]; }, /ui_patterns.*unique|duplicate/i],
    ["duplicate state matrix values", (value) => { (value.states as Record<string, unknown>).screen = ["default", "default"]; }, /states\.screen.*unique|duplicate/i],
    ["duplicate component states", (value) => { ((value.components as Array<Record<string, unknown>>)[0]).states = ["default", "default"]; }, /components\[0\]\.states.*unique|duplicate/i],
    ["duplicate responsive changes", (value) => { ((value.responsive_rules as Array<Record<string, unknown>>)[0]).changes = ["stack_sections", "stack_sections"]; }, /responsive_rules\[0\]\.changes.*unique|duplicate/i],
    ["duplicate supported languages", (value) => { (value.localization as Record<string, unknown>).supported_languages = ["ko", "ko"]; }, /supported_languages.*unique|duplicate/i],
    ["duplicate long-copy profiles", (value) => { (value.localization as Record<string, unknown>).long_copy_profiles = ["long-copy-ko", "long-copy-ko"]; }, /long_copy_profiles.*unique|duplicate/i],
    ["duplicate themes", (value) => { (value.themes as Record<string, unknown>).supported = ["light", "light"]; }, /themes\.supported.*unique|duplicate/i],
    ["unknown focusable ID", (value) => { (value.focus_and_keyboard as Record<string, unknown>).focusable_components = ["missing-component"]; }, /focusable_components.*missing|component/i],
    ["non-object fixture", (value) => { (value.fixture_data as Record<string, unknown>).bad = "not-an-object"; }, /fixture_data\.bad.*object/i],
    ["invalid quality profiles", (value) => { (value.quality_requirements as Record<string, unknown>).responsive_profiles = [320, 320]; }, /responsive_profiles.*unique|duplicate/i],
    ["short language tag", (value) => { (value.request as Record<string, unknown>).language = "k"; }, /request\.language.*2|length/i],
    ["empty content fixtures", (value) => { (value.content as Record<string, unknown>).fixtures = []; }, /content\.fixtures.*non-empty/i],
    ["empty navigation actions", (value) => { value.navigation_and_actions = []; }, /navigation_and_actions.*non-empty/i],
    ["fixed measure bounds", (value) => { (value.layout as Record<string, unknown>).screen_horizontal_inset = { value: 16, unit: "px", min: 8 }; }, /screen_horizontal_inset.*fixed|bounds|min|max/i],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    mutate(value);
    const result = validateSpec(value);
    assert.equal(result.valid, false, `${name} unexpectedly passed`);
    assert.match(result.errors.join("\n"), expected, name);
  }
});
