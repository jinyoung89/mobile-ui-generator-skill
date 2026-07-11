import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { loadProofCatalog } from "../src/catalog.js";
import { buildStaticSite } from "../../tooling/src/build-site.js";

const root = path.resolve(import.meta.dirname, "../..");

test("catalog is derived from proof artifacts with four source targets", () => {
  const catalog = loadProofCatalog(path.join(root, "examples/proof"));
  assert.equal(catalog.length, 5);
  for (const example of catalog) {
    assert.match(example.route, /^examples\/[a-z0-9-]+\/$/);
    assert.ok(example.category);
    assert.ok(example.patterns.length > 0);
    assert.deepEqual(Object.keys(example.sources), ["html_css", "react_native", "flutter", "swiftui"]);
    assert.deepEqual(Object.values(example.sources).map((files) => files.length), [3, 2, 2, 2]);
    assert.equal(existsSync(path.join(root, "examples/proof", example.proofId)), true);
    for (const files of Object.values(example.sources)) {
      assert.ok(files.length > 0);
      assert.ok(files.every((file) => file.content.trim().length > 40));
    }
  }
});

test("static build emits an explorer and one accessible detail route per proof", () => {
  const output = mkdtempSync(path.join(tmpdir(), "mobile-ui-site-"));
  const result = buildStaticSite({ root, output });
  assert.equal(result.routes.length, result.examples + 1);

  const home = readFileSync(path.join(output, "index.html"), "utf8");
  assert.match(home, /data-filter="category"/);
  assert.match(home, /data-filter="pattern"/);
  assert.match(home, /id="example-grid"/);
  assert.match(home, /Install the skill/);

  for (const route of result.routes.filter((item) => item !== "./")) {
    const detail = readFileSync(path.join(output, route, "index.html"), "utf8");
    assert.match(detail, /aria-label="Preview width"/);
    assert.match(detail, /role="tablist" aria-label="Source platform"/);
    assert.match(detail, /data-copy-source/);
    assert.match(detail, /HTML \/ CSS/);
    assert.match(detail, /React Native/);
    assert.match(detail, /Flutter/);
    assert.match(detail, /SwiftUI/);
    const proofId = route.split("/").filter(Boolean).at(-1) === "commerce-checkout-address" ? "commerce-checkout" : route.split("/").filter(Boolean).at(-1);
    assert.match(detail, new RegExp(`examples/proof/${proofId}`));
  }
});
