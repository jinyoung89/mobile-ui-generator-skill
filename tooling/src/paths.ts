import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRIVATE_OR_LOCAL_PATHS = [
  "data",
  "output",
  "src",
  "tests",
  "pyproject.toml",
  path.join("docs", "LOCAL_WORKFLOW.md"),
];

export function repositoryRoot(): string {
  return ROOT;
}

export function resolvePublicPath(relativePath: string): string {
  const candidate = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, candidate);

  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error(`Path resolves outside the repository: ${relativePath}`);
  }

  const normalized = relative.split(path.sep).join("/");
  const isPrivate =
    normalized === ".env" ||
    normalized.startsWith(".env.") ||
    PRIVATE_OR_LOCAL_PATHS.some((privatePath) => {
      const privateNormalized = privatePath.split(path.sep).join("/");
      return normalized === privateNormalized || normalized.startsWith(`${privateNormalized}/`);
    });

  if (isPrivate) {
    throw new Error(`Path resolves into a private or local-only directory: ${relativePath}`);
  }

  return candidate;
}

export function cleanStagingRoot(): string {
  return resolvePublicPath("staging");
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
