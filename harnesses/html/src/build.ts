import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exampleRegistry } from "./examples.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(path.join(dist, "examples"), { recursive: true });
const runtime = `(() => {
  const profileTable = { compact: { safe: [0, 0], textScale: 1 }, standard: { safe: [0, 0], textScale: 1 }, large: { safe: [0, 0], textScale: 1 }, 'short-keyboard': { safe: [0, 0], textScale: 1, keyboard: true }, 'large-text': { safe: [0, 0], textScale: 1.3 } };
  function resolveProfile(name) { if (!profileTable[name]) throw new Error('unknown browser profile: ' + name); return { name, ...profileTable[name] }; }
  function applyBrowserProfile(root, name) { const profile = resolveProfile(name); const screen = root.querySelector('.mobile-screen') || root; screen.dataset.profile = profile.name; screen.style.setProperty('--safe-top', profile.safe[0] + 'px'); screen.style.setProperty('--safe-bottom', profile.safe[1] + 'px'); screen.style.setProperty('--text-scale', profile.textScale); screen.style.fontSize = profile.textScale + 'em'; screen.classList.toggle('keyboard-open', Boolean(profile.keyboard)); return profile; }
  function bootFromLocation(root) { const params = new URLSearchParams(window.location.search); const name = params.get('profile') || 'standard'; const profile = applyBrowserProfile(root, name); const screen = root.querySelector('.mobile-screen') || root; const live = screen.querySelector('.live-region'); const setState = state => { screen.dataset.state = state; if (live) live.textContent = state === 'success' ? '완료되었습니다.' : state === 'loading' ? '처리 중입니다.' : ''; }; const initialState = params.get('state'); if (['default', 'loading', 'error', 'success'].includes(initialState)) setState(initialState); screen.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => { if (screen.dataset.state === 'success') return; setState('loading'); window.setTimeout(() => setState('success'), 80); })); screen.querySelectorAll('input[data-focus-scroll]').forEach(input => input.addEventListener('focus', () => window.setTimeout(() => input.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0))); return profile; }
  window.MobileUIRuntime = { resolveProfile, applyBrowserProfile, bootFromLocation };
  const root = document.querySelector('.mobile-screen')?.parentElement || document;
  bootFromLocation(root);
})();`;
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
