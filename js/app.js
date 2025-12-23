console.log("APP.JS LOADED");

const app = document.getElementById("app");

/* ===============================
   PAGE CSS LOADER (SAFE)
   =============================== */
function loadPageCSS(page) {
  const map = {
    home: "css/pages/home.css",
    notes: "css/pages/notes.css",
    editor: "css/pages/editor.css",
    detail: "css/pages/detail.css",
    settings: "css/pages/settings.css",
    lfg: "css/pages/lfg.css",
    about: "css/pages/about.css",
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

/* ===============================
   APP ROUTER (FINAL 🔒)
   =============================== */
window.loadPage = function (page) {
  app.classList.add("loading");
  app.classList.remove("ready");

  // ⬇️ LOAD CSS DULU (FOUC FIX)
  loadPageCSS(page);

  fetch(`pages/${page}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Page not found: " + page);
      return res.text();
    })
    .then(html => {
      app.innerHTML = html;

      // render after 1 frame
      requestAnimationFrame(() => {
        app.classList.remove("loading");
        app.classList.add("ready");
      });

      // remove old page script
      document
        .querySelectorAll("script[data-page-script]")
        .forEach(s => s.remove());

      let scriptSrc = null;
      if (page === "home") scriptSrc = "js/pages/home.js";
      if (page === "notes") scriptSrc = "js/pages/notes.js";
      if (page === "editor") scriptSrc = "js/pages/editor.js";
      if (page === "detail") scriptSrc = "js/pages/detail.js";
      if (page === "settings") scriptSrc = "js/pages/settings.js";
      if (page === "lfg") scriptSrc = "js/pages/lfg.js";
      if (page === "about") scriptSrc = "js/pages/about.js";

      if (scriptSrc) {
        const script = document.createElement("script");
        script.src = scriptSrc;
        script.dataset.pageScript = "true";
        document.body.appendChild(script);
      }
    })
    .catch(err => {
      app.innerHTML = "<p style='padding:16px'>Error loading page</p>";
      app.classList.remove("loading");
      app.classList.add("ready");
      console.error(err);
    });
};

/* ===============================
   DEFAULT PAGE
   =============================== */
window.addEventListener("load", () => {
  setTimeout(() => loadPage("home"), 30);
});

/* =========================
   PWA INSTALL HANDLER (FINAL)
   ========================= */

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

/* =========================
   STATE CHECK
   ========================= */

// true jika sudah standalone
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// true jika pernah install (persisted)
const alreadyInstalled =
  localStorage.getItem("pwaInstalled") === "true";

/* hide by default if not needed */
if (installBtn && (isStandalone || alreadyInstalled)) {
  installBtn.classList.add("is-hidden");
}

/* =========================
   CAPTURE INSTALL PROMPT
   ========================= */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // hanya tampil jika memang relevan
  if (installBtn && !isStandalone && !alreadyInstalled) {
    installBtn.classList.remove("is-hidden");
  }
});

/* =========================
   INSTALL BUTTON CLICK
   ========================= */
if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    // jika user accept → simpan state
    if (result.outcome === "accepted") {
      localStorage.setItem("pwaInstalled", "true");
    }

    deferredPrompt = null;
    installBtn.classList.add("is-hidden");
  });
}

/* =========================
   AFTER INSTALLED
   ========================= */
window.addEventListener("appinstalled", () => {
  localStorage.setItem("pwaInstalled", "true");
  deferredPrompt = null;

  if (installBtn) {
    installBtn.classList.add("is-hidden");
  }
});