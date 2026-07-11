import assert from "node:assert/strict";
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

  assert.equal(cleanStagingRoot(), `${root}/staging`);
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
    assert.throws(() => resolvePublicPath(path), /private or local-only/);
  }
});

test("public path resolution cannot escape the repository", () => {
  assert.throws(() => resolvePublicPath("../outside"), /outside the repository/);
});
