import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import type { CompiledExample } from "../../tooling/src/compile-example.js";
import { generateFlutterArtifact } from "../../tooling/src/generators/flutter.js";
import { generateHtmlArtifact } from "../../tooling/src/generators/html.js";
import { generateReactNativeArtifact } from "../../tooling/src/generators/react-native.js";
import { generateSwiftUIArtifact } from "../../tooling/src/generators/swiftui.js";

export type SourceFile = { name: string; content: string };
export type SourcePlatform = "html_css" | "react_native" | "flutter" | "swiftui";
export type SiteExample = {
  id: string;
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
      const html = generateHtmlArtifact(compiled);
      const reactNative = generateReactNativeArtifact(compiled);
      const flutter = generateFlutterArtifact(compiled);
      const swiftui = generateSwiftUIArtifact(compiled);
      const copy = compiled.content.copy as Record<string, unknown>;
      const classification = compiled.classification as Record<string, unknown>;
      const request = compiled.request as Record<string, unknown>;
      const patterns = Array.isArray(classification.ui_patterns) ? classification.ui_patterns.filter((item): item is string => typeof item === "string") : [];
      const widths = Array.isArray(compiled.viewport.profiles) ? compiled.viewport.profiles.filter((item): item is number => typeof item === "number") : [320, 390, 430];
      return {
        id: compiled.example_id,
        route: `examples/${compiled.example_id}/`,
        title: text(copy.title, compiled.example_id.replaceAll("-", " ")),
        userJob: text(request.user_job, "Complete this mobile task"),
        language: text(compiled.content.language, "en"),
        category: text(classification.app_category, "mobile"),
        patterns,
        states: stateNames(compiled),
        widths,
        tokens: numericTokens(compiled),
        preview: { html: html.html, css: html.css, js: html.js },
        sources: {
          html_css: [
            { name: "index.html", content: `<!doctype html>\n<html lang="${text(compiled.content.language, "en")}">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="styles.css"></head>\n<body>\n${html.html}\n<script src="app.js"></script>\n</body>\n</html>\n` },
            { name: "styles.css", content: html.css },
            { name: "app.js", content: html.js },
          ],
          react_native: [{ name: `${compiled.example_id}.tsx`, content: reactNative.source }],
          flutter: [{ name: `${compiled.example_id}.dart`, content: flutter.source }],
          swiftui: [{ name: `${compiled.example_id}.swift`, content: swiftui.source }],
        },
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}
