import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

type InstalledCell = { installed: boolean };
type ConfiguredCell = { configured: boolean };
type ToolchainRegistry = {
  requiredCellsConfigured: boolean;
  node: InstalledCell & { version: string };
  npm: InstalledCell & { version: string };
  python: InstalledCell & { version: string };
  flutter: InstalledCell & { version: string };
  dart: InstalledCell & { version: string };
  apple: InstalledCell & {
    xcode: string;
    swift: string;
    iosRuntime: string;
    simulator: ConfiguredCell & { name: string; udid: string };
  };
  android: InstalledCell & {
    sdkRoot: string;
    commandLineTools: string;
    platformApi: number;
    systemImage: string;
    adb: string;
    emulator: string;
    avd: ConfiguredCell & { name: string; device: string };
  };
};

const root = path.resolve(import.meta.dirname, "../..");
const registryPath = path.join(root, "tooling", "toolchains.json");
const environmentScript = path.join(root, "tooling", "scripts", "toolchain-env.sh");
const COMMAND_TIMEOUT_MS = 15_000;

function command(command: string, args: string[] = [], env: NodeJS.ProcessEnv = process.env): string {
  const result = spawnSync(command, args, { encoding: "utf8", env, timeout: COMMAND_TIMEOUT_MS });
  assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  return `${result.stdout}${result.stderr}`.trim();
}

function toolchainEnvironment(): NodeJS.ProcessEnv {
  const result = spawnSync(
    "/bin/sh",
    ["-c", '. "$1"; env -0', "toolchain-env", environmentScript],
    { encoding: "utf8", timeout: COMMAND_TIMEOUT_MS },
  );
  assert.equal(result.status, 0, result.stderr);

  return Object.fromEntries(
    result.stdout
      .split("\0")
      .filter(Boolean)
      .map((entry) => {
        const separator = entry.indexOf("=");
        return [entry.slice(0, separator), entry.slice(separator + 1)];
      }),
  );
}

function registry(): ToolchainRegistry {
  assert.ok(existsSync(registryPath), "toolchain registry not ready");
  return JSON.parse(readFileSync(registryPath, "utf8")) as ToolchainRegistry;
}

test("host tool commands agree with the pinned registry", () => {
  const pinned = registry();
  const environment = toolchainEnvironment();

  assert.equal(command("node", ["--version"], environment), `v${pinned.node.version}`);
  assert.equal(command("npm", ["--version"], environment), pinned.npm.version);
  assert.equal(command("python3", ["--version"], environment), `Python ${pinned.python.version}`);
  assert.match(command("flutter", ["--version"], environment), new RegExp(`Flutter ${pinned.flutter.version}\\b`));
  assert.match(command("dart", ["--version"], environment), new RegExp(`Dart SDK version: ${pinned.dart.version}\\b`));
  assert.match(command("xcodebuild", ["-version"], environment), new RegExp(`Xcode ${pinned.apple.xcode}\\b`));
  assert.match(command("swift", ["--version"], environment), new RegExp(`Apple Swift version ${pinned.apple.swift}\\b`));

  const devices = command("xcrun", ["simctl", "list", "devices", "available"], environment);
  assert.match(devices, new RegExp(`-- iOS ${pinned.apple.iosRuntime} --`));
  assert.match(devices, new RegExp(`${pinned.apple.simulator.name} \\(${pinned.apple.simulator.udid}\\)`));
});

test("Android SDK commands and API 34 AVD agree with the pinned registry", () => {
  const pinned = registry();
  const toolEnvironment = toolchainEnvironment();
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
  assert.match(command(adb, ["version"], toolEnvironment), new RegExp(`Version ${pinned.android.adb}\\b`));
  assert.match(command(emulator, ["-version"], toolEnvironment), new RegExp(`Android emulator version ${pinned.android.emulator}\\b`));
  assert.ok(avdmanager, "avdmanager is not installed");

  const commandLineTools = path.join(sdkRoot, "cmdline-tools", "latest", "bin", "sdkmanager");
  const toolsVersion = spawnSync(commandLineTools, ["--version"], {
    encoding: "utf8",
    env: toolEnvironment,
    timeout: COMMAND_TIMEOUT_MS,
  });
  assert.equal(toolsVersion.status, 0, toolsVersion.stderr);
  assert.equal(toolsVersion.stdout.trim(), pinned.android.commandLineTools);

  const avdResult = spawnSync(avdmanager, ["list", "avd"], {
    encoding: "utf8",
    env: toolEnvironment,
    timeout: COMMAND_TIMEOUT_MS,
  });
  assert.equal(avdResult.status, 0, avdResult.stderr);
  const avds = avdResult.stdout;
  assert.match(avds, new RegExp(`Name: ${pinned.android.avd.name}\\b`));
  assert.match(avds, new RegExp(`Device: ${pinned.android.avd.device} \\(Google\\)`));
  assert.match(avds, /Target: Google APIs\n\s+Based on: Android 14\.0 \("UpsideDownCake"\) Tag\/ABI: google_apis\/arm64-v8a/);
});

test("required tools are installed and mobile targets are configured", () => {
  const pinned = registry();
  const installedCells: InstalledCell[] = [
    pinned.node,
    pinned.npm,
    pinned.python,
    pinned.flutter,
    pinned.dart,
    pinned.apple,
    pinned.android,
  ];

  assert.equal(pinned.requiredCellsConfigured, true);
  assert.ok(installedCells.every((cell) => cell.installed), "one or more required tools are not installed");
  assert.ok(pinned.apple.simulator.configured, "the pinned iOS simulator is not configured");
  assert.ok(pinned.android.avd.configured, "the pinned Android AVD is not configured");
});
