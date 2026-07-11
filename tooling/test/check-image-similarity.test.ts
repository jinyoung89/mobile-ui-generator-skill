import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  canonicalAuditPayload,
  scanImageSimilarity,
  type SimilarityEvidence,
} from "../src/check-image-similarity.js";

function fixtureRoot(): string {
  return mkdtempSync(path.join(os.tmpdir(), "image-similarity-fixtures-"));
}

function makeImage(pathname: string, variant: "source" | "near" | "different"): void {
  const script = String.raw`
from PIL import Image, ImageDraw
import sys
out, variant = sys.argv[1:]
im = Image.new("RGB", (64, 64), (20, 80, 140))
draw = ImageDraw.Draw(im)
draw.rectangle((8, 8, 55, 55), fill=(220, 150, 40))
draw.line((8, 55, 55, 8), fill=(30, 30, 30), width=4)
if variant == "near":
  draw.point((32, 32), fill=(220, 151, 40))
if variant == "different":
  im = Image.new("RGB", (64, 64), (240, 240, 240))
  draw = ImageDraw.Draw(im)
  draw.ellipse((5, 5, 58, 58), fill=(40, 180, 90))
im.save(out, format="PNG")
`;
  const result = spawnSync("python3", ["-c", script, pathname, variant], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

function signedEvidence(root: string): string {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const evidence: SimilarityEvidence = {
    version: 1,
    status: "passed",
    commit: "0123456789abcdef0123456789abcdef01234567",
    checkedAt: "2026-07-11T00:00:00.000Z",
    sourceDigest: "sha256:" + "a".repeat(64),
    publicDigest: "sha256:" + "b".repeat(64),
    algorithm: "ed25519",
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
    signature: "",
  };
  evidence.signature = sign(null, Buffer.from(canonicalAuditPayload(evidence)), privateKey).toString("base64");
  const pathname = path.join(root, "audit.json");
  writeFileSync(pathname, JSON.stringify(evidence, null, 2));
  return pathname;
}

test("rejects an exact byte-for-byte source image by SHA-256", () => {
  const root = fixtureRoot();
  const source = path.join(root, "source");
  const output = path.join(root, "output");
  mkdirSync(source);
  mkdirSync(output);
  makeImage(path.join(source, "screen.png"), "source");
  writeFileSync(path.join(output, "screen.png"), readFileSync(path.join(source, "screen.png")));

  const findings = scanImageSimilarity(source, output);
  assert.equal(findings.some((finding) => finding.kind === "exact-hash"), true);
});

test("rejects a perceptually near source image even when bytes differ", () => {
  const root = fixtureRoot();
  const source = path.join(root, "source");
  const output = path.join(root, "output");
  mkdirSync(source);
  mkdirSync(output);
  makeImage(path.join(source, "screen.png"), "source");
  makeImage(path.join(output, "screen.png"), "near");

  const findings = scanImageSimilarity(source, output, { maxDHashDistance: 8 });
  assert.equal(findings.some((finding) => finding.kind === "perceptual-similarity"), true);
  assert.equal(findings.some((finding) => finding.kind === "exact-hash"), false);
});

test("allows an unrelated generated image", () => {
  const root = fixtureRoot();
  const source = path.join(root, "source");
  const output = path.join(root, "output");
  mkdirSync(source);
  mkdirSync(output);
  makeImage(path.join(source, "screen.png"), "source");
  makeImage(path.join(output, "screen.png"), "different");

  assert.deepEqual(scanImageSimilarity(source, output), []);
});

test("fails closed when the source set is unavailable and no signed audit exists", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");

  const findings = scanImageSimilarity(path.join(root, "missing-source"), output);
  assert.equal(findings.some((finding) => finding.kind === "evidence"), true);
});

test("accepts a valid signed audit when the source set is unavailable", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root);

  assert.deepEqual(scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence }), []);
});

test("rejects tampered signed audit evidence", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root);
  const record = JSON.parse(readFileSync(evidence, "utf8")) as SimilarityEvidence;
  record.publicDigest = "sha256:" + "c".repeat(64);
  writeFileSync(evidence, JSON.stringify(record));

  const findings = scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence });
  assert.equal(findings.some((finding) => finding.kind === "evidence"), true);
});

test("wires image comparison into the repository boundary command", () => {
  const root = fixtureRoot();
  const source = path.join(root, "source");
  const output = path.join(root, "output");
  mkdirSync(source);
  mkdirSync(output);
  makeImage(path.join(source, "screen.png"), "source");
  makeImage(path.join(output, "screen.png"), "near");
  const result = spawnSync("npm", ["run", "validate:boundary", "--", "--image-similarity", source, output], {
    cwd: path.resolve("."), encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /image-similarity/);
});
