#!/usr/bin/env node

import Ajv2020Module from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
import path from "node:path";

type JsonObject = Record<string, unknown>;
export type CatalogValidationResult = { valid: boolean; errors: string[] };
type Validator = ((value: unknown) => boolean) & { errors?: Array<{ instancePath?: string; message?: string }> };
type AjvLike = { compile(schema: unknown): Validator };

const Ajv = Ajv2020Module as unknown as new (options?: Record<string, unknown>) => AjvLike;
const root = path.resolve(import.meta.dirname, "../..");
const transitionOrder = ["proposed", "approved", "generated", "build_verified", "render_verified", "published"];
const profileNames = ["compact", "standard", "large", "dark", "short-keyboard", "large-text", "long-copy-ko", "long-copy-en"];
const placeholder = /^(?:realistic|agreed|designated|tbd|todo|pending|unknown|fill.?me)$/i;

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function schemaErrors(value: unknown, fileName: string, schemaPath: string, errors: string[]): void {
  const schema = readJson(path.join(root, schemaPath));
  const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
  if (!validate(value)) {
    for (const error of validate.errors ?? []) errors.push(`${fileName}${error.instancePath ?? "$"}: ${error.message ?? "schema violation"}`);
  }
}

function object(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : undefined;
}

function add(errors: string[], message: string): void { errors.push(message); }

function validateManifest(manifest: JsonObject, matrix: JsonObject, errors: string[]): void {
  schemaErrors(manifest, "coverage-manifest", "tooling/schemas/coverage-manifest.schema.json", errors);
  const categories = Array.isArray(manifest.supported_categories) ? manifest.supported_categories : [];
  const patterns = Array.isArray(manifest.supported_patterns) ? manifest.supported_patterns : [];
  const categoryIds = new Set(categories.map((item) => object(item)?.id).filter((id): id is string => typeof id === "string"));
  const patternIds = new Set(patterns.map((item) => object(item)?.id).filter((id): id is string => typeof id === "string"));
  if (categoryIds.size !== categories.length) add(errors, "coverage-manifest: duplicate category id");
  if (patternIds.size !== patterns.length) add(errors, "coverage-manifest: duplicate pattern id");
  const pairs = Array.isArray(manifest.pairs) ? manifest.pairs : [];
  const pairIds = new Set<string>();
  const frequencyRanks = new Set<number>();
  const entries = new Map<string, Map<string, string>>();
  for (const entry of Array.isArray(matrix.entries) ? matrix.entries : []) {
    const row = object(entry);
    const states = new Map<string, string>();
    if (row && typeof row.ui_pattern === "string" && Array.isArray(row.states)) {
      for (const state of row.states) {
        const stateRow = object(state);
        if (stateRow && typeof stateRow.id === "string" && typeof stateRow.applicability === "string") states.set(stateRow.id, stateRow.applicability);
      }
      entries.set(row.ui_pattern, states);
    }
  }
  const snapshot = object(manifest.frequency_snapshot);
  const snapshotVersion = snapshot?.version;
  if (!snapshot || typeof snapshot.tie_rule !== "string" || snapshot.tie_rule.trim() === "") add(errors, "coverage-manifest: frequency snapshot and deterministic tie rule are required");
  for (const [index, item] of pairs.entries()) {
    const pair = object(item);
    if (!pair) continue;
    const label = `coverage-manifest.pairs[${index}]`;
    const id = pair.pair_id;
    if (typeof id === "string") {
      if (pairIds.has(id)) add(errors, `${label}: duplicate pair_id ${id}`);
      pairIds.add(id);
    }
    if (typeof pair.app_category === "string" && !categoryIds.has(pair.app_category)) add(errors, `${label}: unsupported app category ${pair.app_category}`);
    if (typeof pair.ui_pattern === "string") {
      if (!patternIds.has(pair.ui_pattern)) add(errors, `${label}: unsupported pattern ${pair.ui_pattern}`);
      const states = entries.get(pair.ui_pattern);
      if (!states) add(errors, `${label}: missing pattern-state matrix entry for ${pair.ui_pattern}`);
      else if (Array.isArray(pair.required_states)) for (const state of pair.required_states) {
        const applicability = states.get(String(state));
        if (!applicability) add(errors, `${label}: state ${String(state)} absent from pattern-state matrix`);
        else if (applicability === "not_applicable") add(errors, `${label}: state ${String(state)} is not_applicable for ${pair.ui_pattern}`);
      }
    }
    if (typeof pair.rationale !== "string" || pair.rationale.trim() === "") add(errors, `${label}: rationale is required`);
    if (typeof pair.owner !== "string" || pair.owner.trim() === "") add(errors, `${label}: owner is required`);
    const basis = object(pair.basis);
    if (!basis || !["sanitized_knowledge", "product_rationale"].includes(String(basis.kind))) add(errors, `${label}: sanitized knowledge or product rationale basis is required`);
    if (basis && snapshotVersion && basis.snapshot_version !== snapshotVersion) add(errors, `${label}: basis snapshot version must match frequency snapshot`);
    if (typeof pair.frequency_rank === "number") {
      if (frequencyRanks.has(pair.frequency_rank)) add(errors, `${label}: duplicate frequency_rank ${pair.frequency_rank}`);
      frequencyRanks.add(pair.frequency_rank);
    }
  }
  const proofPairs = Array.isArray(manifest.proof_pairs) ? manifest.proof_pairs : [];
  const proofSet = new Set(pairIds);
  for (const proofId of proofPairs) if (typeof proofId !== "string" || !proofSet.has(proofId)) add(errors, `coverage-manifest: proof pair ${String(proofId)} is not present in pairs`);
  if (proofPairs.length === 5) {
    const proofRows = proofPairs.map((id) => pairs.find((pair) => object(pair)?.pair_id === id)).map(object);
    const archetypes = new Set(proofRows.map((row) => row?.layout_archetype).filter((value): value is string => typeof value === "string"));
    for (const required of ["form", "map-overlay", "feed", "chat"]) if (!archetypes.has(required)) add(errors, `coverage-manifest: proof pairs must cover ${required} archetype`);
    if (!proofRows.some((row) => row?.app_category === "commerce-marketplace")) add(errors, "coverage-manifest: proof pairs must include commerce category");
  }
}

function validateMatrix(matrix: JsonObject, manifest: JsonObject, errors: string[]): void {
  schemaErrors(matrix, "pattern-state-matrix", "tooling/schemas/pattern-state-matrix.schema.json", errors);
  const catalog = new Set(Array.isArray(matrix.state_catalog) ? matrix.state_catalog.map(String) : []);
  const transitions = Array.isArray(matrix.state_transitions) ? matrix.state_transitions : [];
  const expected = transitionOrder.slice(0, -1).map((from, index) => ({ from, to: transitionOrder[index + 1] }));
  if (JSON.stringify(transitions) !== JSON.stringify(expected)) add(errors, "pattern-state-matrix: illegal state transition; legal transitions are proposed -> approved -> generated -> build_verified -> render_verified -> published");
  const entryIds = new Set<string>();
  for (const [index, entry] of (Array.isArray(matrix.entries) ? matrix.entries : []).entries()) {
    const row = object(entry);
    if (!row) continue;
    const pattern = row.ui_pattern;
    if (typeof pattern === "string") {
      if (entryIds.has(pattern)) add(errors, `pattern-state-matrix.entries[${index}]: duplicate pattern ${pattern}`);
      entryIds.add(pattern);
    }
    if (!Array.isArray(row.states) || row.states.length === 0) continue;
    const stateIds = new Set<string>();
    for (const state of row.states) {
      const stateRow = object(state);
      if (!stateRow) continue;
      const id = stateRow.id;
      const applicability = stateRow.applicability;
      if (typeof id === "string") {
        if (stateIds.has(id)) add(errors, `pattern-state-matrix.entries[${index}]: duplicate state ${id}`);
        stateIds.add(id);
        if (!catalog.has(id)) add(errors, `pattern-state-matrix.entries[${index}]: unsupported state ${id}`);
      }
      if (!new Set(["required", "optional", "not_applicable"]).has(String(applicability))) add(errors, `pattern-state-matrix.entries[${index}]: applicability must be required, optional, or not_applicable`);
    }
  }
  const patterns = new Set((Array.isArray(manifest.supported_patterns) ? manifest.supported_patterns : []).map((item) => object(item)?.id).filter((id): id is string => typeof id === "string"));
  for (const pattern of patterns) if (!entryIds.has(pattern)) add(errors, `pattern-state-matrix: missing entry for supported pattern ${pattern}`);
}

function validateProfiles(profiles: JsonObject, errors: string[]): void {
  schemaErrors(profiles, "verification-profiles", "tooling/schemas/verification-profiles.schema.json", errors);
  const contract = object(profiles.dimensions_contract);
  if (contract?.viewport_units !== "logical_css_or_points" || contract.capture_units !== "physical_pixels" || contract.capture_rule !== "capture.width = viewport.width * pixel_ratio and capture.height = viewport.height * pixel_ratio") add(errors, "verification-profiles: logical viewport and physical capture dimensions contract is required");
  const rows = Array.isArray(profiles.profiles) ? profiles.profiles : [];
  const ids = new Set<string>();
  const byPlatform = new Map<string, Set<string>>();
  for (const [index, item] of rows.entries()) {
    const profile = object(item);
    if (!profile) continue;
    const label = `verification-profiles.profiles[${index}]`;
    const id = String(profile.profile_id ?? "");
    if (ids.has(id)) add(errors, `${label}: duplicate profile_id ${id}`);
    ids.add(id);
    const platform = String(profile.platform ?? "");
    const name = String(profile.profile ?? "");
    const values = byPlatform.get(platform) ?? new Set<string>();
    values.add(name); byPlatform.set(platform, values);
    const viewport = object(profile.viewport);
    const expected: Record<string, [number, number]> = { compact: [320, 568], standard: [390, 844], large: [430, 932], dark: [390, 844], "short-keyboard": [390, 667], "large-text": [390, 844], "long-copy-ko": [390, 844], "long-copy-en": [390, 844] };
    const dimensions = expected[name];
    if (dimensions && (viewport?.width !== dimensions[0] || viewport?.height !== dimensions[1])) add(errors, `${label}: ${name} profile has incorrect concrete viewport`);
    const capture = object(profile.capture);
    const ratio = Number(profile.pixel_ratio);
    if (viewport && capture && Number.isFinite(ratio) && (capture.width !== Number(viewport.width) * ratio || capture.height !== Number(viewport.height) * ratio)) add(errors, `${label}: capture dimensions must equal logical viewport multiplied by pixel_ratio`);
    const safe = object(profile.safe_area);
    if (!safe || ["top", "right", "bottom", "left"].some((key) => typeof safe[key] !== "number" || Number(safe[key]) < 0)) add(errors, `${label}: safe-area values must be concrete numeric values`);
    const walk = (value: unknown, location: string): void => {
      if (typeof value === "string" && placeholder.test(value.trim())) add(errors, `${location}: placeholder profile value is not allowed`);
      else if (Array.isArray(value)) value.forEach((child, childIndex) => walk(child, `${location}[${childIndex}]`));
      else if (value && typeof value === "object") Object.entries(value).forEach(([key, child]) => walk(child, `${location}.${key}`));
    };
    walk(profile, label);
    if (platform === "ios" && (profile.os_version !== "17.2" || typeof profile.simulator_udid !== "string")) add(errors, `${label}: iOS 17.2 simulator identity is required`);
    if (platform === "android" && (profile.api_level !== 34 || profile.avd_name !== "mobile_ui_api34" || profile.device_name !== "Pixel 7")) add(errors, `${label}: Android API 34 Pixel 7 emulator identity is required`);
    if (platform === "web" && (typeof profile.browser !== "string" || typeof profile.browser_version !== "string")) add(errors, `${label}: concrete browser identity is required`);
  }
  for (const platform of ["web", "ios", "android"]) {
    const names = byPlatform.get(platform) ?? new Set<string>();
    for (const name of profileNames) if (!names.has(name)) add(errors, `verification-profiles: ${platform} missing ${name} profile`);
  }
}

export function validateCatalog(manifest: unknown, matrix: unknown, profiles: unknown): CatalogValidationResult {
  const errors: string[] = [];
  const manifestObject = object(manifest);
  const matrixObject = object(matrix);
  const profilesObject = object(profiles);
  if (!manifestObject) errors.push("coverage-manifest: expected object");
  if (!matrixObject) errors.push("pattern-state-matrix: expected object");
  if (!profilesObject) errors.push("verification-profiles: expected object");
  if (manifestObject && matrixObject) validateManifest(manifestObject, matrixObject, errors);
  if (matrixObject && manifestObject) validateMatrix(matrixObject, manifestObject, errors);
  if (profilesObject) validateProfiles(profilesObject, errors);
  return { valid: errors.length === 0, errors };
}

if (process.argv[1]?.endsWith("validate-catalog.ts")) {
  const result = validateCatalog(
    readJson(path.join(root, "catalog/coverage-manifest.json")),
    readJson(path.join(root, "catalog/pattern-state-matrix.json")),
    readJson(path.join(root, "catalog/verification-profiles.json")),
  );
  if (!result.valid) { console.error(result.errors.join("\n")); process.exitCode = 1; }
  else console.log("Catalog validation passed");
}
