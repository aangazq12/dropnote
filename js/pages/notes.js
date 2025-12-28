/* ===============================
   NOTES PAGE (FINAL)
   CORE LIST & FILTER 🔒
   + STEP E: NOTES BEHAVIOR
   =============================== */

(() => {
  const waitDom = () => {
    const list = document.getElementById("notesList");
    if (!list) {
      requestAnimationFrame(waitDom);
      return;
    }
    initNotes();
  };

  let allNotes = [];
  let activeStatus = "all";

  function initNotes() {
    const list = document.getElementById("notesList");
    const addBtn = document.getElementById("addNoteBtn");
    const searchInput = document.getElementById("searchInput");
    const filterBtns = document.querySelectorAll(".status-filter button");

    const settings = window.getSettings?.();

    /* ===============================
       LOAD FILTER STATE
       =============================== */
    const savedFilter = sessionStorage.getItem("notesFilter");
    if (savedFilter) activeStatus = savedFilter;

    /* ===============================
       RENDER
       =============================== */
    function renderNotes(notes) {
      list.innerHTML = "";

      if (!notes.length) {
        list.innerHTML = "<p class='empty'>Tidak ada catatan</p>";
        return;
      }

      notes.forEach(note => {
        const { state, label } = getNoteState(note);

        const card = document.createElement("div");
        card.className = `note-card note-${state}`;
        card.dataset.id = note.id;

        const showPreview = settings?.notes?.showPreview !== false;
        const previewHTML = showPreview && note.content
          ? `<div class="note-preview">
               ${note.content.slice(0, 120)}${note.content.length > 120 ? "…" : ""}
             </div>`
          : "";

        card.innerHTML = `
          <div class="note-head">
            <h3>${note.title}</h3>
            <button class="delete-btn" data-id="${note.id}">🗑️</button>
          </div>

          ${note.wallet ? `<div class="note-wallet">🔗 ${note.wallet}</div>` : ""}

          ${
            note.tags?.length
              ? `<div class="note-tags">
                  ${note.tags.map(tag => `#${tag}`).join(" ")}
                </div>`
              : ""
          }

          ${previewHTML}

          <div class="note-meta">
            ${label} • ${timeAgo(note.updatedAt || note.createdAt)}
          </div>
        `;

        /* OPEN DETAIL */
        card.onclick = () => {
          sessionStorage.setItem("editNoteId", note.id);
          loadPage("detail");
        };

        list.appendChild(card);
      });

/* DELETE (WITH UNDO) */
list.querySelectorAll(".delete-btn").forEach(btn => {
  btn.onclick = e => {
    e.stopPropagation();
    const id = btn.dataset.id;

    if (!confirm("Hapus catatan ini?")) return;

    // 🔒 soft delete + single undo
    deleteNoteWithUndo(id);

    // 🔔 undo toast (single, non-queued)
    showToast("🗑️ Note deleted — Undo", {
      undo: true
    });
  };
});
    }

    /* ===============================
       FILTER + SEARCH
       =============================== */
    function applyFilter() {
      const q = searchInput.value.toLowerCase();

      const filtered = allNotes.filter(note => {
        const textMatch =
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.wallet.toLowerCase().includes(q) ||
          note.tags.join(" ").toLowerCase().includes(q);

        const state = getNoteState(note).state;
        const statusMatch =
          activeStatus === "all" || state === activeStatus;

        return textMatch && statusMatch;
      });

      renderNotes(filtered);
    }

    /* ===============================
       LOAD NOTES
       =============================== */
    function loadNotes() {
      let notes = getNotes();

      /* STEP E — SORT BEHAVIOR */
      if (settings?.notes?.sort === "oldest") {
        notes = [...notes].reverse();
      }

      allNotes = notes;
      applyFilter();
    }

    /* ===============================
       EVENTS
       =============================== */
    searchInput.oninput = applyFilter;

    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        activeStatus = btn.dataset.status;
        sessionStorage.setItem("notesFilter", activeStatus);

        applyFilter();
      };
    });

    if (addBtn) {
  addBtn.onclick = () => {
    sessionStorage.setItem("editor:new", "1");
    sessionStorage.removeItem("editNoteId");
    localStorage.removeItem("dropnote_editor_draft");
    loadPage("editor");
  };
}

    window.addEventListener("notes:updated", loadNotes);
    window.addEventListener("settings:updated", loadNotes);

    loadNotes();
  }

  waitDom();
})();