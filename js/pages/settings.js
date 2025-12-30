/* ===============================
   SETTINGS PAGE — FINAL (SINGLE BLOCK)
   DropNote v1.1.x — SPA SAFE
   =============================== */

(function () {

  /* ===============================
     STATE REFS
     =============================== */

  // Appearance
  let themeSelect, fontSelect;

  // Editor
  let editorAutofocus, editorAutosave, defaultWalletInput;

  // Notes
  let notesSortSelect, notesPreviewToggle;

  // Backup
  let backupBtn, backupAsBtn, importDataInput, resetDataBtn, storageInfo;

  // Wallet scope
  let walletInput, walletScopeList;

  /* ===============================
     HELPERS
     =============================== */

  function showToast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
  }

  function buildBackupPayload() {
    const notes = getNotes?.() || [];
    const settings = getSettings?.() || {};

    let context = "default";
    if (settings?.editor?.presetState) context = "preset";
    else if (settings?.editor?.defaultWallet) context = "wallet";

    return {
      meta: {
        app: "DropNote",
        schema: "1.1",
        createdAt: new Date().toISOString(),
        context,
        noteCount: notes.length
      },
      notes,
      settings
    };
  }

  function getDefaultBackupFilename() {
    const today = new Date().toISOString().slice(0, 10);
    return `dropnote-backup-${today}.json`;
  }

  function downloadBackup(payload, filename) {
    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ===============================
     SYNC SETTINGS → UI
     =============================== */

  function syncUI() {
    const s = window.getSettings?.();
    if (!s) return;

    themeSelect && (themeSelect.value = s.appearance.theme);
    fontSelect && (fontSelect.value = s.appearance.fontSize);

    editorAutofocus && (editorAutofocus.checked = !!s.editor.autofocus);
    editorAutosave && (editorAutosave.checked = !!s.editor.autosave);
    defaultWalletInput && (defaultWalletInput.value = s.editor.defaultWallet || "");

    notesSortSelect && (notesSortSelect.value = s.notes.sort);
    notesPreviewToggle && (notesPreviewToggle.checked = !!s.notes.showPreview);

    if (storageInfo) {
      const size = new Blob([JSON.stringify(localStorage)]).size;
      storageInfo.textContent =
        `Local storage size: ${(size / 1024).toFixed(2)} KB`;
    }
  }

/* ===============================
   WALLET SCOPE UI — FINAL
   =============================== */

function renderWalletScope() {
  if (!walletScopeList || !window.getWalletScope) return;

  const scope = getWalletScope();
  walletScopeList.innerHTML = "";

  if (!scope.length) {
    walletScopeList.innerHTML =
      `<small class="text-muted">No wallets added</small>`;
    return;
  }

  scope.forEach(addr => {
    const row = document.createElement("div");
    row.className = "wallet-scope-item";

    row.innerHTML = `
      <span>${addr}</span>
      <button aria-label="Remove">✕</button>
    `;

    row.querySelector("button").onclick = () => {
      const ok = confirm(
        `Remove this wallet?\n\n${addr}\n\nAll related wallet events will be cleared.`
      );
      if (!ok) return;

      removeWalletFromScope(addr);

      // 🧹 jika ini wallet terakhir → clear event & pause sync
      if (getWalletScope().length === 0) {
        clearWalletEvents?.();
        console.info("[wallet] scope empty → events cleared & sync paused");
      }

      renderWalletScope();
      window.dispatchEvent(new Event("wallet:updated"));
    };

    walletScopeList.appendChild(row);
  });
}

function initWalletSettings() {
  walletInput = document.getElementById("walletInput");
  walletScopeList = document.getElementById("walletScopeList");
  if (!walletInput || !walletScopeList) return;

  renderWalletScope();

  walletInput.addEventListener("change", () => {
    const addr = walletInput.value.trim();
    if (!addr) return;

    addWalletToScope(addr);
    walletInput.value = "";
    renderWalletScope();

    // 🔄 re-sync telegram after wallet added
    window.syncTelegramToWallet?.();
  });
}
  /* ===============================
     INIT
     =============================== */

  function init() {

    // Appearance
    themeSelect = document.getElementById("themeSelect");
    fontSelect = document.getElementById("fontSelect");

    // Editor
    editorAutofocus = document.getElementById("editorAutofocus");
    editorAutosave = document.getElementById("editorAutosave");
    defaultWalletInput = document.getElementById("defaultWalletInput");

    // Notes
    notesSortSelect = document.getElementById("notesSortSelect");
    notesPreviewToggle = document.getElementById("notesPreviewToggle");

    // Backup
    backupBtn = document.getElementById("backupBtn");
    backupAsBtn = document.getElementById("backupAsBtn");
    importDataInput = document.getElementById("importDataInput");
    resetDataBtn = document.getElementById("resetDataBtn");
    storageInfo = document.getElementById("storageInfo");

    syncUI();
    initWalletSettings();

    /* ===== listeners ===== */

    themeSelect?.addEventListener("change", e =>
      updateSettings({ appearance: { theme: e.target.value } })
    );

    fontSelect?.addEventListener("change", e =>
      updateSettings({ appearance: { fontSize: e.target.value } })
    );

    editorAutofocus?.addEventListener("change", e =>
      updateSettings({ editor: { autofocus: e.target.checked } })
    );

    editorAutosave?.addEventListener("change", e =>
      updateSettings({ editor: { autosave: e.target.checked } })
    );

    defaultWalletInput?.addEventListener("input", e =>
      updateSettings({ editor: { defaultWallet: e.target.value } })
    );

    notesSortSelect?.addEventListener("change", e =>
      updateSettings({ notes: { sort: e.target.value } })
    );

    notesPreviewToggle?.addEventListener("change", e =>
      updateSettings({ notes: { showPreview: e.target.checked } })
    );

    backupBtn?.addEventListener("click", () => {
      downloadBackup(buildBackupPayload(), getDefaultBackupFilename());
      showToast("Backup saved");
    });

    backupAsBtn?.addEventListener("click", () => {
      const name = prompt("Backup As", getDefaultBackupFilename());
      if (name && name.endsWith(".json")) {
        downloadBackup(buildBackupPayload(), name);
        showToast("Backup exported");
      }
    });

    resetDataBtn?.addEventListener("click", () => {
      if (!confirm("Reset all data?")) return;
      localStorage.clear();
      sessionStorage.clear();
      showToast("All data cleared");
      setTimeout(() => location.reload(), 800);
    });
  }

  /* ===============================
     EVENTS
     =============================== */

  window.addEventListener("settings:updated", syncUI);
  window.addEventListener("notes:updated", syncUI);

  init();

})();