#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type JsonObject = Record<string, unknown>;
export type SpecValidationResult = { valid: boolean; errors: string[] };

const TOP_LEVEL = new Set([
  "schema_version", "id", "request", "classification", "platform_policy", "layout", "typography", "colors",
  "components", "states", "interactions", "responsive_rules", "accessibility", "content", "assets_and_fallbacks",
  "fixture_data", "navigation_and_actions", "validation_rules", "focus_and_keyboard", "localization", "themes",
  "capabilities_and_dependencies", "platform_mappings", "quality_requirements",
]);
const PLATFORMS = ["html_css", "react_native", "flutter", "swiftui"] as const;
const UNITS = new Set(["px", "pt", "dp", "sp", "ratio"]);
const ROUNDING = new Set(["nearest", "floor", "ceil"]);
const RISKS = new Set(["low", "medium", "high"]);
const OUTCOMES = new Set(["local_state", "local_screen", "local_modal", "fixture_result"]);
const PRECEDENCE = ["safe_area", "fixed_region", "min_max", "content"];

function object(value: unknown, field: string, errors: string[]): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${field}: expected an object`);
    return undefined;
  }
  return value as JsonObject;
}

function array(value: unknown, field: string, errors: string[]): unknown[] | undefined {
  if (!Array.isArray(value)) {
    errors.push(`${field}: expected an array`);
    return undefined;
  }
  return value;
}

function required(value: JsonObject, fields: string[], field: string, errors: string[]): void {
  for (const key of fields) if (!(key in value)) errors.push(`${field}.${key}: required`);
}

function strict(value: JsonObject, allowed: readonly string[] | Set<string>, field: string, errors: string[]): void {
  const known = allowed instanceof Set ? allowed : new Set(allowed);
  for (const key of Object.keys(value)) if (!known.has(key)) errors.push(`${field}.${key}: unknown key`);
}

function stringValue(value: unknown, field: string, errors: string[], nonEmpty = true): string | undefined {
  if (typeof value !== "string" || (nonEmpty && value.trim() === "")) {
    errors.push(`${field}: expected a non-empty string`);
    return undefined;
  }
  return value;
}

function requireUniqueStrings(values: unknown[], field: string, errors: string[], nonEmpty = true): void {
  if (nonEmpty && values.length === 0) errors.push(`${field}: must be non-empty`);
  const strings = values.filter((value): value is string => typeof value === "string");
  if (new Set(strings).size !== strings.length) errors.push(`${field}: values must be unique`);
}

function numberValue(value: unknown, field: string, errors: string[], options: { integer?: boolean; min?: number; max?: number } = {}): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || (options.integer && !Number.isInteger(value)) ||
      (options.min !== undefined && value < options.min) || (options.max !== undefined && value > options.max)) {
    const suffix = options.min !== undefined && options.max !== undefined ? ` between ${options.min} and ${options.max}` : options.min !== undefined ? ` >= ${options.min}` : options.max !== undefined ? ` <= ${options.max}` : "";
    errors.push(`${field}: expected finite ${options.integer ? "integer" : "number"}${suffix}`);
    return undefined;
  }
  return value;
}

function checkMeasure(value: unknown, field: string, errors: string[], tokens: Set<string>, allowContentString = false): void {
  if (allowContentString && (value === "fill" || value === "content")) return;
  const row = object(value, field, errors);
  if (!row) return;
  strict(row, ["value", "unit", "token", "formula", "min", "max"], field, errors);
  const variants = ["value", "token", "formula"].filter((key) => key in row);
  if (variants.length !== 1) {
    errors.push(`${field}: exactly one of value, token, or formula is required`);
    return;
  }
  if ("token" in row) {
    const name = stringValue(row.token, `${field}.token`, errors);
    if (name && !tokens.has(name)) errors.push(`${field}.token: unresolved token ${name}`);
    if ("unit" in row || "min" in row || "max" in row) errors.push(`${field}: token references cannot add unit or bounds`);
    return;
  }
  if ("value" in row) {
    numberValue(row.value, `${field}.value`, errors);
    const unit = stringValue(row.unit, `${field}.unit`, errors);
    if (unit && !UNITS.has(unit)) errors.push(`${field}.unit: unsupported unit ${unit}`);
    if ("min" in row || "max" in row) errors.push(`${field}: fixed values cannot add min/max bounds`);
    return;
  }
  const formula = stringValue(row.formula, `${field}.formula`, errors);
  const unit = stringValue(row.unit, `${field}.unit`, errors);
  if (unit && !UNITS.has(unit)) errors.push(`${field}.unit: unsupported unit ${unit}`);
  if (!formula || !/^[A-Za-z0-9_ .+*/()%-]+$/.test(formula)) errors.push(`${field}.formula: unsafe formula`);
  const min = numberValue(row.min, `${field}.min`, errors);
  const max = numberValue(row.max, `${field}.max`, errors);
  if (min !== undefined && max !== undefined && min > max) errors.push(`${field}: min must not exceed max`);
}

function checkColorTokens(value: JsonObject, errors: string[]): Set<string> {
  strict(value, ["tokens", "contrast_pairs"], "colors", errors);
  const tokens = object(value.tokens, "colors.tokens", errors);
  const tokenNames = new Set(tokens ? Object.keys(tokens) : []);
  if (tokens) {
    if (Object.keys(tokens).length === 0) errors.push("colors.tokens: at least one token is required");
    for (const [name, color] of Object.entries(tokens)) {
      if (typeof color !== "string" || !/^#[0-9A-Fa-f]{6,8}$/.test(color)) errors.push(`colors.tokens.${name}: expected #RRGGBB or #RRGGBBAA`);
    }
  }
  const pairs = array(value.contrast_pairs, "colors.contrast_pairs", errors);
  pairs?.forEach((pair, index) => {
    const row = object(pair, `colors.contrast_pairs[${index}]`, errors);
    if (!row) return;
    strict(row, ["foreground", "background", "minimum_ratio"], `colors.contrast_pairs[${index}]`, errors);
    required(row, ["foreground", "background", "minimum_ratio"], `colors.contrast_pairs[${index}]`, errors);
    stringValue(row.foreground, `colors.contrast_pairs[${index}].foreground`, errors);
    stringValue(row.background, `colors.contrast_pairs[${index}].background`, errors);
    if (typeof row.foreground === "string" && !tokenNames.has(row.foreground)) errors.push(`colors.contrast_pairs[${index}].foreground: unknown color token ${row.foreground}`);
    if (typeof row.background === "string" && !tokenNames.has(row.background)) errors.push(`colors.contrast_pairs[${index}].background: unknown color token ${row.background}`);
    numberValue(row.minimum_ratio, `colors.contrast_pairs[${index}].minimum_ratio`, errors, { min: 1 });
  });
  return tokenNames;
}

function checkPlatformPolicy(value: JsonObject, errors: string[]): void {
  strict(value, ["reference_viewport_width", "supported_width_range", "safe_area", "token_resolution_order", "rounding", "constraint_precedence"], "platform_policy", errors);
  required(value, ["reference_viewport_width", "supported_width_range", "safe_area", "token_resolution_order", "rounding", "constraint_precedence"], "platform_policy", errors);
  const reference = numberValue(value.reference_viewport_width, "platform_policy.reference_viewport_width", errors, { integer: true, min: 1 });
  const range = object(value.supported_width_range, "platform_policy.supported_width_range", errors);
  let min: number | undefined;
  let max: number | undefined;
  if (range) {
    strict(range, ["min", "max"], "platform_policy.supported_width_range", errors);
    min = numberValue(range.min, "platform_policy.supported_width_range.min", errors, { integer: true, min: 1 });
    max = numberValue(range.max, "platform_policy.supported_width_range.max", errors, { integer: true, min: 1 });
    if (min !== undefined && max !== undefined && min > max) errors.push("platform_policy.supported_width_range: min must not exceed max");
  }
  if (reference !== undefined && min !== undefined && max !== undefined && (reference < min || reference > max)) errors.push("platform_policy.reference_viewport_width: must be within supported_width_range");
  const safe = object(value.safe_area, "platform_policy.safe_area", errors);
  if (safe) {
    strict(safe, ["top", "bottom", "unit", "mode"], "platform_policy.safe_area", errors);
    required(safe, ["top", "bottom", "unit", "mode"], "platform_policy.safe_area", errors);
    numberValue(safe.top, "platform_policy.safe_area.top", errors, { min: 0 });
    numberValue(safe.bottom, "platform_policy.safe_area.bottom", errors, { min: 0 });
    const unit = stringValue(safe.unit, "platform_policy.safe_area.unit", errors);
    if (unit && unit !== "px") errors.push("platform_policy.safe_area.unit: canonical safe-area unit must be px");
    stringValue(safe.mode, "platform_policy.safe_area.mode", errors);
  }
  const order = array(value.token_resolution_order, "platform_policy.token_resolution_order", errors);
  if (order) {
    if (order.length === 0 || new Set(order).size !== order.length) errors.push("platform_policy.token_resolution_order: must be non-empty and unique");
    order.forEach((entry, index) => stringValue(entry, `platform_policy.token_resolution_order[${index}]`, errors));
  }
  const rounding = object(value.rounding, "platform_policy.rounding", errors);
  if (rounding) {
    strict(rounding, PLATFORMS, "platform_policy.rounding", errors);
    for (const platform of PLATFORMS) {
      const valueForPlatform = stringValue(rounding[platform], `platform_policy.rounding.${platform}`, errors);
      if (valueForPlatform && !ROUNDING.has(valueForPlatform)) errors.push(`platform_policy.rounding.${platform}: unsupported rounding mode`);
    }
  }
  const precedence = array(value.constraint_precedence, "platform_policy.constraint_precedence", errors);
  if (precedence && (precedence.length !== PRECEDENCE.length || precedence.some((entry, index) => entry !== PRECEDENCE[index]))) errors.push("platform_policy.constraint_precedence: must be safe_area, fixed_region, min_max, content in that order");
}

function checkLayout(value: JsonObject, errors: string[]): Set<string> {
  strict(value, ["tokens", "screen_horizontal_inset", "grid", "alignment_anchors", "component_gap", "section_gap", "card_padding", "control_height", "corner_radius", "sticky_region_height", "scroll_content_bottom_inset", "max_readable_line_width", "image_aspect_ratios", "constraints"], "layout", errors);
  required(value, ["tokens", "screen_horizontal_inset", "grid", "alignment_anchors", "component_gap", "section_gap", "card_padding", "control_height", "corner_radius", "sticky_region_height", "scroll_content_bottom_inset", "max_readable_line_width", "image_aspect_ratios", "constraints"], "layout", errors);
  const tokens = object(value.tokens, "layout.tokens", errors);
  const names = new Set(tokens ? Object.keys(tokens) : []);
  if (tokens && names.size === 0) errors.push("layout.tokens: must be non-empty");
  if (tokens) for (const [name, token] of Object.entries(tokens)) {
    checkMeasure(token, `layout.tokens.${name}`, errors, names);
    const row = token as JsonObject;
    if (row && typeof row === "object" && "token" in row && row.token === name) errors.push(`layout.tokens.${name}: token cannot reference itself`);
  }
  if (tokens) {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (name: string, trail: string[]): void => {
      if (visiting.has(name)) {
        errors.push(`layout.tokens.${name}: token cycle detected (${[...trail, name].join(" -> ")})`);
        return;
      }
      if (visited.has(name)) return;
      visiting.add(name);
      const row = tokens[name] as JsonObject | undefined;
      if (row && typeof row.token === "string" && names.has(row.token)) visit(row.token, [...trail, name]);
      visiting.delete(name);
      visited.add(name);
    };
    for (const name of names) visit(name, []);
  }
  for (const field of ["screen_horizontal_inset", "component_gap", "section_gap", "card_padding", "control_height", "corner_radius", "sticky_region_height", "scroll_content_bottom_inset", "max_readable_line_width"]) checkMeasure(value[field], `layout.${field}`, errors, names);
  const grid = object(value.grid, "layout.grid", errors);
  if (grid) {
    strict(grid, ["columns", "gutter"], "layout.grid", errors);
    required(grid, ["columns", "gutter"], "layout.grid", errors);
    numberValue(grid.columns, "layout.grid.columns", errors, { integer: true, min: 1 });
    checkMeasure(grid.gutter, "layout.grid.gutter", errors, names);
  }
  const anchors = array(value.alignment_anchors, "layout.alignment_anchors", errors);
  if (anchors && anchors.length === 0) errors.push("layout.alignment_anchors: must be non-empty");
  anchors?.forEach((anchor, index) => stringValue(anchor, `layout.alignment_anchors[${index}]`, errors));
  const ratios = object(value.image_aspect_ratios, "layout.image_aspect_ratios", errors);
  if (ratios) for (const [name, ratio] of Object.entries(ratios)) {
    const row = object(ratio, `layout.image_aspect_ratios.${name}`, errors);
    if (!row) continue;
    strict(row, ["width", "height", "crop"], `layout.image_aspect_ratios.${name}`, errors);
    numberValue(row.width, `layout.image_aspect_ratios.${name}.width`, errors, { min: 0.01 });
    numberValue(row.height, `layout.image_aspect_ratios.${name}.height`, errors, { min: 0.01 });
    const crop = stringValue(row.crop, `layout.image_aspect_ratios.${name}.crop`, errors);
    if (crop && !new Set(["cover", "contain", "fill"]).has(crop)) errors.push(`layout.image_aspect_ratios.${name}.crop: unsupported crop mode`);
  }
  const constraints = object(value.constraints, "layout.constraints", errors);
  if (constraints) {
    strict(constraints, ["precedence"], "layout.constraints", errors);
    const precedence = array(constraints.precedence, "layout.constraints.precedence", errors);
    if (precedence && (precedence.length !== PRECEDENCE.length || precedence.some((entry, index) => entry !== PRECEDENCE[index]))) errors.push("layout.constraints.precedence: must match platform policy precedence");
  }
  return names;
}

function checkTypography(value: JsonObject, errors: string[], tokens: Set<string>): Set<string> {
  strict(value, ["roles"], "typography", errors);
  const roles = array(value.roles, "typography.roles", errors);
  if (roles && roles.length === 0) errors.push("typography.roles: must be non-empty");
  const ids = new Set<string>();
  roles?.forEach((role, index) => {
    const field = `typography.roles[${index}]`;
    const row = object(role, field, errors);
    if (!row) return;
    strict(row, ["id", "font_family", "size", "line_height", "weight", "letter_spacing", "max_lines", "overflow", "text_scale_policy", "min_contrast_ratio"], field, errors);
    required(row, ["id", "font_family", "size", "line_height", "weight", "max_lines", "overflow", "text_scale_policy", "min_contrast_ratio"], field, errors);
    const id = stringValue(row.id, `${field}.id`, errors);
    if (id && ids.has(id)) errors.push(`${field}.id: duplicate role`); else if (id) ids.add(id);
    stringValue(row.font_family, `${field}.font_family`, errors);
    checkMeasure(row.size, `${field}.size`, errors, tokens);
    checkMeasure(row.line_height, `${field}.line_height`, errors, tokens);
    if ("letter_spacing" in row) checkMeasure(row.letter_spacing, `${field}.letter_spacing`, errors, tokens);
    numberValue(row.weight, `${field}.weight`, errors, { integer: true, min: 100, max: 1000 });
    numberValue(row.max_lines, `${field}.max_lines`, errors, { integer: true, min: 1 });
    stringValue(row.overflow, `${field}.overflow`, errors);
    stringValue(row.text_scale_policy, `${field}.text_scale_policy`, errors);
    numberValue(row.min_contrast_ratio, `${field}.min_contrast_ratio`, errors, { min: 1 });
  });
  return ids;
}

function checkComponents(value: unknown, errors: string[], tokens: Set<string>, componentStates: Set<string>, typographyRoles: Set<string>): Set<string> {
  const components = array(value, "components", errors);
  if (components && components.length === 0) errors.push("components: must be non-empty");
  const ids = new Set<string>();
  const rows: JsonObject[] = [];
  components?.forEach((component, index) => {
    const field = `components[${index}]`;
    const row = object(component, field, errors);
    if (!row) return;
    rows.push(row);
    strict(row, ["id", "role", "parent", "order", "layout", "states", "default_state", "text_roles", "interaction", "accessibility", "platform_native_substitution"], field, errors);
    required(row, ["id", "role", "parent", "order", "layout", "states", "default_state", "interaction", "accessibility", "platform_native_substitution"], field, errors);
    const id = stringValue(row.id, `${field}.id`, errors);
    if (id && ids.has(id)) errors.push(`${field}.id: duplicate component id`); else if (id) ids.add(id);
    stringValue(row.role, `${field}.role`, errors);
    if (row.parent !== null) stringValue(row.parent, `${field}.parent`, errors);
    numberValue(row.order, `${field}.order`, errors, { integer: true, min: 0 });
    const layout = object(row.layout, `${field}.layout`, errors);
    if (layout) {
      strict(layout, ["width", "height", "padding", "gap", "alignment"], `${field}.layout`, errors);
      required(layout, ["width", "height", "padding", "gap", "alignment"], `${field}.layout`, errors);
      checkMeasure(layout.width, `${field}.layout.width`, errors, tokens, true);
      checkMeasure(layout.height, `${field}.layout.height`, errors, tokens, true);
      checkMeasure(layout.padding, `${field}.layout.padding`, errors, tokens);
      checkMeasure(layout.gap, `${field}.layout.gap`, errors, tokens);
      stringValue(layout.alignment, `${field}.layout.alignment`, errors);
    }
    const states = array(row.states, `${field}.states`, errors);
    if (states && states.length === 0) errors.push(`${field}.states: must be non-empty`);
    const stateNames = new Set<string>();
    if (states) requireUniqueStrings(states, `${field}.states`, errors);
    states?.forEach((state, stateIndex) => {
      const name = stringValue(state, `${field}.states[${stateIndex}]`, errors);
      if (name) { stateNames.add(name); componentStates.add(name); }
    });
    const defaultState = stringValue(row.default_state, `${field}.default_state`, errors);
    if (defaultState && !stateNames.has(defaultState)) errors.push(`${field}.default_state: must be listed in states`);
    const textRolesValue = row.text_roles;
    if (textRolesValue !== undefined) {
      const textRoleList = array(textRolesValue, `${field}.text_roles`, errors);
      textRoleList?.forEach((role, roleIndex) => {
        const roleName = stringValue(role, `${field}.text_roles[${roleIndex}]`, errors);
        if (roleName && !typographyRoles.has(roleName)) errors.push(`${field}.text_roles[${roleIndex}]: unknown typography role ${roleName}`);
      });
    }
    const interaction = object(row.interaction, `${field}.interaction`, errors);
    if (interaction) { strict(interaction, ["kind", "focusable"], `${field}.interaction`, errors); required(interaction, ["kind"], `${field}.interaction`, errors); stringValue(interaction.kind, `${field}.interaction.kind`, errors); if ("focusable" in interaction && typeof interaction.focusable !== "boolean") errors.push(`${field}.interaction.focusable: expected boolean`); }
    const accessibility = object(row.accessibility, `${field}.accessibility`, errors);
    if (accessibility) {
      strict(accessibility, ["label", "target_size"], `${field}.accessibility`, errors);
      required(accessibility, ["label", "target_size"], `${field}.accessibility`, errors);
      stringValue(accessibility.label, `${field}.accessibility.label`, errors);
      const target = object(accessibility.target_size, `${field}.accessibility.target_size`, errors);
      if (target) { strict(target, ["width", "height", "unit"], `${field}.accessibility.target_size`, errors); required(target, ["width", "height", "unit"], `${field}.accessibility.target_size`, errors); const width = numberValue(target.width, `${field}.accessibility.target_size.width`, errors, { min: 44 }); const height = numberValue(target.height, `${field}.accessibility.target_size.height`, errors, { min: 44 }); if (width !== undefined && height !== undefined && (width < 44 || height < 44)) errors.push(`${field}.accessibility.target_size: minimum 44x44`); const unit = stringValue(target.unit, `${field}.accessibility.target_size.unit`, errors); if (unit && !new Set(["px", "pt", "dp"]).has(unit)) errors.push(`${field}.accessibility.target_size.unit: expected px, pt, or dp`); }
    }
    stringValue(row.platform_native_substitution, `${field}.platform_native_substitution`, errors);
  });
  const componentIds = new Set(rows.map((row) => row.id).filter((id): id is string => typeof id === "string"));
  rows.forEach((row, index) => { if (row.parent !== null && typeof row.parent === "string" && !componentIds.has(row.parent)) errors.push(`components[${index}].parent: missing component ${row.parent}`); });
  return componentIds;
}

function checkStates(value: JsonObject, errors: string[], componentStates: Set<string>): Set<string> {
  strict(value, ["screen", "inputs", "cta"], "states", errors);
  required(value, ["screen", "inputs", "cta"], "states", errors);
  for (const key of ["screen", "inputs", "cta"]) {
    const list = array(value[key], `states.${key}`, errors);
    if (list && list.length === 0) errors.push(`states.${key}: must be non-empty`);
    if (list) { requireUniqueStrings(list, `states.${key}`, errors); list.forEach((state, index) => { const name = stringValue(state, `states.${key}[${index}]`, errors); if (name) componentStates.add(name); }); }
  }
  return componentStates;
}

function checkResponsive(value: unknown, errors: string[], policy: JsonObject): void {
  const rules = array(value, "responsive_rules", errors);
  if (rules && rules.length < 3) errors.push("responsive_rules: at least three rules are required for compact, standard, and large widths");
  const covered = [320, 390, 430].map(() => false);
  const ranges: Array<{ min: number; max: number; index: number }> = [];
  rules?.forEach((rule, index) => {
    const field = `responsive_rules[${index}]`;
    const row = object(rule, field, errors);
    if (!row) return;
    strict(row, ["width", "changes", "no_horizontal_overflow", "fixed_regions_preserve_inset"], field, errors);
    required(row, ["width", "changes", "no_horizontal_overflow", "fixed_regions_preserve_inset"], field, errors);
    const width = object(row.width, `${field}.width`, errors);
    let min: number | undefined; let max: number | undefined;
    if (width) { strict(width, ["min", "max"], `${field}.width`, errors); min = numberValue(width.min, `${field}.width.min`, errors, { integer: true, min: 1 }); max = numberValue(width.max, `${field}.width.max`, errors, { integer: true, min: 1 }); if (min !== undefined && max !== undefined && min > max) errors.push(`${field}.width: min must not exceed max`); }
    const changes = array(row.changes, `${field}.changes`, errors); if (changes) { requireUniqueStrings(changes, `${field}.changes`, errors); changes.forEach((change, changeIndex) => stringValue(change, `${field}.changes[${changeIndex}]`, errors)); }
    if (row.no_horizontal_overflow !== true) errors.push(`${field}.no_horizontal_overflow: must be true`);
    if (row.fixed_regions_preserve_inset !== true) errors.push(`${field}.fixed_regions_preserve_inset: must be true`);
    [320, 390, 430].forEach((widthValue, widthIndex) => { if (min !== undefined && max !== undefined && widthValue >= min && widthValue <= max) covered[widthIndex] = true; });
    if (min !== undefined && max !== undefined) ranges.push({ min, max, index });
  });
  covered.forEach((present, index) => { if (!present) errors.push(`responsive_rules: missing coverage for ${[320, 390, 430][index]}px`); });
  const range = policy.supported_width_range as JsonObject | undefined;
  if (range && (range.min !== 320 || range.max !== 430)) errors.push("platform_policy.supported_width_range: version 1 requires 320..430 baseline");
  if (range && ranges.length > 0) {
    ranges.sort((left, right) => left.min - right.min);
    if (ranges[0].min !== range.min) errors.push("responsive_rules: coverage must start at supported minimum");
    if (ranges[ranges.length - 1].max !== range.max) errors.push("responsive_rules: coverage must end at supported maximum");
    for (let index = 1; index < ranges.length; index += 1) {
      if (ranges[index].min !== ranges[index - 1].max + 1) errors.push(`responsive_rules[${ranges[index].index}]: coverage must be contiguous; gap or overlap follows rule ${ranges[index - 1].index}`);
    }
  }
}

function checkInteractions(value: unknown, errors: string[], componentIds: Set<string>): void {
  const interactions = array(value, "interactions", errors);
  if (interactions && interactions.length === 0) errors.push("interactions: must be non-empty");
  const ids = new Set<string>();
  interactions?.forEach((interaction, index) => {
    const field = `interactions[${index}]`;
    const row = object(interaction, field, errors);
    if (!row) return;
    strict(row, ["id", "source", "event", "action"], field, errors);
    required(row, ["id", "source", "event", "action"], field, errors);
    const id = stringValue(row.id, `${field}.id`, errors); if (id && ids.has(id)) errors.push(`${field}.id: duplicate interaction id`); else if (id) ids.add(id);
    const source = stringValue(row.source, `${field}.source`, errors); if (source && !componentIds.has(source)) errors.push(`${field}.source: missing component ${source}`);
    stringValue(row.event, `${field}.event`, errors); stringValue(row.action, `${field}.action`, errors);
  });
}

function checkNavigation(value: unknown, errors: string[], componentIds: Set<string>, fixtures: Set<string>, states: Set<string>): void {
  const actions = array(value, "navigation_and_actions", errors);
  if (actions && actions.length === 0) errors.push("navigation_and_actions: must be non-empty");
  actions?.forEach((action, index) => {
    const field = `navigation_and_actions[${index}]`;
    const row = object(action, field, errors);
    if (!row) return;
    strict(row, ["id", "source_component", "outcome"], field, errors);
    required(row, ["id", "source_component", "outcome"], field, errors);
    stringValue(row.id, `${field}.id`, errors);
    const source = stringValue(row.source_component, `${field}.source_component`, errors); if (source && !componentIds.has(source)) errors.push(`${field}.source_component: missing component ${source}`);
    const outcome = object(row.outcome, `${field}.outcome`, errors);
    if (!outcome) return;
    strict(outcome, ["kind", "state", "target", "fixture"], `${field}.outcome`, errors);
    const kind = stringValue(outcome.kind, `${field}.outcome.kind`, errors);
    if (kind && !OUTCOMES.has(kind)) errors.push(`${field}.outcome.kind: must resolve locally, not ${kind}`);
    if (kind === "local_state") { const state = stringValue(outcome.state, `${field}.outcome.state`, errors); if (state && !states.has(state)) errors.push(`${field}.outcome.state: unknown state ${state}`); }
    if (kind === "local_screen" || kind === "local_modal") stringValue(outcome.target, `${field}.outcome.target`, errors);
    if (kind === "fixture_result") { const fixture = stringValue(outcome.fixture, `${field}.outcome.fixture`, errors); if (fixture && !fixtures.has(fixture)) errors.push(`${field}.outcome.fixture: missing fixture ${fixture}`); }
  });
}

function checkSimpleSections(spec: JsonObject, errors: string[], componentIds: Set<string>): void {
  const accessibility = object(spec.accessibility, "accessibility", errors);
  if (accessibility) {
    strict(accessibility, ["minimum_contrast_ratio", "minimum_touch_target", "screen_reader", "reduced_motion", "dynamic_text"], "accessibility", errors);
    required(accessibility, ["minimum_contrast_ratio", "minimum_touch_target", "screen_reader", "reduced_motion", "dynamic_text"], "accessibility", errors);
    numberValue(accessibility.minimum_contrast_ratio, "accessibility.minimum_contrast_ratio", errors, { min: 4.5 });
    const target = object(accessibility.minimum_touch_target, "accessibility.minimum_touch_target", errors); if (target) { strict(target, ["width", "height", "unit"], "accessibility.minimum_touch_target", errors); required(target, ["width", "height", "unit"], "accessibility.minimum_touch_target", errors); numberValue(target.width, "accessibility.minimum_touch_target.width", errors, { min: 44 }); numberValue(target.height, "accessibility.minimum_touch_target.height", errors, { min: 44 }); const unit = stringValue(target.unit, "accessibility.minimum_touch_target.unit", errors); if (unit && !new Set(["px", "pt", "dp"]).has(unit)) errors.push("accessibility.minimum_touch_target.unit: expected px, pt, or dp"); }
    for (const key of ["screen_reader", "reduced_motion", "dynamic_text"]) stringValue(accessibility[key], `accessibility.${key}`, errors);
  }
  const focus = object(spec.focus_and_keyboard, "focus_and_keyboard", errors); if (focus) { strict(focus, ["focusable_components", "keyboard_behavior", "primary_action_visible"], "focus_and_keyboard", errors); required(focus, ["focusable_components", "keyboard_behavior", "primary_action_visible"], "focus_and_keyboard", errors); const ids = array(focus.focusable_components, "focus_and_keyboard.focusable_components", errors); if (ids) { requireUniqueStrings(ids, "focus_and_keyboard.focusable_components", errors); ids.forEach((id, index) => { const idValue = stringValue(id, `focus_and_keyboard.focusable_components[${index}]`, errors); if (idValue && !componentIds.has(idValue)) errors.push(`focus_and_keyboard.focusable_components[${index}]: missing component ${idValue}`); }); } stringValue(focus.keyboard_behavior, "focus_and_keyboard.keyboard_behavior", errors); if (focus.primary_action_visible !== true) errors.push("focus_and_keyboard.primary_action_visible: must be true"); }
  const localization = object(spec.localization, "localization", errors); if (localization) { strict(localization, ["default_language", "supported_languages", "fallback_language", "long_copy_profiles"], "localization", errors); required(localization, ["default_language", "supported_languages", "fallback_language", "long_copy_profiles"], "localization", errors); const supported = array(localization.supported_languages, "localization.supported_languages", errors); if (supported) { requireUniqueStrings(supported, "localization.supported_languages", errors); supported.forEach((lang, index) => { const value = stringValue(lang, `localization.supported_languages[${index}]`, errors); if (value && !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(value)) errors.push(`localization.supported_languages[${index}]: invalid language tag`); }); } const defaultLanguage = stringValue(localization.default_language, "localization.default_language", errors); const fallback = stringValue(localization.fallback_language, "localization.fallback_language", errors); if (defaultLanguage && supported && !supported.includes(defaultLanguage)) errors.push("localization.default_language: must be supported"); if (fallback && supported && !supported.includes(fallback)) errors.push("localization.fallback_language: must be supported"); const profiles = array(localization.long_copy_profiles, "localization.long_copy_profiles", errors); if (profiles) { requireUniqueStrings(profiles, "localization.long_copy_profiles", errors); profiles.forEach((profile, index) => stringValue(profile, `localization.long_copy_profiles[${index}]`, errors)); } }
}

function checkMappings(value: JsonObject, errors: string[], policy: JsonObject | undefined): void {
  strict(value, PLATFORMS, "platform_mappings", errors);
  for (const platform of PLATFORMS) {
    const row = object(value[platform], `platform_mappings.${platform}`, errors);
    if (!row) continue;
    strict(row, ["unit", "safe_area", "rounding", "native_substitutions_explicit"], `platform_mappings.${platform}`, errors);
    required(row, ["unit", "safe_area", "rounding", "native_substitutions_explicit"], `platform_mappings.${platform}`, errors);
    const unit = stringValue(row.unit, `platform_mappings.${platform}.unit`, errors);
    const expectedUnit: Record<string, string> = { html_css: "px", react_native: "dp", flutter: "dp", swiftui: "pt" };
    if (unit && unit !== expectedUnit[platform]) errors.push(`platform_mappings.${platform}.unit: expected canonical ${expectedUnit[platform]} unit`);
    stringValue(row.safe_area, `platform_mappings.${platform}.safe_area`, errors);
    const rounding = stringValue(row.rounding, `platform_mappings.${platform}.rounding`, errors); if (rounding && !ROUNDING.has(rounding)) errors.push(`platform_mappings.${platform}.rounding: unsupported rounding mode`);
    const policyRounding = (policy?.rounding as JsonObject | undefined)?.[platform];
    if (rounding && typeof policyRounding === "string" && rounding !== policyRounding) errors.push(`platform_mappings.${platform}.rounding: must match platform_policy rounding for parity`);
    if (row.native_substitutions_explicit !== true) errors.push(`platform_mappings.${platform}.native_substitutions_explicit: must be true`);
  }
}

export function validateSpec(input: unknown): SpecValidationResult {
  const errors: string[] = [];
  const spec = object(input, "spec", errors);
  if (!spec) return { valid: false, errors };
  strict(spec, TOP_LEVEL, "spec", errors);
  required(spec, [...TOP_LEVEL], "spec", errors);
  if (spec.schema_version !== 1) errors.push("schema_version: only version 1 is supported");
  const specId = stringValue(spec.id, "id", errors);
  if (specId && !/^[a-z][a-z0-9-]{2,96}$/.test(specId)) errors.push("id: must be lowercase kebab-case with 3-97 characters");
  const request = object(spec.request, "request", errors); if (request) { strict(request, ["language", "user_job"], "request", errors); required(request, ["language", "user_job"], "request", errors); const language = stringValue(request.language, "request.language", errors); if (language && language.length < 2) errors.push("request.language: must be at least 2 characters"); stringValue(request.user_job, "request.user_job", errors); }
  const classification = object(spec.classification, "classification", errors); if (classification) { strict(classification, ["app_category", "ui_patterns", "risk_level"], "classification", errors); required(classification, ["app_category", "ui_patterns", "risk_level"], "classification", errors); stringValue(classification.app_category, "classification.app_category", errors); const patterns = array(classification.ui_patterns, "classification.ui_patterns", errors); if (patterns) { requireUniqueStrings(patterns, "classification.ui_patterns", errors); patterns.forEach((pattern, index) => stringValue(pattern, `classification.ui_patterns[${index}]`, errors)); } const risk = stringValue(classification.risk_level, "classification.risk_level", errors); if (risk && !RISKS.has(risk)) errors.push("classification.risk_level: unsupported risk"); }
  const policy = object(spec.platform_policy, "platform_policy", errors);
  if (policy) checkPlatformPolicy(policy, errors);
  const layout = object(spec.layout, "layout", errors);
  const tokens = layout ? checkLayout(layout, errors) : new Set<string>();
  const typography = object(spec.typography, "typography", errors); const typographyRoles = typography ? checkTypography(typography, errors, tokens) : new Set<string>();
  const colors = object(spec.colors, "colors", errors); if (colors) checkColorTokens(colors, errors);
  const componentStates = new Set<string>();
  const componentIds = checkComponents(spec.components, errors, tokens, componentStates, typographyRoles);
  const states = object(spec.states, "states", errors); const matrixStates = states ? checkStates(states, errors, new Set<string>()) : new Set<string>();
  for (const state of componentStates) if (!matrixStates.has(state)) errors.push(`states: component state ${state} is not represented in the state matrix`);
  const fixtureData = object(spec.fixture_data, "fixture_data", errors); const fixtures = new Set(fixtureData ? Object.keys(fixtureData) : []);
  if (fixtureData) for (const [name, fixture] of Object.entries(fixtureData)) object(fixture, `fixture_data.${name}`, errors);
  checkResponsive(spec.responsive_rules, errors, policy ?? {});
  checkInteractions(spec.interactions, errors, componentIds);
  checkNavigation(spec.navigation_and_actions, errors, componentIds, fixtures, matrixStates);
  checkSimpleSections(spec, errors, componentIds);
  const content = object(spec.content, "content", errors); if (content) { strict(content, ["locales", "fixtures"], "content", errors); required(content, ["locales", "fixtures"], "content", errors); const locales = object(content.locales, "content.locales", errors); const requestLanguage = (spec.request as JsonObject | undefined)?.language; if (locales && Object.keys(locales).length === 0) errors.push("content.locales: must be non-empty"); if (locales && typeof requestLanguage === "string" && !(requestLanguage in locales)) errors.push("content.locales: request language must have copy"); if (locales) for (const [language, copy] of Object.entries(locales)) { const row = object(copy, `content.locales.${language}`, errors); if (row && Object.keys(row).length === 0) errors.push(`content.locales.${language}: must contain copy`); } const contentFixtures = array(content.fixtures, "content.fixtures", errors); if (contentFixtures) { requireUniqueStrings(contentFixtures, "content.fixtures", errors); contentFixtures.forEach((name, index) => { const key = stringValue(name, `content.fixtures[${index}]`, errors); if (key && !fixtures.has(key)) errors.push(`content.fixtures[${index}]: missing fixture_data.${key}`); }); } }
  const assets = object(spec.assets_and_fallbacks, "assets_and_fallbacks", errors); if (assets) { strict(assets, ["assets", "fallback_policy"], "assets_and_fallbacks", errors); required(assets, ["assets", "fallback_policy"], "assets_and_fallbacks", errors); const assetList = array(assets.assets, "assets_and_fallbacks.assets", errors); assetList?.forEach((asset, index) => stringValue(asset, `assets_and_fallbacks.assets[${index}]`, errors)); stringValue(assets.fallback_policy, "assets_and_fallbacks.fallback_policy", errors); }
  const themes = object(spec.themes, "themes", errors); if (themes) { strict(themes, ["supported", "default"], "themes", errors); required(themes, ["supported", "default"], "themes", errors); const supported = array(themes.supported, "themes.supported", errors); if (supported) requireUniqueStrings(supported, "themes.supported", errors); const defaultTheme = stringValue(themes.default, "themes.default", errors); if (defaultTheme && supported && !supported.includes(defaultTheme)) errors.push("themes.default: must be supported"); }
  const capabilities = object(spec.capabilities_and_dependencies, "capabilities_and_dependencies", errors); if (capabilities) { strict(capabilities, ["network", "authentication", "payment_execution", "push", "fixture_only"], "capabilities_and_dependencies", errors); for (const key of ["network", "authentication", "payment_execution", "push", "fixture_only"]) if (typeof capabilities[key] !== "boolean") errors.push(`capabilities_and_dependencies.${key}: expected boolean`); if (capabilities.network === true || capabilities.authentication === true || capabilities.payment_execution === true || capabilities.push === true) errors.push("capabilities_and_dependencies: version 1 examples must be fixture-only and local"); if (capabilities.fixture_only !== true) errors.push("capabilities_and_dependencies.fixture_only: must be true"); }
  const mappings = object(spec.platform_mappings, "platform_mappings", errors); if (mappings) checkMappings(mappings, errors, policy);
  const validationRules = object(spec.validation_rules, "validation_rules", errors); if (validationRules) { strict(validationRules, ["no_horizontal_overflow", "no_overlap", "safe_area_respected", "fixed_regions_do_not_cover_content", "required_states_renderable"], "validation_rules", errors); for (const key of ["no_horizontal_overflow", "no_overlap", "safe_area_respected", "fixed_regions_do_not_cover_content", "required_states_renderable"]) if (validationRules[key] !== true) errors.push(`validation_rules.${key}: must be true`); }
  const quality = object(spec.quality_requirements, "quality_requirements", errors); if (quality) { strict(quality, ["numeric_spec_validated", "responsive_profiles", "all_states_fixture_backed", "platform_parity_report"], "quality_requirements", errors); required(quality, ["numeric_spec_validated", "responsive_profiles", "all_states_fixture_backed", "platform_parity_report"], "quality_requirements", errors); if (quality.numeric_spec_validated !== true || quality.all_states_fixture_backed !== true || quality.platform_parity_report !== true) errors.push("quality_requirements: all release gates must be true"); const profiles = array(quality.responsive_profiles, "quality_requirements.responsive_profiles", errors); if (profiles) { if (profiles.length < 3) errors.push("quality_requirements.responsive_profiles: must contain at least 3 profiles"); if (new Set(profiles).size !== profiles.length) errors.push("quality_requirements.responsive_profiles: values must be unique"); profiles.forEach((profile, index) => numberValue(profile, `quality_requirements.responsive_profiles[${index}]`, errors, { integer: true, min: 1 })); if ([320, 390, 430].some((width) => !profiles.includes(width))) errors.push("quality_requirements.responsive_profiles: must include 320, 390, and 430"); } }
  const requestLanguage = request?.language; const localization = object(spec.localization, "localization", errors); if (localization && typeof requestLanguage === "string" && Array.isArray(localization.supported_languages) && !localization.supported_languages.includes(requestLanguage)) errors.push("localization.supported_languages: must include request.language");
  return { valid: errors.length === 0, errors };
}

function runCli(): void {
  const specPath = process.argv[2];
  if (!specPath) throw new Error("usage: validate-spec <spec.json>");
  const result = validateSpec(JSON.parse(readFileSync(path.resolve(specPath), "utf8")));
  if (!result.valid) { for (const error of result.errors) console.error(error); process.exitCode = 1; } else console.log("canonical mobile UI spec is valid");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
