/* =========================
   DAYLIGHT LOGIC v1.1 (SPA SAFE)
   ========================= */
(function () {
  const STORAGE_KEY = "dropnote:theme";
  const root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateButtons(theme);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "light";
    setTheme(current === "dark" ? "light" : "dark");
  }

  function updateButtons(theme) {
    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.textContent = theme === "dark" ? "🌙" : "☀️";
    });
  }

  // INIT THEME ONCE
  const saved = localStorage.getItem(STORAGE_KEY) || "light";
  setTheme(saved);

  // GLOBAL CLICK DELEGATION (SPA SAFE)
  document.addEventListener("click", e => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    toggleTheme();
  });

})();