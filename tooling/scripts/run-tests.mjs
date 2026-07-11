#!/usr/bin/env node

import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const requested = process.argv.slice(2);
const testFiles = requested.length > 0
  ? requested
  : readdirSync(path.resolve("tooling/test"))
      .filter((file) => file.endsWith(".test.ts"))
      .sort()
      .map((file) => path.join("tooling", "test", file));

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...testFiles],
  { stdio: "inherit", timeout: 30_000 },
);

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
