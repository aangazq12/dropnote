/* ===============================
   SETTINGS PAGE — FINAL (SPA SAFE)
   =============================== */

(function () {

  // Appearance
  let themeSelect, fontSelect;

  // Editor
  let editorAutofocus, editorAutosave, defaultWalletInput;

  // Notes
  let notesSortSelect, notesPreviewToggle;

  // Data & Backup
  let exportDataBtn, importDataInput, resetDataBtn, storageInfo;

  /* ===============================
     SYNC SETTINGS → UI (READ ONLY)
     =============================== */
  function syncUI() {
    const s = window.getSettings?.();
    if (!s) return;

    // Appearance
    themeSelect && (themeSelect.value = s.appearance.theme);
    fontSelect && (fontSelect.value = s.appearance.fontSize);

    // Editor
    editorAutofocus && (editorAutofocus.checked = !!s.editor.autofocus);
    editorAutosave && (editorAutosave.checked = !!s.editor.autosave);
    defaultWalletInput && (defaultWalletInput.value = s.editor.defaultWallet || "");

    // Notes
    notesSortSelect && (notesSortSelect.value = s.notes.sort);
    notesPreviewToggle && (notesPreviewToggle.checked = !!s.notes.showPreview);

    // Storage info
    if (storageInfo) {
      const size = new Blob([JSON.stringify(localStorage)]).size;
      storageInfo.textContent =
        `Local storage size: ${(size / 1024).toFixed(2)} KB`;
    }
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

    // Data & Backup
    exportDataBtn = document.getElementById("exportDataBtn");
    importDataInput = document.getElementById("importDataInput");
    resetDataBtn = document.getElementById("resetDataBtn");
    storageInfo = document.getElementById("storageInfo");

    // Initial sync (READ ONLY)
    syncUI();

    /* ===============================
       SETTINGS LISTENERS
       =============================== */
    themeSelect?.addEventListener("change", e => {
      updateSettings({ appearance: { theme: e.target.value } });
    });

    fontSelect?.addEventListener("change", e => {
      updateSettings({ appearance: { fontSize: e.target.value } });
    });

    editorAutofocus?.addEventListener("change", e => {
      updateSettings({ editor: { autofocus: e.target.checked } });
    });

    editorAutosave?.addEventListener("change", e => {
      updateSettings({ editor: { autosave: e.target.checked } });
    });

    defaultWalletInput?.addEventListener("input", e => {
      updateSettings({ editor: { defaultWallet: e.target.value } });
    });

    notesSortSelect?.addEventListener("change", e => {
      updateSettings({ notes: { sort: e.target.value } });
    });

    notesPreviewToggle?.addEventListener("change", e => {
      updateSettings({ notes: { showPreview: e.target.checked } });
    });

    /* ===============================
       DATA & BACKUP
       =============================== */

    // EXPORT
    exportDataBtn?.addEventListener("click", () => {
      const payload = {
        notes: getNotes(),
        settings: getSettings()
      };

      const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
      );

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dropnote-backup.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // IMPORT
    importDataInput?.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);

          if (Array.isArray(data.notes)) {
            localStorage.setItem(
              "dropnote_notes",
              JSON.stringify(data.notes)
            );
          }

          if (data.settings) {
            localStorage.setItem(
              "dropnote_settings",
              JSON.stringify(data.settings)
            );
          }

          alert("Data imported. App will reload.");
          location.reload();
        } catch {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    });

    // RESET
    resetDataBtn?.addEventListener("click", () => {
      if (!confirm("Reset all data? This cannot be undone.")) return;

      localStorage.removeItem("dropnote_notes");
      localStorage.removeItem("dropnote_settings");
      localStorage.removeItem("dropnote_editor_draft");
      sessionStorage.clear();

      alert("All data cleared.");
      location.reload();
    });
  }

  /* ===============================
     EVENTS
     =============================== */
  window.addEventListener("settings:updated", syncUI);
  window.addEventListener("notes:updated", syncUI);

  init();

})();