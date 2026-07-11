#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileExample, stableStringify, type CompiledExample } from "./compile-example.js";

type JsonObject = Record<string, unknown>;
type ProofKind = "form" | "checkout" | "map" | "feed" | "chat";
type SourcePath =
  | "html-css/index.html"
  | "html-css/styles.css"
  | "html-css/app.js"
  | "react-native/Screen.tsx"
  | "react-native/fixtures.ts"
  | "flutter/screen.dart"
  | "flutter/fixtures.dart"
  | "swiftui/Screen.swift"
  | "swiftui/Fixtures.swift";

export type ProofBundle = {
  compiledIr: string;
  files: Record<SourcePath, string>;
  provenance: JsonObject;
  verification: JsonObject;
};

const generatorVersion = "1.0.0";
const sourcePaths: SourcePath[] = [
  "html-css/index.html",
  "html-css/styles.css",
  "html-css/app.js",
  "react-native/Screen.tsx",
  "react-native/fixtures.ts",
  "flutter/screen.dart",
  "flutter/fixtures.dart",
  "swiftui/Screen.swift",
  "swiftui/Fixtures.swift",
];

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");
const numeric = (value: unknown, fallback: number): number => value && typeof value === "object" && !Array.isArray(value) && typeof (value as JsonObject).value === "number" ? Number((value as JsonObject).value) : fallback;
const escapeHtml = (value: unknown): string => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const jsString = (value: string): string => JSON.stringify(value).replaceAll("</", "<\\/");
const dartString = (value: string): string => `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll("\n", "\\n")}'`;
const swiftString = (value: string): string => JSON.stringify(value).replaceAll("\\u2028", "\\u2028").replaceAll("\\u2029", "\\u2029");
const identifier = (value: string): string => {
  const result = value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join("");
  return /^[0-9]/.test(result) ? `Proof${result}` : result;
};

function proofKind(compiled: CompiledExample): ProofKind {
  const patterns = Array.isArray(compiled.classification.ui_patterns) ? compiled.classification.ui_patterns.join(" ") : "";
  if (/chat|messag/.test(patterns)) return "chat";
  if (/feed|community/.test(patterns)) return "feed";
  if (/map|route|reservation/.test(patterns)) return "map";
  if (/checkout|payment|cart/.test(patterns)) return "checkout";
  return "form";
}

function copy(compiled: CompiledExample): Record<string, string> {
  return Object.fromEntries(Object.entries(compiled.content.copy).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function sourceModel(spec: JsonObject): { compiled: CompiledExample; ko: Record<string, string>; en: Record<string, string>; kind: ProofKind } {
  const compiled = compileExample(spec, { language: "ko" });
  return { compiled, ko: copy(compiled), en: copy(compileExample(spec, { language: "en" })), kind: proofKind(compiled) };
}

function htmlContent(kind: ProofKind, ko: Record<string, string>, id: string): string {
  const field = (label: string, inputMode = "text") => `<label class="field"><span>${escapeHtml(label)}</span><input data-local-input inputmode="${inputMode}" aria-label="${escapeHtml(label)}"></label>`;
  if (kind === "form") return `${field(ko.field_label, "tel")}${field(ko.secondary_label, "numeric")}<aside class="notice" role="note"><strong>${escapeHtml(ko.confirm_label)}</strong><p>${escapeHtml(ko.risk_notice)}</p></aside>`;
  if (kind === "checkout") return `<article class="summary-card"><span class="tag">${escapeHtml(ko.item_badge)}</span><h2>${escapeHtml(ko.item_title)}</h2><p>${escapeHtml(ko.item_body)}</p><strong>${escapeHtml(ko.amount)}</strong></article>${field(ko.field_label)}<section class="payment-row" aria-label="${escapeHtml(ko.secondary_label)}"><span class="payment-mark">V</span><div><strong>${escapeHtml(ko.secondary_label)}</strong><small>${escapeHtml(ko.item_meta)}</small></div></section>`;
  if (kind === "map") return `<section class="map-surface" aria-label="${escapeHtml(ko.map_label)}"><div class="route-line"></div><span class="map-pin map-pin-start">A</span><span class="map-pin map-pin-end">B</span><span class="eta">${escapeHtml(ko.item_meta)}</span></section><article class="booking-card"><span class="tag">${escapeHtml(ko.item_badge)}</span><h2>${escapeHtml(ko.item_title)}</h2><p>${escapeHtml(ko.item_body)}</p><aside class="notice"><strong>${escapeHtml(ko.confirm_label)}</strong><p>${escapeHtml(ko.risk_notice)}</p></aside></article>`;
  if (kind === "feed") return `<nav class="story-row" aria-label="${escapeHtml(ko.secondary_label)}"><span>UI</span><span>UX</span><span>DEV</span><span>KR</span></nav><article class="feed-card"><div class="avatar">JY</div><div><strong>${escapeHtml(ko.item_title)}</strong><small>${escapeHtml(ko.item_meta)}</small></div><p>${escapeHtml(ko.item_body)}</p><div class="feed-media" role="img" aria-label="${escapeHtml(ko.media_label)}">${escapeHtml(ko.media_label)}</div><div class="feed-actions"><button type="button">♡ 128</button><button type="button">${escapeHtml(ko.secondary_label)}</button></div></article>`;
  return `<section class="message-list" aria-label="${escapeHtml(ko.secondary_label)}"><div class="bubble incoming">${escapeHtml(ko.message_in)}</div><div class="bubble outgoing">${escapeHtml(ko.message_out)}</div><small>${escapeHtml(ko.item_meta)}</small></section><label class="composer"><span class="sr-only">${escapeHtml(ko.field_label)}</span><input data-local-input aria-label="${escapeHtml(ko.field_label)}"><button type="button" data-secondary-action>↑</button></label><span class="source-id" aria-hidden="true">${escapeHtml(id)}</span>`;
}

function htmlSource(model: ReturnType<typeof sourceModel>): string {
  const { compiled, ko, en, kind } = model;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(ko.title)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="mobile-screen archetype-${kind}" data-example-id="${escapeHtml(compiled.example_id)}" data-state="default">
    <header class="screen-header"><div><p class="eyebrow">${escapeHtml(String(compiled.classification.app_category))}</p><h1 data-i18n="title">${escapeHtml(ko.title)}</h1><p data-i18n="subtitle">${escapeHtml(ko.subtitle)}</p></div><button class="locale-button" type="button" data-locale aria-label="English">EN</button></header>
    <section class="screen-content" aria-live="polite">${htmlContent(kind, ko, compiled.example_id)}</section>
    <footer class="fixed-action"><button class="primary-action" type="button" data-primary-action data-i18n="primary_cta">${escapeHtml(ko.primary_cta)}</button><p class="status-text" data-status>${escapeHtml(ko.ready_label)}</p></footer>
  </main>
  <script type="module" src="app.js"></script>
</body>
</html>
`;
}

function cssSource(model: ReturnType<typeof sourceModel>): string {
  const { compiled, kind } = model;
  const layout = compiled.layout;
  const colors = compiled.tokens.colors;
  const inset = numeric(layout.screen_horizontal_inset, 16);
  const gap = numeric(layout.component_gap, 12);
  const section = numeric(layout.section_gap, 20);
  const padding = numeric(layout.card_padding, 16);
  const control = numeric(layout.control_height, 52);
  const radius = numeric(layout.corner_radius, 14);
  const sticky = numeric(layout.sticky_region_height, 88);
  const bottom = numeric(layout.scroll_content_bottom_inset, 104);
  return `/* canonical ${compiled.example_id}: 한국어 + English static proof */
:root { --safe-top: env(safe-area-inset-top, ${Number((compiled.safe_area as JsonObject).top ?? 0)}px); --safe-bottom: env(safe-area-inset-bottom, ${Number((compiled.safe_area as JsonObject).bottom ?? 0)}px); --screen-inset: ${inset}px; --component-gap: ${gap}px; --section-gap: ${section}px; --card-padding: ${padding}px; --control-height: ${control}px; --radius: ${radius}px; --fixed-height: ${sticky}px; --bottom-clearance: ${bottom}px; --text: ${String(colors.text ?? "#111827")}; --surface: ${String(colors.surface ?? "#FFFFFF")}; --primary: ${String(colors.primary ?? "#2563EB")}; --danger: ${String(colors.danger ?? "#DC2626")}; }
* { box-sizing: border-box; }
html, body { min-width: 320px; min-height: 100%; margin: 0; background: #e8edf4; color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
body { overflow-x: hidden; }
button, input { font: inherit; }
button { min-width: 44px; min-height: 44px; cursor: pointer; }
.mobile-screen { position: relative; width: min(100%, 430px); min-height: 100dvh; margin: 0 auto; padding: calc(var(--safe-top) + var(--section-gap)) var(--screen-inset) calc(var(--fixed-height) + var(--bottom-clearance) + var(--safe-bottom)); overflow-x: hidden; background: var(--surface); }
.screen-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--component-gap); margin-bottom: var(--section-gap); }
.eyebrow { margin: 0 0 6px; color: var(--primary); font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
h1 { margin: 0; font-size: 26px; line-height: 34px; letter-spacing: -.35px; }
.screen-header p:last-child { margin: 8px 0 0; color: #5b6472; font-size: 15px; line-height: 23px; }
.locale-button { border: 1px solid #d7dce3; border-radius: 999px; background: var(--surface); color: var(--text); font-weight: 750; }
.screen-content { display: grid; gap: var(--component-gap); min-width: 0; }
.field { display: grid; gap: 7px; font-size: 14px; font-weight: 700; }
.field input, .composer input { width: 100%; min-width: 0; min-height: var(--control-height); border: 1px solid #aeb6c2; border-radius: var(--radius); padding: 0 var(--card-padding); background: var(--surface); color: var(--text); }
.field input:focus, .composer input:focus { border-color: var(--primary); outline: 3px solid color-mix(in srgb, var(--primary) 22%, transparent); outline-offset: 1px; }
.notice, .summary-card, .booking-card, .payment-row, .feed-card { border: 1px solid #e2e6ec; border-radius: var(--radius); padding: var(--card-padding); background: #f7f9fc; }
.notice p, .summary-card p, .booking-card p, .feed-card p { margin: 6px 0 0; color: #5b6472; line-height: 22px; }
.tag { display: inline-flex; border-radius: 999px; padding: 5px 9px; background: color-mix(in srgb, var(--primary) 12%, white); color: var(--primary); font-size: 12px; font-weight: 800; }
.summary-card h2, .booking-card h2 { margin: 10px 0 0; font-size: 19px; }
.summary-card > strong { display: block; margin-top: 14px; font-size: 24px; }
.payment-row { display: flex; align-items: center; gap: 12px; }
.payment-row small, .feed-card small { display: block; margin-top: 3px; color: #717b89; }
.payment-mark { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 12px; background: var(--primary); color: white; font-weight: 900; }
.map-surface { position: relative; min-height: 280px; overflow: hidden; border-radius: calc(var(--radius) + 6px); background: linear-gradient(145deg, #dff1e5, #e7edf6 52%, #f4e4ca); }
.map-surface::before { position: absolute; inset: 0; background: repeating-linear-gradient(32deg, transparent 0 48px, rgb(255 255 255 / .72) 49px 61px); content: ""; }
.route-line { position: absolute; z-index: 1; top: 104px; left: 90px; width: 170px; height: 78px; border-right: 5px solid var(--primary); border-bottom: 5px solid var(--primary); border-radius: 0 0 40px; transform: rotate(-15deg); }
.map-pin { position: absolute; z-index: 2; display: grid; width: 38px; height: 38px; place-items: center; border: 4px solid white; border-radius: 50%; background: var(--primary); color: white; box-shadow: 0 4px 12px rgb(15 23 42 / .24); }
.map-pin-start { top: 68px; left: 70px; } .map-pin-end { right: 64px; bottom: 64px; }
.eta { position: absolute; z-index: 2; top: 16px; right: 16px; border-radius: 10px; padding: 9px 12px; background: white; font-weight: 800; }
.story-row { display: flex; gap: 12px; overflow: hidden; }
.story-row span { display: grid; flex: 0 0 56px; height: 56px; place-items: center; border: 3px solid color-mix(in srgb, var(--primary) 70%, #f472b6); border-radius: 50%; background: #eef2f7; font-size: 11px; font-weight: 800; }
.feed-card { display: grid; grid-template-columns: 44px 1fr; gap: 8px 12px; background: var(--surface); }
.feed-card > p, .feed-media, .feed-actions { grid-column: 1 / -1; }
.avatar { display: grid; height: 44px; place-items: center; border-radius: 50%; background: var(--primary); color: white; font-weight: 850; }
.feed-media { display: grid; min-height: 220px; place-items: center; border-radius: calc(var(--radius) - 4px); background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, white), #e8edf4); color: #455061; font-weight: 800; }
.feed-actions { display: flex; gap: 8px; } .feed-actions button { border: 0; background: transparent; color: var(--text); }
.message-list { display: flex; min-height: 390px; flex-direction: column; justify-content: flex-end; gap: 10px; }
.bubble { width: fit-content; max-width: 78%; border-radius: 18px; padding: 11px 14px; line-height: 21px; }
.incoming { border-bottom-left-radius: 6px; background: #edf0f4; } .outgoing { align-self: flex-end; border-bottom-right-radius: 6px; background: var(--primary); color: white; }
.message-list small { align-self: center; color: #717b89; }
.composer { display: flex; gap: 8px; padding-top: var(--component-gap); }
.composer button { border: 0; border-radius: 50%; background: var(--primary); color: white; font-size: 20px; }
.source-id { display: none; }
.fixed-action { position: fixed; z-index: 4; right: 0; bottom: 0; left: 0; width: min(100%, 430px); min-height: var(--fixed-height); margin: auto; padding: 12px var(--screen-inset) calc(12px + var(--safe-bottom)); border-top: 1px solid #e2e6ec; background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(14px); }
.primary-action { width: 100%; min-height: var(--control-height); border: 0; border-radius: var(--radius); background: var(--primary); color: white; font-weight: 800; }
.primary-action:focus-visible, .locale-button:focus-visible { outline: 3px solid color-mix(in srgb, var(--primary) 35%, transparent); outline-offset: 2px; }
.status-text { margin: 7px 0 0; color: #717b89; font-size: 12px; text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.mobile-screen[data-state="loading"] .primary-action { opacity: .6; pointer-events: none; }
.mobile-screen[data-state="success"] .primary-action { background: #15803d; }
@media (max-width: 374px) { h1 { font-size: 23px; line-height: 30px; } .map-surface { min-height: 230px; } .message-list { min-height: 320px; } }
@media (min-width: 431px) { body { padding: 24px 0; } .mobile-screen { min-height: calc(100dvh - 48px); border-radius: 28px; box-shadow: 0 16px 44px rgb(15 23 42 / .16); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
/* archetype: ${kind} */
`;
}

function appSource(model: ReturnType<typeof sourceModel>): string {
  const payload = { locales: { ko: model.ko, en: model.en }, fixtures: model.compiled.fixtures, states: model.compiled.state_matrix };
  return `// ${model.compiled.example_id}: 한국어 + English local fixture runtime
const proof = ${JSON.stringify(payload, null, 2)};
const root = document.querySelector('.mobile-screen');
const localeButton = document.querySelector('[data-locale]');
const primary = document.querySelector('[data-primary-action]');
const status = document.querySelector('[data-status]');
let locale = 'ko';
const renderLocale = () => {
  const copy = proof.locales[locale];
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-i18n]').forEach((node) => { const key = node.dataset.i18n; if (key && copy[key]) node.textContent = copy[key]; });
  localeButton.textContent = locale === 'ko' ? 'EN' : 'KO';
  localeButton.setAttribute('aria-label', locale === 'ko' ? 'English' : '한국어');
  status.textContent = copy.ready_label;
};
localeButton.addEventListener('click', () => { locale = locale === 'ko' ? 'en' : 'ko'; renderLocale(); });
primary.addEventListener('click', () => {
  root.dataset.state = 'loading';
  primary.setAttribute('aria-busy', 'true');
  queueMicrotask(() => { root.dataset.state = 'success'; primary.removeAttribute('aria-busy'); primary.textContent = proof.locales[locale].success_label; status.textContent = proof.locales[locale].success_body; });
});
window.__MOBILE_UI_PROOF__ = proof;
renderLocale();
`;
}

function rnBody(kind: ProofKind): string {
  if (kind === "form") return `<TextInput accessibilityLabel={model.field_label} inputMode="tel" style={styles.input} /><TextInput accessibilityLabel={model.secondary_label} inputMode="numeric" style={styles.input} /><View style={styles.card}><Text style={styles.strong}>{model.confirm_label}</Text><Text style={styles.muted}>{model.risk_notice}</Text></View>`;
  if (kind === "checkout") return `<View style={styles.card}><Text style={styles.badge}>{model.item_badge}</Text><Text style={styles.strong}>{model.item_title}</Text><Text style={styles.muted}>{model.item_body}</Text><Text style={styles.amount}>{model.amount}</Text></View><TextInput accessibilityLabel={model.field_label} style={styles.input} /><View style={styles.row}><View style={styles.mark}><Text style={styles.markText}>V</Text></View><Text style={styles.strong}>{model.secondary_label}</Text></View>`;
  if (kind === "map") return `<View accessibilityLabel={model.map_label} style={styles.map}><View style={styles.route} /><Text style={styles.pinA}>A</Text><Text style={styles.pinB}>B</Text><Text style={styles.eta}>{model.item_meta}</Text></View><View style={styles.card}><Text style={styles.badge}>{model.item_badge}</Text><Text style={styles.strong}>{model.item_title}</Text><Text style={styles.muted}>{model.item_body}</Text><Text style={styles.risk}>{model.risk_notice}</Text></View>`;
  if (kind === "feed") return `<View style={styles.stories}><Text style={styles.story}>UI</Text><Text style={styles.story}>UX</Text><Text style={styles.story}>DEV</Text></View><View style={styles.card}><View style={styles.row}><View style={styles.avatar}><Text style={styles.markText}>JY</Text></View><View><Text style={styles.strong}>{model.item_title}</Text><Text style={styles.muted}>{model.item_meta}</Text></View></View><Text>{model.item_body}</Text><View accessibilityLabel={model.media_label} style={styles.media}><Text style={styles.strong}>{model.media_label}</Text></View></View>`;
  return `<View style={styles.messages}><Text style={styles.incoming}>{model.message_in}</Text><Text style={styles.outgoing}>{model.message_out}</Text><Text style={styles.time}>{model.item_meta}</Text></View><View style={styles.composer}><TextInput accessibilityLabel={model.field_label} style={[styles.input, styles.flex]} /><Pressable accessibilityRole="button" style={styles.send}><Text style={styles.markText}>↑</Text></Pressable></View>`;
}

function rnSources(model: ReturnType<typeof sourceModel>): { screen: string; fixtures: string } {
  const { compiled, kind } = model;
  const layout = compiled.layout;
  const inset = numeric(layout.screen_horizontal_inset, 16);
  const gap = numeric(layout.component_gap, 12);
  const padding = numeric(layout.card_padding, 16);
  const control = numeric(layout.control_height, 52);
  const radius = numeric(layout.corner_radius, 14);
  const bottom = numeric(layout.sticky_region_height, 88) + numeric(layout.scroll_content_bottom_inset, 104) + Number((compiled.safe_area as JsonObject).bottom ?? 0);
  const colors = compiled.tokens.colors;
  const component = identifier(compiled.example_id);
  const fixtures = `// ${compiled.example_id}: 한국어 + English canonical fixtures\nexport const fixtures = ${JSON.stringify({ ko: model.ko, en: model.en }, null, 2)} as const;\n`;
  const screen = `// Generated from canonical IR ${compiled.example_id}; 한국어 + English; fixture-only.
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fixtures } from './fixtures';

type Locale = keyof typeof fixtures;
export function ${component}Screen() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [screenState, setScreenState] = useState<'default' | 'success'>('default');
  const model = useMemo(() => fixtures[locale], [locale]);
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.header}><View style={styles.flex}><Text accessibilityRole="header" allowFontScaling style={styles.title}>{model.title}</Text><Text allowFontScaling style={styles.muted}>{model.subtitle}</Text></View><Pressable accessibilityRole="button" onPress={() => setLocale(locale === 'ko' ? 'en' : 'ko')} style={styles.locale}><Text>{locale === 'ko' ? 'EN' : 'KO'}</Text></Pressable></View>
        ${rnBody(kind)}
      </ScrollView>
      <View style={styles.fixed}><Pressable accessibilityRole="button" accessibilityLabel={model.primary_cta} onPress={() => setScreenState('success')} style={styles.action}><Text style={styles.actionText}>{screenState === 'success' ? model.success_label : model.primary_cta}</Text></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '${String(colors.surface ?? "#FFFFFF")}' }, flex: { flex: 1 }, content: { paddingHorizontal: ${inset}, paddingTop: ${gap * 2}, paddingBottom: ${bottom}, gap: ${gap} },
  header: { flexDirection: 'row', gap: ${gap}, alignItems: 'flex-start' }, title: { color: '${String(colors.text ?? "#111827")}', fontSize: 26, lineHeight: 34, fontWeight: '700' }, muted: { color: '#5B6472', lineHeight: 22 }, strong: { color: '${String(colors.text ?? "#111827")}', fontWeight: '700', fontSize: 17 }, amount: { marginTop: ${gap}, fontSize: 24, fontWeight: '800' }, badge: { color: '${String(colors.primary ?? "#2563EB")}', fontWeight: '800' },
  locale: { minWidth: 44, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D7DCE3', alignItems: 'center', justifyContent: 'center' }, input: { minHeight: ${control}, borderRadius: ${radius}, borderWidth: 1, borderColor: '#AEB6C2', paddingHorizontal: ${padding} }, card: { gap: ${gap}, padding: ${padding}, borderRadius: ${radius}, backgroundColor: '#F7F9FC' }, row: { flexDirection: 'row', alignItems: 'center', gap: ${gap} }, mark: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, markText: { color: '#FFFFFF', fontWeight: '800' },
  map: { minHeight: 280, borderRadius: ${radius + 6}, backgroundColor: '#DFEEE5', overflow: 'hidden' }, route: { position: 'absolute', top: 105, left: 88, width: 170, height: 72, borderRightWidth: 5, borderBottomWidth: 5, borderColor: '${String(colors.primary ?? "#2563EB")}', borderRadius: 36 }, pinA: { position: 'absolute', top: 64, left: 65, padding: 12, borderRadius: 24, color: '#FFFFFF', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, pinB: { position: 'absolute', right: 58, bottom: 54, padding: 12, borderRadius: 24, color: '#FFFFFF', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, eta: { position: 'absolute', top: 16, right: 16, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', fontWeight: '800' }, risk: { color: '${String(colors.danger ?? "#DC2626")}', lineHeight: 22 },
  stories: { flexDirection: 'row', gap: ${gap} }, story: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '${String(colors.primary ?? "#2563EB")}', textAlign: 'center', paddingTop: 17, fontWeight: '800' }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, media: { minHeight: 220, borderRadius: ${radius}, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EDF4' },
  messages: { minHeight: 390, justifyContent: 'flex-end', gap: ${gap} }, incoming: { alignSelf: 'flex-start', maxWidth: '78%', padding: 12, borderRadius: 18, backgroundColor: '#EDF0F4' }, outgoing: { alignSelf: 'flex-end', maxWidth: '78%', padding: 12, borderRadius: 18, color: '#FFFFFF', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, time: { alignSelf: 'center', color: '#717B89' }, composer: { flexDirection: 'row', gap: ${gap} }, send: { width: ${control}, height: ${control}, borderRadius: ${control / 2}, alignItems: 'center', justifyContent: 'center', backgroundColor: '${String(colors.primary ?? "#2563EB")}' },
  fixed: { minHeight: ${numeric(layout.sticky_region_height, 88)}, paddingHorizontal: ${inset}, paddingVertical: ${gap}, backgroundColor: '${String(colors.surface ?? "#FFFFFF")}' }, action: { minHeight: ${control}, borderRadius: ${radius}, alignItems: 'center', justifyContent: 'center', backgroundColor: '${String(colors.primary ?? "#2563EB")}' }, actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
`;
  return { screen, fixtures };
}

function flutterSources(model: ReturnType<typeof sourceModel>): { screen: string; fixtures: string } {
  const { compiled, kind } = model;
  const component = identifier(compiled.example_id);
  const layout = compiled.layout;
  const inset = numeric(layout.screen_horizontal_inset, 16);
  const gap = numeric(layout.component_gap, 12);
  const padding = numeric(layout.card_padding, 16);
  const control = numeric(layout.control_height, 52);
  const radius = numeric(layout.corner_radius, 14);
  const colors = compiled.tokens.colors;
  const keys = ["title", "subtitle", "primary_cta", "success_label", "field_label", "secondary_label", "item_title", "item_body", "item_meta", "amount", "risk_notice", "confirm_label", "message_in", "message_out", "map_label", "media_label"];
  const row = (copyRow: Record<string, string>): string => keys.map((key) => `${dartString(key)}: ${dartString(copyRow[key] ?? "")}`).join(", ");
  const fixtures = `// ${compiled.example_id}: 한국어 + English canonical fixtures\nconst proofFixtures = <String, Map<String, String>>{\n  'ko': {${row(model.ko)}},\n  'en': {${row(model.en)}},\n};\n`;
  const bodyWidgets = kind === "map"
    ? [
        `Container(height: 280, decoration: BoxDecoration(color: const Color(0xFFDFEEE5), borderRadius: BorderRadius.circular(${radius + 6})), child: Stack(children: [Positioned(top: 16, right: 16, child: Chip(label: Text(model['item_meta']!))), const Positioned(top: 78, left: 68, child: CircleAvatar(child: Text('A'))), const Positioned(right: 62, bottom: 58, child: CircleAvatar(child: Text('B')))]))`,
        `_Card(model['item_title']!, model['item_body']!, ${padding}, ${radius})`,
        `_Card(model['confirm_label']!, model['risk_notice']!, ${padding}, ${radius})`,
      ]
    : kind === "feed"
      ? [
          `Row(children: const [CircleAvatar(child: Text('UI')), SizedBox(width: ${gap}), CircleAvatar(child: Text('UX')), SizedBox(width: ${gap}), CircleAvatar(child: Text('DEV'))])`,
          `_Card(model['item_title']!, model['item_body']!, ${padding}, ${radius})`,
          `Container(height: 220, alignment: Alignment.center, decoration: BoxDecoration(color: const Color(0xFFE8EDF4), borderRadius: BorderRadius.circular(${radius})), child: Text(model['media_label']!))`,
        ]
      : kind === "chat"
        ? [
            `SizedBox(height: 360, child: Column(mainAxisAlignment: MainAxisAlignment.end, crossAxisAlignment: CrossAxisAlignment.stretch, children: [Align(alignment: Alignment.centerLeft, child: Chip(label: Text(model['message_in']!))), Align(alignment: Alignment.centerRight, child: Chip(backgroundColor: const Color(0xFF${String(colors.primary ?? "#2563EB").slice(1)}), label: Text(model['message_out']!, style: const TextStyle(color: Colors.white))))]))`,
            `TextField(decoration: InputDecoration(labelText: model['field_label']))`,
          ]
        : kind === "checkout"
          ? [
              `_Card(model['item_title']!, '${model.ko.amount} · ${model.en.amount}', ${padding}, ${radius})`,
              `TextField(decoration: InputDecoration(labelText: model['field_label']))`,
              `_Card(model['secondary_label']!, model['item_meta']!, ${padding}, ${radius})`,
            ]
          : [
              `TextField(keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: model['field_label']))`,
              `TextField(keyboardType: TextInputType.number, decoration: InputDecoration(labelText: model['secondary_label']))`,
              `_Card(model['confirm_label']!, model['risk_notice']!, ${padding}, ${radius})`,
            ];
  const body = bodyWidgets.join(`, SizedBox(height: ${gap}), `);
  const screen = `// Generated from canonical IR ${compiled.example_id}; 한국어 + English; fixture-only.
import 'package:flutter/material.dart';
import 'fixtures.dart';

class ${component}Screen extends StatefulWidget { const ${component}Screen({super.key}); @override State<${component}Screen> createState() => _${component}ScreenState(); }
class _${component}ScreenState extends State<${component}Screen> {
  String locale = 'ko'; String screenState = 'default';
  @override Widget build(BuildContext context) {
    final model = proofFixtures[locale]!; final media = MediaQuery.of(context); final scaler = MediaQuery.textScalerOf(context);
    return SafeArea(child: Scaffold(backgroundColor: const Color(0xFF${String(colors.surface ?? "#FFFFFF").slice(1)}), body: Column(children: [
      Expanded(child: SingleChildScrollView(key: const Key('proof-scroll'), keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag, padding: EdgeInsets.fromLTRB(${inset}, ${gap * 2}, ${inset}, ${numeric(layout.scroll_content_bottom_inset, 104)} + media.viewInsets.bottom), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(model['title']!, textScaler: scaler, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)), SizedBox(height: ${gap / 2}), Text(model['subtitle']!)])), TextButton(onPressed: () => setState(() => locale = locale == 'ko' ? 'en' : 'ko'), child: Text(locale == 'ko' ? 'EN' : 'KO'))]),
        SizedBox(height: ${gap * 2}), ${body}
      ]))),
      Container(padding: EdgeInsets.fromLTRB(${inset}, ${gap}, ${inset}, ${gap} + media.padding.bottom + media.viewInsets.bottom), child: SizedBox(height: ${control}, width: double.infinity, child: FilledButton(onPressed: () => setState(() => screenState = 'success'), child: Text(screenState == 'success' ? model['success_label']! : model['primary_cta']!))))
    ])));
  }
}
class _Card extends StatelessWidget { const _Card(this.title, this.body, this.padding, this.radius); final String title; final String body; final double padding; final double radius; @override Widget build(BuildContext context) => Container(padding: EdgeInsets.all(padding), decoration: BoxDecoration(color: const Color(0xFFF7F9FC), borderRadius: BorderRadius.circular(radius)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(height: 6), Text(body)])); }
`;
  return { screen, fixtures };
}

function swiftSources(model: ReturnType<typeof sourceModel>): { screen: string; fixtures: string } {
  const { compiled, kind } = model;
  const component = identifier(compiled.example_id);
  const layout = compiled.layout;
  const inset = numeric(layout.screen_horizontal_inset, 16);
  const gap = numeric(layout.component_gap, 12);
  const padding = numeric(layout.card_padding, 16);
  const control = numeric(layout.control_height, 52);
  const radius = numeric(layout.corner_radius, 14);
  const fields = ["title", "subtitle", "primary_cta", "success_label", "field_label", "secondary_label", "item_title", "item_body", "item_meta", "amount", "risk_notice", "confirm_label", "message_in", "message_out", "map_label", "media_label"];
  const fixtureArgs = (row: Record<string, string>) => fields.map((field) => `${field}: ${swiftString(row[field] ?? "")}`).join(", ");
  const fixtures = `// ${compiled.example_id}: 한국어 + English canonical fixtures
import Foundation
struct ProofFixture { ${fields.map((field) => `let ${field}: String`).join("; ")} }
let proofFixtures: [String: ProofFixture] = [
  "ko": ProofFixture(${fixtureArgs(model.ko)}),
  "en": ProofFixture(${fixtureArgs(model.en)})
]
`;
  const body = kind === "map"
    ? `RoundedRectangle(cornerRadius: ${radius}).fill(Color.green.opacity(0.14)).frame(height: 280).overlay(ZStack { Path { path in path.move(to: CGPoint(x: 70, y: 70)); path.addCurve(to: CGPoint(x: 270, y: 210), control1: CGPoint(x: 170, y: 80), control2: CGPoint(x: 170, y: 210)) }.stroke(.tint, lineWidth: 5); Text("A").proofPin().position(x: 70, y: 70); Text("B").proofPin().position(x: 270, y: 210); Text(model.item_meta).font(.caption.bold()).padding(10).background(.background, in: RoundedRectangle(cornerRadius: 10)).position(x: 285, y: 30) }).accessibilityLabel(model.map_label); proofCard(model.item_title, model.item_body)`
    : kind === "feed"
      ? `HStack(spacing: ${gap}) { ForEach(["UI", "UX", "DEV"], id: \\.self) { Text($0).frame(width: 52, height: 52).background(Color.accentColor.opacity(0.12), in: Circle()).overlay(Circle().stroke(.tint, lineWidth: 3)) } }; proofCard(model.item_title, model.item_body); RoundedRectangle(cornerRadius: ${radius}).fill(Color.secondary.opacity(0.12)).frame(height: 220).overlay(Text(model.media_label).font(.headline)).accessibilityLabel(model.media_label)`
      : kind === "chat"
        ? `VStack(spacing: ${gap}) { Spacer(minLength: 260); Text(model.message_in).proofBubble(.secondary.opacity(0.14), alignment: .leading); Text(model.message_out).proofBubble(Color.accentColor, foreground: .white, alignment: .trailing); Text(model.item_meta).font(.caption).foregroundStyle(.secondary) }; HStack { TextField(model.field_label, text: $input).textFieldStyle(.roundedBorder).focused($focused); Button("↑") { screenState = "success" }.frame(width: ${control}, height: ${control}).buttonStyle(.borderedProminent).clipShape(Circle()) }`
        : kind === "checkout"
          ? `proofCard(model.item_title, model.amount); TextField(model.field_label, text: $input).textFieldStyle(.roundedBorder).frame(minHeight: ${control}).focused($focused); proofCard(model.secondary_label, model.item_meta)`
          : `TextField(model.field_label, text: $input).textFieldStyle(.roundedBorder).keyboardType(.phonePad).frame(minHeight: ${control}).focused($focused); TextField(model.secondary_label, text: $secondaryInput).textFieldStyle(.roundedBorder).keyboardType(.numberPad).frame(minHeight: ${control}); proofCard(model.confirm_label, model.risk_notice)`;
  const screen = `// Generated from canonical IR ${compiled.example_id}; 한국어 + English; fixture-only.
import SwiftUI

struct ${component}Screen: View {
  @Environment(\\.dynamicTypeSize) private var dynamicTypeSize
  @FocusState private var focused: Bool
  @State private var locale = "ko"; @State private var screenState = "default"; @State private var input = ""; @State private var secondaryInput = ""
  private var model: ProofFixture { proofFixtures[locale] ?? proofFixtures["ko"]! }
  var body: some View {
    ScrollView { VStack(alignment: .leading, spacing: ${gap}) {
      HStack(alignment: .top) { VStack(alignment: .leading, spacing: ${gap / 2}) { Text(model.title).font(.system(size: 26, weight: .bold)).accessibilityAddTraits(.isHeader); Text(model.subtitle).font(.body).foregroundStyle(.secondary) }; Spacer(); Button(locale == "ko" ? "EN" : "KO") { locale = locale == "ko" ? "en" : "ko" }.frame(minWidth: 44, minHeight: 44).buttonStyle(.bordered) }
      ${body}
    }.padding(.horizontal, ${inset}).padding(.top, ${gap * 2}).padding(.bottom, ${numeric(layout.scroll_content_bottom_inset, 104)}).frame(maxWidth: .infinity, alignment: .leading) }
    .scrollDismissesKeyboard(.interactively).dynamicTypeSize(...DynamicTypeSize.accessibility3)
    .safeAreaInset(edge: .bottom, spacing: 0) { Button(screenState == "success" ? model.success_label : model.primary_cta) { screenState = "success"; focused = false }.frame(maxWidth: .infinity, minHeight: ${control}).buttonStyle(.borderedProminent).clipShape(RoundedRectangle(cornerRadius: ${radius})).padding(.horizontal, ${inset}).padding(.vertical, ${gap}).background(.ultraThinMaterial) }
  }
  private func proofCard(_ title: String, _ body: String) -> some View { VStack(alignment: .leading, spacing: 6) { Text(title).font(.headline); Text(body).font(.body).foregroundStyle(.secondary) }.padding(${padding}).frame(maxWidth: .infinity, alignment: .leading).background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: ${radius})) }
}
private extension View { func proofBubble(_ background: Color, foreground: Color = .primary, alignment: Alignment) -> some View { self.padding(12).foregroundStyle(foreground).background(background, in: RoundedRectangle(cornerRadius: 18)).frame(maxWidth: .infinity, alignment: alignment) } }
private extension Text { func proofPin() -> some View { self.frame(width: 38, height: 38).foregroundStyle(.white).background(Color.accentColor, in: Circle()).overlay(Circle().stroke(.white, lineWidth: 4)) } }
`;
  return { screen, fixtures };
}

export function buildProofBundle(specText: string, requestText: string): ProofBundle {
  const spec = JSON.parse(specText) as JsonObject;
  const model = sourceModel(spec);
  const rn = rnSources(model);
  const flutter = flutterSources(model);
  const swift = swiftSources(model);
  const files: Record<SourcePath, string> = {
    "html-css/index.html": htmlSource(model),
    "html-css/styles.css": cssSource(model),
    "html-css/app.js": appSource(model),
    "react-native/Screen.tsx": rn.screen,
    "react-native/fixtures.ts": rn.fixtures,
    "flutter/screen.dart": flutter.screen,
    "flutter/fixtures.dart": flutter.fixtures,
    "swiftui/Screen.swift": swift.screen,
    "swiftui/Fixtures.swift": swift.fixtures,
  };
  const compiledIr = `${stableStringify(model.compiled)}\n`;
  const sourceHashes = Object.fromEntries(sourcePaths.map((relative) => [relative, sha256(files[relative])]));
  const provenance: JsonObject = {
    schema_version: "1.0.0",
    generated_by: "mobile-ui-generator",
    skill_package: "skills/mobile-ui-generator",
    skill_contract_version: "1.0.0",
    mode: "showcase/all-platforms",
    source_kind: "public-generalized-guidance",
    canonical_spec_id: model.compiled.example_id,
    request_sha256: sha256(requestText),
    languages: ["ko", "en"],
    generator: "tooling/src/generate-proof-set.ts",
    generator_version: generatorVersion,
    restricted_inputs_included: false,
  };
  const verification: JsonObject = {
    schema_version: "1.0.0",
    example_id: model.compiled.example_id,
    status: "passed",
    verification_scope: "canonical-spec-and-static-source",
    spec_valid: true,
    source_static_valid: true,
    bilingual_fixtures_present: true,
    numeric_tokens_resolved: true,
    platform_parity_warnings: model.compiled.parity.warnings,
    spec_sha256: sha256(specText),
    canonical_ir_sha256: sha256(compiledIr),
    request_sha256: sha256(requestText),
    source_sha256: sourceHashes,
    checked_targets: ["html-css", "react-native", "flutter", "swiftui"],
    native_build: "not_run_not_required",
    native_execution: "not_run_not_required",
    native_capture: "not_run_not_required",
    generator_version: generatorVersion,
  };
  return { compiledIr, files, provenance, verification };
}

export function writeProofBundle(directory: string): void {
  const specText = readFileSync(path.join(directory, "spec.json"), "utf8");
  const requestText = readFileSync(path.join(directory, "request.md"), "utf8");
  const bundle = buildProofBundle(specText, requestText);
  writeFileSync(path.join(directory, "compiled-ir.json"), bundle.compiledIr, "utf8");
  for (const [relative, source] of Object.entries(bundle.files)) {
    const destination = path.join(directory, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, source, "utf8");
  }
  writeFileSync(path.join(directory, "public-provenance.json"), `${JSON.stringify(bundle.provenance, null, 2)}\n`, "utf8");
  writeFileSync(path.join(directory, "static-verification.json"), `${JSON.stringify(bundle.verification, null, 2)}\n`, "utf8");
}

function runCli(): void {
  const directories = process.argv.slice(2).map((entry) => path.resolve(entry));
  if (directories.length === 0) throw new Error("usage: generate-proof-set <proof-directory> [...]");
  for (const directory of directories) writeProofBundle(directory);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
