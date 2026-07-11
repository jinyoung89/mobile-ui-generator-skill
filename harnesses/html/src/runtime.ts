export type BrowserProfile = {
  name: string;
  viewport: { width: number; height: number };
  pixelRatio: number;
  safeArea: { top: number; right: number; bottom: number; left: number };
  orientation: "portrait" | "landscape";
  theme: "light" | "dark";
  locale: "ko" | "en";
  textScale: number;
  keyboard: { open: boolean; inset: number };
};

export const profileTable: Record<string, BrowserProfile> = {
  compact: { name: "compact", viewport: { width: 320, height: 568 }, pixelRatio: 1, safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, inset: 0 } },
  standard: { name: "standard", viewport: { width: 390, height: 844 }, pixelRatio: 1, safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, inset: 0 } },
  large: { name: "large", viewport: { width: 430, height: 932 }, pixelRatio: 1, safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, inset: 0 } },
  "short-keyboard": { name: "short-keyboard", viewport: { width: 390, height: 667 }, pixelRatio: 1, safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: true, inset: 291 } },
  "large-text": { name: "large-text", viewport: { width: 390, height: 844 }, pixelRatio: 1, safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1.3, keyboard: { open: false, inset: 0 } },
};

export function resolveProfile(name: string): BrowserProfile {
  const profile = profileTable[name];
  if (!profile) throw new Error(`unknown browser profile: ${name}`);
  return { ...profile, viewport: { ...profile.viewport }, safeArea: { ...profile.safeArea }, keyboard: { ...profile.keyboard } };
}

export function fixtureAction(actionId: string, event: string, current: { state: string }): { state: string; outcome: "local_state" | "ignored" } {
  if (actionId !== "submit-payment" || event !== "press") return { state: current.state, outcome: "ignored" };
  return { state: "success", outcome: "local_state" };
}

export function attachFixtureRuntime(root: HTMLElement): void {
  const screen = root.querySelector<HTMLElement>(".mobile-screen") ?? root;
  const live = screen.querySelector<HTMLElement>(".live-region");
  const setState = (state: string): void => {
    screen.dataset.state = state;
    screen.querySelectorAll<HTMLElement>("[data-state]").forEach((node) => { node.dataset.state = state; });
    if (live) live.textContent = state === "success" ? "결제가 완료되었습니다." : state === "loading" ? "결제를 처리하고 있습니다." : "";
  };
  screen.querySelectorAll<HTMLButtonElement>('[data-action="submit-payment"]').forEach((button) => {
    button.addEventListener("click", () => {
      if (screen.dataset.state === "success") return;
      setState("loading");
      window.setTimeout(() => setState("success"), 80);
    });
  });
  screen.querySelectorAll<HTMLInputElement>("input[data-focus-scroll]").forEach((input) => {
    input.addEventListener("focus", () => window.setTimeout(() => input.scrollIntoView({ block: "center", behavior: "smooth" }), 0));
    input.addEventListener("input", () => { input.closest<HTMLElement>(".ui-field")?.setAttribute("data-state", input.value ? "filled" : "empty"); });
  });
}

export function applyBrowserProfile(root: HTMLElement, profileName: string): BrowserProfile {
  const profile = resolveProfile(profileName);
  const screen = root.querySelector<HTMLElement>(".mobile-screen") ?? root;
  screen.style.setProperty("--profile-width", `${profile.viewport.width}px`);
  screen.style.setProperty("--profile-height", `${profile.viewport.height}px`);
  screen.style.setProperty("--profile-safe-top", `${profile.safeArea.top}px`);
  screen.style.setProperty("--profile-safe-bottom", `${profile.safeArea.bottom}px`);
  screen.style.setProperty("--safe-top", `${profile.safeArea.top}px`);
  screen.style.setProperty("--safe-bottom", `${profile.safeArea.bottom}px`);
  screen.style.setProperty("--profile-keyboard-inset", `${profile.keyboard.inset}px`);
  screen.dataset.profile = profile.name;
  screen.dataset.keyboard = profile.keyboard.open ? "open" : "closed";
  screen.style.fontSize = `${profile.textScale}em`;
  screen.style.setProperty("--text-scale", String(profile.textScale));
  if (profile.keyboard.open) screen.classList.add("keyboard-open");
  else screen.classList.remove("keyboard-open");
  return profile;
}

export function bootFromLocation(root: HTMLElement): BrowserProfile {
  const params = new URLSearchParams(window.location.search);
  const profile = applyBrowserProfile(root, params.get("profile") ?? "standard");
  const state = params.get("state");
  if (state && ["default", "loading", "error", "success"].includes(state)) (root.querySelector<HTMLElement>(".mobile-screen") ?? root).dataset.state = state;
  attachFixtureRuntime(root);
  return profile;
}
