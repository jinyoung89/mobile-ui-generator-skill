import { createHash } from "node:crypto";
import type { CompiledExample } from "../compile-example.js";

export type SwiftUIArtifactManifest = {
  manifest_version: "1.0.0";
  example_id: string;
  platform: "swiftui";
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

export type SwiftUIArtifact = { source: string; manifest: SwiftUIArtifactManifest };

type JsonObject = Record<string, unknown>;

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

function swiftString(value: string): string {
  return JSON.stringify(value).replaceAll("\\u2028", "\\u2028").replaceAll("\\u2029", "\\u2029");
}

function swiftIdentifier(value: string): string {
  const identifier = value.replace(/[^A-Za-z0-9]/g, "_");
  return /^[0-9]/.test(identifier) ? `Example_${identifier}` : identifier;
}

/** Generate a standalone SwiftUI screen module from the canonical compiled example. */
export function generateSwiftUIArtifact(compiled: CompiledExample): SwiftUIArtifact {
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
  const title = swiftString(text(compiled, "title", "Mobile screen"));
  const subtitle = swiftString(text(compiled, "subtitle", "Local fixture"));
  const cta = swiftString(text(compiled, "pay", text(compiled, "primary_cta", "계속")));
  const identifier = swiftIdentifier(compiled.example_id);
  const source = `import SwiftUI

/// Generated from canonical spec ${compiled.example_id}; fixture-only, no network or authentication.
struct ${identifier}Screen: View {
    @Environment(\\.dynamicTypeSize) private var dynamicTypeSize
    @FocusState private var focusedField: Field?
    @State private var address = ""
    @State private var screenState = "default"

    private enum Field: Hashable { case address }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: ${gap}) {
                Text(${title})
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Color(.label))
                    .dynamicTypeSize(...DynamicTypeSize.accessibility3)
                    .accessibilityAddTraits(.isHeader)
                Text(${subtitle})
                    .font(.body)
                    .foregroundStyle(Color(.secondaryLabel))
                    .dynamicTypeSize(...DynamicTypeSize.accessibility3)
                VStack(alignment: .leading, spacing: 6) {
                    Text("배송지")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color(.label))
                    TextField("서울시 강남구 테헤란로 123", text: $address)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.default)
                        .frame(minHeight: ${controlHeight})
                        .focused($focusedField, equals: .address)
                        .submitLabel(.done)
                        .accessibilityLabel("배송지")
                }
                .padding(${cardPadding})
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: ${radius}))
                Text("신한카드 ···· 1234")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Color(.label))
                    .padding(${cardPadding})
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: ${radius}))
            }
            .padding(${inset})
            .padding(.bottom, ${sticky + bottomInset + safeBottom})
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .scrollDismissesKeyboard(.interactively)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            Button {
                screenState = "success"
                focusedField = nil
            } label: {
                Text(screenState == "success" ? "결제가 완료됐어요" : ${cta})
                    .frame(maxWidth: .infinity, minHeight: ${controlHeight})
            }
            .buttonStyle(.borderedProminent)
            .clipShape(RoundedRectangle(cornerRadius: ${radius}))
            .accessibilityLabel("결제하기")
            .padding(.horizontal, ${inset})
            .padding(.top, ${gap})
            .padding(.bottom, ${safeBottom})
            .background(.ultraThinMaterial)
        }
        .background(Color(.systemBackground))
        .scrollIndicators(.hidden)
        .onChange(of: dynamicTypeSize) { _, _ in }
    }
}
`;
  const sourceHash = createHash("sha256").update(source).digest("hex");
  return {
    source,
    manifest: {
      manifest_version: "1.0.0",
      example_id: compiled.example_id,
      platform: "swiftui",
      harness_version: "1.0.0",
      source_hash: sourceHash,
      module_entry: `harnesses/swiftui/Sources/Generated/${compiled.example_id}.swift`,
      required_fixtures: Object.keys(compiled.fixtures),
      required_assets: [],
      capabilities: { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true },
      assembly_command: "npm run verify:swiftui-source",
      run_command: "xcodebuild -project harnesses/swiftui/MobileUIShowcase.xcodeproj -scheme MobileUIShowcase -destination 'platform=iOS Simulator,id=7732B728-22A6-4CCC-A121-C1F2BDC5EC23'",
      verification: { native_build: "unverified", native_capture: "unverified" },
      profiles: ["compact", "standard", "large", "short-keyboard", "large-text"],
    },
  };
}
