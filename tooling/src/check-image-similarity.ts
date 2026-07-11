#!/usr/bin/env node

import { createHash, createPublicKey, verify } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type SimilarityFindingKind = "exact-hash" | "perceptual-similarity" | "evidence" | "unreadable";
export type SimilarityFinding = { kind: SimilarityFindingKind; path: string; detail: string };

export type SimilarityEvidence = {
  version: 1;
  status: "passed";
  commit: string;
  checkedAt: string;
  sourceDigest: string;
  publicDigest: string;
  algorithm: "ed25519";
  publicKey: string;
  signature: string;
};

export type SimilarityOptions = {
  maxDHashDistance?: number;
  evidencePath?: string;
};

type Fingerprint = { sha256: string; dHash: string; width: number; height: number };

const imageExtensions = new Set([".png", ".jpg", ".jpeg"]);
const fingerprintScript = String.raw`
from PIL import Image
import json, sys
image = Image.open(sys.argv[1]).convert("L")
width, height = image.size
small = image.resize((9, 8), Image.Resampling.BILINEAR)
pixels = list(small.getdata())
bits = []
for row in range(8):
  start = row * 9
  bits.extend("1" if pixels[start + col] > pixels[start + col + 1] else "0" for col in range(8))
print(json.dumps({"width": width, "height": height, "dHash": "".join(bits)}))
`;

function isImage(pathname: string): boolean {
  return imageExtensions.has(path.extname(pathname).toLowerCase());
}

function collectImages(root: string): string[] {
  const images: string[] = [];
  const visit = (pathname: string): void => {
    const stat = lstatSync(pathname);
    if (stat.isSymbolicLink()) throw new Error(`symbolic link is not supported: ${pathname}`);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(pathname).sort()) visit(path.join(pathname, entry));
      return;
    }
    if (stat.isFile() && isImage(pathname)) images.push(pathname);
  };
  visit(root);
  return images;
}

function fingerprint(pathname: string): Fingerprint {
  const bytes = readFileSync(pathname);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const result = spawnSync("python3", ["-c", fingerprintScript, pathname], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "image fingerprint failed");
  const parsed = JSON.parse(result.stdout) as { width: number; height: number; dHash: string };
  if (!Number.isInteger(parsed.width) || !Number.isInteger(parsed.height) || !/^[01]{64}$/.test(parsed.dHash)) {
    throw new Error("invalid image fingerprint");
  }
  return { sha256: digest, dHash: parsed.dHash, width: parsed.width, height: parsed.height };
}

function hamming(left: string, right: string): number {
  let distance = 0;
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }
  return distance + Math.abs(left.length - right.length);
}

export function canonicalAuditPayload(evidence: SimilarityEvidence): string {
  return JSON.stringify({
    version: evidence.version,
    status: evidence.status,
    commit: evidence.commit,
    checkedAt: evidence.checkedAt,
    sourceDigest: evidence.sourceDigest,
    publicDigest: evidence.publicDigest,
    algorithm: evidence.algorithm,
    publicKey: evidence.publicKey,
  });
}

function validDigest(value: unknown): value is string {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value);
}

function verifyEvidence(pathname: string): boolean {
  try {
    const value = JSON.parse(readFileSync(pathname, "utf8")) as Partial<SimilarityEvidence>;
    if (value.version !== 1 || value.status !== "passed" || value.algorithm !== "ed25519" ||
      typeof value.commit !== "string" || !/^[0-9a-f]{40}$/.test(value.commit) ||
      typeof value.checkedAt !== "string" || !validDigest(value.sourceDigest) || !validDigest(value.publicDigest) ||
      typeof value.publicKey !== "string" || typeof value.signature !== "string" || !value.signature) return false;
    const evidence = value as SimilarityEvidence;
    return verify(null, Buffer.from(canonicalAuditPayload(evidence)), createPublicKey(evidence.publicKey), Buffer.from(evidence.signature, "base64"));
  } catch {
    return false;
  }
}

function unavailableEvidence(pathname: string, evidencePath?: string): SimilarityFinding[] {
  if (evidencePath && verifyEvidence(evidencePath)) return [];
  const suffix = evidencePath ? `; signed audit invalid: ${evidencePath}` : "; signed audit evidence is required";
  return [{ kind: "evidence", path: pathname, detail: `source image set unavailable${suffix}` }];
}

export function scanImageSimilarity(sourceRoot: string, publicRoot: string, options: SimilarityOptions = {}): SimilarityFinding[] {
  const threshold = options.maxDHashDistance ?? 8;
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 64) {
    throw new Error("maxDHashDistance must be an integer between 0 and 64");
  }
  let sourceImages: string[];
  try {
    sourceImages = collectImages(sourceRoot);
  } catch {
    return unavailableEvidence(sourceRoot, options.evidencePath);
  }
  if (sourceImages.length === 0) return unavailableEvidence(sourceRoot, options.evidencePath);

  const findings: SimilarityFinding[] = [];
  let publicImages: string[];
  try {
    publicImages = collectImages(publicRoot);
  } catch (error) {
    return [{ kind: "unreadable", path: publicRoot, detail: (error as Error).message }];
  }
  const sources: Fingerprint[] = [];
  for (const source of sourceImages) {
    try { sources.push(fingerprint(source)); }
    catch (error) { findings.push({ kind: "unreadable", path: source, detail: (error as Error).message }); }
  }
  if (sources.length === 0) return findings.length ? findings : unavailableEvidence(sourceRoot, options.evidencePath);

  for (const publicImage of publicImages) {
    let candidate: Fingerprint;
    try { candidate = fingerprint(publicImage); }
    catch (error) {
      findings.push({ kind: "unreadable", path: publicImage, detail: (error as Error).message });
      continue;
    }
    const exact = sources.find((source) => source.sha256 === candidate.sha256);
    if (exact) {
      findings.push({ kind: "exact-hash", path: publicImage, detail: `matches source SHA-256 ${exact.sha256}` });
      continue;
    }
    let closest = 65;
    for (const source of sources) closest = Math.min(closest, hamming(source.dHash, candidate.dHash));
    if (closest <= threshold) findings.push({ kind: "perceptual-similarity", path: publicImage, detail: `dHash distance ${closest} is within threshold ${threshold}` });
  }
  return findings;
}

function runCli(): void {
  const args = process.argv.slice(2);
  let source: string | undefined;
  let output: string | undefined;
  let evidence: string | undefined;
  let threshold: number | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--source-dir") source = args[++index];
    else if (argument === "--public-root") output = args[++index];
    else if (argument === "--evidence") evidence = args[++index];
    else if (argument === "--threshold") threshold = Number(args[++index]);
    else throw new Error(`unknown argument: ${argument}`);
  }
  if (!source || !output) throw new Error("--source-dir and --public-root are required");
  const findings = scanImageSimilarity(path.resolve(source), path.resolve(output), { evidencePath: evidence ? path.resolve(evidence) : undefined, maxDHashDistance: threshold });
  if (findings.length) {
    for (const finding of findings) console.error(`${finding.kind}: ${finding.path}: ${finding.detail}`);
    process.exitCode = 1;
  } else console.log("image similarity boundary passed");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
