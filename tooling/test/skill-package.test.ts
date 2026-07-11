import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const skill = path.join(root, "skills/mobile-ui-generator");
const python = process.env.PYTHON ?? "python3";

test("public mobile skill package has installable metadata and focused references", () => {
  const required = [
    "SKILL.md",
    "agents/openai.yaml",
    "references/request-routing.md",
    "references/layout-foundations.md",
    "references/responsive-and-safe-area.md",
    "references/accessibility.md",
    "references/acceptance-checks.md",
    "references/taxonomy.md",
    "references/pattern-catalog.md",
    "references/domain-guides.md",
    "scripts/search.py",
    "scripts/validate_spec.py",
    "scripts/validate_artifact.py",
    "templates/html-css/index.html.tpl",
    "templates/html-css/styles.css.tpl",
    "templates/html-css/app.js.tpl",
    "templates/react-native/Screen.tsx.tpl",
    "templates/react-native/fixtures.ts.tpl",
    "templates/flutter/screen.dart.tpl",
    "templates/flutter/fixtures.dart.tpl",
    "templates/swiftui/Screen.swift.tpl",
    "templates/swiftui/Fixtures.swift.tpl",
  ];
  for (const rel of required) assert.equal(existsSync(path.join(skill, rel)), true, rel);
  const body = readFileSync(path.join(skill, "SKILL.md"), "utf8");
  assert.match(body, /canonical mobile ui spec/i);
  assert.match(body, /showcase\/all-platforms/);
  assert.match(body, /validate_spec\.py/);
  assert.doesNotMatch(body, /version:\s*0\.6\.0/);
});

test("public skill validators accept a fixture spec and complete artifact manifest", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "mobile-skill-"));
  const spec = path.join(tmp, "spec.json");
  const fixture = path.join(root, "examples/proof/commerce-checkout/spec.json");
  writeFileSync(spec, readFileSync(fixture, "utf8"));
  const specRun = spawnSync(python, [path.join(skill, "scripts/validate_spec.py"), spec], { encoding: "utf8" });
  assert.equal(specRun.status, 0, specRun.stderr || specRun.stdout);

  const artifactDir = path.join(tmp, "artifact");
  mkdirSync(artifactDir);
  writeFileSync(path.join(artifactDir, "index.html"), "<!doctype html><main data-screen-id=\"commerce-checkout-address\"></main>\n");
  writeFileSync(path.join(artifactDir, "styles.css"), ":root{--space-16:16px}\n");
  writeFileSync(path.join(artifactDir, "app.js"), "document.querySelector('main');\n");
  const manifest = path.join(artifactDir, "artifact.json");
  writeFileSync(manifest, JSON.stringify({
    artifact_id: "commerce-checkout-address-html",
    spec_id: "commerce-checkout-address",
    platform: "html-css",
    skill_version: "1.0.0",
    generated_by: "mobile-ui-generator",
    source_files: ["index.html", "styles.css", "app.js"],
  }));
  const artifactRun = spawnSync(python, [path.join(skill, "scripts/validate_artifact.py"), manifest, "--spec", spec], { encoding: "utf8" });
  assert.equal(artifactRun.status, 0, artifactRun.stderr || artifactRun.stdout);
});
