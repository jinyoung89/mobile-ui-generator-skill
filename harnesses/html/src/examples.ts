import { readFileSync } from "node:fs";
import path from "node:path";
import { compileExample, type CompiledExample } from "../../../tooling/src/compile-example.js";
import { generateHtmlArtifact, type HtmlArtifact, type HtmlArtifactManifest } from "../../../tooling/src/generators/html.js";

export type HtmlExampleEntry = { id: string; title: string; compiled: CompiledExample; artifact: HtmlArtifact };

const root = path.resolve(import.meta.dirname, "../../..");
const checkoutPath = path.join(root, "examples/proof/commerce-checkout/spec.json");
const checkout = compileExample(JSON.parse(readFileSync(checkoutPath, "utf8")) as Record<string, unknown>);

export const exampleRegistry: HtmlExampleEntry[] = [{
  id: checkout.example_id,
  title: String(checkout.content.copy.title ?? "Checkout"),
  compiled: checkout,
  artifact: generateHtmlArtifact(checkout),
}];

export function getExample(exampleId: string): HtmlExampleEntry {
  const entry = exampleRegistry.find((item) => item.id === exampleId);
  if (!entry) throw new Error(`unknown HTML example: ${exampleId}`);
  return entry;
}

export function getExampleArtifactManifest(exampleId: string): HtmlArtifactManifest {
  return getExample(exampleId).artifact.manifest;
}
