import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(path.join(root, "dist/examples/commerce-checkout-address/index.html"))) throw new Error("run build before Playwright smoke");
let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  throw new Error(`Playwright Chromium is unavailable; install the pinned browser or provide signed local skip evidence: ${(error instanceof Error ? error.message : String(error))}`);
}
const server = spawn(process.execPath, [path.join(root, "src/preview.mjs"), "--host", "127.0.0.1", "--port", "4175"], { stdio: "ignore" });
try {
  await new Promise((resolve, reject) => { const timer = setTimeout(resolve, 300); server.once("error", reject); timer.unref(); });
  const profiles = [
    ["compact", 320, 568], ["standard", 390, 844], ["large", 430, 932], ["short-keyboard", 390, 667], ["large-text", 390, 844],
  ];
  for (const [name, width, height] of profiles) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(["http:", "", "127.0.0.1:4175", "examples", "commerce-checkout-address", "?profile=" + name].join("/"), { waitUntil: "networkidle" });
    assert.equal(await page.locator(".mobile-screen").getAttribute("data-profile"), name);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${name} horizontal overflow`);
    const metrics = await page.locator(".mobile-screen").evaluate((node) => { const screen = node; const scroll = screen.querySelector(".mobile-scroll"); const input = screen.querySelector("input"); const style = getComputedStyle(scroll); return { width: screen.getBoundingClientRect().width, paddingBottom: Number.parseFloat(style.paddingBottom), fontSize: Number.parseFloat(getComputedStyle(screen.querySelector("h1")).fontSize), inputHeight: input.getBoundingClientRect().height }; });
    assert.ok(metrics.width <= width, `${name} viewport width`);
    assert.ok(metrics.paddingBottom >= 100, `${name} fixed-region clearance`);
    assert.ok(metrics.inputHeight >= 44, `${name} touch target`);
    if (name === "short-keyboard") { assert.equal(await page.locator(".mobile-screen").evaluate((node) => node.classList.contains("keyboard-open")), true); await page.locator("input").focus(); assert.equal(await page.locator("input").evaluate((node) => document.activeElement === node), true); }
    if (name === "large-text") assert.ok(metrics.fontSize > 20, "large text scale");
    await page.close();
  }
  process.stdout.write("Playwright smoke passed: compact, standard, large, short-keyboard, large-text\n");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
