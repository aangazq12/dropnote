/* ===============================
   SETTINGS — APPEARANCE + EDITOR + NOTES + DATA (STEP F)
   =============================== */

(function () {

  // Appearance
  let themeSelect, fontSelect;

  // Editor
  let editorAutofocus, editorAutosave, defaultWalletInput;

  // Notes
  let notesSortSelect, notesPreviewToggle;

  // Data
  let exportDataBtn, importDataInput, resetDataBtn, storageInfo;

  function applyToUI() {
    const settings = window.getSettings?.();
    if (!settings) return;

    // Appearance
    themeSelect && (themeSelect.value = settings.appearance.theme);
    fontSelect && (fontSelect.value = settings.appearance.fontSize);

    // Editor
    editorAutofocus && (editorAutofocus.checked = !!settings.editor.autofocus);
    editorAutosave && (editorAutosave.checked = !!settings.editor.autosave);
    defaultWalletInput && (defaultWalletInput.value = settings.editor.defaultWallet || "");

    // Notes
    notesSortSelect && (notesSortSelect.value = settings.notes.sort);
    notesPreviewToggle && (notesPreviewToggle.checked = !!settings.notes.showPreview);

    // Storage info
    if (storageInfo) {
      const size = new Blob([JSON.stringify(localStorage)]).size;
      storageInfo.textContent = `Local storage size: ${(size / 1024).toFixed(2)} KB`;
    }
  }

  function init() {
    const settings = window.getSettings?.();
    if (!settings) return;

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

    // Data
    exportDataBtn = document.getElementById("exportDataBtn");
    importDataInput = document.getElementById("importDataInput");
    resetDataBtn = document.getElementById("resetDataBtn");
    storageInfo = document.getElementById("storageInfo");

    applyToUI();

    /* ===============================
       DATA ACTIONS
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
            localStorage.setItem("dropnote_notes", JSON.stringify(data.notes));
          }

          if (data.settings) {
            localStorage.setItem("dropnote_settings", JSON.stringify(data.settings));
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

  window.addEventListener("settings:updated", applyToUI);
  window.addEventListener("notes:updated", applyToUI);

  init();

})();