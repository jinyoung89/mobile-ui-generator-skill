import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { scanArchive, scanPublicTree } from "../src/check-public-boundary.js";

const blockedCopy = "private" + " corpus";
const providerCopy = "crawl" + "er";
const credentialCopy = "gh" + "p_" + "A".repeat(36);
const homePath = "/Users/" + "fixture-owner/Library/source.png";

function fixtureRoot(): string {
  return mkdtempSync(path.join(os.tmpdir(), "boundary-leak-fixtures-"));
}

function makeImage(pathname: string, format: "PNG" | "JPEG", metadata: string): void {
  const script = String.raw`
from PIL import Image, PngImagePlugin
import sys
out, fmt, note = sys.argv[1:]
im = Image.new("RGB", (16, 16), (20, 80, 140))
if fmt == "PNG":
  info = PngImagePlugin.PngInfo()
  info.add_text("Comment", note)
  im.save(out, pnginfo=info)
else:
  im.save(out, format="JPEG", comment=note.encode("utf-8"))
`;
  const result = spawnSync("python3", ["-c", script, pathname, format, metadata], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

function makeZip(pathname: string, members: Record<string, string>): void {
  const script = String.raw`
import json, sys, zipfile
out, members = sys.argv[1], json.loads(sys.argv[2])
with zipfile.ZipFile(out, "w") as z:
  for name, value in members.items(): z.writestr(name, value)
`;
  const result = spawnSync("python3", ["-c", script, pathname, JSON.stringify(members)], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

test("finds forbidden copy, provider terms, private paths, credentials, and disallowed URLs", () => {
  const root = fixtureRoot();
  writeFileSync(path.join(root, "copy.md"), [blockedCopy, providerCopy, homePath, credentialCopy, "https://example.invalid/source"].join("\n"));
  const findings = scanPublicTree(root, { copyMode: "public" });
  assert.deepEqual(new Set(findings.map((finding) => finding.kind)), new Set(["copy", "path", "credential", "url"]));
});

test("rejects general POSIX content paths but permits documented site routes", () => {
  const root = fixtureRoot();
  writeFileSync(path.join(root, "paths.md"), [
    "/tmp/release/private.json",
    "/opt/build/source.png",
    "/examples/commerce-checkout",
  ].join("\n"));
  const findings = scanPublicTree(root, { copyMode: "public" });
  const details = findings.filter((finding) => finding.kind === "path").map((finding) => finding.detail);
  assert.equal(details.some((detail) => detail.includes("/tmp/")), true);
  assert.equal(details.some((detail) => detail.includes("/opt/")), true);
  assert.equal(details.some((detail) => detail.includes("/examples/")), false);
});

test("allows documented public URLs in repository metadata but rejects them in generated data", () => {
  const root = fixtureRoot();
  writeFileSync(path.join(root, "README.md"), "https://example.com/docs\n");
  assert.equal(scanPublicTree(root, { copyMode: "repository" }).length, 0);
  assert.equal(scanPublicTree(root, { copyMode: "generated" }).some((finding) => finding.kind === "url"), true);
});

test("fails closed on archive traversal and sensitive member names", () => {
  const root = fixtureRoot();
  const archive = path.join(root, "download.zip");
  makeZip(archive, { "../escape.txt": "safe", ["config/." + "env"]: "safe" });
  const findings = scanArchive(archive);
  assert.equal(findings.some((finding) => finding.kind === "traversal"), true);
  assert.equal(findings.some((finding) => finding.kind === "sensitive-name"), true);
});

test("fails closed on ZIP symlink members", () => {
  const root = fixtureRoot();
  const archive = path.join(root, "symlink.zip");
  const script = String.raw`
import stat, sys, zipfile
with zipfile.ZipFile(sys.argv[1], "w") as z:
  info = zipfile.ZipInfo("tooling/test/link.txt")
  info.create_system = 3
  info.external_attr = (stat.S_IFLNK | 0o777) << 16
  z.writestr(info, "../../private.txt")
`;
  const made = spawnSync("python3", ["-c", script, archive], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const findings = scanArchive(archive);
  assert.equal(findings.some((finding) => finding.kind === "unsupported" && finding.detail.includes("link")), true);
});

test("applies strict distribution policy inside tooling-like download archive paths", () => {
  const root = fixtureRoot();
  const archive = path.join(root, "download.zip");
  makeZip(archive, {
    "tooling/test/leak.txt": [homePath, credentialCopy, "https://example.invalid/private"].join("\n"),
  });
  const result = spawnSync("npm", ["run", "validate:boundary", "--", "--archive", archive], {
    cwd: path.resolve("."), encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /path:/);
  assert.match(result.stderr, /credential:/);
  assert.match(result.stderr, /url:/);
});

test("recursively inspects archive contents and source maps", () => {
  const root = fixtureRoot();
  const inner = path.join(root, "inner.zip");
  makeZip(inner, { "app.js.map": JSON.stringify({ version: 3, sources: [homePath], mappings: "" }) });
  const outer = path.join(root, "outer.zip");
  const script = String.raw`
import sys, zipfile
with zipfile.ZipFile(sys.argv[1], "w") as z: z.write(sys.argv[2], "nested/inner.zip")
`;
  const result = spawnSync("python3", ["-c", script, outer, inner], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const findings = scanArchive(outer);
  assert.equal(findings.some((finding) => finding.kind === "source-map"), true);
  assert.equal(findings.some((finding) => finding.kind === "path"), true);
});

test("inspects textual metadata in PNG and JPEG files", () => {
  const root = fixtureRoot();
  makeImage(path.join(root, "noted.png"), "PNG", blockedCopy);
  makeImage(path.join(root, "noted.jpg"), "JPEG", homePath);
  const findings = scanPublicTree(root, { copyMode: "public" });
  assert.equal(findings.some((finding) => finding.kind === "image-metadata" && finding.path.endsWith("noted.png")), true);
  assert.equal(findings.some((finding) => finding.kind === "image-metadata" && finding.path.endsWith("noted.jpg")), true);
});

test("fails closed on unsupported files and bounded archive expansion", () => {
  const root = fixtureRoot();
  writeFileSync(path.join(root, "unknown.bin"), Buffer.from([0, 1, 2, 3]));
  const treeFindings = scanPublicTree(root, { copyMode: "public" });
  assert.equal(treeFindings.some((finding) => finding.kind === "unsupported"), true);

  const archive = path.join(root, "many.zip");
  makeZip(archive, { "one.txt": "1", "two.txt": "2" });
  const archiveFindings = scanArchive(archive, { maxMembers: 1 });
  assert.equal(archiveFindings.some((finding) => finding.kind === "limit"), true);
});

test("stops oversized archive member enumeration at the configured bound", () => {
  const root = fixtureRoot();
  const archive = path.join(root, "oversized.zip");
  const script = String.raw`
import sys, zipfile
with zipfile.ZipFile(sys.argv[1], "w") as z:
  for index in range(20000): z.writestr(f"members/{index:05d}-{'x' * 80}.txt", "x")
`;
  const made = spawnSync("python3", ["-c", script, archive], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const started = performance.now();
  const findings = scanArchive(archive, { maxMembers: 1, maxBytes: 1024 });
  const elapsed = performance.now() - started;
  assert.deepEqual(findings.map((finding) => finding.kind), ["limit"]);
  assert.ok(elapsed < 2_000, `bounded scan took ${elapsed.toFixed(0)}ms`);
});

test("shared synthetic leak fixtures are rejected by both Node and Python validators", () => {
  const root = fixtureRoot();
  mkdirSync(path.join(root, "docs"));
  writeFileSync(path.join(root, "docs", "copy.md"), `${blockedCopy}\n`);
  const nodeKinds = scanPublicTree(path.join(root, "docs"), { copyMode: "public" }).map((item) => item.kind);
  assert.equal(nodeKinds.includes("copy"), true);

  const python = spawnSync("python3", ["scripts/validate_site.py", "--compat-fixture", path.join(root, "docs", "copy.md")], {
    cwd: path.resolve("."), encoding: "utf8",
  });
  assert.notEqual(python.status, 0);
  assert.match(python.stderr, /public-copy leak/i);
});
