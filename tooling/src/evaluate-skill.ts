#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type JsonObject = Record<string, unknown>;

export type EvaluationDimension =
  | "classification"
  | "spec_completeness"
  | "numeric_consistency"
  | "required_states"
  | "accessibility"
  | "platform_mapping"
  | "build_readiness"
  | "visible_acceptance";

export type EvaluationPrompt = {
  id: string;
  tags: string[];
  request: string;
  language: string;
  expected: {
    app_categories: string[];
    ui_patterns: string[];
    risk_levels: string[];
    width_range: [number, number];
    required_states: string[];
    numeric_ranges: Record<string, [number, number]>;
    platforms: string[];
    acceptance: string[];
  };
};

export type EvaluationCorpus = { schema_version: "1.0.0"; corpus_id: string; prompts: EvaluationPrompt[] };

export type SkillResponse = {
  prompt_id: string;
  classification?: JsonObject;
  spec?: unknown;
  verification?: JsonObject;
};

export type EvaluationCase = {
  prompt_id: string;
  tags: string[];
  scores: Record<EvaluationDimension, number>;
  total: number;
  passed: boolean;
  failures: string[];
};

export type EvaluationReport = {
  schema_version: "1.0.0";
  corpus_id: string;
  mode: "contract-smoke" | "responses";
  release_eligible: boolean;
  generated_at: string;
  thresholds: { overall_min: number; prompt_pass_rate_min: number; blocking_dimension_min: number };
  summary: {
    prompt_count: number;
    response_count: number;
    evaluated_count: number;
    prompt_pass_rate: number;
    overall_score: number;
    blocking_dimension_pass_rate: number;
  };
  dimensions: Array<{ id: EvaluationDimension; label: string; blocking: boolean; threshold: number; weight: number; average: number; pass_rate: number }>;
  cases: EvaluationCase[];
  errors: string[];
  passed: boolean;
};

const DIMENSIONS: Array<{ id: EvaluationDimension; label: string; blocking: boolean; threshold: number; weight: number }> = [
  { id: "classification", label: "Request classification", blocking: true, threshold: 85, weight: 0.12 },
  { id: "spec_completeness", label: "Canonical specification completeness", blocking: true, threshold: 90, weight: 0.14 },
  { id: "numeric_consistency", label: "Numeric layout consistency", blocking: true, threshold: 90, weight: 0.15 },
  { id: "required_states", label: "Required state coverage", blocking: true, threshold: 85, weight: 0.12 },
  { id: "accessibility", label: "Accessibility contract", blocking: true, threshold: 90, weight: 0.12 },
  { id: "platform_mapping", label: "Platform mapping parity", blocking: true, threshold: 90, weight: 0.12 },
  { id: "build_readiness", label: "Build readiness", blocking: true, threshold: 95, weight: 0.11 },
  { id: "visible_acceptance", label: "Visible acceptance", blocking: true, threshold: 90, weight: 0.12 },
];

const THRESHOLDS = { overall_min: 90, prompt_pass_rate_min: 1, blocking_dimension_min: 85 };
const PLATFORM_IDS = ["html_css", "react_native", "flutter", "swiftui"] as const;
const SPEC_REQUIRED = ["schema_version", "id", "request", "classification", "platform_policy", "layout", "typography", "components", "states", "accessibility", "platform_mappings"];
const NUMERIC_KEYS = ["screen_inset", "control_height", "minimum_touch_target", "minimum_contrast_ratio"] as const;
const CATEGORY_ALIASES: Record<string, string> = { commerce: "commerce-marketplace", finance: "finance-banking", messaging: "messaging" };
const PATTERN_ALIASES: Record<string, string> = { checkout: "cart-checkout", payment: "payment-coupon", chat: "chat" };

function object(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : undefined;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percent(value: number, total: number): number {
  return total > 0 ? clamp((value / total) * 100) : 0;
}

function statesIn(spec: JsonObject): Set<string> {
  const states = new Set<string>();
  const matrix = object(spec.states);
  if (matrix) for (const values of Object.values(matrix)) for (const value of array(values)) if (typeof value === "string") states.add(value);
  for (const component of array(spec.components)) {
    const row = object(component);
    if (row) for (const value of array(row.states)) if (typeof value === "string") states.add(value);
  }
  return states;
}

function scoreClassification(prompt: EvaluationPrompt, response: SkillResponse): number {
  const classification = object(response.classification) ?? object(object(response.spec)?.classification);
  if (!classification) return 0;
  const category = CATEGORY_ALIASES[String(classification.app_category ?? "")] ?? String(classification.app_category ?? "");
  const patterns = new Set(array(classification.ui_patterns).filter((value): value is string => typeof value === "string").map((value) => PATTERN_ALIASES[value] ?? value));
  const risk = String(classification.risk_level ?? "");
  const categoryScore = prompt.expected.app_categories.includes(category) ? 1 : 0;
  const patternScore = prompt.expected.ui_patterns.length === 0
    ? 1
    : prompt.expected.ui_patterns.filter((pattern) => patterns.has(pattern)).length / prompt.expected.ui_patterns.length;
  const riskScore = prompt.expected.risk_levels.includes(risk) ? 1 : 0;
  return percent(categoryScore + patternScore + riskScore, 3);
}

function scoreSpecCompleteness(response: SkillResponse): number {
  const spec = object(response.spec);
  if (!spec) return 0;
  const present = SPEC_REQUIRED.filter((key) => key in spec).length;
  const hasRequest = object(spec.request) && typeof object(spec.request)?.user_job === "string";
  const hasLayout = object(spec.layout) && object(spec.layout)?.tokens && object(spec.layout)?.alignment_anchors;
  const hasTypography = array(object(spec.typography)?.roles).length > 0;
  const hasComponents = array(spec.components).length > 0;
  const extras = [hasRequest, hasLayout, hasTypography, hasComponents].filter(Boolean).length;
  return percent(present + extras, SPEC_REQUIRED.length + 4);
}

function scoreNumericConsistency(prompt: EvaluationPrompt, response: SkillResponse): number {
  const spec = object(response.spec);
  const contract = object(spec?.numeric_contract) ?? {};
  const layout = object(spec?.layout);
  const tokens = object(layout?.tokens);
  const resolveMeasure = (value: unknown): number | undefined => {
    const row = object(value);
    if (!row) return undefined;
    if (finite(row.value)) return row.value;
    const token = typeof row.token === "string" ? object(tokens?.[row.token]) : undefined;
    return finite(token?.value) ? token.value : undefined;
  };
  const screenInset = finite(contract.screen_inset) ? contract.screen_inset : resolveMeasure(layout?.screen_horizontal_inset);
  const controlHeight = finite(contract.control_height) ? contract.control_height : resolveMeasure(layout?.control_height);
  const target = object(object(spec?.accessibility)?.minimum_touch_target);
  const minimumTarget = finite(contract.minimum_touch_target) ? contract.minimum_touch_target : finite(target?.width) ? target.width : undefined;
  const contrast = finite(contract.minimum_contrast_ratio) ? contract.minimum_contrast_ratio : object(spec?.accessibility)?.minimum_contrast_ratio;
  let passed = 0;
  let total = 0;
  const values: Record<string, unknown> = { screen_inset: screenInset, control_height: controlHeight, minimum_touch_target: minimumTarget, minimum_contrast_ratio: contrast };
  for (const key of NUMERIC_KEYS) {
    total += 1;
    const value = values[key];
    const range = prompt.expected.numeric_ranges[key];
    if (finite(value) && range && value >= range[0] && value <= range[1]) passed += 1;
  }
  const policy = object(spec?.platform_policy);
  total += 2;
  if (finite(policy?.reference_viewport_width) && policy.reference_viewport_width >= prompt.expected.width_range[0] && policy.reference_viewport_width <= prompt.expected.width_range[1]) passed += 1;
  const safe = object(policy?.safe_area);
  if (finite(safe?.top) && finite(safe?.bottom) && safe.unit === "px") passed += 1;
  return percent(passed, total);
}

function scoreRequiredStates(prompt: EvaluationPrompt, response: SkillResponse): number {
  const spec = object(response.spec);
  if (!spec) return 0;
  const actual = statesIn(spec);
  const found = prompt.expected.required_states.filter((state) => actual.has(state)).length;
  return percent(found, prompt.expected.required_states.length);
}

function scoreAccessibility(prompt: EvaluationPrompt, response: SkillResponse): number {
  const spec = object(response.spec);
  const accessibility = object(spec?.accessibility);
  if (!accessibility) return 0;
  const target = object(accessibility.minimum_touch_target);
  const minTarget = prompt.expected.numeric_ranges.minimum_touch_target[0];
  let passed = 0;
  if (finite(accessibility.minimum_contrast_ratio) && accessibility.minimum_contrast_ratio >= prompt.expected.numeric_ranges.minimum_contrast_ratio[0]) passed += 1;
  if (finite(target?.width) && finite(target?.height) && target.width >= minTarget && target.height >= minTarget) passed += 1;
  if (typeof accessibility.screen_reader === "string" && accessibility.screen_reader.trim() !== "") passed += 1;
  if (typeof accessibility.dynamic_text === "string" && accessibility.dynamic_text.trim() !== "") passed += 1;
  return percent(passed, 4);
}

function scorePlatformMapping(prompt: EvaluationPrompt, response: SkillResponse): number {
  const mappings = object(object(response.spec)?.platform_mappings);
  if (!mappings) return 0;
  let passed = 0;
  for (const platform of prompt.expected.platforms) {
    const mapping = object(mappings[platform]);
    if (mapping && typeof mapping.unit === "string" && typeof mapping.safe_area === "string" && mapping.native_substitutions_explicit === true) passed += 1;
  }
  return percent(passed, prompt.expected.platforms.length);
}

function scoreBuildReadiness(response: SkillResponse): number {
  const build = object(object(response.verification)?.build);
  if (!build) return 0;
  const passed = PLATFORM_IDS.filter((platform) => build[platform] === true).length;
  return percent(passed, PLATFORM_IDS.length);
}

function scoreVisibleAcceptance(prompt: EvaluationPrompt, response: SkillResponse): number {
  const acceptance = object(object(response.verification)?.visible_acceptance);
  if (!acceptance) return 0;
  const passed = prompt.expected.acceptance.filter((key) => acceptance[key] === true).length;
  return percent(passed, prompt.expected.acceptance.length);
}

function evaluateCase(prompt: EvaluationPrompt, response: SkillResponse): EvaluationCase {
  const scores: Record<EvaluationDimension, number> = {
    classification: scoreClassification(prompt, response),
    spec_completeness: scoreSpecCompleteness(response),
    numeric_consistency: scoreNumericConsistency(prompt, response),
    required_states: scoreRequiredStates(prompt, response),
    accessibility: scoreAccessibility(prompt, response),
    platform_mapping: scorePlatformMapping(prompt, response),
    build_readiness: scoreBuildReadiness(response),
    visible_acceptance: scoreVisibleAcceptance(prompt, response),
  };
  const failures = DIMENSIONS.filter((dimension) => scores[dimension.id] < dimension.threshold)
    .map((dimension) => `${dimension.id} ${scores[dimension.id]} < ${dimension.threshold}`);
  const total = clamp(DIMENSIONS.reduce((sum, dimension) => sum + scores[dimension.id] * dimension.weight, 0));
  return { prompt_id: prompt.id, tags: prompt.tags, scores, total, passed: failures.length === 0, failures };
}

export function loadEvaluationCorpus(filePath: string): EvaluationCorpus {
  const value = JSON.parse(readFileSync(filePath, "utf8")) as JsonObject;
  if (value.schema_version !== "1.0.0" || typeof value.corpus_id !== "string" || !Array.isArray(value.prompts)) throw new Error("evaluation corpus must use schema version 1.0.0 and contain prompts");
  const ids = new Set<string>();
  const prompts: EvaluationPrompt[] = [];
  for (const [index, item] of value.prompts.entries()) {
    const prompt = object(item);
    if (!prompt || typeof prompt.id !== "string" || ids.has(prompt.id)) throw new Error(`evaluation prompt ${index} has a missing or duplicate id`);
    const expected = object(prompt.expected);
    if (!expected) throw new Error(`evaluation prompt ${prompt.id} is missing expected invariants`);
    ids.add(prompt.id);
    prompts.push({
      id: prompt.id,
      tags: array(prompt.tags).filter((tag): tag is string => typeof tag === "string"),
      request: String(prompt.request ?? ""),
      language: String(prompt.language ?? "en"),
      expected: {
        app_categories: array(expected.app_categories).filter((value): value is string => typeof value === "string"),
        ui_patterns: array(expected.ui_patterns).filter((value): value is string => typeof value === "string"),
        risk_levels: array(expected.risk_levels).filter((value): value is string => typeof value === "string"),
        width_range: [Number(array(expected.width_range)[0]), Number(array(expected.width_range)[1])],
        required_states: array(expected.required_states).filter((value): value is string => typeof value === "string"),
        numeric_ranges: Object.fromEntries(Object.entries(object(expected.numeric_ranges) ?? {}).map(([key, value]) => [key, [Number(array(value)[0]), Number(array(value)[1])] as [number, number]])),
        platforms: array(expected.platforms).filter((value): value is string => typeof value === "string"),
        acceptance: array(expected.acceptance).filter((value): value is string => typeof value === "string"),
      },
    });
  }
  return { schema_version: "1.0.0", corpus_id: value.corpus_id, prompts };
}

function baselineResponse(prompt: EvaluationPrompt): SkillResponse {
  const range = prompt.expected.numeric_ranges;
  const midpoint = (key: string, fallback: number): number => {
    const values = range[key];
    return values ? (values[0] + values[1]) / 2 : fallback;
  };
  const states = prompt.expected.required_states;
  const platforms = Object.fromEntries(prompt.expected.platforms.map((platform) => [platform, {
    unit: platform === "swiftui" ? "pt" : platform === "html_css" ? "px" : "dp",
    safe_area: "system_safe_area",
    native_substitutions_explicit: true,
  }]));
  return {
    prompt_id: prompt.id,
    classification: { app_category: prompt.expected.app_categories[0], ui_patterns: prompt.expected.ui_patterns, risk_level: prompt.expected.risk_levels[0] },
    spec: {
      schema_version: 1,
      id: `${prompt.id}-baseline`,
      request: { language: prompt.language, user_job: "Complete the requested task" },
      classification: { app_category: prompt.expected.app_categories[0], ui_patterns: prompt.expected.ui_patterns, risk_level: prompt.expected.risk_levels[0] },
      platform_policy: { reference_viewport_width: midpoint("reference_viewport", (prompt.expected.width_range[0] + prompt.expected.width_range[1]) / 2), safe_area: { top: 47, bottom: 34, unit: "px" } },
      layout: { tokens: { space_4: { value: midpoint("screen_inset", 16), unit: "px" } }, alignment_anchors: ["screen-leading"] },
      typography: { roles: [{ id: "body", size: { value: 16, unit: "px" } }] },
      components: [{ id: "screen", states }],
      states: { screen: states },
      accessibility: { minimum_contrast_ratio: midpoint("minimum_contrast_ratio", 4.5), minimum_touch_target: { width: midpoint("minimum_touch_target", 44), height: midpoint("minimum_touch_target", 44), unit: "px" }, screen_reader: "labels_from_component_contract", dynamic_text: "reflow_and_wrap" },
      numeric_contract: { screen_inset: midpoint("screen_inset", 16), control_height: midpoint("control_height", 52), minimum_touch_target: midpoint("minimum_touch_target", 44), minimum_contrast_ratio: midpoint("minimum_contrast_ratio", 4.5) },
      platform_mappings: platforms,
    },
    verification: {
      build: Object.fromEntries(PLATFORM_IDS.map((platform) => [platform, true])),
      visible_acceptance: Object.fromEntries(prompt.expected.acceptance.map((key) => [key, true])),
    },
  };
}

export function evaluateSkill(corpus: EvaluationCorpus, responses: SkillResponse[], mode: EvaluationReport["mode"] = "responses"): EvaluationReport {
  const responseByPrompt = new Map(responses.map((response) => [response.prompt_id, response]));
  const cases: EvaluationCase[] = [];
  const errors: string[] = [];
  for (const prompt of corpus.prompts) {
    const response = responseByPrompt.get(prompt.id);
    if (!response) {
      errors.push(`missing response for prompt ${prompt.id}`);
      continue;
    }
    cases.push(evaluateCase(prompt, response));
  }
  const dimensions = DIMENSIONS.map((dimension) => {
    const values = cases.map((item) => item.scores[dimension.id]);
    const passed = values.filter((value) => value >= dimension.threshold).length;
    return { ...dimension, average: values.length ? clamp(values.reduce((sum, value) => sum + value, 0) / values.length) : 0, pass_rate: values.length ? passed / values.length : 0 };
  });
  const overall = cases.length ? clamp(cases.reduce((sum, item) => sum + item.total, 0) / cases.length) : 0;
  const promptPassRate = corpus.prompts.length ? cases.filter((item) => item.passed).length / corpus.prompts.length : 0;
  const blockingValues = dimensions.filter((dimension) => dimension.blocking).map((dimension) => dimension.average);
  const blockingPassRate = blockingValues.length ? blockingValues.filter((value) => value >= THRESHOLDS.blocking_dimension_min).length / blockingValues.length : 0;
  const passed = errors.length === 0 && overall >= THRESHOLDS.overall_min && promptPassRate >= THRESHOLDS.prompt_pass_rate_min && dimensions.filter((dimension) => dimension.blocking).every((dimension) => dimension.average >= dimension.threshold);
  return {
    schema_version: "1.0.0",
    corpus_id: corpus.corpus_id,
    mode,
    release_eligible: mode === "responses" && passed,
    generated_at: "2026-07-11T00:00:00.000Z",
    thresholds: THRESHOLDS,
    summary: { prompt_count: corpus.prompts.length, response_count: responses.length, evaluated_count: cases.length, prompt_pass_rate: promptPassRate, overall_score: overall, blocking_dimension_pass_rate: blockingPassRate },
    dimensions,
    cases,
    errors,
    passed,
  };
}

function markdown(report: EvaluationReport): string {
  const lines = ["# Mobile UI skill effectiveness evaluation", "", `- Status: **${report.passed ? "PASS" : "FAIL"}**`, `- Mode: ${report.mode}`, `- Release eligible: **${report.release_eligible ? "yes" : "no (contract smoke only)"}**`, `- Prompts: ${report.summary.evaluated_count}/${report.summary.prompt_count}`, `- Overall score: ${report.summary.overall_score}/100`, `- Prompt pass rate: ${(report.summary.prompt_pass_rate * 100).toFixed(0)}%`, "", "| Dimension | Average | Pass rate | Blocking |", "| --- | ---: | ---: | :---:|"];
  for (const dimension of report.dimensions) lines.push(`| ${dimension.label} | ${dimension.average}/100 | ${(dimension.pass_rate * 100).toFixed(0)}% | ${dimension.blocking ? "yes" : "no"} |`);
  if (report.errors.length > 0) lines.push("", "## Errors", "", ...report.errors.map((error) => `- ${error}`));
  lines.push("", "## Prompt cases", "", ...report.cases.map((item) => `- ${item.prompt_id}: ${item.passed ? "PASS" : "FAIL"} (${item.total}/100)`));
  return `${lines.join("\n")}\n`;
}

function readResponses(filePath: string): SkillResponse[] {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  const rows = Array.isArray(parsed) ? parsed : object(parsed)?.responses;
  return array(rows).filter((row): row is SkillResponse => !!object(row) && typeof object(row)?.prompt_id === "string");
}

if (process.argv[1]?.endsWith("evaluate-skill.ts")) {
  const root = path.resolve(import.meta.dirname, "../..");
  const corpus = loadEvaluationCorpus(path.join(root, "evaluations/prompts.json"));
  const responseIndex = process.argv.indexOf("--responses");
  const smoke = process.argv.includes("--contract-smoke");
  const responsePath = responseIndex >= 0 ? process.argv[responseIndex + 1] : undefined;
  const invalidResponses = responseIndex >= 0 && (!responsePath || responsePath.startsWith("-"));
  if (invalidResponses) {
    console.error("--responses requires a non-empty response file path.");
    process.exitCode = 1;
  } else if (responseIndex >= 0 && smoke) {
    console.error("Choose either --responses <file> for release evaluation or --contract-smoke for the non-release contract check, not both.");
    process.exitCode = 1;
  } else if (responseIndex < 0 && !smoke) {
    console.error("Release effectiveness requires --responses <file>; use --contract-smoke only for the non-release contract check.");
    process.exitCode = 1;
  } else {
    const responses = responseIndex >= 0 && process.argv[responseIndex + 1]
      ? readResponses(path.resolve(responsePath!))
      : corpus.prompts.map(baselineResponse);
    const report = evaluateSkill(corpus, responses, responseIndex >= 0 ? "responses" : "contract-smoke");
    mkdirSync(path.join(root, "reports"), { recursive: true });
    writeFileSync(path.join(root, "reports/skill-evaluation.json"), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(path.join(root, "reports/skill-evaluation.md"), markdown(report));
    console.log(`${report.passed ? "Skill evaluation passed" : "Skill evaluation failed"}: ${report.summary.overall_score}/100 across ${report.summary.evaluated_count}/${report.summary.prompt_count} prompts (${report.mode})`);
    if (!report.passed) process.exitCode = 1;
  }
}
