/* ===============================
   EDITOR (FINAL)
   CREATE & EDIT NOTE 🔒
   + STEP D: EDITOR DEFAULTS
   =============================== */

(() => {
  const waitDom = () => {
    const saveBtn = document.getElementById("saveBtn");
    if (!saveBtn) {
      requestAnimationFrame(waitDom);
      return;
    }
    initEditor();
  };

  function initEditor() {
    const titleInput = document.getElementById("titleInput");
    const walletInput = document.getElementById("linkInput");
    const tagInput = document.getElementById("tagsInput");
    const contentInput = document.getElementById("contentInput");
    const saveBtn = document.getElementById("saveBtn");
    const editorHint = document.getElementById("editorHint");

    const settings = window.getSettings?.();

    const editId = sessionStorage.getItem("editNoteId");
    let editingNote = null;
    let isNewNote = !editId;

    /* ===============================
       STEP D — AUTOFUCUS
       =============================== */
    if (settings?.editor?.autofocus) {
      (contentInput || titleInput)?.focus();
    }

    /* ===============================
       STEP D — RESTORE DRAFT
       =============================== */
    const savedDraft = JSON.parse(
      localStorage.getItem("dropnote_editor_draft") || "null"
    );

    if (savedDraft && !editId) {
      titleInput.value ||= savedDraft.title || "";
      walletInput.value ||= savedDraft.wallet || "";
      tagInput.value ||= savedDraft.tags || "";
      contentInput.value ||= savedDraft.content || "";
    }

    /* ===============================
       AUTO RESIZE TEXTAREA
       =============================== */
    const autoResize = el => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    };

    contentInput.addEventListener("input", () => {
      autoResize(contentInput);

      if (contentInput.value.trim().length > 0) {
        editorHint?.classList.add("hidden");
      } else if (isNewNote) {
        editorHint?.classList.remove("hidden");
      }
    });

    contentInput.addEventListener("focus", () => {
      if (isNewNote && contentInput.value.trim() === "") {
        editorHint?.classList.remove("hidden");
      }
    });

    contentInput.addEventListener("blur", () => {
      if (contentInput.value.trim() === "") {
        editorHint?.classList.add("hidden");
      }
    });

    /* ===============================
       LOAD EDIT MODE
       =============================== */
    if (editId) {
      editingNote = getNotes().find(
        n => String(n.id) === String(editId)
      );

      if (editingNote) {
        titleInput.value = editingNote.title || "";
        walletInput.value = editingNote.wallet || "";
        tagInput.value = (editingNote.tags || []).join(", ");
        contentInput.value = editingNote.content || "";

        editorHint?.classList.add("hidden");
        isNewNote = false;

        setTimeout(() => autoResize(contentInput), 0);
      }
    }

    /* ===============================
       STEP D — DEFAULT WALLET
       =============================== */
    if (!editId && settings?.editor?.defaultWallet) {
      if (walletInput && !walletInput.value) {
        walletInput.value = settings.editor.defaultWallet;
      }
    }

    /* ===============================
       STEP D — AUTOSAVE DRAFT
       =============================== */
    let autosaveTimer = null;

    function autosaveDraft() {
      if (!settings?.editor?.autosave) return;

      const draft = {
        title: titleInput.value,
        wallet: walletInput.value,
        tags: tagInput.value,
        content: contentInput.value
      };

      localStorage.setItem(
        "dropnote_editor_draft",
        JSON.stringify(draft)
      );
    }

    ["input", "change"].forEach(evt => {
      document
        .querySelector(".editor-body")
        ?.addEventListener(evt, () => {
          clearTimeout(autosaveTimer);
          autosaveTimer = setTimeout(autosaveDraft, 600);
        });
    });

    /* ===============================
       SAVE
       =============================== */
    saveBtn.onclick = () => {
      const title = titleInput.value.trim();
      if (!title) {
        alert("Judul wajib diisi");
        return;
      }

      const wallet = walletInput.value.trim();
      const tags = tagInput.value
        .split(/[,\n|/]+/)
        .map(t => t.trim())
        .filter(Boolean);

      const content = contentInput.value.trim();

      // ===============================
      // UPDATE
      // ===============================
      if (editId && editingNote) {
        updateNote(editId, {
          title,
          wallet,
          tags,
          content,
          status:
            editingNote.status === "Draft"
              ? "Active"
              : editingNote.status
        });

        showToast("💾 Changes saved");

        localStorage.removeItem("dropnote_editor_draft");
        sessionStorage.removeItem("editNoteId");
      }
      // ===============================
      // CREATE
      // ===============================
      else {
        addNote({
          title,
          wallet,
          tags,
          content
        });

        showToast("✅ Note saved");
        localStorage.removeItem("dropnote_editor_draft");
      }

      // 🔔 notify pages AFTER data change
      window.dispatchEvent(new Event("notes:updated"));

      loadPage("notes");
    };
  }

  waitDom();
})();

/* ===============================
   KEYBOARD AWARE BOTTOM NAV
   =============================== */

(function () {
  const nav = document.querySelector(".bottom-nav");
  if (!nav) return;

  function onFocus(e) {
    if (e.target.matches("input, textarea")) {
      nav.classList.add("hide-on-keyboard");
    }
  }

  function onBlur(e) {
    if (e.target.matches("input, textarea")) {
      nav.classList.remove("hide-on-keyboard");
    }
  }

  document.addEventListener("focusin", onFocus);
  document.addEventListener("focusout", onBlur);

  // 🧹 cleanup when leaving editor page (SPA-safe)
  window.addEventListener("page:leave", () => {
    document.removeEventListener("focusin", onFocus);
    document.removeEventListener("focusout", onBlur);
    nav.classList.remove("hide-on-keyboard");
  });
})();