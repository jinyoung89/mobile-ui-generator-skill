#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_MINIMUM_SAMPLES = 5;
const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const schemaRoot = path.join(repositoryRoot, "tooling/schemas");

type JsonSchema = {
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean";
  const?: unknown;
  enum?: unknown[];
  additionalProperties?: boolean;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  minItems?: number;
  uniqueItems?: boolean;
};

type PrivateObservation = {
  source_id: string;
  source_url: string;
  local_path: string;
  credential_fields: { api_key: string; bearer_token: string };
  reviewer_identity: string;
  raw_asset_pointer: string;
  app_specific_copy: string;
  category_id: string;
  pattern_id: string;
  observation_metrics: Record<"content_padding_px" | "card_gap_px" | "bottom_nav_height_px", number>;
  component_rules: string[];
  state_rules: string[];
  confidence: number;
  sample_group: string;
};

type PrivateInput = {
  schema_version: "1.0.0";
  fixture_notice?: string;
  observations: PrivateObservation[];
};

function parseJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}: ${(error as Error).message}`);
  }
}

function validate(value: unknown, schema: JsonSchema, location = "$", errors: string[] = []): string[] {
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${location}: must equal ${JSON.stringify(schema.const)}`);
    return errors;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${location}: must be one of ${schema.enum.join(", ")}`);
    return errors;
  }

  const actualType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  if (schema.type) {
    const typeMatches = schema.type === "integer"
      ? typeof value === "number" && Number.isInteger(value)
      : schema.type === "object"
        ? actualType === "object"
        : actualType === schema.type;
    if (!typeMatches) {
      errors.push(`${location}: expected ${schema.type}, received ${actualType}`);
      return errors;
    }
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location}: string is too short`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${location}: does not match ${schema.pattern}`);
    }
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) errors.push(`${location}: must be finite`);
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${location}: below minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${location}: above maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${location}: too few items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(`${location}: duplicate items are not allowed`);
    }
    if (schema.items) value.forEach((item, index) => validate(item, schema.items!, `${location}[${index}]`, errors));
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(record, required)) errors.push(`${location}: missing ${required}`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(record)) {
        if (!Object.hasOwn(schema.properties ?? {}, key)) errors.push(`${location}: unknown key ${key}`);
      }
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(record, key)) validate(record[key], childSchema, `${location}.${key}`, errors);
    }
  }
  return errors;
}

function parseArguments(argv: string[]) {
  const values = new Map<string, string>();
  const allowed = new Set(["--input", "--output", "--mode", "--min-samples"]);
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(flag) || value === undefined || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${flag ?? "end of command"}`);
    }
    if (values.has(flag)) throw new Error(`Duplicate argument ${flag}`);
    values.set(flag, value);
  }
  const input = values.get("--input");
  const output = values.get("--output");
  if (!input || !output) throw new Error("Usage: --input <external-private.json> --output <safe-staging-directory>");
  const mode = values.get("--mode") ?? "release";
  if (mode !== "release" && mode !== "fixture") throw new Error("--mode must be release or fixture");
  const minimumSamples = Number(values.get("--min-samples") ?? DEFAULT_MINIMUM_SAMPLES);
  if (!Number.isInteger(minimumSamples) || minimumSamples < 1) throw new Error("--min-samples must be a positive integer");
  if (mode === "release" && minimumSamples < DEFAULT_MINIMUM_SAMPLES) {
    throw new Error(`Release minimum sample count cannot be lower than ${DEFAULT_MINIMUM_SAMPLES}`);
  }
  return { input: path.resolve(input), output: path.resolve(output), mode, minimumSamples };
}

function isInside(candidate: string, parent: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertSafePaths(input: string, output: string, mode: string): void {
  const realInput = realpathSync(input);
  if (mode === "release" && isInside(realInput, repositoryRoot)) {
    throw new Error("Release mode requires an external private input outside public repository roots");
  }
  if (!/(?:^|[-_])staging$/i.test(path.basename(output))) {
    throw new Error("Output must be an explicitly named staging directory");
  }
  if (output === path.parse(output).root || output === path.dirname(output)) {
    throw new Error("Refusing unsafe staging directory");
  }
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) {
    throw new Error("Selected staging directory must not be a symlink");
  }
  const stagingParent = path.dirname(output);
  if (existsSync(stagingParent) && lstatSync(stagingParent).isSymbolicLink()) {
    throw new Error("Selected staging directory must not be beneath a symlink");
  }
}

function privateStringKinds(observations: PrivateObservation[]): Map<string, string> {
  const kinds = new Map<string, string>();
  for (const observation of observations) {
    for (const value of [observation.source_id, observation.source_url, observation.raw_asset_pointer]) {
      kinds.set(value, "source-identifying private string");
    }
    for (const value of [observation.app_specific_copy, observation.reviewer_identity, observation.sample_group]) {
      kinds.set(value, "app-specific private string");
    }
    for (const value of Object.values(observation.credential_fields)) {
      kinds.set(value, "credential-like private string");
    }
  }
  return kinds;
}

function assertPublicIdentifier(value: string, privateKinds: Map<string, string>): void {
  if (/^https?:\/\//i.test(value)) throw new Error("Public identifier contains a URL");
  if (path.isAbsolute(value) || /^[a-z]:[\\/]/i.test(value)) throw new Error("Public identifier contains a local path");
  const privateKind = privateKinds.get(value);
  if (privateKind) throw new Error(`Public identifier contains a ${privateKind}`);
  if (!IDENTIFIER_PATTERN.test(value)) throw new Error(`Public identifier is not sanitized: ${value}`);
}

function rounded(value: number): number {
  return Number(value.toFixed(4));
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const interpolated = sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  return rounded(interpolated);
}

function recurringRules(observations: PrivateObservation[], field: "component_rules" | "state_rules"): string[] {
  const counts = new Map<string, number>();
  for (const observation of observations) {
    for (const rule of observation[field]) counts.set(rule, (counts.get(rule) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count / observations.length >= 0.6)
    .map(([rule]) => rule)
    .sort();
}

function buildPublicKnowledge(input: PrivateInput, minimumSamples: number): unknown {
  const groups = new Map<string, PrivateObservation[]>();
  const privateKinds = privateStringKinds(input.observations);
  for (const observation of input.observations) {
    assertPublicIdentifier(observation.category_id, privateKinds);
    assertPublicIdentifier(observation.pattern_id, privateKinds);
    const key = `${observation.category_id}\u0000${observation.pattern_id}`;
    groups.set(key, [...(groups.get(key) ?? []), observation]);
  }

  const patterns = [...groups.values()]
    .filter((observations) => new Set(observations.map((item) => item.sample_group)).size >= minimumSamples)
    .sort((left, right) => {
      const category = left[0].category_id.localeCompare(right[0].category_id);
      return category || left[0].pattern_id.localeCompare(right[0].pattern_id);
    })
    .map((observations) => {
      const metrics = ([
        ["bottom-nav-height-px", "bottom_nav_height_px"],
        ["card-gap-px", "card_gap_px"],
        ["content-padding-px", "content_padding_px"],
      ] as const).map(([metricId, field]) => {
        const values = observations.map((observation) => observation.observation_metrics[field]);
        return {
          distribution: {
            metric_id: metricId,
            minimum: Math.min(...values),
            median: percentile(values, 0.5),
            maximum: Math.max(...values),
          },
          range: {
            metric_id: metricId,
            minimum: percentile(values, 0.25),
            maximum: percentile(values, 0.75),
          },
        };
      });
      const confidence = observations.map((observation) => observation.confidence);
      return {
        category_id: observations[0].category_id,
        pattern_id: observations[0].pattern_id,
        sample_count: observations.length,
        aggregate_distributions: metrics.map((metric) => metric.distribution),
        recommended_ranges: metrics.map((metric) => metric.range),
        recurring_component_rules: recurringRules(observations, "component_rules"),
        recurring_state_rules: recurringRules(observations, "state_rules"),
        confidence_summary: {
          minimum: Math.min(...confidence),
          median: percentile(confidence, 0.5),
          maximum: Math.max(...confidence),
        },
      };
    });

  return {
    schema_version: "1.0.0",
    authored_platform_guidance: true,
    minimum_aggregate_sample_count: minimumSamples,
    patterns,
  };
}

function main(): void {
  const options = parseArguments(process.argv.slice(2));
  assertSafePaths(options.input, options.output, options.mode);

  const privateSchema = parseJson(path.join(schemaRoot, "private-observation-fixture.schema.json")) as JsonSchema;
  const publicSchema = parseJson(path.join(schemaRoot, "public-knowledge.schema.json")) as JsonSchema;
  const privateInput = parseJson(options.input);
  const inputErrors = validate(privateInput, privateSchema);
  if (inputErrors.length > 0) throw new Error(`Input schema validation failed:\n${inputErrors.join("\n")}`);

  const publicKnowledge = buildPublicKnowledge(privateInput as PrivateInput, options.minimumSamples);
  const outputErrors = validate(publicKnowledge, publicSchema);
  if (outputErrors.length > 0) throw new Error(`Output schema validation failed:\n${outputErrors.join("\n")}`);

  if (existsSync(options.output)) rmSync(options.output, { recursive: true, force: false });
  mkdirSync(options.output, { recursive: false });
  writeFileSync(
    path.join(options.output, "public-knowledge.json"),
    `${JSON.stringify(publicKnowledge, null, 2)}\n`,
    { encoding: "utf8", flag: "wx", mode: 0o644 },
  );
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
