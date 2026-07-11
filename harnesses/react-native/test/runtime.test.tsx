import { create } from "react-test-renderer";
import { App } from "../App";
import { exampleRegistry, getExampleArtifactManifest } from "../src/registry";
import {
  fixtureAction,
  profileTable,
  resolveProfile,
  runtimeContract,
} from "../src/runtime";

describe("React Native runtime contracts", () => {
  test("pins native profiles with safe-area and keyboard metrics", () => {
    expect(Object.keys(profileTable)).toEqual([
      "compact",
      "standard",
      "large",
      "short-keyboard",
      "large-text",
    ]);
    expect(resolveProfile("standard")).toMatchObject({
      viewport: { width: 390, height: 844 },
      safeArea: { top: 59, bottom: 34 },
      pixelRatio: 3,
      textScale: 1,
      keyboard: { open: false, inset: 34 },
    });
    expect(resolveProfile("short-keyboard").keyboard).toEqual({
      open: true,
      height: 291,
      inset: 325,
    });
    expect(() => resolveProfile("nope")).toThrow(/unknown native profile/i);
  });

  test("runtime contract makes one owner for scrolling and reserves fixed CTA clearance", () => {
    const contract = runtimeContract({
      safeArea: { top: 59, bottom: 34 },
      stickyRegionHeight: 84,
      scrollContentBottomInset: 100,
      keyboard: { open: true, inset: 325 },
    });
    expect(contract).toEqual({
      safeAreaTop: 59,
      safeAreaBottom: 34,
      contentBottomPadding: 184,
      keyboardBottomInset: 325,
      scrollOwner: "screen-scroll",
      fixedRegion: "primary-action",
    });
  });

  test("fixture actions stay local and never report navigation or network", () => {
    expect(fixtureAction("submit-payment", "press", { state: "default" })).toEqual({
      state: "success",
      outcome: "local_state",
    });
    expect(fixtureAction("unknown", "press", { state: "default" })).toEqual({
      state: "default",
      outcome: "ignored",
    });
  });

  test("registry exposes a complete checkout manifest", () => {
    expect(exampleRegistry).toContainEqual(expect.objectContaining({ id: "commerce-checkout-address" }));
    expect(getExampleArtifactManifest("commerce-checkout-address")).toMatchObject({
      platform: "react_native",
      capabilities: { network: false, authentication: false, payment_execution: false, fixture_only: true },
      required_fixtures: ["address_default", "payment_card"],
    });
  });

  test("checkout screen uses one scroll view, keyboard avoidance, and accessible action", () => {
    const renderer = create(<App exampleId="commerce-checkout-address" profile="standard" state="default" />);
    const tree = renderer.toJSON();
    expect(tree).toBeTruthy();
    const json = JSON.stringify(tree);
    expect(json).toContain("keyboardShouldPersistTaps");
    expect(json).toContain("automaticallyAdjustKeyboardInsets");
    expect(json).toContain("screen-scroll");
    expect(json).toContain("primary-action");
    expect(json).toContain("배송지");
    renderer.unmount();
  });
});
