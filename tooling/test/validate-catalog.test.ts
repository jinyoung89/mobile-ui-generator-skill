import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { validateCatalog } from "../src/validate-catalog.js";

const root = path.resolve(import.meta.dirname, "../..");
const manifestPath = path.join(root, "catalog/coverage-manifest.json");
const matrixPath = path.join(root, "catalog/pattern-state-matrix.json");
const profilesPath = path.join(root, "catalog/verification-profiles.json");

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

test("validates the release coverage, state, and profile registries", () => {
  const result = validateCatalog(readJson(manifestPath), readJson(matrixPath), readJson(profilesPath));
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);

  const manifest = readJson(manifestPath);
  const pairs = manifest.pairs as unknown[];
  assert.ok(pairs.length >= 80 && pairs.length <= 120, `expected 80-120 pairs, got ${pairs.length}`);
});

test("rejects duplicate pair IDs and unsupported patterns", () => {
  const manifest = readJson(manifestPath);
  const pairs = manifest.pairs as Array<Record<string, unknown>>;
  pairs[1].pair_id = pairs[0].pair_id;
  pairs[2].ui_pattern = "not-a-supported-pattern";
  const result = validateCatalog(manifest, readJson(matrixPath), readJson(profilesPath));
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /duplicate.*pair_id/i);
  assert.match(result.errors.join("\n"), /unsupported.*pattern/i);
});

test("requires rationale, owner, and an evidence basis for every pair", () => {
  const manifest = readJson(manifestPath);
  const pair = (manifest.pairs as Array<Record<string, unknown>>)[0];
  delete pair.rationale;
  delete pair.owner;
  delete pair.basis;
  const result = validateCatalog(manifest, readJson(matrixPath), readJson(profilesPath));
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /rationale/i);
  assert.match(result.errors.join("\n"), /owner/i);
  assert.match(result.errors.join("\n"), /basis|sanitized|product/i);
});

test("rejects invalid state applicability and illegal transitions", () => {
  const matrix = readJson(matrixPath);
  const entries = matrix.entries as Array<Record<string, unknown>>;
  (entries[0].states as Array<Record<string, unknown>>)[0].applicability = "sometimes";
  (matrix.state_transitions as Array<Record<string, unknown>>)[0].to = "published";
  const result = validateCatalog(readJson(manifestPath), matrix, readJson(profilesPath));
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /applicability|required|optional|not_applicable/i);
  assert.match(result.errors.join("\n"), /transition|proposed.*approved|illegal/i);
});

test("rejects missing frequency snapshot and nondeterministic tie rule", () => {
  const manifest = readJson(manifestPath);
  delete manifest.frequency_snapshot;
  const result = validateCatalog(manifest, readJson(matrixPath), readJson(profilesPath));
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /frequency.*snapshot/i);
  assert.match(result.errors.join("\n"), /tie/i);
});

test("rejects placeholder profile values and incomplete named profiles", () => {
  const profiles = readJson(profilesPath);
  const profile = (profiles.profiles as Array<Record<string, unknown>>)[0];
  profile.viewport = { width: "realistic", height: 844 };
  delete profile.safe_area;
  const result = validateCatalog(readJson(manifestPath), readJson(matrixPath), profiles);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /placeholder|numeric|viewport/i);
  assert.match(result.errors.join("\n"), /safe.?area/i);
});

