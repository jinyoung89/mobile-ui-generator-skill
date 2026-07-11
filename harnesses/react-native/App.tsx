import { CheckoutApp, profileTable, resolveProfile } from "./src/runtime";

export type AppProps = { exampleId?: string; profile?: string; state?: string };

export function App({ exampleId = "commerce-checkout-address", profile = "standard", state = "default" }: AppProps) {
  if (exampleId !== "commerce-checkout-address") throw new Error(`unknown example: ${exampleId}`);
  return <CheckoutApp profile={profileTable[profile] ?? resolveProfile(profile)} state={state} />;
}

export default App;
