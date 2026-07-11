#!/usr/bin/env node

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadProofCatalog, type SiteExample, type SourcePlatform } from "../../site/src/catalog.js";

type BuildOptions = { root: string; output: string };
const platformLabels: Record<SourcePlatform, string> = { html_css: "HTML / CSS", react_native: "React Native", flutter: "Flutter", swiftui: "SwiftUI" };
const escapeHtml = (value: unknown): string => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const previewDocument = (example: SiteExample): string => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${example.preview.css}</style></head><body>${example.preview.html}<script>${example.preview.js.replaceAll("</script", "<\\/script")}</script></body></html>`;

function pageShell(title: string, base: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Generated mobile UI examples with complete cross-platform source."><title>${escapeHtml(title)}</title><link rel="stylesheet" href="${base}assets/site.css"></head>
<body>${body}<script src="${base}assets/site.js" defer></script></body></html>`;
}

function previewFrame(example: SiteExample, eager = false): string {
  return `<div class="device-shell"><iframe class="device-preview" title="${escapeHtml(example.title)} generated mobile UI preview" loading="${eager ? "eager" : "lazy"}" srcdoc="${escapeHtml(previewDocument(example))}"></iframe></div>`;
}

function card(example: SiteExample): string {
  return `<article class="example-card" data-example data-category="${escapeHtml(example.category)}" data-patterns="${escapeHtml(example.patterns.join(" "))}" data-search="${escapeHtml(`${example.title} ${example.userJob} ${example.category} ${example.patterns.join(" ")}`.toLowerCase())}">${previewFrame(example)}<div class="card-copy"><div class="eyebrow">${escapeHtml(example.category)}</div><h3>${escapeHtml(example.title)}</h3><p>${escapeHtml(example.userJob)}</p><div class="chips">${example.patterns.map((pattern) => `<span>${escapeHtml(pattern.replaceAll("_", " "))}</span>`).join("")}</div><a class="text-link" href="${escapeHtml(example.route)}">View responsive preview and source <span aria-hidden="true">→</span></a></div></article>`;
}

function renderHome(examples: SiteExample[]): string {
  const hero = examples[0];
  const categories = [...new Set(examples.map((item) => item.category))];
  const patterns = [...new Set(examples.flatMap((item) => item.patterns))];
  const heroPreview = hero ? previewFrame(hero, true) : `<div class="empty-state">Run the proof build to publish reviewed examples.</div>`;
  return pageShell("Mobile UI Generator — output first", "./", `<header class="topbar"><a class="brand" href="./">M/UI</a><nav aria-label="Primary"><a href="#examples">Examples</a><a href="#install">Install</a><a href="https://github.com/jinyoung89/mobile-ui-generator-skill">GitHub</a></nav></header>
<main><section class="hero"><div class="hero-copy"><p class="kicker">One numeric spec · four production targets</p><h1>Ask for a mobile screen.<br><em>Get the screen and the source.</em></h1><p class="lede">Responsive, safe-area-aware mobile UI generated from one canonical contract, with complete HTML/CSS, React Native, Flutter, and SwiftUI files.</p><a class="button" href="#examples">Explore generated outputs</a><p class="proof-note"><strong>${examples.length} proof examples</strong> · 320 / 390 / 430 widths · static source validation</p></div>${heroPreview}</section>
<section class="explorer" id="examples"><div class="section-heading"><div><p class="kicker">Proof gallery</p><h2>Outputs you can inspect</h2></div><p>Every preview and source file below is generated from the same checked proof artifact.</p></div><form class="filters" role="search" aria-label="Filter examples"><label>Search<input type="search" data-filter="search" placeholder="Try checkout, chat, map…"></label><label>Category<select data-filter="category"><option value="">All categories</option>${categories.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}</select></label><label>Pattern<select data-filter="pattern"><option value="">All patterns</option>${patterns.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value.replaceAll("_", " "))}</option>`).join("")}</select></label><button type="reset" class="quiet-button">Reset</button></form><p class="result-count" aria-live="polite"><span data-result-count>${examples.length}</span> examples</p><div class="example-grid" id="example-grid">${examples.map(card).join("")}</div><p class="empty-state" data-empty hidden>No examples match those filters.</p></section>
<section class="install" id="install"><div><p class="kicker">Install and use</p><h2>Install the skill. Request the outcome.</h2><p>Copy the public skill into your Codex skills directory, then describe the screen, states, language, and target platforms you need.</p></div><div class="install-steps"><article><span>01</span><h3>Install</h3><pre><code>git clone https://github.com/jinyoung89/mobile-ui-generator-skill.git
cp -R mobile-ui-generator-skill/skills/mobile-ui-generator "$CODEX_HOME/skills/"</code></pre></article><article><span>02</span><h3>Ask</h3><pre><code>Create a checkout screen for 320–430 px widths. Include empty, loading, error, and success states. Return HTML/CSS, React Native, Flutter, and SwiftUI.</code></pre></article><article><span>03</span><h3>Inspect</h3><p>Review the numeric spec, responsive preview, complete files, and static validation evidence before integrating.</p></article></div></section>
<section class="method"><p class="kicker">Public boundary</p><h2>Generalized knowledge in. Original references out.</h2><p>This public site consumes only sanitized canonical specs and repository-generated proof outputs. It does not publish source screenshots, private acquisition data, local paths, or credentials.</p></section></main><footer><span>Mobile UI Generator</span><span>Static, inspectable, API-free.</span></footer>`);
}

function sourcePanels(example: SiteExample): string {
  return (Object.entries(example.sources) as [SourcePlatform, SiteExample["sources"][SourcePlatform]][]).map(([platform, files], platformIndex) => {
    const panelId = `panel-${platform}`;
    return `<section id="${panelId}" role="tabpanel" aria-labelledby="tab-${platform}" ${platformIndex ? "hidden" : ""}>${files.map((file, fileIndex) => { const codeId = `source-${platform}-${fileIndex}`; return `<article class="source-file"><div class="source-toolbar"><strong>${escapeHtml(file.name)}</strong><button type="button" data-copy-source="${codeId}">Copy file</button></div><pre tabindex="0"><code id="${codeId}">${escapeHtml(file.content)}</code></pre></article>`; }).join("")}</section>`;
  }).join("");
}

function renderDetail(example: SiteExample): string {
  const widths = [...new Set([320, 390, 430, ...example.widths])].filter((item) => item >= 320 && item <= 430).sort((a, b) => a - b);
  return pageShell(`${example.title} — Mobile UI Generator`, "../../", `<header class="topbar"><a class="brand" href="../../">M/UI</a><nav aria-label="Primary"><a href="../../#examples">All examples</a><a href="../../#install">Install</a></nav></header><main class="detail"><section class="detail-hero"><div><p class="kicker">${escapeHtml(example.category)} · ${escapeHtml(example.patterns.join(" + "))}</p><h1>${escapeHtml(example.title)}</h1><p class="lede">${escapeHtml(example.userJob)}</p><div class="chips">${example.states.slice(0, 6).map((state) => `<span>${escapeHtml(state)}</span>`).join("")}</div></div><div class="preview-studio"><div class="preview-toolbar" role="group" aria-label="Preview width">${widths.map((width) => `<button type="button" data-preview-width="${width}" aria-pressed="${width === 390}">${width}</button>`).join("")}</div><div class="resizable-preview" data-preview-container style="--preview-width:390px">${previewFrame(example, true)}</div></div></section>
<section class="evidence"><div><p class="kicker">Numeric contract</p><h2>Measured, not guessed</h2></div><dl>${example.tokens.map((token) => `<div><dt>${escapeHtml(token.name)}</dt><dd>${escapeHtml(token.value)}</dd></div>`).join("")}</dl><p class="evidence-note">Safe area and fixed regions are represented in the canonical IR. Responsive profiles cover 320, 390, and 430 px. Platform source is statically generated; native execution is not claimed.</p></section>
<section class="source-section"><div class="section-heading"><div><p class="kicker">Complete source</p><h2>Use the platform you ship</h2></div><p>File boundaries are preserved. Copy controls copy the entire visible file.</p></div><div class="source-tabs" role="tablist" aria-label="Source platform">${(Object.keys(example.sources) as SourcePlatform[]).map((platform, index) => `<button id="tab-${platform}" type="button" role="tab" aria-controls="panel-${platform}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${platformLabels[platform]}</button>`).join("")}</div>${sourcePanels(example)}</section></main><footer><a href="../../#examples">← Back to all examples</a><span>Generated from <code>examples/proof/${escapeHtml(example.id)}</code></span></footer>`);
}

export function buildStaticSite({ root, output }: BuildOptions): { examples: number; routes: string[] } {
  const examples = loadProofCatalog(path.join(root, "examples/proof"));
  mkdirSync(output, { recursive: true });
  const generatedExamples = path.join(output, "examples");
  rmSync(generatedExamples, { recursive: true, force: true });
  rmSync(path.join(output, "ko"), { recursive: true, force: true });
  for (const obsolete of ["app.js", "site-data.js", "styles.css"]) rmSync(path.join(output, obsolete), { force: true });
  mkdirSync(path.join(output, "assets"), { recursive: true });
  writeFileSync(path.join(output, "index.html"), renderHome(examples));
  cpSync(path.join(root, "site/static/styles.css"), path.join(output, "assets/site.css"));
  cpSync(path.join(root, "site/static/app.js"), path.join(output, "assets/site.js"));
  writeFileSync(path.join(output, "assets/site-catalog.json"), `${JSON.stringify(examples.map(({ preview, sources, ...item }) => item), null, 2)}\n`);
  for (const example of examples) {
    const directory = path.join(output, example.route);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, "index.html"), renderDetail(example));
  }
  const routes = ["./", ...examples.map((item) => item.route)];
  writeFileSync(path.join(output, "route-manifest.json"), `${JSON.stringify({ routes }, null, 2)}\n`);
  const siteBase = "https://jinyoung89.github.io/mobile-ui-generator-skill/";
  writeFileSync(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${siteBase}${route === "./" ? "" : route}</loc></url>`).join("\n")}\n</urlset>\n`);
  writeFileSync(path.join(output, "llms.txt"), `# Mobile UI Generator\n\nArtifact-driven mobile UI proof gallery with complete HTML/CSS, React Native, Flutter, and SwiftUI source.\n\n${routes.map((route) => `- ${siteBase}${route === "./" ? "" : route}`).join("\n")}\n`);
  writeFileSync(path.join(output, ".nojekyll"), "");
  return { examples: examples.length, routes };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const root = path.resolve(import.meta.dirname, "../..");
  const result = buildStaticSite({ root, output: path.join(root, "docs") });
  console.log(`Built ${result.examples} examples across ${result.routes.length} routes.`);
}
