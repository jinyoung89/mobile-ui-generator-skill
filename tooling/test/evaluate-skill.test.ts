import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { evaluateSkill, loadEvaluationCorpus, type SkillResponse } from "../src/evaluate-skill.js";

const root = path.resolve(import.meta.dirname, "../..");
const corpusPath = path.join(root, "evaluations/prompts.json");
const scoringPath = path.join(root, "evaluations/scoring.schema.json");

test("the prompt corpus covers the required effectiveness stress cases", () => {
  const corpus = loadEvaluationCorpus(corpusPath);
  assert.equal(corpus.schema_version, "1.0.0");
  const tags = new Set(corpus.prompts.flatMap((prompt) => prompt.tags));
  for (const required of [
    "familiar", "rare", "ambiguous", "multi-pattern", "long-copy-ko", "long-copy-en",
    "compact", "keyboard-heavy", "destructive", "high-trust",
    "keyboard-heavy-form",
  ]) assert.equal(tags.has(required), true, required);
  assert.ok(corpus.prompts.length >= 8);
});

test("the scoring contract declares every blocking quality dimension and thresholds", () => {
  const schema = JSON.parse(readFileSync(scoringPath, "utf8")) as Record<string, unknown>;
  const dimensions = schema.properties && typeof schema.properties === "object"
    ? (schema.properties as Record<string, unknown>).dimensions
    : undefined;
  const dimensionItems = (dimensions as Record<string, unknown>).items as Record<string, unknown>;
  const ids = new Set(((dimensionItems.properties as Record<string, unknown>).id as Record<string, unknown>).enum as string[]);
  for (const required of [
    "classification", "spec_completeness", "numeric_consistency", "required_states",
    "accessibility", "platform_mapping", "build_readiness", "visible_acceptance",
  ]) assert.equal(ids.has(required), true, required);
  assert.ok((schema.properties as Record<string, unknown>).thresholds);
});

function responseFor(promptId: string): SkillResponse {
  return {
    prompt_id: promptId,
    classification: { app_category: "commerce-marketplace", ui_patterns: ["cart-checkout", "payment-coupon"], risk_level: "medium" },
    spec: {
      schema_version: 1,
      id: `${promptId}-fixture`,
      request: { language: "ko", user_job: "Complete a task safely" },
      classification: { app_category: "commerce-marketplace", ui_patterns: ["cart-checkout", "payment-coupon"], risk_level: "medium" },
      platform_policy: {
        reference_viewport_width: 390,
        supported_width_range: { min: 320, max: 430 },
        safe_area: { top: 47, bottom: 34, unit: "px", mode: "system_insets" },
        token_resolution_order: ["component", "pattern", "global"],
        rounding: { html_css: "nearest", react_native: "nearest", flutter: "nearest", swiftui: "nearest" },
        constraint_precedence: ["safe_area", "fixed_region", "min_max", "content"],
      },
      layout: { tokens: { space_4: { value: 16, unit: "px" } }, alignment_anchors: ["screen-leading"] },
      typography: { roles: [{ id: "body", size: { value: 16, unit: "px" } }] },
      components: [{ id: "checkout-screen", states: ["default", "loading", "error", "success"] }],
      numeric_contract: {
        screen_inset: 16, component_gap: 12, control_height: 52, safe_area_top: 47,
        safe_area_bottom: 34, minimum_touch_target: 44, minimum_contrast_ratio: 4.5,
      },
      states: { screen: ["default", "loading", "error", "success"], inputs: ["empty", "focused", "filled", "invalid", "disabled"], cta: ["disabled", "enabled", "pressed", "loading", "success"] },
      accessibility: { minimum_contrast_ratio: 4.5, minimum_touch_target: { width: 44, height: 44, unit: "px" }, screen_reader: "labels_from_component_contract", dynamic_text: "reflow_and_wrap" },
      platform_mappings: {
        html_css: { unit: "px", safe_area: "env(safe-area-inset-top/bottom)", native_substitutions_explicit: true },
        react_native: { unit: "dp", safe_area: "react-native-safe-area-context", native_substitutions_explicit: true },
        flutter: { unit: "dp", safe_area: "SafeArea+MediaQuery", native_substitutions_explicit: true },
        swiftui: { unit: "pt", safe_area: "safeAreaInset", native_substitutions_explicit: true },
      },
    },
    verification: {
      build: { html_css: true, react_native: true, flutter: true, swiftui: true },
      visible_acceptance: { no_horizontal_overflow: true, no_overlap: true, safe_area_respected: true, fixed_regions_do_not_cover_content: true, required_states_renderable: true },
    },
  };
}

test("a complete response passes all blocking dimensions", () => {
  const corpus = loadEvaluationCorpus(corpusPath);
  const response = responseFor(corpus.prompts[0].id);
  const report = evaluateSkill({ ...corpus, prompts: [corpus.prompts[0]] }, [response]);
  assert.equal(report.passed, true, report.errors.join("\n"));
  assert.equal(report.cases[0].passed, true, JSON.stringify(report.cases[0]));
  for (const score of Object.values(report.cases[0].scores)) assert.ok(score >= 80);
});

test("missing numeric and platform evidence fails the corresponding blocking gates", () => {
  const corpus = loadEvaluationCorpus(corpusPath);
  const response = responseFor(corpus.prompts[0].id);
  delete (response.spec as Record<string, unknown>).numeric_contract;
  delete (response.spec as Record<string, unknown>).platform_mappings;
  const report = evaluateSkill({ ...corpus, prompts: [corpus.prompts[0]] }, [response]);
  assert.equal(report.passed, false);
  assert.match(report.cases[0].failures.join("\n"), /numeric_consistency|platform_mapping/);
});

test("every prompt must have a response; omitted stress cases block the release", () => {
  const corpus = loadEvaluationCorpus(corpusPath);
  const report = evaluateSkill(corpus, [responseFor(corpus.prompts[0].id)]);
  assert.equal(report.passed, false);
  assert.match(report.errors.join("\n"), /missing response/i);
  assert.ok(report.summary.prompt_pass_rate < 1);
});

test("the CLI refuses to call a contract smoke baseline a release evaluation", () => {
  const evaluator = path.join(root, "tooling/src/evaluate-skill.ts");
  const result = spawnSync(process.execPath, ["--import", "tsx", evaluator], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--responses|contract-smoke/i);
  const smoke = spawnSync(process.execPath, ["--import", "tsx", evaluator, "--contract-smoke"], { cwd: root, encoding: "utf8" });
  assert.equal(smoke.status, 0, smoke.stderr);
  const report = JSON.parse(readFileSync(path.join(root, "reports/skill-evaluation.json"), "utf8")) as Record<string, unknown>;
  assert.equal(report.mode, "contract-smoke");
  assert.equal(report.release_eligible, false);
});
