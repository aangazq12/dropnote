/* ===============================
   NOTES PAGE (FINAL)
   CORE LIST & FILTER 🔒
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

      /* DELETE */
      list.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          if (confirm("Hapus catatan ini?")) {
            deleteNote(id);
          }
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
      allNotes = sortNotesSmart(getNotes());
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

    addBtn.onclick = () => {
      sessionStorage.removeItem("editNoteId");
      loadPage("editor");
    };

    window.addEventListener("notes:updated", loadNotes);

    loadNotes();
  }

  waitDom();
})();