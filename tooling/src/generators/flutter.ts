import { createHash } from "node:crypto";
import type { CompiledExample } from "../compile-example.js";

type JsonObject = Record<string, unknown>;

export type FlutterArtifactManifest = {
  manifest_version: "1.0.0";
  example_id: string;
  platform: "flutter";
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

export type FlutterArtifact = { source: string; manifest: FlutterArtifactManifest };

function numberMeasure(value: unknown, fallback: number): number {
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as JsonObject).value === "number") {
    return Number((value as JsonObject).value);
  }
  return fallback;
}

function text(compiled: CompiledExample, key: string, fallback: string): string {
  const value = (compiled.content.copy as JsonObject)[key];
  return typeof value === "string" ? value : fallback;
}

function dartString(value: string): string {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'").replaceAll("\n", "\\n")}'`;
}

/** Generate a standalone Flutter screen module from the canonical compiled example. */
export function generateFlutterArtifact(compiled: CompiledExample): FlutterArtifact {
  const layout = compiled.layout as JsonObject;
  const safe = compiled.safe_area as JsonObject;
  const inset = numberMeasure(layout.screen_horizontal_inset, 16);
  const gap = numberMeasure(layout.component_gap, 12);
  const cardPadding = numberMeasure(layout.card_padding, 16);
  const controlHeight = numberMeasure(layout.control_height, 52);
  const radius = numberMeasure(layout.corner_radius, 12);
  const sticky = numberMeasure(layout.sticky_region_height, 84);
  const bottomInset = numberMeasure(layout.scroll_content_bottom_inset, 100);
  const safeBottom = Number(safe.bottom ?? 34);
  const title = dartString(text(compiled, "title", "Mobile screen"));
  const subtitle = dartString(text(compiled, "subtitle", "Local fixture"));
  const cta = dartString(text(compiled, "pay", text(compiled, "primary_cta", "계속")));
  const source = `import 'package:flutter/material.dart';

class ${compiled.example_id.replace(/[^A-Za-z0-9]/g, "_")}Screen extends StatefulWidget {
  const ${compiled.example_id.replace(/[^A-Za-z0-9]/g, "_")}Screen({super.key});

  @override
  State<${compiled.example_id.replace(/[^A-Za-z0-9]/g, "_")}Screen> createState() => _ScreenState();
}

class _ScreenState extends State<${compiled.example_id.replace(/[^A-Za-z0-9]/g, "_")}Screen> {
  String state = 'default';

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final TextScaler textScaler = MediaQuery.textScalerOf(context);
    final bottomClearance = ${sticky} + ${bottomInset} + media.padding.bottom + media.viewInsets.bottom;
    return SafeArea(child: Scaffold(body: Column(children: [
      Expanded(child: SingleChildScrollView(key: const Key('screen-scroll'), padding: EdgeInsets.fromLTRB(${inset}, ${gap * 2}, ${inset}, bottomClearance), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(${title}, textScaler: textScaler, style: Theme.of(context).textTheme.headlineSmall),
        SizedBox(height: ${gap}),
        Text(${subtitle}, style: Theme.of(context).textTheme.bodyLarge),
        SizedBox(height: ${gap}),
        TextField(decoration: const InputDecoration(labelText: '배송지'), minLines: 1, maxLines: 2, style: const TextStyle(height: 1.5)),
        SizedBox(height: ${gap}),
        Card(child: Padding(padding: const EdgeInsets.all(${cardPadding}), child: const Text('신한카드 ···· 1234'))),
      ]))),
      Container(key: const Key('primary-action'), padding: EdgeInsets.fromLTRB(${inset}, ${gap}, ${inset}, ${gap} + media.padding.bottom + media.viewInsets.bottom), child: ConstrainedBox(constraints: const BoxConstraints(minHeight: ${controlHeight}), child: SizedBox(height: ${controlHeight}, width: double.infinity, child: FilledButton(onPressed: () => setState(() => state = 'success'), child: Text(state == 'success' ? '결제가 완료됐어요' : ${cta}))))),
    ])));
  }
}

const numericRadius = ${radius};
const numericSafeBottom = ${safeBottom};
`;
  const sourceHash = createHash("sha256").update(source).digest("hex");
  return {
    source,
    manifest: {
      manifest_version: "1.0.0",
      example_id: compiled.example_id,
      platform: "flutter",
      harness_version: "1.0.0",
      source_hash: sourceHash,
      module_entry: `harnesses/flutter/lib/generated/${compiled.example_id}.dart`,
      required_fixtures: Object.keys(compiled.fixtures),
      required_assets: [],
      capabilities: { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true },
      assembly_command: "cd harnesses/flutter && flutter pub get && dart format --output=none --set-exit-if-changed . && flutter analyze && flutter test",
      run_command: `cd harnesses/flutter && flutter run --dart-define=EXAMPLE_ID=${compiled.example_id}`,
      verification: { native_build: "unverified", native_capture: "unverified" },
      profiles: ["compact", "standard", "large", "short-keyboard", "large-text"],
    },
  };
}
