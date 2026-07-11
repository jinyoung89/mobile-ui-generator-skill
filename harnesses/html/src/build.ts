import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exampleRegistry } from "./examples.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(path.join(dist, "examples"), { recursive: true });
const runtime = `(() => { const screen = document.querySelector('.mobile-screen'); if (!screen) return; const live = screen.querySelector('.live-region'); const setState = state => { screen.dataset.state = state; if (live) live.textContent = state === 'success' ? '결제가 완료되었습니다.' : state === 'loading' ? '결제를 처리하고 있습니다.' : ''; }; screen.querySelectorAll('[data-action="submit-payment"]').forEach(button => button.addEventListener('click', () => { if (screen.dataset.state === 'success') return; setState('loading'); window.setTimeout(() => setState('success'), 80); })); screen.querySelectorAll('input[data-focus-scroll]').forEach(input => input.addEventListener('focus', () => window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0))); const profile = new URLSearchParams(location.search).get('profile') || 'standard'; const safe = profile === 'compact' ? [24, 34] : [47, 34]; screen.dataset.profile = profile; screen.style.setProperty('--safe-top', safe[0] + 'px'); screen.style.setProperty('--safe-bottom', safe[1] + 'px'); if (profile === 'short-keyboard') screen.classList.add('keyboard-open'); })();`;
for (const entry of exampleRegistry) {
  const output = path.join(dist, "examples", entry.id);
  mkdirSync(output, { recursive: true });
  writeFileSync(path.join(output, "index.html"), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${entry.title}</title><link rel="stylesheet" href="../../styles.css"></head><body>${entry.artifact.html}<script>${entry.artifact.js}</script><script src="../../app.js"></script></body></html>\n`);
  writeFileSync(path.join(output, "styles.css"), entry.artifact.css);
  writeFileSync(path.join(output, "artifact-manifest.json"), `${JSON.stringify(entry.artifact.manifest, null, 2)}\n`);
}
writeFileSync(path.join(dist, "styles.css"), exampleRegistry[0].artifact.css);
writeFileSync(path.join(dist, "app.js"), runtime);
writeFileSync(path.join(dist, "index.html"), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mobile UI Generator</title></head><body><main><h1>Mobile UI Generator</h1><p>Verified runnable examples</p><a href="examples/${exampleRegistry[0].id}/">${exampleRegistry[0].title}</a></main></body></html>\n`);
process.stdout.write(`built ${exampleRegistry.length} HTML example(s) to ${dist}\n`);
