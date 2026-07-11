import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
assert.ok(existsSync(path.join(dist, "examples/commerce-checkout-address/index.html")), "run build before browser smoke");
const server = spawn(process.execPath, [path.join(root, "src/preview.mjs"), "--host", "127.0.0.1", "--port", "4174"], { stdio: "ignore" });
try {
  await new Promise((resolve, reject) => { const timer = setTimeout(resolve, 300); server.once("error", reject); timer.unref(); });
  for (const profile of ["compact", "standard", "large", "short-keyboard", "large-text"]) {
    const response = await fetch(`http://127.0.0.1:4174/examples/commerce-checkout-address/?profile=${profile}`);
    assert.equal(response.status, 200, `${profile} route status`);
    const html = await response.text();
    assert.match(html, /data-example-id="commerce-checkout-address"/, `${profile} example marker`);
    assert.match(html, /data-action="submit-payment"/, `${profile} fixture action`);
  }
  const app = readFileSync(path.join(dist, "app.js"), "utf8");
  assert.match(app, /bootFromLocation/);
  assert.match(app, /applyBrowserProfile/);
  process.stdout.write("browser smoke passed: compact, standard, large, short-keyboard, large-text\n");
} finally {
  server.kill("SIGTERM");
}
