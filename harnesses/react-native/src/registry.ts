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

export const exampleRegistry = [{ id: "commerce-checkout-address", title: "Commerce checkout address", module: "src/runtime/index.tsx" }] as const;

const checkoutManifest: ReactNativeArtifactManifest = {
  manifest_version: "1.0.0",
  example_id: "commerce-checkout-address",
  platform: "react_native",
  harness_version: "1.0.0",
  source_hash: "local-fixture-generated-at-build-time",
  module_entry: "harnesses/react-native/src/runtime/index.tsx#CheckoutApp",
  required_fixtures: ["address_default", "payment_card"],
  required_assets: [],
  capabilities: { network: false, authentication: false, payment_execution: false, push: false, fixture_only: true },
  assembly_command: "npm --prefix harnesses/react-native ci && npm --prefix harnesses/react-native run typecheck",
  run_command: "npm --prefix harnesses/react-native run start -- --offline",
  verification: { native_build: "unverified", native_capture: "unverified" },
  profiles: ["compact", "standard", "large", "short-keyboard", "large-text"],
};

export function getExampleArtifactManifest(exampleId: string): ReactNativeArtifactManifest {
  if (exampleId !== checkoutManifest.example_id) throw new Error(`unknown React Native example: ${exampleId}`);
  return { ...checkoutManifest, required_fixtures: [...checkoutManifest.required_fixtures], required_assets: [...checkoutManifest.required_assets], profiles: [...checkoutManifest.profiles] };
}
