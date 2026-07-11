import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REAL_ROOT = realpathSync(ROOT);
const PUBLIC_ROOTS = [
  "docs",
  "site",
  path.join("skills", "mobile-ui-generator"),
  "examples",
  "catalog",
  "reports",
  "tooling",
  "public-knowledge",
  "artifacts",
  "harnesses",
  "evaluations",
  ".github",
];

function isWithin(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function nearestExistingRealPath(candidate: string): string {
  let existing = candidate;
  const missingSegments: string[] = [];

  while (!existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) {
      throw new Error(`No existing ancestor for path: ${candidate}`);
    }
    missingSegments.unshift(path.basename(existing));
    existing = parent;
  }

  return path.join(realpathSync(existing), ...missingSegments);
}

function hasSensitiveSegment(relativePath: string): boolean {
  return relativePath.split(path.sep).some((segment) => {
    const lower = segment.toLowerCase();
    return (
      lower === ".git" ||
      lower === "node_modules" ||
      lower === ".venv" ||
      lower === "venv" ||
      lower === ".idea" ||
      lower === ".vscode" ||
      lower === "__pycache__" ||
      lower === "data" ||
      lower === ".env" ||
      lower.startsWith(".env.") ||
      lower.endsWith(".egg-info") ||
      lower === ".ds_store" ||
      lower.endsWith(".har") ||
      lower.endsWith(".secret") ||
      lower.endsWith(".session") ||
      lower.includes("credentials") ||
      lower === "local_workflow.md"
    );
  });
}

export function repositoryRoot(): string {
  return ROOT;
}

export function resolvePublicPath(relativePath: string): string {
  const candidate = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, candidate);

  if (!isWithin(ROOT, candidate)) {
    throw new Error(`Path resolves outside the repository: ${relativePath}`);
  }

  if (hasSensitiveSegment(relative)) {
    throw new Error(`Path contains a sensitive or private name: ${relativePath}`);
  }

  const allowedRoot = PUBLIC_ROOTS.find((publicRoot) => {
    const relativeToPublicRoot = path.relative(publicRoot, relative);
    return relativeToPublicRoot === "" || isWithin(publicRoot, relative);
  });
  if (!allowedRoot) {
    throw new Error(`Path is not under an allowed public root: ${relativePath}`);
  }

  const resolvedCandidate = nearestExistingRealPath(candidate);
  const allowedRootPath = path.resolve(ROOT, allowedRoot);
  const resolvedAllowedRoot = nearestExistingRealPath(allowedRootPath);
  if (!isWithin(REAL_ROOT, resolvedCandidate) || !isWithin(resolvedAllowedRoot, resolvedCandidate)) {
    throw new Error(`Path symlink escapes allowed public root: ${relativePath}`);
  }

  return candidate;
}

export function cleanStagingRoot(): string {
  return resolvePublicPath(path.join("artifacts", "staging"));
}

export function artifactRoot(): string {
  return resolvePublicPath("artifacts");
}

export function docsOutputPath(): string {
  return resolvePublicPath("docs");
}

export function siteOutputPath(): string {
  return resolvePublicPath("site");
}
