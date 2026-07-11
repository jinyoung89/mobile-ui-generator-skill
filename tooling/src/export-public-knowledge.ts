#!/usr/bin/env node

import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
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

type Identity = { path: string; dev: number; ino: number };
type InputSnapshot = { realPath: string; file: Identity; ancestors: Identity[] };

function identity(filePath: string): Identity {
  const value = lstatSync(filePath);
  if (value.isSymbolicLink()) throw new Error(`Path identity is a symlink: ${filePath}`);
  return { path: filePath, dev: value.dev, ino: value.ino };
}

function captureInputSnapshot(filePath: string): InputSnapshot {
  const ancestors: Identity[] = [];
  for (let current = path.dirname(filePath); ; current = path.dirname(current)) {
    ancestors.push(identity(current));
    if (current === path.dirname(current)) break;
  }
  return { realPath: realpathSync(filePath), file: identity(filePath), ancestors };
}

function assertIdentityUnchanged(expected: Identity): void {
  const current = identity(expected.path);
  if (current.dev !== expected.dev || current.ino !== expected.ino) {
    throw new Error(`Path identity changed during secure read: ${expected.path}`);
  }
}

function parsePrivateJsonSecure(filePath: string, snapshot: InputSnapshot): unknown {
  const noFollow = constants.O_NOFOLLOW ?? 0;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(filePath, constants.O_RDONLY | noFollow);
    const opened = fstatSync(descriptor);
    if (!opened.isFile()) throw new Error("Private input must be a regular file");
    if (opened.dev !== snapshot.file.dev || opened.ino !== snapshot.file.ino) {
      throw new Error("Private input identity changed before secure open");
    }
    for (const ancestor of snapshot.ancestors) assertIdentityUnchanged(ancestor);
    if (realpathSync(filePath) !== snapshot.realPath) throw new Error("Private input resolved path changed during secure read");
    return JSON.parse(readFileSync(descriptor, "utf8"));
  } catch (error) {
    throw new Error(`Unable to securely read private JSON: ${(error as Error).message}`);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
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

function assertNoSymlinkAncestors(candidate: string, label: "input" | "staging"): void {
  for (let current = path.resolve(candidate); ; current = path.dirname(current)) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) {
      throw new Error(`Selected ${label} path has a symlink ancestor: ${current}`);
    }
    if (current === path.dirname(current)) return;
  }
}

function assertSafePaths(input: string, output: string, mode: string): InputSnapshot {
  assertNoSymlinkAncestors(input, "input");
  assertNoSymlinkAncestors(output, "staging");
  if (mode === "release" && isInside(input, repositoryRoot)) {
    throw new Error("Release mode requires an external private input outside public repository roots");
  }
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
  return captureInputSnapshot(input);
}

type PrivateString = { value: string; kind: string; allowDelimitedMatch: boolean };

function canonical(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US");
}

function privateStringKinds(input: PrivateInput): PrivateString[] {
  const kinds = new Map<string, PrivateString>();
  const add = (value: string, kind: string, allowDelimitedMatch: boolean) => {
    const normalized = canonical(value);
    if (normalized) kinds.set(`${kind}\u0000${normalized}`, { value: normalized, kind, allowDelimitedMatch });
  };
  if (input.fixture_notice) add(input.fixture_notice, "private fixture string", true);
  for (const observation of input.observations) {
    add(observation.source_id, "source-identifying private string", true);
    add(observation.source_url, "source-identifying private string", true);
    add(observation.local_path, "source-identifying private string", true);
    add(observation.raw_asset_pointer, "source-identifying private string", true);
    for (const value of [observation.app_specific_copy, observation.reviewer_identity, observation.sample_group]) {
      add(value, "app-specific private string", true);
    }
    for (const value of Object.values(observation.credential_fields)) {
      add(value, "credential-like private string", true);
    }
  }
  return [...kinds.values()];
}

function assertNoPrivateString(value: string, privateKinds: PrivateString[], label: string): void {
  const normalized = canonical(value);
  for (const privateValue of privateKinds) {
    const exact = normalized === privateValue.value;
    const escaped = privateValue.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const delimited = privateValue.allowDelimitedMatch && privateValue.value.length >= 4
      && new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "u").test(normalized);
    if (exact || delimited) throw new Error(`${label} contains a ${privateValue.kind}`);
  }
}

function assertPublicIdentifier(value: string, privateKinds: PrivateString[]): void {
  if (/^https?:\/\//i.test(value)) throw new Error("Public identifier contains a URL");
  if (path.isAbsolute(value) || /^[a-z]:[\\/]/i.test(value)) throw new Error("Public identifier contains a local path");
  assertNoPrivateString(value, privateKinds, "Public identifier");
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

function recurringRules(groups: PrivateObservation[][], field: "component_rules" | "state_rules"): string[] {
  const counts = new Map<string, number>();
  for (const observations of groups) {
    const present = new Set(observations.flatMap((observation) => observation[field]));
    for (const rule of present) counts.set(rule, (counts.get(rule) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count / groups.length >= 0.6)
    .map(([rule]) => rule)
    .sort();
}

function groupBySample(observations: PrivateObservation[]): PrivateObservation[][] {
  const grouped = new Map<string, PrivateObservation[]>();
  for (const observation of observations) {
    grouped.set(observation.sample_group, [...(grouped.get(observation.sample_group) ?? []), observation]);
  }
  return [...grouped.values()];
}

function buildPublicKnowledge(input: PrivateInput, minimumSamples: number): unknown {
  const groups = new Map<string, PrivateObservation[]>();
  const privateKinds = privateStringKinds(input);
  for (const observation of input.observations) {
    assertPublicIdentifier(observation.category_id, privateKinds);
    assertPublicIdentifier(observation.pattern_id, privateKinds);
    for (const rule of [...observation.component_rules, ...observation.state_rules]) {
      assertNoPrivateString(rule, privateKinds, "Public rule");
    }
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
      const independentGroups = groupBySample(observations);
      const metrics = ([
        ["bottom-nav-height-px", "bottom_nav_height_px"],
        ["card-gap-px", "card_gap_px"],
        ["content-padding-px", "content_padding_px"],
      ] as const).map(([metricId, field]) => {
        const values = independentGroups.map((group) => percentile(
          group.map((observation) => observation.observation_metrics[field]),
          0.5,
        ));
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
      const confidence = independentGroups.map((group) => percentile(
        group.map((observation) => observation.confidence),
        0.5,
      ));
      return {
        category_id: observations[0].category_id,
        pattern_id: observations[0].pattern_id,
        sample_count: independentGroups.length,
        aggregate_distributions: metrics.map((metric) => metric.distribution),
        recommended_ranges: metrics.map((metric) => metric.range),
        recurring_component_rules: recurringRules(independentGroups, "component_rules"),
        recurring_state_rules: recurringRules(independentGroups, "state_rules"),
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
  const inputSnapshot = assertSafePaths(options.input, options.output, options.mode);

  const privateSchema = parseJson(path.join(schemaRoot, "private-observation-fixture.schema.json")) as JsonSchema;
  const publicSchema = parseJson(path.join(schemaRoot, "public-knowledge.schema.json")) as JsonSchema;
  const privateInput = parsePrivateJsonSecure(options.input, inputSnapshot);
  const inputErrors = validate(privateInput, privateSchema);
  if (inputErrors.length > 0) throw new Error(`Input schema validation failed:\n${inputErrors.join("\n")}`);

  const publicKnowledge = buildPublicKnowledge(privateInput as PrivateInput, options.minimumSamples);
  const outputErrors = validate(publicKnowledge, publicSchema);
  if (outputErrors.length > 0) throw new Error(`Output schema validation failed:\n${outputErrors.join("\n")}`);

  replaceOwnedStaging(options.output, `${JSON.stringify(publicKnowledge, null, 2)}\n`);
}

type FileStats = NonNullable<ReturnType<typeof statSync>>;

function requiredStat(filePath: string): FileStats {
  const value = statSync(filePath);
  if (!value) throw new Error(`Unable to stat required path: ${filePath}`);
  return value;
}

function sameIdentity(left: FileStats, right: FileStats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function replaceOwnedStaging(output: string, contents: string): void {
  const parent = path.dirname(output);
  const parentBefore = requiredStat(parent);
  const lock = path.join(parent, ".public-knowledge-export.lock");
  const marker = ".public-knowledge-export-owned";
  mkdirSync(lock, { recursive: false, mode: 0o700 });
  let next: string | undefined;
  let previous: string | undefined;
  let published = false;
  try {
    const parentAfterLock = requiredStat(parent);
    if (!sameIdentity(parentBefore, parentAfterLock) || realpathSync(parent) !== parent) {
      throw new Error("Staging parent identity changed during export");
    }
    if (existsSync(output)) {
      const outputStat = lstatSync(output);
      if (!outputStat.isDirectory() || outputStat.isSymbolicLink()) throw new Error("Existing staging path is not an owned directory");
      if (!existsSync(path.join(output, marker))) throw new Error("Existing staging directory is not owned by this exporter");
    }
    next = mkdtempSync(path.join(parent, ".public-knowledge-next-"));
    writeFileSync(path.join(next, marker), "owned\n", { encoding: "utf8", flag: "wx", mode: 0o600 });
    const outputFile = path.join(next, "public-knowledge.json");
    const descriptor = openSync(outputFile, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o644);
    try {
      writeFileSync(descriptor, contents, "utf8");
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    if (!sameIdentity(parentBefore, requiredStat(parent))) throw new Error("Staging parent identity changed before publish");
    if (existsSync(output)) {
      previous = `${output}.previous-${process.pid}`;
      renameSync(output, previous);
    }
    if (process.env.PUBLIC_KNOWLEDGE_TEST_FAIL_PUBLISH === "1") {
      throw new Error("Injected publish failure for rollback verification");
    }
    renameSync(next, output);
    next = undefined;
    published = true;
    if (previous) {
      const previousStat = lstatSync(previous);
      if (!previousStat.isDirectory() || previousStat.isSymbolicLink()) throw new Error("Previous staging identity changed");
      rmSync(previous, { recursive: true, force: false });
      previous = undefined;
    }
  } finally {
    if (next && existsSync(next) && !lstatSync(next).isSymbolicLink()) rmSync(next, { recursive: true, force: true });
    if (!published && previous && existsSync(previous) && !existsSync(output)) {
      renameSync(previous, output);
      previous = undefined;
    }
    if (published && previous && existsSync(previous) && !lstatSync(previous).isSymbolicLink()) {
      rmSync(previous, { recursive: true, force: true });
    }
    if (existsSync(lock) && !lstatSync(lock).isSymbolicLink()) rmdirSync(lock);
  }
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
