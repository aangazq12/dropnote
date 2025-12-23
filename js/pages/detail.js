/* ===============================
   DETAIL NOTE VIEW – FINAL
   =============================== */

(() => {
  function waitDom() {
    if (!document.getElementById("detailTitle")) {
      requestAnimationFrame(waitDom);
      return;
    }
    initDetail();
  }

  function initDetail() {
    const id = sessionStorage.getItem("editNoteId");
    if (!id) {
      loadPage("notes");
      return;
    }

    const notes = getNotes();
    const note = notes.find(n => String(n.id) === String(id));
    if (!note) {
      loadPage("notes");
      return;
    }

    const { state, label } = getNoteState(note);

    // RENDER
    document.getElementById("detailTitle").textContent = note.title;
    document.getElementById("detailMeta").textContent =
      `${label} • ${timeAgo(note.updatedAt || note.createdAt)}`;
    document.getElementById("detailContent").textContent =
      note.content || "";

    /* ===============================
       DONE / UNDO
       =============================== */
    const toggleBtn = document.getElementById("toggleDoneBtn");
    const isDone = state === "done";

    toggleBtn.textContent = isDone
      ? "↩️ Undo Done"
      : "✔️ Mark Done";

    toggleBtn.onclick = () => {
      const nextDone = !isDone;

      updateNote(note.id, {
        completedAt: nextDone ? Date.now() : null,
        status: nextDone ? "Done" : "Draft"
      });

      showToast(
        nextDone ? "✔️ Marked as Done" : "↩️ Undo Done"
      );

      sessionStorage.removeItem("editNoteId");
      loadPage("notes");
    };

    /* ===============================
       EDIT
       =============================== */
    document.getElementById("editBtn").onclick = () => {
      loadPage("editor");
    };

    /* ===============================
       DELETE
       =============================== */
    document.getElementById("deleteBtn").onclick = () => {
  if (!confirm("Catatan ini akan dihapus permanen")) return;

  deleteNoteWithUndo(note.id);

  showToast("🗑️ Note deleted — Undo");

  sessionStorage.removeItem("editNoteId");
  loadPage("notes");
};
  }

  waitDom();
})();