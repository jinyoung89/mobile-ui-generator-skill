import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

type ReadyCell = { ready: boolean };
type ToolchainRegistry = {
  requiredCellsReady: boolean;
  node: ReadyCell & { version: string };
  npm: ReadyCell & { version: string };
  python: ReadyCell & { version: string };
  flutter: ReadyCell & { version: string };
  dart: ReadyCell & { version: string };
  apple: ReadyCell & {
    xcode: string;
    swift: string;
    iosRuntime: string;
    simulator: ReadyCell & { name: string; udid: string };
  };
  android: ReadyCell & {
    sdkRoot: string;
    commandLineTools: string;
    platformApi: number;
    systemImage: string;
    adb: string;
    emulator: string;
    avd: ReadyCell & { name: string; device: string };
  };
};

const root = path.resolve(import.meta.dirname, "../..");
const registryPath = path.join(root, "tooling", "toolchains.json");

function command(command: string, args: string[] = []): string {
  const result = spawnSync(command, args, { encoding: "utf8" });
  assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  return `${result.stdout}${result.stderr}`.trim();
}

function registry(): ToolchainRegistry {
  assert.ok(existsSync(registryPath), "toolchain registry not ready");
  return JSON.parse(readFileSync(registryPath, "utf8")) as ToolchainRegistry;
}

test("host tool commands agree with the pinned registry", () => {
  const pinned = registry();

  assert.equal(command("node", ["--version"]), `v${pinned.node.version}`);
  assert.equal(command("npm", ["--version"]), pinned.npm.version);
  assert.equal(command("python3", ["--version"]), `Python ${pinned.python.version}`);
  assert.match(command("flutter", ["--version"]), new RegExp(`Flutter ${pinned.flutter.version}\\b`));
  assert.match(command("dart", ["--version"]), new RegExp(`Dart SDK version: ${pinned.dart.version}\\b`));
  assert.match(command("xcodebuild", ["-version"]), new RegExp(`Xcode ${pinned.apple.xcode}\\b`));
  assert.match(command("swift", ["--version"]), new RegExp(`Apple Swift version ${pinned.apple.swift}\\b`));

  const devices = command("xcrun", ["simctl", "list", "devices", "available"]);
  assert.match(devices, new RegExp(`-- iOS ${pinned.apple.iosRuntime} --`));
  assert.match(devices, new RegExp(`${pinned.apple.simulator.name} \\(${pinned.apple.simulator.udid}\\)`));
});

test("Android SDK commands and API 34 AVD agree with the pinned registry", () => {
  const pinned = registry();
  const sdkRoot = pinned.android.sdkRoot.replace("$HOME", os.homedir());
  const adb = path.join(sdkRoot, "platform-tools", "adb");
  const emulator = path.join(sdkRoot, "emulator", "emulator");
  const avdmanagerCandidates = [
    path.join(sdkRoot, "cmdline-tools", "latest", "bin", "avdmanager"),
    path.join(sdkRoot, "tools", "bin", "avdmanager"),
  ];
  const avdmanager = avdmanagerCandidates.find(existsSync);

  assert.ok(existsSync(path.join(sdkRoot, "platforms", `android-${pinned.android.platformApi}`, "package.xml")));
  assert.ok(existsSync(path.join(sdkRoot, ...pinned.android.systemImage.split(";"), "package.xml")));
  assert.match(command(adb, ["version"]), new RegExp(`Version ${pinned.android.adb}\\b`));
  assert.match(command(emulator, ["-version"]), new RegExp(`Android emulator version ${pinned.android.emulator}\\b`));
  assert.ok(avdmanager, "avdmanager is not installed");

  const javaHome = "/Applications/Android Studio.app/Contents/jbr/Contents/Home";
  const commandLineTools = path.join(sdkRoot, "cmdline-tools", "latest", "bin", "sdkmanager");
  const toolEnvironment = { ...process.env, JAVA_HOME: javaHome };
  const toolsVersion = spawnSync(commandLineTools, ["--version"], { encoding: "utf8", env: toolEnvironment });
  assert.equal(toolsVersion.status, 0, toolsVersion.stderr);
  assert.equal(toolsVersion.stdout.trim(), pinned.android.commandLineTools);

  const avdResult = spawnSync(avdmanager, ["list", "avd"], { encoding: "utf8", env: toolEnvironment });
  assert.equal(avdResult.status, 0, avdResult.stderr);
  const avds = avdResult.stdout;
  assert.match(avds, new RegExp(`Name: ${pinned.android.avd.name}\\b`));
  assert.match(avds, new RegExp(`Device: ${pinned.android.avd.device} \\(Google\\)`));
  assert.match(avds, /Target: Google APIs\n\s+Based on: Android 14\.0 \("UpsideDownCake"\) Tag\/ABI: google_apis\/arm64-v8a/);
});

test("every required toolchain cell is marked ready", () => {
  const pinned = registry();
  const cells: ReadyCell[] = [
    pinned.node,
    pinned.npm,
    pinned.python,
    pinned.flutter,
    pinned.dart,
    pinned.apple,
    pinned.apple.simulator,
    pinned.android,
    pinned.android.avd,
  ];

  assert.equal(pinned.requiredCellsReady, true);
  assert.ok(cells.every((cell) => cell.ready), "one or more required toolchain cells are not ready");
});
