import type { JsonObject } from "./tokens.js";

export const PLATFORM_IDS = ["html_css", "react_native", "flutter", "swiftui"] as const;
export type PlatformId = typeof PLATFORM_IDS[number];

export type PlatformMappingSummary = {
  unit: string;
  safe_area: string;
  rounding: string;
  native_substitutions_explicit: boolean;
  warnings: string[];
};

export type PlatformMappingReport = {
  platforms: Record<PlatformId, PlatformMappingSummary>;
  warnings: string[];
  component_order: string[];
  state_ids: string[];
  locale_ids: string[];
};

function object(value: unknown): JsonObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function buildPlatformMappingReport(spec: JsonObject): PlatformMappingReport {
  const allWarnings: string[] = [];
  const mappingRoot = object(spec.platform_mappings) ?? {};
  const policy = object(spec.platform_policy);
  const policyRounding = object(policy?.rounding);
  const expectedUnits: Record<PlatformId, string> = { html_css: "px", react_native: "dp", flutter: "dp", swiftui: "pt" };
  const platforms = {} as Record<PlatformId, PlatformMappingSummary>;
  for (const platform of PLATFORM_IDS) {
    const row = object(mappingRoot[platform]);
    const warnings: string[] = [];
    if (!row) warnings.push(`${platform}: mapping is missing`);
    const unit = typeof row?.unit === "string" ? row.unit : "";
    const safeArea = typeof row?.safe_area === "string" ? row.safe_area : "";
    const rounding = typeof row?.rounding === "string" ? row.rounding : "";
    const explicit = row?.native_substitutions_explicit === true;
    if (!unit) warnings.push(`${platform}: unit is missing`);
    else if (unit !== expectedUnits[platform]) warnings.push(`${platform}: expected canonical ${expectedUnits[platform]} unit, received ${unit}`);
    if (!safeArea) warnings.push(`${platform}: safe-area mapping is missing`);
    if (typeof policyRounding?.[platform] === "string" && rounding !== policyRounding[platform]) warnings.push(`${platform}: rounding differs from platform policy`);
    if (!explicit) warnings.push(`${platform}: native substitutions must be explicit`);
    platforms[platform] = { unit, safe_area: safeArea, rounding, native_substitutions_explicit: explicit, warnings };
    allWarnings.push(...warnings);
  }
  const components = Array.isArray(spec.components) ? spec.components.map(object).filter((row): row is JsonObject => Boolean(row)) : [];
  const componentOrder = components
    .sort((left, right) => Number(left.order ?? 0) - Number(right.order ?? 0) || String(left.id ?? "").localeCompare(String(right.id ?? "")))
    .map((row) => String(row.id ?? ""));
  const states = object(spec.states);
  const stateIds = [...new Set(Object.values(states ?? {}).flatMap(strings))].sort();
  const locales = object(object(spec.content)?.locales);
  return {
    platforms,
    warnings: [...new Set(allWarnings)].sort(),
    component_order: componentOrder,
    state_ids: stateIds,
    locale_ids: Object.keys(locales ?? {}).sort(),
  };
}
