/* =========================
   DAYLIGHT LOGIC v1.3 (FINAL)
   SOURCE OF TRUTH: SETTINGS 🔒
   ========================= */

(function () {
  const root = document.documentElement;

  /* =========================
     APPLY THEME
     ========================= */
  function applyTheme(mode) {
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = prefersDark ? "dark" : "light";
    } else {
      root.dataset.theme = mode;
    }

    updateButtons(root.dataset.theme);
  }

  /* =========================
     APPLY FONT SIZE
     ========================= */
  function applyFontSize(size) {
    root.dataset.font = size || "default";
  }

  /* =========================
     BUTTON STATE
     ========================= */
  function updateButtons(theme) {
    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.textContent = theme === "dark" ? "🌙" : "☀️";
    });
  }

  /* =========================
     TOGGLE HANDLER
     ========================= */
  function toggleTheme() {
    const settings = window.getSettings?.();
    if (!settings) return;

    const current = settings.appearance.theme;
    const next =
      current === "dark" ? "light" :
      current === "light" ? "dark" :
      "dark"; // system → dark

    updateSettings({
      appearance: {
        ...settings.appearance,
        theme: next
      }
    });
  }

  /* =========================
     INIT / APPLY ALL
     ========================= */
  function init() {
    const settings = window.getSettings?.();
    if (!settings) return;

    applyTheme(settings.appearance.theme);
    applyFontSize(settings.appearance.fontSize);
  }

  /* =========================
     EVENTS
     ========================= */
  document.addEventListener("click", e => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    toggleTheme();
  });

  window.addEventListener("settings:updated", init);

  /* =========================
     SYSTEM THEME WATCHER
     ========================= */
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    const settings = window.getSettings?.();
    if (!settings) return;
    if (settings.appearance.theme === "system") {
      applyTheme("system");
    }
  });

  init();
})();