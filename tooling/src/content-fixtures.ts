import type { JsonObject } from "./tokens.js";

export type ContentFixtures = {
  language: string;
  fallback_language: string;
  copy: JsonObject;
  fixtures: Record<string, JsonObject>;
};

function object(value: unknown, field: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as JsonObject;
}

function cloneSorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneSorted);
  if (value && typeof value === "object") {
    const row = value as JsonObject;
    return Object.fromEntries(Object.keys(row).sort().map((key) => [key, cloneSorted(row[key])]));
  }
  return value;
}

export function resolveContentFixtures(spec: JsonObject, language?: string): ContentFixtures {
  const request = object(spec.request, "request");
  const localization = object(spec.localization, "localization");
  const content = object(spec.content, "content");
  const locales = object(content.locales, "content.locales");
  const defaultLanguage = typeof language === "string" && language.trim() ? language : String(localization.default_language ?? request.language);
  const fallback = String(localization.fallback_language ?? request.language);
  const copy = object(locales[defaultLanguage] ?? locales[fallback], `content.locales.${defaultLanguage}`);
  const data = object(spec.fixture_data, "fixture_data");
  const names = Array.isArray(content.fixtures) ? content.fixtures : [];
  if (names.length === 0) throw new Error("content.fixtures must be non-empty");
  const fixtures: Record<string, JsonObject> = {};
  for (const item of names) {
    if (typeof item !== "string" || item.trim() === "") throw new Error("content.fixtures entries must be non-empty strings");
    const fixture = data[item];
    if (fixture === undefined) throw new Error(`missing fixture_data.${item}`);
    fixtures[item] = cloneSorted(object(fixture, `fixture_data.${item}`)) as JsonObject;
  }
  return {
    language: locales[defaultLanguage] ? defaultLanguage : fallback,
    fallback_language: fallback,
    copy: cloneSorted(copy) as JsonObject,
    fixtures,
  };
}

export function resolveFixture(spec: JsonObject, fixtureName: string): JsonObject {
  const content = resolveContentFixtures(spec);
  const fixture = content.fixtures[fixtureName];
  if (!fixture) throw new Error(`unknown fixture ${fixtureName}`);
  return { ...fixture };
}

