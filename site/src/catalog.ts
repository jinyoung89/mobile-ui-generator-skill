import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import type { CompiledExample } from "../../tooling/src/compile-example.js";

export type SourceFile = { name: string; content: string };
export type SourcePlatform = "html_css" | "react_native" | "flutter" | "swiftui";
export type SiteExample = {
  id: string;
  proofId: string;
  route: string;
  title: string;
  userJob: string;
  language: string;
  category: string;
  patterns: string[];
  states: string[];
  widths: number[];
  tokens: { name: string; value: string }[];
  preview: { html: string; css: string; js: string };
  sources: Record<SourcePlatform, SourceFile[]>;
};

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;
const readSource = (directory: string, name: string): SourceFile => ({ name, content: readFileSync(path.join(directory, name), "utf8") });
const text = (value: unknown, fallback: string): string => typeof value === "string" && value.trim() ? value : fallback;

function measure(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  return typeof row.value === "number" ? `${row.value}${text(row.unit, "px")}` : null;
}

function numericTokens(compiled: CompiledExample): { name: string; value: string }[] {
  const rows: { name: string; value: string }[] = [];
  for (const [name, value] of Object.entries(compiled.layout)) {
    const rendered = measure(value);
    if (rendered) rows.push({ name: name.replaceAll("_", " "), value: rendered });
  }
  return rows.slice(0, 8);
}

function stateNames(compiled: CompiledExample): string[] {
  return [...new Set(Object.values(compiled.state_matrix).flatMap((value) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []))];
}

export function loadProofCatalog(proofRoot: string): SiteExample[] {
  if (!existsSync(proofRoot)) return [];
  return readdirSync(proofRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(proofRoot, entry.name, "compiled-ir.json"))
    .filter(existsSync)
    .map((file) => {
      const compiled = readJson<CompiledExample>(file);
      const proofDirectory = path.dirname(file);
      const proofId = path.basename(proofDirectory);
      const htmlDirectory = path.join(proofDirectory, "html-css");
      const htmlSources = ["index.html", "styles.css", "app.js"].map((name) => readSource(htmlDirectory, name));
      const copy = compiled.content.copy as Record<string, unknown>;
      const classification = compiled.classification as Record<string, unknown>;
      const request = compiled.request as Record<string, unknown>;
      const patterns = Array.isArray(classification.ui_patterns) ? classification.ui_patterns.filter((item): item is string => typeof item === "string") : [];
      const widths = Array.isArray(compiled.viewport.profiles) ? compiled.viewport.profiles.filter((item): item is number => typeof item === "number") : [320, 390, 430];
      return {
        id: compiled.example_id,
        proofId,
        route: `examples/${compiled.example_id}/`,
        title: text(copy.title, compiled.example_id.replaceAll("-", " ")),
        userJob: text(request.user_job, "Complete this mobile task"),
        language: text(compiled.content.language, "en"),
        category: text(classification.app_category, "mobile"),
        patterns,
        states: stateNames(compiled),
        widths,
        tokens: numericTokens(compiled),
        preview: { html: htmlSources[0].content, css: htmlSources[1].content, js: htmlSources[2].content },
        sources: {
          html_css: htmlSources,
          react_native: ["Screen.tsx", "fixtures.ts"].map((name) => readSource(path.join(proofDirectory, "react-native"), name)),
          flutter: ["screen.dart", "fixtures.dart"].map((name) => readSource(path.join(proofDirectory, "flutter"), name)),
          swiftui: ["Screen.swift", "Fixtures.swift"].map((name) => readSource(path.join(proofDirectory, "swiftui"), name)),
        },
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}
