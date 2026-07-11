export type JsonObject = Record<string, unknown>;

export type ResolvedMeasure = {
  value: number;
  unit: string;
  source: string;
  formula?: string;
  min?: number;
  max?: number;
};

export type TokenTable = Record<string, ResolvedMeasure>;

export type FormulaContext = {
  viewport: number;
  safe_area_top?: number;
  safe_area_bottom?: number;
  width?: number;
};

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function finite(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${field} must be a finite number`);
  return value;
}

function measureObject(value: unknown, field: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be a measure object`);
  return value as JsonObject;
}

/** Evaluate the deliberately small arithmetic grammar allowed by mobile-ui-spec. */
export function evaluateFormula(formula: string, context: FormulaContext): number {
  if (!/^[A-Za-z0-9_ .+*/()%-]+$/.test(formula)) throw new Error(`unsafe formula: ${formula}`);
  const tokens = formula.match(/[A-Za-z_][A-Za-z0-9_]*|(?:\d+(?:\.\d*)?|\.\d+)|[()+*/%-]/g) ?? [];
  const compact = tokens.join("");
  if (compact.replaceAll(" ", "") !== formula.replaceAll(" ", "")) throw new Error(`invalid formula: ${formula}`);
  let index = 0;
  const variable = (name: string): number => {
    if (!SAFE_IDENTIFIER.test(name)) throw new Error(`invalid formula variable: ${name}`);
    if (name === "width") return context.width ?? context.viewport;
    if (name === "viewport") return context.viewport;
    if (name === "safe_area_top") return context.safe_area_top ?? 0;
    if (name === "safe_area_bottom") return context.safe_area_bottom ?? 0;
    throw new Error(`unknown formula variable: ${name}`);
  };
  const peek = (): string | undefined => tokens[index];
  const consume = (expected?: string): string => {
    const value = tokens[index];
    if (value === undefined || (expected !== undefined && value !== expected)) throw new Error(`invalid formula near ${formula}`);
    index += 1;
    return value;
  };
  const primary = (): number => {
    const value = peek();
    if (value === "(") { consume("("); const result = expression(); consume(")"); return result; }
    if (value === "+" || value === "-") { consume(); const result = primary(); return value === "-" ? -result : result; }
    if (value && /^\d/.test(value)) { consume(); return Number(value); }
    if (value && SAFE_IDENTIFIER.test(value)) { consume(); return variable(value); }
    throw new Error(`invalid formula near ${formula}`);
  };
  const term = (): number => {
    let result = primary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const operator = consume();
      const right = primary();
      if (operator === "*") result *= right;
      else if (operator === "/") { if (right === 0) throw new Error("formula division by zero"); result /= right; }
      else result %= right;
    }
    return result;
  };
  function expression(): number {
    let result = term();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = term();
      result = operator === "+" ? result + right : result - right;
    }
    return result;
  }
  const result = expression();
  if (index !== tokens.length || !Number.isFinite(result)) throw new Error(`invalid formula: ${formula}`);
  return result;
}

function resolveMeasureInternal(
  value: unknown,
  field: string,
  tokens: TokenTable,
  context: FormulaContext,
  resolving: Set<string>,
): ResolvedMeasure {
  const row = measureObject(value, field);
  const variants = ["value", "token", "formula"].filter((key) => key in row);
  if (variants.length !== 1) throw new Error(`${field} must contain exactly one of value, token, or formula`);
  if ("token" in row) {
    const tokenName = row.token;
    if (typeof tokenName !== "string" || tokenName.trim() === "") throw new Error(`${field}.token must be a non-empty string`);
    if (resolving.has(tokenName)) throw new Error(`token cycle detected at ${tokenName}`);
    const token = tokens[tokenName];
    if (!token) throw new Error(`${field}.token: unresolved token ${tokenName}`);
    return { ...token };
  }
  const unit = row.unit;
  if (typeof unit !== "string" || unit.trim() === "") throw new Error(`${field}.unit must be a non-empty string`);
  let result: number;
  let formula: string | undefined;
  if ("value" in row) result = finite(row.value, `${field}.value`);
  else {
    formula = typeof row.formula === "string" ? row.formula : undefined;
    if (typeof formula !== "string" || formula.trim() === "") throw new Error(`${field}.formula must be a non-empty string`);
    result = evaluateFormula(formula, context);
  }
  const min = row.min === undefined ? undefined : finite(row.min, `${field}.min`);
  const max = row.max === undefined ? undefined : finite(row.max, `${field}.max`);
  if (min !== undefined && max !== undefined && min > max) throw new Error(`${field}: min cannot exceed max`);
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  const resolved: ResolvedMeasure = { value: result, unit, source: field };
  if (formula !== undefined) resolved.formula = formula;
  if (min !== undefined) resolved.min = min;
  if (max !== undefined) resolved.max = max;
  return resolved;
}

export function resolveMeasure(
  value: unknown,
  field: string,
  tokens: TokenTable,
  context: FormulaContext,
): ResolvedMeasure {
  return resolveMeasureInternal(value, field, tokens, context, new Set());
}

export function resolveTokenTable(
  tokenMap: unknown,
  context: FormulaContext,
  field = "layout.tokens",
): TokenTable {
  if (!tokenMap || typeof tokenMap !== "object" || Array.isArray(tokenMap)) throw new Error(`${field} must be an object`);
  const source = tokenMap as JsonObject;
  const table: TokenTable = {};
  const resolving = new Set<string>();
  const resolveToken = (name: string): ResolvedMeasure => {
    const existing = table[name];
    if (existing) return existing;
    if (resolving.has(name)) throw new Error(`token cycle detected at ${name}`);
    const raw = source[name];
    if (raw === undefined) throw new Error(`${field}.${name}: unresolved token`);
    resolving.add(name);
    const row = measureObject(raw, `${field}.${name}`);
    const resolved = "token" in row
      ? (() => {
        const target = row.token;
        if (typeof target !== "string") throw new Error(`${field}.${name}.token must be a string`);
        const targetResolved = resolveToken(target);
        return { ...targetResolved, source: `${field}.${name}` };
      })()
      : resolveMeasureInternal(row, `${field}.${name}`, table, context, resolving);
    resolving.delete(name);
    table[name] = resolved;
    return resolved;
  };
  for (const name of Object.keys(source).sort()) resolveToken(name);
  return table;
}
