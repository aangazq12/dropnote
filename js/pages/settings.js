/* ===============================
   SETTINGS PAGE — FINAL (SPA SAFE)
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

  /* ===============================
     HELPERS
     =============================== */

  function buildBackupPayload() {
    const notes = getNotes?.() || [];
    const settings = getSettings?.() || {};

    // context (sinkron dengan filename logic)
    let context = "default";

    if (settings?.editor?.presetState === true) {
      context = "preset";
    } else if (settings?.editor?.defaultWallet) {
      context = "wallet";
    } else {
      const tags = {};
      notes.forEach(n => {
        (n.tags || []).forEach(t => {
          const k = String(t).toLowerCase();
          tags[k] = (tags[k] || 0) + 1;
        });
      });

      if (tags.airdrop) context = "airdrop";
      else if (tags.testnet) context = "testnet";
      else if (tags.retro) context = "retro";
    }

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
    const settings = getSettings?.() || {};
    const notes = getNotes?.() || [];

    if (settings?.editor?.presetState === true) {
      return `dropnote-backup-preset-${today}.json`;
    }

    if (settings?.editor?.defaultWallet) {
      return `dropnote-backup-wallet-${today}.json`;
    }

    const tagCount = {};
    notes.forEach(n => {
      (n.tags || []).forEach(t => {
        const k = String(t).toLowerCase();
        tagCount[k] = (tagCount[k] || 0) + 1;
      });
    });

    const priorityTags = ["airdrop", "testnet", "retro"];
    for (const tag of priorityTags) {
      if (tagCount[tag]) {
        return `dropnote-backup-${tag}-${today}.json`;
      }
    }

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

  function showToast(text) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
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
       BACKUP
       =============================== */

    backupBtn?.addEventListener("click", () => {
      const payload = buildBackupPayload();
      const filename = getDefaultBackupFilename();
      downloadBackup(payload, filename);
      showToast("Backup saved");
    });

    backupAsBtn?.addEventListener("click", () => {
      const payload = buildBackupPayload();
      const suggested = getDefaultBackupFilename();
      const filename = prompt("Backup As", suggested);
      if (!filename) return;

      if (!filename.endsWith(".json")) {
        showToast("Filename must end with .json");
        return;
      }

      downloadBackup(payload, filename);
      showToast("Backup exported");
    });

    /* ===============================
       RESTORE
       =============================== */

    importDataInput?.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          let restored = false;

          if (Array.isArray(data.notes)) {
            localStorage.setItem("dropnote_notes", JSON.stringify(data.notes));
            restored = true;
          }

          if (data.settings && typeof data.settings === "object") {
            localStorage.setItem("dropnote_settings", JSON.stringify(data.settings));
            restored = true;
          }

          if (!restored) {
            showToast("Nothing to restore");
            importDataInput.value = "";
            return;
          }

          showToast("Backup restored");
          setTimeout(() => location.reload(), 800);

        } catch {
          showToast("Invalid backup file");
          importDataInput.value = "";
        }
      };

      reader.readAsText(file);
    });

    /* ===============================
       RESET
       =============================== */

    resetDataBtn?.addEventListener("click", () => {
      if (!confirm("Reset all data? This cannot be undone.")) return;

      localStorage.removeItem("dropnote_notes");
      localStorage.removeItem("dropnote_settings");
      localStorage.removeItem("dropnote_editor_draft");
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