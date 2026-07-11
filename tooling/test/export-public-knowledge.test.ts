import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, test } from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const exporter = path.join(repositoryRoot, "tooling/src/export-public-knowledge.ts");
const temporaryRoots: string[] = [];

type JsonObject = Record<string, unknown>;

function makeObservation(index: number): JsonObject {
  return {
    source_id: `synthetic-source-${index}`,
    source_url: `https://invalid.example.test/fake-${index}`,
    local_path: `/synthetic/not-real/fake-${index}.png`,
    credential_fields: {
      api_key: `FAKE_API_KEY_${index}`,
      bearer_token: `FAKE_BEARER_TOKEN_${index}`,
    },
    reviewer_identity: `Synthetic Reviewer ${index}`,
    raw_asset_pointer: `fake-asset://${index}`,
    app_specific_copy: `Fictional App ${index} private copy`,
    category_id: "commerce",
    pattern_id: "product-grid",
    observation_metrics: {
      content_padding_px: 16 + index,
      card_gap_px: 8 + index,
      bottom_nav_height_px: 48 + index,
    },
    component_rules: ["card-grid", "persistent-bottom-nav"],
    state_rules: ["loading-skeleton", "empty-state"],
    confidence: 0.8 + index / 100,
    sample_group: `synthetic-group-${index}`,
  };
}

function makeInput(count = 5): JsonObject {
  return {
    schema_version: "1.0.0",
    fixture_notice: "SYNTHETIC TEST DATA ONLY; NOT SOURCE-DERIVED",
    observations: Array.from({ length: count }, (_, index) => makeObservation(index + 1)),
  };
}

function makeTemporaryRoot(): string {
  const root = mkdtempSync(path.join(realpathSync(os.tmpdir()), "public-knowledge-export-"));
  temporaryRoots.push(root);
  return root;
}

function writeInput(root: string, input: JsonObject): string {
  const inputPath = path.join(root, "private-input.json");
  writeFileSync(inputPath, `${JSON.stringify(input, null, 2)}\n`);
  return inputPath;
}

function runExporter(
  input: JsonObject,
  options: { root?: string; output?: string; extraArgs?: string[] } = {},
) {
  const root = options.root ?? makeTemporaryRoot();
  const inputPath = writeInput(root, input);
  const output = options.output ?? path.join(root, "public-knowledge-staging");
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      exporter,
      "--input",
      inputPath,
      "--output",
      output,
      "--mode",
      "release",
      ...(options.extraArgs ?? []),
    ],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  return { ...result, inputPath, output, root };
}

afterEach(() => {
  while (temporaryRoots.length > 0) {
    rmSync(temporaryRoots.pop()!, { recursive: true, force: true });
  }
});

test("exports deterministic allowlist-only aggregate knowledge", () => {
  const first = runExporter(makeInput());
  assert.equal(first.status, 0, first.stderr);
  const firstOutputPath = path.join(first.output, "public-knowledge.json");
  const firstText = readFileSync(firstOutputPath, "utf8");
  const firstOutput = JSON.parse(firstText) as JsonObject;

  assert.deepEqual(Object.keys(firstOutput), [
    "schema_version",
    "authored_platform_guidance",
    "minimum_aggregate_sample_count",
    "patterns",
  ]);
  assert.equal((firstOutput.patterns as JsonObject[]).length, 1);
  assert.deepEqual(Object.keys((firstOutput.patterns as JsonObject[])[0]), [
    "category_id",
    "pattern_id",
    "sample_count",
    "aggregate_distributions",
    "recommended_ranges",
    "recurring_component_rules",
    "recurring_state_rules",
    "confidence_summary",
  ]);

  for (const forbidden of [
    "synthetic-source-1",
    "invalid.example.test",
    "/synthetic/not-real",
    "FAKE_API_KEY",
    "FAKE_BEARER_TOKEN",
    "Synthetic Reviewer",
    "fake-asset://",
    "Fictional App",
    "synthetic-group",
  ]) {
    assert.equal(firstText.includes(forbidden), false, forbidden);
  }

  const second = runExporter(makeInput());
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(path.join(second.output, "public-knowledge.json"), "utf8"), firstText);
});

test("rejects private strings promoted into public identifiers", () => {
  for (const [field, value, message] of [
    ["category_id", "https://private.example.test/path", /URL/i],
    ["pattern_id", "/Users/private/source.png", /local path/i],
    ["category_id", "FAKE_API_KEY_1", /credential|private string/i],
    ["pattern_id", "Fictional App 1 private copy", /app-specific|identifier/i],
    ["category_id", "synthetic-source-1", /source-identifying|private string/i],
  ] as const) {
    const input = makeInput();
    (input.observations as JsonObject[])[0][field] = value;
    const result = runExporter(input);
    assert.notEqual(result.status, 0, `${field}=${value}`);
    assert.match(result.stderr, message);
    assert.equal(existsSync(result.output), false);
  }
});

test("rejects private strings leaked across observation records", () => {
  const input = makeInput();
  const observations = input.observations as JsonObject[];
  (observations[0].credential_fields as JsonObject).api_key = "private-token";
  observations[1].category_id = "private-token";
  const result = runExporter(input);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /credential|private string/i);
  assert.equal(existsSync(result.output), false);
});

test("rejects private values in recurring rule channels", () => {
  const cases = [
    {
      privateField: (observations: JsonObject[]) => {
        (observations[0].credential_fields as JsonObject).api_key = "private-token";
      },
      ruleField: "component_rules",
      rule: "private-token",
    },
    {
      privateField: (observations: JsonObject[]) => {
        observations[0].source_id = "source-token";
      },
      ruleField: "state_rules",
      rule: "contains-source-token",
    },
    {
      privateField: (observations: JsonObject[]) => {
        observations[0].app_specific_copy = "app-copy-token";
      },
      ruleField: "component_rules",
      rule: "app-copy-token-card",
    },
  ] as const;

  for (const reproduction of cases) {
    const input = makeInput();
    const observations = input.observations as JsonObject[];
    reproduction.privateField(observations);
    for (const observation of observations) observation[reproduction.ruleField] = [reproduction.rule];
    const result = runExporter(input);
    assert.notEqual(result.status, 0, reproduction.rule);
    assert.match(result.stderr, /public rule.*private string|private value.*rule/i);
    assert.equal(existsSync(result.output), false);
  }
});

test("omits aggregates below the conservative minimum sample count", () => {
  const result = runExporter(makeInput(4));
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(
    readFileSync(path.join(result.output, "public-knowledge.json"), "utf8"),
  ) as JsonObject;
  assert.deepEqual(output.patterns, []);
  assert.equal(output.minimum_aggregate_sample_count, 5);
});

test("fails closed on unknown private input keys", () => {
  const input = makeInput();
  (input.observations as JsonObject[])[0].unexpected_private_key = "must fail";
  const result = runExporter(input);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /input schema validation.*unexpected_private_key/is);
  assert.equal(existsSync(result.output), false);
});

test("fails closed when generated public output violates its schema", () => {
  const input = makeInput();
  for (const observation of input.observations as JsonObject[]) {
    observation.component_rules = ["Not a sanitized rule"];
  }
  const result = runExporter(input);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /output schema validation/i);
  assert.equal(existsSync(result.output), false);
});

test("cleans only the selected non-empty staging directory", () => {
  const root = makeTemporaryRoot();
  const output = path.join(root, "public-knowledge-staging");
  mkdirSync(output);
  writeFileSync(path.join(output, "stale.txt"), "stale");
  const sibling = path.join(root, "must-survive.txt");
  writeFileSync(sibling, "keep");

  const result = runExporter(makeInput(), { root, output });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(path.join(output, "stale.txt")), false);
  assert.equal(readFileSync(sibling, "utf8"), "keep");
  assert.deepEqual(readdirSync(output), ["public-knowledge.json"]);
});

test("does not follow staging symlinks or create read-through links", () => {
  const root = makeTemporaryRoot();
  const outside = path.join(root, "outside");
  mkdirSync(outside);
  writeFileSync(path.join(outside, "secret.txt"), "keep");
  const output = path.join(root, "public-knowledge-staging");
  symlinkSync(outside, output);

  const result = runExporter(makeInput(), { root, output });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /staging.*symlink/i);
  assert.equal(readFileSync(path.join(outside, "secret.txt"), "utf8"), "keep");
});

test("rejects a staging directory beneath a symlinked parent", () => {
  const root = makeTemporaryRoot();
  const outside = path.join(root, "outside");
  mkdirSync(outside);
  const linkedParent = path.join(root, "linked-parent");
  symlinkSync(outside, linkedParent);
  const output = path.join(linkedParent, "public-knowledge-staging");

  const result = runExporter(makeInput(), { root, output });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /staging.*symlink/i);
  assert.deepEqual(readdirSync(outside), []);
});

test("rejects a deep symlink ancestor of the staging directory", () => {
  const root = makeTemporaryRoot();
  const outside = path.join(root, "outside");
  mkdirSync(path.join(outside, "nested/deep"), { recursive: true });
  const linkedParent = path.join(root, "linked-parent");
  symlinkSync(outside, linkedParent);
  const output = path.join(linkedParent, "nested/deep/public-knowledge-staging");

  const result = runExporter(makeInput(), { root, output });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /staging.*symlink ancestor/i);
  assert.deepEqual(readdirSync(path.join(outside, "nested/deep")), []);
});

test("release mode rejects a repo-local symlink to external private input", () => {
  const root = makeTemporaryRoot();
  const inputPath = writeInput(root, makeInput());
  const linkedInputRoot = path.join(repositoryRoot, "tooling/test/.external-private-link");
  const output = path.join(root, "public-knowledge-staging");
  symlinkSync(root, linkedInputRoot);
  try {
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        exporter,
        "--input",
        path.join(linkedInputRoot, path.basename(inputPath)),
        "--output",
        output,
        "--mode",
        "release",
      ],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /input.*symlink ancestor|lexically external/i);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(linkedInputRoot, { force: true });
  }
});

test("release input does not have to claim it is a synthetic fixture", () => {
  const input = makeInput();
  delete input.fixture_notice;
  const result = runExporter(input);
  assert.equal(result.status, 0, result.stderr);
});

test("release mode requires external input and forbids lowering the threshold", () => {
  const publicInput = path.join(repositoryRoot, "tooling/test/public-input.json");
  writeFileSync(publicInput, `${JSON.stringify(makeInput())}\n`);
  try {
    const root = makeTemporaryRoot();
    const output = path.join(root, "public-knowledge-staging");
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", exporter, "--input", publicInput, "--output", output, "--mode", "release"],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /external private input/i);
  } finally {
    rmSync(publicInput, { force: true });
  }

  const lowered = runExporter(makeInput(), { extraArgs: ["--min-samples", "4"] });
  assert.notEqual(lowered.status, 0);
  assert.match(lowered.stderr, /cannot be lower than 5/i);
});
