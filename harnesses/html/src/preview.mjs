import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const args = process.argv.slice(2);
const host = args.includes("--host") ? args[args.indexOf("--host") + 1] : "127.0.0.1";
const port = Number(args.includes("--port") ? args[args.indexOf("--port") + 1] : 4173);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent((request.url ?? "/").split("?")[0]);
  const candidate = path.resolve(dist, `.${pathname === "/" ? "/index.html" : pathname}`);
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : path.join(candidate, "index.html");
  if (!existsSync(file)) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "content-type": mime[path.extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});
server.listen(port, host, () => process.stdout.write(`HTML harness preview ready ${host}:${port}\n`));
