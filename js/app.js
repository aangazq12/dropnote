console.log("APP.JS LOADED");

const app = document.getElementById("app");
let currentPage = "home";

/* =================================================
   PAGE CSS LOADER (SAFE / NO FOUC)
   ================================================= */
function loadPageCSS(page) {
  const map = {
    home: "css/pages/home.css",
    notes: "css/pages/notes.css",
    editor: "css/pages/editor.css",
    detail: "css/pages/detail.css",
    settings: "css/pages/settings.css",
    lfg: "css/pages/lfg.css",
    about: "css/pages/about.css",
    audit: "css/pages/audit.css",
  };

  const href = map[page];
  if (!href) return;

  const id = "page-css";
  const old = document.getElementById(id);
  if (old) old.remove();

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.id = id;

  document.head.appendChild(link);
}

/* =================================================
   GLOBAL PLUS VISIBILITY (LOCKED)
   ================================================= */
function updateGlobalAddVisibility(page) {
  const addBtn = document.getElementById("globalAddBtn");
  if (!addBtn) return;

  // + hanya boleh muncul di page level list
  const SHOW_ON = ["home", "notes"];

  addBtn.style.display = SHOW_ON.includes(page)
    ? "flex"
    : "none";
}

/* =================================================
   APP ROUTER (SPA CORE – STABLE)
   ================================================= */
window.loadPage = function (page, fromPop = false) {

  // 🛑 prevent reload same page (Android / WebView glitch fix)
  if (page === currentPage && !fromPop) return;
  currentPage = page;

  // history only if user action
  if (!fromPop) {
    if (page === "home") {
      history.replaceState({ page }, "", "#home");
    } else {
      history.pushState({ page }, "", `#${page}`);
    }
  }

  app.classList.add("loading");
  app.classList.remove("ready");

  // load CSS first (FOUC fix)
  loadPageCSS(page);

  fetch(`pages/${page}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Page not found: " + page);
      return res.text();
    })
    .then(html => {
      // 🔔 notify page cleanup BEFORE replace
      window.dispatchEvent(new Event("page:leave"));

      app.innerHTML = html;

      // 🔒 KUNCI VISIBILITAS GLOBAL +
      updateGlobalAddVisibility(page);

      // tunggu CSS + layout stabil (anti flicker)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          app.classList.remove("loading");
          app.classList.add("ready");
        });
      });

      // remove old page scripts
      document
        .querySelectorAll("script[data-page-script]")
        .forEach(s => s.remove());

      // page script mapping
      let scriptSrc = null;
      if (page === "home") scriptSrc = "js/pages/home.js";
      if (page === "notes") scriptSrc = "js/pages/notes.js";
      if (page === "editor") scriptSrc = "js/pages/editor.js";
      if (page === "detail") scriptSrc = "js/pages/detail.js";
      if (page === "settings") scriptSrc = "js/pages/settings.js";
      if (page === "lfg") scriptSrc = "js/pages/lfg.js";
      if (page === "about") scriptSrc = "js/pages/about.js";
      if (page === "audit") scriptSrc = "js/pages/audit.js";

      if (scriptSrc) {
        const script = document.createElement("script");
        script.src = scriptSrc;
        script.dataset.pageScript = "true";
        document.body.appendChild(script);
      }
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "<p style='padding:16px'>Error loading page</p>";
      app.classList.remove("loading");
      app.classList.add("ready");
    });
};

/* =================================================
   DEFAULT PAGE (FIRST LOAD)
   ================================================= */
window.addEventListener("load", () => {
  history.replaceState({ page: "home" }, "", "#home");
  setTimeout(() => loadPage("home", true), 30);
});

/* =================================================
   PWA INSTALL HANDLER (FINAL & QUIET)
   ================================================= */
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

/* --- state detection --- */
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const alreadyInstalled =
  localStorage.getItem("pwaInstalled") === "true";

/* hide if not needed */
if (installBtn && (isStandalone || alreadyInstalled)) {
  installBtn.classList.add("is-hidden");
}

/* capture install prompt */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn && !isStandalone && !alreadyInstalled) {
    installBtn.classList.remove("is-hidden");
  }
});

/* install click */
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      localStorage.setItem("pwaInstalled", "true");
    }

    deferredPrompt = null;
    installBtn.classList.add("is-hidden");
  });
}

/* installed event */
window.addEventListener("appinstalled", () => {
  localStorage.setItem("pwaInstalled", "true");
  deferredPrompt = null;

  if (installBtn) {
    installBtn.classList.add("is-hidden");
  }
});

/* =================================================
   DOUBLE BACK TO EXIT (ANDROID STYLE) — FINAL
   ================================================= */
let lastBackTime = 0;

window.addEventListener("popstate", () => {

  // 🔹 Jika BUKAN di home → render page dari history
  if (currentPage !== "home") {
    const page = location.hash.replace("#", "") || "home";
    loadPage(page, true);
    return;
  }

  // 🔹 Jika DI HOME → pakai double back logic
  const now = Date.now();

  if (now - lastBackTime < 2000) {
    // Exit app (Android PWA / WebView)
    window.close();
    history.go(-2); // fallback browser
    return;
  }

  // Back pertama → toast
  lastBackTime = now;
  showToast("Tekan sekali lagi untuk keluar", 1600);

  // Tetap di home (jangan pindah halaman)
  history.replaceState({ page: "home" }, "", "#home");
});