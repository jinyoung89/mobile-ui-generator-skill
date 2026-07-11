#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { scanImageSimilarity } from "./check-image-similarity.js";

export type FindingKind =
  | "copy"
  | "path"
  | "credential"
  | "url"
  | "traversal"
  | "sensitive-name"
  | "source-map"
  | "image-metadata"
  | "image-similarity"
  | "unsupported"
  | "unreadable"
  | "limit";

export type Finding = { kind: FindingKind; path: string; detail: string };
export type CopyMode = "public" | "distribution" | "generated" | "repository";
export type ScanOptions = {
  copyMode?: CopyMode;
  maxMembers?: number;
  maxBytes?: number;
  maxDepth?: number;
};

const defaults = { maxMembers: 2_000, maxBytes: 64 * 1024 * 1024, maxDepth: 4 };
const forbiddenCopy = [
  "crawl" + "er",
  "connect" + "or",
  "private" + " corpus",
  "reference" + " corpus",
  "quality" + " gates",
  "quality" + " report",
  "raw" + " screenshots",
  "56" + ",665",
  "349" + " apps",
  "0" + ".95",
  "index" + "ed",
  "수집" + "처",
  "데이터" + "셋",
  "레퍼런스" + " 품질",
  "원본" + " 경로",
];
const textExtensions = new Set([
  ".css", ".csv", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".py",
  ".lock", ".sh", ".svg", ".tpl", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml", ".dart",
]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg"]);
const archiveExtensions = [".tar.gz", ".tgz", ".zip", ".tar"];
const credentialPatterns = [
  /\bghp_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{16,}/gi,
];
const posixPathPattern = /(?:^|[\s"'(=:])(\/(?:[A-Za-z0-9._-]+\/)+[^\s"')<>,;]*)/g;
const windowsPathPattern = /\b[A-Za-z]:\\(?:Users|ProgramData|Windows|Temp)\\[^\s"']+/g;
const allowedSiteRouteRoots = new Set([
  "assets", "catalog", "docs", "evaluations", "examples", "ko", "mobile-ui-generator-skill", "public-knowledge",
  "reports", "scripts", "skills", "tooling",
]);
const urlPattern = /https?:\/\/[^\s<>"')\]]+/g;
const generatedUrlHosts = new Set([
  "cdn.jsdelivr.net", "fonts.google.com", "fonts.googleapis.com", "fonts.gstatic.com",
  "github.com", "jinyoung89.github.io", "mobile-ui-generator.dev", "opensource.org", "schema.org", "www.sitemaps.org", "www.w3.org",
]);
const repositoryUrlHosts = new Set([
  ...generatedUrlHosts,
  "example.com", "github.com", "json-schema.org", "mobile-ui-generator.dev", "opencollective.com", "raw.githubusercontent.com", "registry.npmjs.org",
  // Dependency lockfiles preserve package funding metadata. These hosts are
  // permitted only in repository metadata; generated/distribution scans still
  // reject them so they cannot enter the public website or proof artifacts.
  "dart.dev", "docs.expo.dev", "dotenvx.com", "feross.org", "npmjs.com", "pub.dev", "www.npmjs.com", "paypal.me", "patreon.com", "www.patreon.com", "tidelift.com",
]);

function archiveExtension(name: string): string | undefined {
  const lower = name.toLowerCase();
  return archiveExtensions.find((extension) => lower.endsWith(extension));
}

function sensitiveName(name: string): boolean {
  return name.split(/[\\/]/).some((part) => {
    const lower = part.toLowerCase();
    return lower === ".env" || lower.startsWith(".env.") || lower.includes("credential") ||
      lower.includes("secret") || lower.endsWith(".pem") || lower.endsWith(".key") ||
      lower.endsWith(".p12") || lower.endsWith(".har") || lower.endsWith(".session");
  });
}

function traversalName(name: string): boolean {
  const normalized = name.replaceAll("\\", "/");
  return normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized) ||
    normalized.split("/").includes("..");
}

function addTextFindings(text: string, displayPath: string, mode: CopyMode, findings: Finding[]): void {
  const lower = text.toLocaleLowerCase();
  for (const term of forbiddenCopy) {
    if (lower.includes(term.toLocaleLowerCase())) {
      findings.push({ kind: "copy", path: displayPath, detail: `forbidden public copy: ${term}` });
    }
  }
  const contentName = displayPath.includes("!/") ? displayPath.split("!/").at(-1) ?? displayPath : displayPath;
  if (path.basename(contentName) !== ".gitignore") {
    posixPathPattern.lastIndex = 0;
    for (const match of text.matchAll(posixPathPattern)) {
      const pathname = match[1] ?? "";
      const firstSegment = pathname.split("/")[1]?.toLowerCase() ?? "";
      if (!allowedSiteRouteRoots.has(firstSegment)) {
        findings.push({ kind: "path", path: displayPath, detail: `absolute/private path: ${pathname}` });
      }
    }
  }
  windowsPathPattern.lastIndex = 0;
  for (const match of text.matchAll(windowsPathPattern)) {
    findings.push({ kind: "path", path: displayPath, detail: `absolute/private path: ${match[0]}` });
  }
  for (const pattern of credentialPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) findings.push({ kind: "credential", path: displayPath, detail: "credential-like value" });
  }
  urlPattern.lastIndex = 0;
  for (const match of text.matchAll(urlPattern)) {
    let allowed = false;
    if (["repository", "generated", "distribution", "public"].includes(mode)) {
      try {
        const host = new URL(match[0]).hostname;
        allowed = mode === "repository" ? repositoryUrlHosts.has(host) : generatedUrlHosts.has(host);
      } catch { allowed = false; }
    }
    if (!allowed) findings.push({ kind: "url", path: displayPath, detail: `forbidden URL: ${match[0]}` });
  }
}

function pngMetadata(buffer: Buffer): string[] {
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error("invalid PNG signature");
  const values: string[] = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > buffer.length) throw new Error("truncated PNG chunk");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "tEXt") values.push(data.toString("utf8"));
    if (type === "zTXt") {
      const separator = data.indexOf(0);
      if (separator < 0 || data[separator + 1] !== 0) throw new Error("invalid compressed PNG text chunk");
      values.push(`${data.subarray(0, separator).toString("utf8")}\0${inflateSync(data.subarray(separator + 2)).toString("utf8")}`);
    }
    if (type === "iTXt") {
      const first = data.indexOf(0);
      if (first < 0 || first + 2 >= data.length) throw new Error("invalid international PNG text chunk");
      const compressed = data[first + 1] === 1;
      let cursor = first + 3;
      for (let fields = 0; fields < 2; fields += 1) {
        const next = data.indexOf(0, cursor);
        if (next < 0) throw new Error("invalid international PNG text fields");
        cursor = next + 1;
      }
      const payload = data.subarray(cursor);
      values.push(compressed ? inflateSync(payload).toString("utf8") : payload.toString("utf8"));
    }
    offset = end;
    if (type === "IEND") break;
  }
  return values;
}

function jpegMetadata(buffer: Buffer): string[] {
  if (buffer.length < 2 || buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error("invalid JPEG signature");
  const values: string[] = [];
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1] ?? 0;
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x00 || marker === 0xff || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) throw new Error("truncated JPEG segment");
    if (marker === 0xfe || (marker >= 0xe0 && marker <= 0xef)) {
      values.push(buffer.toString("utf8", offset + 4, offset + 2 + length));
    }
    offset += 2 + length;
  }
  return values;
}

function scanBuffer(buffer: Buffer, displayPath: string, options: Required<ScanOptions>, findings: Finding[], state: ScanState, depth: number): void {
  const lower = displayPath.toLowerCase();
  const extension = path.extname(lower);
  try {
    if (archiveExtension(lower)) {
      scanArchiveBuffer(buffer, displayPath, options, findings, state, depth);
    } else if (lower.endsWith(".js.map") || extension === ".map") {
      findings.push({ kind: "source-map", path: displayPath, detail: "JavaScript source map is public" });
      addTextFindings(buffer.toString("utf8"), displayPath, options.copyMode, findings);
    } else if (textExtensions.has(extension) || extension === "") {
      addTextFindings(buffer.toString("utf8"), displayPath, options.copyMode, findings);
    } else if (imageExtensions.has(extension)) {
      const metadata = extension === ".png" ? pngMetadata(buffer) : jpegMetadata(buffer);
      for (const value of metadata) {
        const before = findings.length;
        addTextFindings(value, displayPath, options.copyMode, findings);
        if (findings.length > before) findings.push({ kind: "image-metadata", path: displayPath, detail: "forbidden textual image metadata" });
      }
    } else {
      findings.push({ kind: "unsupported", path: displayPath, detail: `unsupported file type: ${extension || "none"}` });
    }
  } catch (error) {
    findings.push({ kind: "unreadable", path: displayPath, detail: (error as Error).message });
  }
}

type ScanState = { members: number; bytes: number };
type ArchiveMember = { name: string; kind: "file" | "directory" | "link"; size: number; data?: string; error?: string };

const archiveReader = String.raw`
import base64, json, pathlib, stat, sys, tarfile, zipfile
p = pathlib.Path(sys.argv[1]); max_members = int(sys.argv[2]); max_bytes = int(sys.argv[3]); out = []; total = 0
def add(row, reader=None):
  global total
  total += row["size"]
  over = len(out) + 1 > max_members or total > max_bytes
  if over:
    row["error"] = "archive expansion limit exceeded"
    out.append(row)
    return True
  if reader is not None:
    try: row["data"] = base64.b64encode(reader()).decode("ascii")
    except Exception as e: row["error"] = "unreadable archive member: " + str(e)
  out.append(row)
  return False
try:
  if zipfile.is_zipfile(p):
    with zipfile.ZipFile(p) as z:
      for i in z.infolist():
        mode = (i.external_attr >> 16) & 0xffff
        kind = "link" if stat.S_ISLNK(mode) else ("directory" if i.is_dir() else "file")
        row = {"name": i.filename, "kind": kind, "size": i.file_size}
        if i.flag_bits & 1: row["error"] = "encrypted ZIP member"; stop = add(row)
        else: stop = add(row, (lambda i=i: z.read(i)) if kind == "file" else None)
        if stop: break
  elif tarfile.is_tarfile(p):
    with tarfile.open(p, "r:*") as t:
      for i in t:
        kind = "file" if i.isfile() else ("directory" if i.isdir() else "link")
        row = {"name": i.name, "kind": kind, "size": i.size}
        def read(i=i):
          f = t.extractfile(i)
          if f is None: raise ValueError("member has no readable stream")
          return f.read()
        if add(row, read if kind == "file" else None): break
  else: raise ValueError("unsupported or invalid archive")
  print(json.dumps(out))
except Exception as e:
  print(json.dumps({"error": str(e)}))
  sys.exit(2)
`;

function scanArchiveBuffer(buffer: Buffer, displayPath: string, options: Required<ScanOptions>, findings: Finding[], state: ScanState, depth: number): void {
  if (depth >= options.maxDepth) {
    findings.push({ kind: "limit", path: displayPath, detail: "archive nesting depth exceeded" });
    return;
  }
  const temp = mkdtempSync(path.join(os.tmpdir(), "public-boundary-"));
  const archivePath = path.join(temp, `archive${archiveExtension(displayPath) ?? ".zip"}`);
  try {
    writeFileSync(archivePath, buffer);
    const result = spawnSync("python3", ["-c", archiveReader, archivePath, String(options.maxMembers), String(options.maxBytes)], { encoding: "utf8", maxBuffer: Math.max(options.maxBytes * 2, 1024 * 1024) });
    if (result.status !== 0) throw new Error(`archive reader failed: ${result.stderr || result.stdout}`);
    const parsed = JSON.parse(result.stdout) as ArchiveMember[] | { error: string };
    if (!Array.isArray(parsed)) throw new Error(parsed.error);
    for (const member of parsed) {
      state.members += 1;
      state.bytes += member.size;
      const memberPath = `${displayPath}!/${member.name}`;
      if (state.members > options.maxMembers || state.bytes > options.maxBytes) {
        findings.push({ kind: "limit", path: memberPath, detail: "archive expansion limit exceeded" });
        return;
      }
      if (traversalName(member.name)) findings.push({ kind: "traversal", path: memberPath, detail: "unsafe archive member path" });
      if (sensitiveName(member.name)) findings.push({ kind: "sensitive-name", path: memberPath, detail: "sensitive archive member name" });
      if (member.error) findings.push({ kind: "unreadable", path: memberPath, detail: member.error });
      if (member.kind === "link") findings.push({ kind: "unsupported", path: memberPath, detail: "archive links are not supported" });
      if (member.kind === "file" && member.data && !traversalName(member.name)) {
        scanBuffer(Buffer.from(member.data, "base64"), memberPath, options, findings, state, depth + 1);
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function normalizedOptions(options: ScanOptions): Required<ScanOptions> {
  return { copyMode: options.copyMode ?? "public", maxMembers: options.maxMembers ?? defaults.maxMembers, maxBytes: options.maxBytes ?? defaults.maxBytes, maxDepth: options.maxDepth ?? defaults.maxDepth };
}

export function scanArchive(archivePath: string, options: ScanOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const normalized = normalizedOptions(options);
  try {
    scanArchiveBuffer(readFileSync(archivePath), archivePath, normalized, findings, { members: 0, bytes: 0 }, 0);
  } catch (error) {
    findings.push({ kind: "unreadable", path: archivePath, detail: (error as Error).message });
  }
  return findings;
}

export function scanPublicTree(root: string, options: ScanOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const normalized = normalizedOptions(options);
  const state: ScanState = { members: 0, bytes: 0 };
  const visit = (pathname: string): void => {
    let stat;
    try { stat = lstatSync(pathname); } catch (error) {
      findings.push({ kind: "unreadable", path: pathname, detail: (error as Error).message }); return;
    }
    if (stat.isSymbolicLink()) { findings.push({ kind: "unsupported", path: pathname, detail: "symbolic links are not supported" }); return; }
    if (stat.isDirectory()) {
      let entries: string[];
      try { entries = readdirSync(pathname); } catch (error) {
        findings.push({ kind: "unreadable", path: pathname, detail: (error as Error).message }); return;
      }
      for (const entry of entries.sort()) visit(path.join(pathname, entry));
      return;
    }
    if (!stat.isFile()) { findings.push({ kind: "unsupported", path: pathname, detail: "non-regular file" }); return; }
    try { scanBuffer(readFileSync(pathname), pathname, normalized, findings, state, 0); }
    catch (error) { findings.push({ kind: "unreadable", path: pathname, detail: (error as Error).message }); }
  };
  visit(root);
  return findings;
}

const publicRoots = new Set([
  ".gitignore", "LICENSE", "README.ko.md", "README.md", "catalog", "docs", "evaluations", "examples", "package-lock.json",
  "package.json", "public-knowledge", "reports", "scripts", "skills", "tooling", "harnesses", "tsconfig.json",
]);

function repositoryFixturePath(name: string): boolean {
  const normalized = name.replaceAll("\\", "/");
  return normalized.includes("/tooling/test/") || normalized.startsWith("tooling/test/") ||
    normalized.includes("/tooling/fixtures/private/") || normalized.startsWith("tooling/fixtures/private/") ||
    normalized.endsWith("/docs/superpowers/plans/2026-07-11-mobile-ui-skill-showcase-rebuild.md") ||
    normalized === "docs/superpowers/plans/2026-07-11-mobile-ui-skill-showcase-rebuild.md";
}

function filterRepositoryFixtureFindings(findings: Finding[]): Finding[] {
  return findings.filter((item) => {
    const memberName = item.path.includes("!/") ? item.path.split("!/").at(-1) ?? item.path : item.path;
    return !repositoryFixturePath(memberName) || !["path", "credential", "url"].includes(item.kind);
  });
}

function scanTrackedRepository(root: string): Finding[] {
  const names = execFileSync("git", ["ls-files", "-z"], { cwd: root }).toString("utf8").split("\0").filter(Boolean);
  const findings: Finding[] = [];
  for (const name of names) {
    const top = name.split("/")[0] ?? name;
    if (!publicRoots.has(top)) {
      findings.push({ kind: "unsupported", path: name, detail: "tracked file is outside the explicit public-root allowlist" });
      continue;
    }
    const scanned = scanPublicTree(path.join(root, name), { copyMode: "repository" });
    findings.push(...filterRepositoryFixtureFindings(scanned));
  }
  return findings;
}

function runCli(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const args = process.argv.slice(2);
  const findings = scanTrackedRepository(root);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--tree" || argument === "--site") {
      const value = args[++index];
      if (!value) throw new Error(`${argument} requires a path`);
      findings.push(...scanPublicTree(path.resolve(value), { copyMode: argument === "--site" ? "generated" : "distribution" }));
    } else if (argument === "--archive") {
      const value = args[++index];
      if (!value) throw new Error("--archive requires a path");
      findings.push(...scanArchive(path.resolve(value), { copyMode: "distribution" }));
    } else if (argument === "--git-archive") {
      const value = args[++index];
      if (!value) throw new Error("--git-archive requires a path");
      findings.push(...filterRepositoryFixtureFindings(scanArchive(path.resolve(value), { copyMode: "repository" })));
    } else if (argument === "--image-similarity") {
      const source = args[++index];
      const output = args[++index];
      if (!source || !output) throw new Error("--image-similarity requires a source directory and public root");
      let evidence: string | undefined;
      const trustedKeys: string[] = [];
      while (args[index + 1] === "--image-similarity-evidence" || args[index + 1] === "--image-similarity-trusted-key") {
        const option = args[++index];
        const value = args[++index];
        if (!value) throw new Error(`${option} requires a path`);
        if (option === "--image-similarity-evidence") evidence = value;
        else trustedKeys.push(readFileSync(path.resolve(value), "utf8"));
      }
      findings.push(...scanImageSimilarity(path.resolve(source), path.resolve(output), { evidencePath: evidence ? path.resolve(evidence) : undefined, trustedPublicKeys: trustedKeys, repositoryRoot: root }).map((finding) => ({
        kind: "image-similarity" as const,
        path: finding.path,
        detail: `${finding.kind}: ${finding.detail}`,
      })));
    } else if (!argument.startsWith("-") && archiveExtension(argument)) {
      findings.push(...scanArchive(path.resolve(argument), { copyMode: "distribution" }));
    } else if (!argument.startsWith("-")) {
      findings.push(...scanPublicTree(path.resolve(argument), { copyMode: "public" }));
    } else throw new Error(`unknown argument: ${argument}`);
  }
  if (findings.length) {
    for (const finding of findings) console.error(`${finding.kind}: ${finding.path}: ${finding.detail}`);
    process.exitCode = 1;
  } else console.log(`public boundary passed (${execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).trim().split("\n").length} tracked files)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
