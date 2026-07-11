#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveContentFixtures, type ContentFixtures } from "./content-fixtures.js";
import { buildPlatformMappingReport, type PlatformMappingReport } from "./platform-mapping-report.js";
import { resolveMeasure, resolveTokenTable, type JsonObject, type ResolvedMeasure, type TokenTable } from "./tokens.js";
import { validateSpec } from "./validate-spec.js";

export type CompiledComponent = {
  id: string;
  role: string;
  parent: string | null;
  order: number;
  layout: {
    width: "fill" | "content" | ResolvedMeasure;
    height: "fill" | "content" | ResolvedMeasure;
    padding: ResolvedMeasure;
    gap: ResolvedMeasure;
    alignment: string;
  };
  states: string[];
  default_state: string;
  text_roles: string[];
  interaction: JsonObject;
  accessibility: JsonObject;
  platform_native_substitution: string;
};

export type CompiledExample = {
  schema_version: 1;
  ir_version: "1.0.0";
  example_id: string;
  request: JsonObject;
  classification: JsonObject;
  viewport: JsonObject;
  safe_area: JsonObject;
  tokens: {
    layout: TokenTable;
    typography: Record<string, JsonObject>;
    colors: JsonObject;
  };
  layout: JsonObject;
  components: CompiledComponent[];
  state_matrix: JsonObject;
  content: ContentFixtures;
  fixtures: Record<string, JsonObject>;
  navigation: JsonObject[];
  interactions: JsonObject[];
  responsive_rules: JsonObject[];
  accessibility: JsonObject;
  focus_and_keyboard: JsonObject;
  platform_mappings: PlatformMappingReport["platforms"];
  parity: PlatformMappingReport;
};

export type CompileOptions = { validate?: boolean; language?: string };

function object(value: unknown, field: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as JsonObject;
}

function array(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value;
}

function clone(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as JsonObject).map(([key, child]) => [key, clone(child)]));
  return value;
}

function resolveLayout(spec: JsonObject, tokens: TokenTable, viewport: number): JsonObject {
  const layout = object(spec.layout, "layout");
  const policy = object(spec.platform_policy, "platform_policy");
  const safe = object(policy.safe_area, "platform_policy.safe_area");
  const context = { viewport, safe_area_top: Number(safe.top), safe_area_bottom: Number(safe.bottom) };
  const measure = (value: unknown, field: string): ResolvedMeasure => resolveMeasure(value, field, tokens, context);
  const grid = object(layout.grid, "layout.grid");
  const ratios = object(layout.image_aspect_ratios, "layout.image_aspect_ratios");
  return {
    screen_horizontal_inset: measure(layout.screen_horizontal_inset, "layout.screen_horizontal_inset"),
    grid: { columns: grid.columns, gutter: measure(grid.gutter, "layout.grid.gutter") },
    alignment_anchors: clone(layout.alignment_anchors),
    component_gap: measure(layout.component_gap, "layout.component_gap"),
    section_gap: measure(layout.section_gap, "layout.section_gap"),
    card_padding: measure(layout.card_padding, "layout.card_padding"),
    control_height: measure(layout.control_height, "layout.control_height"),
    corner_radius: measure(layout.corner_radius, "layout.corner_radius"),
    sticky_region_height: measure(layout.sticky_region_height, "layout.sticky_region_height"),
    scroll_content_bottom_inset: measure(layout.scroll_content_bottom_inset, "layout.scroll_content_bottom_inset"),
    max_readable_line_width: measure(layout.max_readable_line_width, "layout.max_readable_line_width"),
    image_aspect_ratios: clone(ratios),
    constraints: clone(layout.constraints),
  };
}

function resolveTypography(spec: JsonObject, tokens: TokenTable, viewport: number): Record<string, JsonObject> {
  const typography = object(spec.typography, "typography");
  const safe = object(object(spec.platform_policy, "platform_policy").safe_area, "platform_policy.safe_area");
  const context = { viewport, safe_area_top: Number(safe.top), safe_area_bottom: Number(safe.bottom) };
  const roles: Record<string, JsonObject> = {};
  for (const item of array(typography.roles, "typography.roles")) {
    const role = object(item, "typography.roles[]");
    const id = String(role.id);
    roles[id] = {
      id,
      font_family: role.font_family,
      size: resolveMeasure(role.size, `typography.roles.${id}.size`, tokens, context),
      line_height: resolveMeasure(role.line_height, `typography.roles.${id}.line_height`, tokens, context),
      weight: role.weight,
      ...(role.letter_spacing === undefined ? {} : { letter_spacing: resolveMeasure(role.letter_spacing, `typography.roles.${id}.letter_spacing`, tokens, context) }),
      max_lines: role.max_lines,
      overflow: role.overflow,
      text_scale_policy: role.text_scale_policy,
      min_contrast_ratio: role.min_contrast_ratio,
    };
  }
  return roles;
}

function resolveComponents(spec: JsonObject, tokens: TokenTable, viewport: number): CompiledComponent[] {
  const policy = object(spec.platform_policy, "platform_policy");
  const safe = object(policy.safe_area, "platform_policy.safe_area");
  const context = { viewport, safe_area_top: Number(safe.top), safe_area_bottom: Number(safe.bottom) };
  return array(spec.components, "components").map((item, index) => {
    const row = object(item, `components[${index}]`);
    const layout = object(row.layout, `components[${index}].layout`);
    const measure = (value: unknown, field: string): ResolvedMeasure => resolveMeasure(value, field, tokens, context);
    const resolveSize = (value: unknown, field: string): "fill" | "content" | ResolvedMeasure => value === "fill" || value === "content" ? value : measure(value, field);
    return {
      id: String(row.id),
      role: String(row.role),
      parent: row.parent === null ? null : String(row.parent),
      order: Number(row.order),
      layout: {
        width: resolveSize(layout.width, `components[${index}].layout.width`),
        height: resolveSize(layout.height, `components[${index}].layout.height`),
        padding: measure(layout.padding, `components[${index}].layout.padding`),
        gap: measure(layout.gap, `components[${index}].layout.gap`),
        alignment: String(layout.alignment),
      },
      states: [...(Array.isArray(row.states) ? row.states.filter((value): value is string => typeof value === "string") : [])],
      default_state: String(row.default_state),
      text_roles: Array.isArray(row.text_roles) ? row.text_roles.filter((value): value is string => typeof value === "string") : [],
      interaction: clone(row.interaction) as JsonObject,
      accessibility: clone(row.accessibility) as JsonObject,
      platform_native_substitution: String(row.platform_native_substitution),
    };
  }).sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

function resolveNavigation(spec: JsonObject): JsonObject[] {
  return array(spec.navigation_and_actions, "navigation_and_actions").map((item, index) => {
    const row = object(item, `navigation_and_actions[${index}]`);
    return clone(row) as JsonObject;
  });
}

function validateOrThrow(spec: JsonObject): void {
  const result = validateSpec(spec);
  if (!result.valid) throw new Error(`invalid canonical spec:\n${result.errors.join("\n")}`);
}

export function compileExample(specInput: unknown, options: CompileOptions = {}): CompiledExample {
  const spec = object(specInput, "spec");
  if (options.validate !== false) validateOrThrow(spec);
  const policy = object(spec.platform_policy, "platform_policy");
  const viewport = Number(policy.reference_viewport_width);
  if (!Number.isFinite(viewport) || viewport <= 0) throw new Error("platform_policy.reference_viewport_width must be positive");
  const safe = object(policy.safe_area, "platform_policy.safe_area");
  const tokens = resolveTokenTable(object(object(spec.layout, "layout").tokens, "layout.tokens"), {
    viewport,
    safe_area_top: Number(safe.top),
    safe_area_bottom: Number(safe.bottom),
  });
  const content = resolveContentFixtures(spec, options.language);
  const parity = buildPlatformMappingReport(spec);
  const components = resolveComponents(spec, tokens, viewport);
  const layout = resolveLayout(spec, tokens, viewport);
  return {
    schema_version: 1,
    ir_version: "1.0.0",
    example_id: String(spec.id),
    request: clone(spec.request) as JsonObject,
    classification: clone(spec.classification) as JsonObject,
    viewport: {
      reference_width: viewport,
      supported_width_range: clone(policy.supported_width_range),
      profiles: clone(object(spec.quality_requirements, "quality_requirements").responsive_profiles),
    },
    safe_area: clone(safe) as JsonObject,
    tokens: {
      layout: tokens,
      typography: resolveTypography(spec, tokens, viewport),
      colors: clone(object(spec.colors, "colors").tokens) as JsonObject,
    },
    layout,
    components,
    state_matrix: clone(spec.states) as JsonObject,
    content,
    fixtures: content.fixtures,
    navigation: resolveNavigation(spec),
    interactions: array(spec.interactions, "interactions").map((item, index) => clone(object(item, `interactions[${index}]`)) as JsonObject),
    responsive_rules: array(spec.responsive_rules, "responsive_rules").map((item, index) => clone(object(item, `responsive_rules[${index}]`)) as JsonObject),
    accessibility: clone(object(spec.accessibility, "accessibility")) as JsonObject,
    focus_and_keyboard: clone(object(spec.focus_and_keyboard, "focus_and_keyboard")) as JsonObject,
    platform_mappings: parity.platforms,
    parity,
  };
}

export function stableStringify(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.fromEntries(Object.keys(item as JsonObject).sort().map((key) => [key, normalize((item as JsonObject)[key])]));
    return item;
  };
  return JSON.stringify(normalize(value));
}

function runCli(): void {
  const args = process.argv.slice(2);
  let specPath = path.resolve(import.meta.dirname, "../../examples/proof/commerce-checkout/spec.json");
  let outPath: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--spec") specPath = path.resolve(args[++index] ?? "");
    else if (args[index] === "--out") outPath = path.resolve(args[++index] ?? "");
    else throw new Error(`unknown argument: ${args[index]}`);
  }
  const output = `${stableStringify(compileExample(JSON.parse(readFileSync(specPath, "utf8")) as JsonObject))}\n`;
  if (outPath) writeFileSync(outPath, output, "utf8");
  else process.stdout.write(output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
