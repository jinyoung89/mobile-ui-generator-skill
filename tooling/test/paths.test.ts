import assert from "node:assert/strict";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  artifactRoot,
  cleanStagingRoot,
  docsOutputPath,
  repositoryRoot,
  resolvePublicPath,
  siteOutputPath,
} from "../src/paths.js";

test("repository paths stay in public, non-ignored locations", () => {
  const root = repositoryRoot();

  assert.equal(cleanStagingRoot(), `${root}/artifacts/staging`);
  assert.equal(artifactRoot(), `${root}/artifacts`);
  assert.equal(docsOutputPath(), `${root}/docs`);
  assert.equal(siteOutputPath(), `${root}/site`);
});

test("public path resolution rejects private and local-only repository paths", () => {
  for (const path of [
    "data/screenshots",
    "output/render.png",
    "src/provider.ts",
    "tests/provider.test.ts",
    "docs/LOCAL_WORKFLOW.md",
    ".env",
    "nested/../data/private.json",
  ]) {
    assert.throws(() => resolvePublicPath(path), /sensitive or private|allowed public root/);
  }
});

test("public path resolution cannot escape the repository", () => {
  assert.throws(() => resolvePublicPath("../outside"), /outside the repository/);
  assert.throws(() => resolvePublicPath(path.join(os.tmpdir(), "outside")), /outside the repository/);
});

test("public path resolution permits only planned public roots", () => {
  for (const publicPath of [
    "docs/index.html",
    "site/index.html",
    "skills/mobile-ui-generator/SKILL.md",
    "examples/specs/example.json",
    "catalog/index.json",
    "reports/tdd/evidence.md",
    "tooling/src/paths.ts",
    "public-knowledge/patterns.json",
    "artifacts/staging/item.json",
    "harnesses/ios/app.swift",
    "evaluations/results.json",
    ".github/workflows/check.yml",
  ]) {
    assert.doesNotThrow(() => resolvePublicPath(publicPath), publicPath);
  }

  for (const nonPublicPath of [
    "package.json",
    "staging/item.json",
    "skills/another-skill/SKILL.md",
    "output/render.png",
    "build/site.js",
    "dist/bundle.js",
    "src/private.ts",
    "tests/private.test.ts",
  ]) {
    assert.throws(() => resolvePublicPath(nonPublicPath), /allowed public root/, nonPublicPath);
  }
});

test("public path resolution rejects sensitive names case-insensitively", () => {
  for (const sensitivePath of [
    "docs/.git/config",
    "docs/node_modules/pkg/index.js",
    "docs/.venv/bin/python",
    "docs/.ENV",
    "docs/.Env.local",
    "reports/Data/private.json",
    "reports/export.SECRET",
    "reports/myCredentials.json",
    "docs/LOCAL_WORKFLOW.md",
    "docs/.idea/workspace.xml",
    "docs/.vscode/settings.json",
    "docs/venv/bin/python",
    "docs/__pycache__/module.pyc",
    "reports/export.egg-info/PKG-INFO",
    "docs/.DS_Store",
    "reports/session.har",
    "reports/login.session",
  ]) {
    assert.throws(() => resolvePublicPath(sensitivePath), /sensitive or private/, sensitivePath);
  }
});

test("public path resolution rejects symlinks that escape an allowed root", () => {
  const testDirectory = mkdtempSync(path.join(repositoryRoot(), "tooling", "test", ".paths-"));
  const link = path.join(testDirectory, "outside");
  symlinkSync(os.tmpdir(), link);

  try {
    const relativeLink = path.relative(repositoryRoot(), path.join(link, "private.json"));
    assert.throws(() => resolvePublicPath(relativeLink), /symlink escapes allowed public root/);
  } finally {
    rmSync(testDirectory, { recursive: true, force: true });
  }
});
