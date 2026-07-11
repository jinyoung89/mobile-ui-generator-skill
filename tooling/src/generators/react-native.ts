import { createHash } from "node:crypto";
import type { CompiledExample } from "../compile-example.js";

export type ReactNativeArtifactManifest = {
  manifest_version: "1.0.0";
  example_id: string;
  platform: "react_native";
  harness_version: "1.0.0";
  source_hash: string;
  module_entry: string;
  required_fixtures: string[];
  required_assets: string[];
  capabilities: { network: false; authentication: false; payment_execution: false; push: false; fixture_only: true };
  assembly_command: string;
  run_command: string;
  verification: { native_build: "unverified"; native_capture: "unverified" };
  profiles: string[];
};

export type ReactNativeArtifact = { source: string; manifest: ReactNativeArtifactManifest };

const numberMeasure = (value: unknown, fallback: number): number => value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).value === "number" ? Number((value as Record<string, unknown>).value) : fallback;
const text = (compiled: CompiledExample, key: string, fallback: string): string => typeof (compiled.content.copy as Record<string, unknown>)[key] === "string" ? String((compiled.content.copy as Record<string, unknown>)[key]) : fallback;

/** Generate the standalone screen module used by the shared Expo harness. */
export function generateReactNativeArtifact(compiled: CompiledExample): ReactNativeArtifact {
  const layout = compiled.layout as Record<string, unknown>;
  const safe = compiled.safe_area as Record<string, unknown>;
  const sticky = numberMeasure(layout.sticky_region_height, 84);
  const bottom = numberMeasure(layout.scroll_content_bottom_inset, 100);
  const inset = numberMeasure(layout.screen_horizontal_inset, 16);
  const control = numberMeasure(layout.control_height, 52);
  const radius = numberMeasure(layout.corner_radius, 12);
  const title = JSON.stringify(text(compiled, "title", "Mobile screen"));
  const subtitle = JSON.stringify(text(compiled, "subtitle", "Local fixture"));
  const cta = JSON.stringify(text(compiled, "primary_cta", "계속"));
  const source = `import React, { useState } from "react";\nimport { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";\nimport { SafeAreaView } from "react-native-safe-area-context";\n\nexport function ${compiled.example_id.replace(/[^A-Za-z0-9]/g, "_")}Screen() {\n  const [state, setState] = useState("default");\n  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}><ScrollView testID="screen-scroll" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets><Text accessibilityRole="header" allowFontScaling maxFontSizeMultiplier={1.3}>{title}</Text><TextInput style={styles.input} allowFontScaling maxFontSizeMultiplier={1.3} /><View style={styles.card}><Text allowFontScaling maxFontSizeMultiplier={1.3}>{subtitle}</Text></View></ScrollView><View testID="primary-action" style={styles.fixed}><Pressable accessibilityRole="button" onPress={() => setState("success")}><Text allowFontScaling maxFontSizeMultiplier={1.3}>{state === "success" ? "완료" : cta}</Text></Pressable></View></KeyboardAvoidingView></SafeAreaView>;\n}\n\nconst styles = StyleSheet.create({ safe: { flex: 1 }, flex: { flex: 1 }, content: { padding: ${inset}, paddingBottom: ${sticky + bottom + Number(safe.bottom ?? 0)}, gap: ${numberMeasure(layout.component_gap, 12)} }, input: { minHeight: ${control}, borderRadius: ${radius}, paddingHorizontal: ${numberMeasure(layout.card_padding, 16)} }, card: { padding: ${numberMeasure(layout.card_padding, 16)}, borderRadius: ${radius} }, fixed: { minHeight: ${sticky}, paddingHorizontal: ${inset} } });\n`;
  const sourceHash = createHash("sha256").update(source).digest("hex");
  return {
    source,
    manifest: {
      manifest_version: "1.0.0",
      example_id: compiled.example_id,
      platform: "react_native",
      harness_version: "1.0.0",
      source_hash: sourceHash,
      module_entry: `harnesses/react-native/src/generated/${compiled.example_id}.tsx`,
      required_fixtures: Object.keys(compiled.fixtures),
      required_assets: [],
      capabilities: { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true },
      assembly_command: "npm --prefix harnesses/react-native ci && npm --prefix harnesses/react-native run typecheck",
      run_command: "npm --prefix harnesses/react-native run start -- --offline",
      verification: { native_build: "unverified", native_capture: "unverified" },
      profiles: ["compact", "standard", "large", "short-keyboard", "large-text"],
    },
  };
}
