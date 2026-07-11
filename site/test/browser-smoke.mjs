import assert from "node:assert/strict";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(readFileSync(path.join(root, "docs/route-manifest.json"), "utf8"));
const docs = path.join(root, "docs");
const server = createServer((request, response) => {
  const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
  const candidate = path.resolve(docs, `.${pathname === "/" ? "/index.html" : pathname}`);
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : path.join(candidate, "index.html");
  if (!existsSync(file)) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200);
  createReadStream(file).pipe(response);
});

try {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(4182, "127.0.0.1", resolve); });
  for (const route of manifest.routes) {
    const response = await fetch(`http://127.0.0.1:4182/${route === "./" ? "" : route}`);
    assert.equal(response.status, 200, `${route} responds`);
    const html = await response.text();
    assert.match(html, /<meta name="viewport"/);
    assert.doesNotMatch(html, /href="\/|src="\//, `${route} uses base-path-safe assets`);
  }
  process.stdout.write(`browser smoke passed: ${manifest.routes.length} routes\n`);
} finally {
  server.close();
}
