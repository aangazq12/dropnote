/* ===============================
   DROPNOTE — EDITOR CORE
   Refactor: STRUCTURAL ONLY (SAFE)
   =============================== */

(() => {
  /* ===============================
     BOOTSTRAP (SPA SAFE)
     =============================== */
  function waitDom() {
    const saveBtn = document.getElementById("saveBtn");
    if (!saveBtn) {
      requestAnimationFrame(waitDom);
      return;
    }
    initEditor();
  }

  /* ===============================
     INIT
     =============================== */
  function initEditor() {
    const dom = bindEditorDOM();
    const state = initEditorState();

    setupAutofocus(dom, state);
    restoreDraft(dom, state);
    setupAutoResize(dom, state);
    setupTagSuggestion(dom);
    setupAutosave(dom, state);
    loadEditMode(dom, state);
    bindSave(dom, state);

    // cleanup flag (important)
    sessionStorage.removeItem("editor:new");
  }

  /* ===============================
     DOM BINDING
     =============================== */
  function bindEditorDOM() {
    return {
      title: document.getElementById("titleInput"),
      wallet: document.getElementById("linkInput"),
      tags: document.getElementById("tagsInput"),
      content: document.getElementById("contentInput"),
      saveBtn: document.getElementById("saveBtn"),
      hint: document.getElementById("editorHint"),
      body: document.querySelector(".editor-body")
    };
  }

  /* ===============================
     STATE
     =============================== */
  function initEditorState() {
    const settings = window.getSettings?.();
    const editId = sessionStorage.getItem("editNoteId");
    const isNewFromHome = sessionStorage.getItem("editor:new") === "1";

    return {
      settings,
      editId,
      isNew: isNewFromHome || !editId,
      editingNote: null
    };
  }

  /* ===============================
     UX — AUTOFUCUS
     =============================== */
  function setupAutofocus(dom, state) {
    if (state.settings?.editor?.autofocus) {
      (dom.content || dom.title)?.focus();
    }
  }

  /* ===============================
     DRAFT — RESTORE
     =============================== */
  function restoreDraft(dom, state) {
    if (state.editId || state.isNew) return;

    const savedDraft = JSON.parse(
      localStorage.getItem("dropnote_editor_draft") || "null"
    );

    if (!savedDraft) return;

    dom.title.value   ||= savedDraft.title   || "";
    dom.wallet.value  ||= savedDraft.wallet  || "";
    dom.tags.value    ||= savedDraft.tags    || "";
    dom.content.value ||= savedDraft.content || "";
  }

  /* ===============================
     CONTENT — AUTO RESIZE & HINT
     =============================== */
  function setupAutoResize(dom, state) {
    const autoResize = el => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    };

    dom.content.addEventListener("input", () => {
      autoResize(dom.content);

      if (dom.content.value.trim()) {
        dom.hint?.classList.add("hidden");
      } else if (state.isNew) {
        dom.hint?.classList.remove("hidden");
      }
    });

    dom.content.addEventListener("focus", () => {
      if (state.isNew && !dom.content.value.trim()) {
        dom.hint?.classList.remove("hidden");
      }
    });

    dom.content.addEventListener("blur", () => {
      if (!dom.content.value.trim()) {
        dom.hint?.classList.add("hidden");
      }
    });
  }

  /* ===============================
     TAG SUGGESTION (UNCHANGED LOGIC)
     =============================== */
  function setupTagSuggestion(dom) {
    const tagSuggest = document.createElement("div");
    tagSuggest.className = "tag-suggest";
    tagSuggest.style.display = "none";
    dom.tags.parentNode.appendChild(tagSuggest);

    function formatTag(tag) {
      const t = String(tag || "").trim();
      if (!t) return "";
      if (t.length <= 4) return t.toUpperCase();
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    }

    function getLastTagToken(value) {
      const parts = value.split(",");
      return parts[parts.length - 1].trim();
    }

    function render(list) {
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
          const parts = dom.tags.value.split(",");
          parts[parts.length - 1] = " " + formatTag(tag);
          dom.tags.value = parts.join(",").replace(/^ /, "") + ", ";
          tagSuggest.style.display = "none";
          dom.tags.focus();
        };

        tagSuggest.appendChild(item);
      });

      tagSuggest.style.display = "block";
    }

    dom.tags.addEventListener("input", () => {
      if (!window.Tags) return;

      const token = getLastTagToken(dom.tags.value);
      if (!token) {
        tagSuggest.style.display = "none";
        return;
      }

      render(Tags.search(token));
    });

    dom.tags.addEventListener("blur", () => {
      setTimeout(() => (tagSuggest.style.display = "none"), 150);
    });
  }

  /* ===============================
     AUTOSAVE DRAFT
     =============================== */
  function setupAutosave(dom, state) {
    if (!state.settings?.editor?.autosave) return;

    let timer = null;

    function autosave() {
      const draft = {
        title: dom.title.value,
        wallet: dom.wallet.value,
        tags: dom.tags.value,
        content: dom.content.value
      };

      localStorage.setItem(
        "dropnote_editor_draft",
        JSON.stringify(draft)
      );
    }

    ["input", "change"].forEach(evt => {
      dom.body?.addEventListener(evt, () => {
        clearTimeout(timer);
        timer = setTimeout(autosave, 600);
      });
    });
  }

  /* ===============================
     LOAD EDIT MODE
     =============================== */
  function loadEditMode(dom, state) {
    if (!state.editId) return;

    state.editingNote = getNotes().find(
      n => String(n.id) === String(state.editId)
    );

    if (!state.editingNote) return;

    dom.title.value   = state.editingNote.title   || "";
    dom.wallet.value  = state.editingNote.wallet  || "";
    dom.tags.value    = (state.editingNote.tags || []).join(", ");
    dom.content.value = state.editingNote.content || "";

    dom.hint?.classList.add("hidden");
    state.isNew = false;

    setTimeout(() => {
      dom.content.style.height = "auto";
      dom.content.style.height = dom.content.scrollHeight + "px";
    }, 0);
  }

  /* ===============================
     SAVE (CREATE / UPDATE)
     =============================== */
  function bindSave(dom, state) {
    dom.saveBtn.onclick = () => {
      const title = dom.title.value.trim();
      if (!title) {
        alert("Judul wajib diisi");
        return;
      }

      const wallet = dom.wallet.value.trim();
      const tags = dom.tags.value
        .split(/[,\n|/]+/)
        .map(t => {
          const v = String(t || "").trim();
          if (!v) return "";
          if (v.length <= 4) return v.toUpperCase();
          return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        })
        .filter(Boolean);

      const content = dom.content.value.trim();

      if (state.editId && state.editingNote) {
        updateNote(state.editId, {
          title,
          wallet,
          tags,
          content,
          status:
            state.editingNote.status === "Draft"
              ? "Active"
              : state.editingNote.status
        });

        showToast("💾 Changes saved");
        localStorage.removeItem("dropnote_editor_draft");
        sessionStorage.removeItem("editNoteId");
      } else {
        addNote({ title, wallet, tags, content });
        showToast("✅ Note saved");
        localStorage.removeItem("dropnote_editor_draft");
        sessionStorage.removeItem("editor:new");
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
   (LEGACY — DO NOT TOUCH)
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