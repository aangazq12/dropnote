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
    const titleInput   = document.getElementById("titleInput");
    const walletInput  = document.getElementById("linkInput");
    const tagInput     = document.getElementById("tagsInput");
    const contentInput = document.getElementById("contentInput");
    const saveBtn      = document.getElementById("saveBtn");
    const editorHint   = document.getElementById("editorHint");
     
    /* ===============================
       TAG SUGGESTION (EDITOR)
       =============================== */

    // inject container once
    const tagSuggest = document.createElement("div");
    tagSuggest.className = "tag-suggest";
    tagSuggest.style.display = "none";
    tagInput.parentNode.appendChild(tagSuggest);

    // helper: format tag (display & save)
    function formatTag(tag) {
      const t = String(tag || "").trim();
      if (!t) return "";

      // singkatan → FULL CAPS
      if (t.length <= 4) return t.toUpperCase();

      // normal → Capitalized
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }

    // helper: get last token after comma
    function getLastTagToken(value) {
      const parts = value.split(",");
      return parts[parts.length - 1].trim();
    }

    // render suggestion list
    function renderTagSuggest(list) {
      tagSuggest.innerHTML = "";

      if (!list.length) {
        tagSuggest.style.display = "none";
        return;
      }

      list.slice(0, 6).forEach(tag => {
        const item = document.createElement("div");
        item.className = "tag-suggest-item";
        item.textContent = formatTag(tag);

        item.onclick = () => {
          const parts = tagInput.value.split(",");
          parts[parts.length - 1] = " " + formatTag(tag);

          tagInput.value =
            parts.join(",").replace(/^ /, "") + ", ";

          tagSuggest.style.display = "none";
          tagInput.focus();
        };

        tagSuggest.appendChild(item);
      });

      tagSuggest.style.display = "block";
    }

    /* ===============================
       SETTINGS & MODE
       =============================== */

    const settings = window.getSettings?.();
const editId   = sessionStorage.getItem("editNoteId");
const isNewFromHome = sessionStorage.getItem("editor:new") === "1";

let editingNote = null;
let isNewNote = isNewFromHome || !editId;
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

    if (savedDraft && !editId && !isNewFromHome) {
      titleInput.value   ||= savedDraft.title   || "";
      walletInput.value  ||= savedDraft.wallet  || "";
      tagInput.value     ||= savedDraft.tags    || "";
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

      if (contentInput.value.trim()) {
        editorHint?.classList.add("hidden");
      } else if (isNewNote) {
        editorHint?.classList.remove("hidden");
      }
    });

    contentInput.addEventListener("focus", () => {
      if (isNewNote && !contentInput.value.trim()) {
        editorHint?.classList.remove("hidden");
      }
    });

    contentInput.addEventListener("blur", () => {
      if (!contentInput.value.trim()) {
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
        titleInput.value   = editingNote.title   || "";
        walletInput.value  = editingNote.wallet  || "";
        tagInput.value     = (editingNote.tags || []).join(", ");
        contentInput.value = editingNote.content || "";

        editorHint?.classList.add("hidden");
        isNewNote = false;

        setTimeout(() => autoResize(contentInput), 0);
      }
    }
/* ===============================
   CLEAN NEW FLAG (IMPORTANT)
   =============================== */
sessionStorage.removeItem("editor:new");
    /* ===============================
       STEP D — DEFAULT WALLET
       =============================== */

    if (!editId && settings?.editor?.defaultWallet) {
      if (!walletInput.value) {
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
        title:   titleInput.value,
        wallet:  walletInput.value,
        tags:    tagInput.value,
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
       TAG INPUT — SUGGESTION LOGIC
       =============================== */

    tagInput.addEventListener("input", () => {
      if (!window.Tags) return;

      const token = getLastTagToken(tagInput.value);
      if (!token) {
        tagSuggest.style.display = "none";
        return;
      }

      const results = Tags.search(token);
      renderTagSuggest(results);
    });

    tagInput.addEventListener("blur", () => {
      setTimeout(() => {
        tagSuggest.style.display = "none";
      }, 150);
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
        .map(formatTag)
        .filter(Boolean);

      const content = contentInput.value.trim();

      // UPDATE
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
      // CREATE
else {
  addNote({ title, wallet, tags, content });
  showToast("✅ Note saved");
  localStorage.removeItem("dropnote_editor_draft");
  sessionStorage.removeItem("editor:new"); // optional safety
}

      window.dispatchEvent(new Event("notes:updated"));
history.replaceState({ page: "notes" }, "", "#notes");
loadPage("notes", true);
    };
  }

  waitDom();
})();

/* ===============================
   KEYBOARD AWARE BOTTOM NAV
   =============================== */

(() => {
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

  window.addEventListener("page:leave", () => {
    document.removeEventListener("focusin", onFocus);
    document.removeEventListener("focusout", onBlur);
    nav.classList.remove("hide-on-keyboard");
  });
})();