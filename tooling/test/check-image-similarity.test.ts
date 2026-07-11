import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  canonicalAuditPayload,
  imageRootDigest,
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

function signedEvidence(root: string, overrides: Partial<SimilarityEvidence> = {}): { path: string; publicKey: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
  const evidence: SimilarityEvidence = {
    version: 1,
    status: "passed",
    commit,
    checkedAt: "2026-07-11T00:00:00.000Z",
    sourceDigest: "sha256:" + "a".repeat(64),
    publicDigest: imageRootDigest(path.join(root, "output")),
    algorithm: "ed25519",
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
    signature: "",
    ...overrides,
  };
  evidence.signature = sign(null, Buffer.from(canonicalAuditPayload(evidence)), privateKey).toString("base64");
  const pathname = path.join(root, "audit.json");
  writeFileSync(pathname, JSON.stringify(evidence, null, 2));
  return { path: pathname, publicKey: evidence.publicKey };
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

  assert.deepEqual(scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence.path, trustedPublicKeys: [evidence.publicKey] }), []);
});

test("rejects tampered signed audit evidence", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root);
  const record = JSON.parse(readFileSync(evidence.path, "utf8")) as SimilarityEvidence;
  record.publicDigest = "sha256:" + "c".repeat(64);
  writeFileSync(evidence.path, JSON.stringify(record));

  const findings = scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence.path, trustedPublicKeys: [evidence.publicKey] });
  assert.equal(findings.some((finding) => finding.kind === "evidence"), true);
});

test("does not accept a self-signed audit without an explicit trusted key", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root);

  const findings = scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence.path });
  assert.equal(findings.some((finding) => finding.kind === "evidence"), true);
});

test("rejects a signed audit for another commit", () => {
  const root = fixtureRoot();
  const output = path.join(root, "output");
  mkdirSync(output);
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root, { commit: "0123456789abcdef0123456789abcdef01234567" });

  const findings = scanImageSimilarity(path.join(root, "missing-source"), output, { evidencePath: evidence.path, trustedPublicKeys: [evidence.publicKey] });
  assert.equal(findings.some((finding) => finding.kind === "evidence"), true);
});

test("checks source and public image-root digests when an audit accompanies an available source set", () => {
  const root = fixtureRoot();
  const source = path.join(root, "source");
  const output = path.join(root, "output");
  mkdirSync(source);
  mkdirSync(output);
  makeImage(path.join(source, "screen.png"), "source");
  makeImage(path.join(output, "screen.png"), "different");
  const evidence = signedEvidence(root, { sourceDigest: "sha256:" + "d".repeat(64) });

  const findings = scanImageSimilarity(source, output, { evidencePath: evidence.path, trustedPublicKeys: [evidence.publicKey] });
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
