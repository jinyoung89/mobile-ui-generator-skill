import { createHash } from "node:crypto";
import type { CompiledComponent, CompiledExample } from "../compile-example.js";

type JsonObject = Record<string, unknown>;

export type HtmlArtifactManifest = {
  manifest_version: "1.0.0";
  example_id: string;
  platform: "html_css";
  harness_version: "1.0.0";
  source_hash: string;
  module_entry: string;
  required_fixtures: string[];
  required_assets: string[];
  capabilities: { network: false; authentication: false; payment_execution: false; push: false; fixture_only: true };
  assembly_command: string;
  run_command: string;
  profiles: string[];
};

export type HtmlArtifact = {
  html: string;
  css: string;
  js: string;
  manifest: HtmlArtifactManifest;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function numberMeasure(value: unknown, fallback = 0): number {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as JsonObject).value === "number") return Number((value as JsonObject).value);
  return fallback;
}

function color(compiled: CompiledExample, name: string, fallback: string): string {
  const value = compiled.tokens.colors[name];
  return typeof value === "string" ? value : fallback;
}

function contentText(compiled: CompiledExample, key: string, fallback: string): string {
  const locale = compiled.content.copy as JsonObject;
  const value = locale[key];
  return typeof value === "string" ? value : fallback;
}

function componentLabel(component: CompiledComponent): string {
  const value = component.accessibility.label;
  return typeof value === "string" ? value : component.id;
}

function componentMarkup(compiled: CompiledExample, component: CompiledComponent): string {
  const label = componentLabel(component);
  const id = escapeHtml(component.id);
  if (component.role === "screen") return "";
  if (component.role === "text_field") {
    const fixture = compiled.fixtures.address_default as JsonObject | undefined;
    const value = fixture && typeof fixture.label === "string" ? fixture.label : "";
    return `<div class="ui-field" data-component="${id}" data-state="${escapeHtml(component.default_state)}"><label for="${id}">${escapeHtml(label)}</label><input id="${id}" name="${id}" type="text" value="${escapeHtml(value)}" autocomplete="street-address" aria-describedby="${id}-hint" data-focus-scroll /><span class="ui-hint" id="${id}-hint" role="status"></span></div>`;
  }
  if (component.role === "primary_action" || component.role === "button") {
    const text = contentText(compiled, "pay", label);
    const action = compiled.interactions.find((item) => item.source === component.id)?.id ?? component.id;
    return `<button class="ui-button ui-button-primary" type="button" data-component="${id}" data-action="${escapeHtml(action)}" aria-label="${escapeHtml(label)}"><span class="ui-button-label">${escapeHtml(text)}</span><span class="ui-button-spinner" aria-hidden="true"></span></button>`;
  }
  return `<section class="ui-component" data-component="${id}" data-state="${escapeHtml(component.default_state)}" aria-label="${escapeHtml(label)}"></section>`;
}

function typographyValue(compiled: CompiledExample, role: string, field: string, fallback: number): number {
  const value = compiled.tokens.typography[role]?.[field];
  return numberMeasure(value, fallback);
}

function componentValue(compiled: CompiledExample, id: string, field: "padding" | "gap", fallback: number): number {
  const component = compiled.components.find((item) => item.id === id);
  return numberMeasure(component?.layout[field], fallback);
}

function fixtureSummary(compiled: CompiledExample): { label: string; value: string } {
  const [name, data] = Object.entries(compiled.fixtures)[0] ?? ["fixture", {}];
  const row = data as JsonObject;
  const first = Object.entries(row).find(([, value]) => typeof value === "string" || typeof value === "number");
  return { label: name.replaceAll("_", " "), value: first ? String(first[1]) : "Local fixture" };
}

function responsiveMedia(compiled: CompiledExample, supportedMax: number): string {
  const rules = compiled.responsive_rules;
  const compact = rules.find((rule) => Number((rule.width as JsonObject).max) < 375);
  const large = rules.find((rule) => Number((rule.width as JsonObject).min) > 400);
  const compactMax = compact ? Number((compact.width as JsonObject).max) : 374;
  const largeMin = large ? Number((large.width as JsonObject).min) : 410;
  return `@media (min-width: ${supportedMax + 1}px) { body { padding: 24px 0; } .mobile-screen { min-height: calc(100dvh - 48px); border-radius: 28px; box-shadow: 0 12px 36px rgb(15 23 42 / .18); } }\n@media (max-width: ${compactMax}px) { .screen-header { padding-block: var(--micro-gap); } h1 { font-size: calc(var(--title-size) - var(--micro-gap)); line-height: calc(var(--title-line) - var(--micro-gap)); } }\n@media (min-width: ${largeMin}px) { .screen-description { max-width: calc(var(--readable-line-width) + var(--section-gap)); } }`;
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("</", "<\\/");
}

export function generateHtmlArtifact(compiled: CompiledExample): HtmlArtifact {
  const layout = compiled.layout as JsonObject;
  const screenInset = numberMeasure(layout.screen_horizontal_inset, 16);
  const componentGap = numberMeasure(layout.component_gap, 12);
  const sectionGap = numberMeasure(layout.section_gap, 16);
  const cardPadding = numberMeasure(layout.card_padding, 16);
  const controlHeight = numberMeasure(layout.control_height, 52);
  const radius = numberMeasure(layout.corner_radius, 12);
  const sticky = numberMeasure(layout.sticky_region_height, 84);
  const bottomInset = numberMeasure(layout.scroll_content_bottom_inset, 100);
  const supportedMax = Number((compiled.viewport.supported_width_range as JsonObject).max ?? 430);
  const microGap = numberMeasure(compiled.tokens.layout.space_1, 4);
  const fieldGap = componentValue(compiled, "address-field", "gap", microGap);
  const controlPadding = componentValue(compiled, "address-field", "padding", 12);
  const titleSize = typographyValue(compiled, "title", "size", 24);
  const titleLine = typographyValue(compiled, "title", "line_height", 32);
  const titleLetter = typographyValue(compiled, "title", "letter_spacing", 0);
  const bodySize = typographyValue(compiled, "body", "size", 16);
  const bodyLine = typographyValue(compiled, "body", "line_height", 24);
  const labelSize = typographyValue(compiled, "label", "size", 14);
  const labelLine = typographyValue(compiled, "label", "line_height", 20);
  const safe = compiled.safe_area as JsonObject;
  const safeTop = Number(safe.top ?? 0);
  const safeBottom = Number(safe.bottom ?? 0);
  const title = contentText(compiled, "title", "Mobile screen");
  const source = JSON.stringify(compiled);
  const sourceHash = createHash("sha256").update(source).digest("hex");
  const screen = compiled.components.find((component) => component.role === "screen");
  const children = compiled.components.filter((component) => component.role !== "screen").map((component) => componentMarkup(compiled, component)).join("\n");
  const summary = fixtureSummary(compiled);
  const primaryAction = compiled.interactions[0]?.id ?? compiled.components.find((component) => component.role === "primary_action")?.id ?? "primary-action";
  const primaryLabel = contentText(compiled, "pay", String(compiled.components.find((component) => component.id === primaryAction)?.accessibility.label ?? "Continue"));
  const html = `<main class="mobile-screen" data-example-id="${escapeHtml(compiled.example_id)}" data-state="default" aria-labelledby="screen-title"><div class="safe-area-top" aria-hidden="true"></div><div class="mobile-scroll"><header class="screen-header"><p class="eyebrow">${escapeHtml(String(compiled.classification.app_category ?? "mobile"))}</p><h1 id="screen-title">${escapeHtml(title)}</h1><p class="screen-description">${escapeHtml(String(compiled.request.user_job ?? "Complete the task"))}</p></header><form class="screen-content" data-component="${escapeHtml(screen?.id ?? "screen")}" novalidate>${children}<section class="fixture-card" aria-label="${escapeHtml(summary.label)}"><div><span class="fixture-label">${escapeHtml(summary.label)}</span><strong>${escapeHtml(summary.value)}</strong></div></section></form></div><div class="mobile-sticky" data-fixed-region="primary-action"><div class="sticky-inner"><button class="ui-button ui-button-primary" type="button" data-action="${escapeHtml(primaryAction)}" aria-label="${escapeHtml(primaryLabel)}"><span class="ui-button-label">${escapeHtml(primaryLabel)}</span><span class="ui-button-spinner" aria-hidden="true"></span></button></div></div><div class="live-region" aria-live="polite" role="status"></div></main>`;
  const derivedBase = BASE_CSS
    .replace("@media (min-width: 431px) { body { padding: 24px 0; } .mobile-screen { min-height: calc(100dvh - 48px); border-radius: 28px; box-shadow: 0 12px 36px rgb(15 23 42 / .18); } }\n@media (max-width: 374px) { .screen-header { padding-block: 12px; } h1 { font-size: 22px; line-height: 28px; } }\n@media (min-width: 410px) { .screen-description { max-width: 390px; } }", responsiveMedia(compiled, supportedMax))
    .replaceAll("font-size: 24px", "font-size: var(--title-size)")
    .replaceAll("line-height: 32px", "line-height: var(--title-line)")
    .replaceAll("letter-spacing: -.2px", "letter-spacing: var(--title-letter-spacing)")
    .replaceAll("font-size: 16px", "font-size: var(--body-size)")
    .replaceAll("line-height: 24px", "line-height: var(--body-line)")
    .replaceAll("font-size: 14px", "font-size: var(--label-size)")
    .replaceAll("line-height: 20px", "line-height: var(--label-line)")
    .replaceAll("margin: 8px 0 0", "margin: var(--micro-gap) 0 0")
    .replaceAll("gap: 6px", "gap: var(--field-gap)")
    .replaceAll("padding: 0 12px", "padding: 0 var(--control-padding)")
    .replaceAll("padding: 0 16px", "padding: 0 var(--card-padding)");
  const css = `:root { --safe-top: env(safe-area-inset-top, ${safeTop}px); --safe-bottom: env(safe-area-inset-bottom, ${safeBottom}px); --screen-inset: ${screenInset}px; --component-gap: ${componentGap}px; --section-gap: ${sectionGap}px; --card-padding: ${cardPadding}px; --control-height: ${controlHeight}px; --corner-radius: ${radius}px; --sticky-region-height: ${sticky}px; --scroll-content-bottom-inset: ${bottomInset}px; --micro-gap: ${microGap}px; --field-gap: ${fieldGap}px; --control-padding: ${controlPadding}px; --title-size: ${titleSize}px; --title-line: ${titleLine}px; --title-letter-spacing: ${titleLetter}px; --body-size: ${bodySize}px; --body-line: ${bodyLine}px; --label-size: ${labelSize}px; --label-line: ${labelLine}px; --readable-line-width: ${numberMeasure(layout.max_readable_line_width, 360)}px; --color-text: ${color(compiled, "text", "#111827")}; --color-surface: ${color(compiled, "surface", "#ffffff")}; --color-primary: ${color(compiled, "primary", "#2563eb")}; --color-danger: ${color(compiled, "danger", "#dc2626")}; }\n${derivedBase}`;
  const js = `window.__MOBILE_UI_EXAMPLE__ = ${safeJson({ exampleId: compiled.example_id, fixtures: compiled.fixtures, defaultState: "default" })};`;
  const manifest: HtmlArtifactManifest = {
    manifest_version: "1.0.0",
    example_id: compiled.example_id,
    platform: "html_css",
    harness_version: "1.0.0",
    source_hash: sourceHash,
    module_entry: `harnesses/html/src/examples.ts#${compiled.example_id}`,
    required_fixtures: Object.keys(compiled.fixtures),
    required_assets: [],
    capabilities: { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true },
    assembly_command: "npm --prefix harnesses/html ci && npm --prefix harnesses/html run build",
    run_command: "npm --prefix harnesses/html run preview -- --host 127.0.0.1 --port 4173",
    profiles: ["compact", "standard", "large", "short-keyboard", "large-text"],
  };
  return { html, css, js, manifest };
}

export const BASE_CSS = `* { box-sizing: border-box; }\nhtml, body { margin: 0; min-width: 320px; background: #e5e7eb; color: var(--color-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }\nbody { overflow-x: hidden; }\n.mobile-screen { position: relative; min-height: 100dvh; max-width: 430px; margin: 0 auto; overflow-x: hidden; background: var(--color-surface); }\n.safe-area-top { height: var(--safe-top); }\n.mobile-scroll { min-height: 100dvh; padding-top: 0; padding-right: var(--screen-inset); padding-bottom: calc(var(--sticky-region-height) + var(--scroll-content-bottom-inset) + var(--safe-bottom)); padding-left: var(--screen-inset); overflow-x: hidden; }\n.screen-header { padding: var(--section-gap) 0; }\n.eyebrow, .fixture-label { margin: 0 0 6px; color: color-mix(in srgb, var(--color-text) 65%, transparent); font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }\nh1 { margin: 0; font-size: 24px; line-height: 32px; letter-spacing: -.2px; }\n.screen-description { max-width: 360px; margin: 8px 0 0; font-size: 16px; line-height: 24px; }\n.screen-content { display: grid; gap: var(--component-gap); min-width: 0; }\n.ui-field { display: grid; gap: 6px; min-width: 0; }\n.ui-field label { font-size: 14px; line-height: 20px; font-weight: 600; }\n.ui-field input { width: 100%; min-height: var(--control-height); border: 1px solid #9ca3af; border-radius: var(--corner-radius); padding: 0 12px; color: var(--color-text); background: var(--color-surface); font: inherit; font-size: 16px; line-height: 24px; }\n.ui-field input:focus { outline: 3px solid color-mix(in srgb, var(--color-primary) 30%, transparent); outline-offset: 2px; border-color: var(--color-primary); }\n.ui-hint { min-height: 20px; color: var(--color-danger); font-size: 12px; }\n.fixture-card { display: flex; min-height: var(--control-height); align-items: center; padding: var(--card-padding); border-radius: var(--corner-radius); background: #f3f4f6; }\n.fixture-card strong { display: block; margin-top: 2px; font-size: 16px; line-height: 24px; }\n.mobile-sticky { position: fixed; z-index: 2; right: 0; bottom: 0; left: 0; min-height: var(--sticky-region-height); padding: 12px var(--screen-inset) max(12px, var(--safe-bottom)); background: color-mix(in srgb, var(--color-surface) 94%, transparent); border-top: 1px solid #e5e7eb; backdrop-filter: blur(12px); }\n.sticky-inner { width: min(100%, 430px); margin: 0 auto; }\n.ui-button { position: relative; display: inline-flex; width: 100%; min-height: var(--control-height); align-items: center; justify-content: center; border: 0; border-radius: var(--corner-radius); padding: 0 16px; font: inherit; font-size: 16px; line-height: 24px; font-weight: 700; cursor: pointer; }\n.ui-button-primary { color: #fff; background: var(--color-primary); }\n.ui-button:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-primary) 45%, transparent); outline-offset: 2px; }\n.mobile-screen[data-state="loading"] .ui-button, .mobile-screen[data-state="success"] .ui-button { pointer-events: none; }\n.mobile-screen[data-state="loading"] .ui-button-spinner { display: block; width: 18px; height: 18px; margin-left: 8px; border: 2px solid rgb(255 255 255 / .45); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; }\n.mobile-screen[data-state="success"] .ui-button { background: #15803d; }\n.live-region { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }\n@keyframes spin { to { transform: rotate(360deg); } }\n@media (min-width: 431px) { body { padding: 24px 0; } .mobile-screen { min-height: calc(100dvh - 48px); border-radius: 28px; box-shadow: 0 12px 36px rgb(15 23 42 / .18); } }\n@media (max-width: 374px) { .screen-header { padding-block: 12px; } h1 { font-size: 22px; line-height: 28px; } }\n@media (min-width: 410px) { .screen-description { max-width: 390px; } }\n@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }\n`;
