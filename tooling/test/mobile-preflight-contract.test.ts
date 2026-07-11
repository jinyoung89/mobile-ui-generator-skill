import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};
const verificationScript = path.join(root, "tooling", "scripts", "verify-mobile-targets.sh");

test("mobile preflight is a checked-in bounded runtime verification command", () => {
  assert.equal(packageJson.scripts["preflight:mobile"], "tooling/scripts/verify-mobile-targets.sh");
  assert.ok(existsSync(verificationScript), "mobile target verification script is missing");

  const script = readFileSync(verificationScript, "utf8");
  assert.match(script, /IOS_BOOT_TIMEOUT_SECONDS/);
  assert.match(script, /ANDROID_BOOT_TIMEOUT_SECONDS/);
  assert.match(script, /simctl boot/);
  assert.match(script, /sys\.boot_completed/);
  assert.match(script, /simctl shutdown/);
  assert.match(script, /adb.*emu kill/);
  assert.match(script, /"status":"ok"/);
});

test("unfinished release scripts always fail behind an explicit baseline validator", () => {
  assert.equal(
    packageJson.scripts["validate:baseline"],
    "python3 scripts/validate_patterns.py && python3 scripts/validate_site.py && npm test && npm run typecheck",
  );
  assert.equal(packageJson.scripts["build:site"], "node tooling/scripts/not-implemented.mjs build:site");
  assert.equal(packageJson.scripts.verify, "node tooling/scripts/not-implemented.mjs verify");
});
