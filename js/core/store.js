/* ===============================
   DROPNOTE STORE (FINAL)
   GLOBAL DATA CONTRACT 🔒
   =============================== */

const STORE_KEY = "dropnote_notes";

/* ===============================
   MIGRATION (SAFE & IDPOTENT)
   =============================== */
(function migrateNotes() {
  const raw = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  const now = Date.now();

  const migrated = raw.map(n => ({
    id: n.id ?? now,
    title: n.title ?? "",
    wallet: n.wallet ?? "",
    tags: Array.isArray(n.tags) ? n.tags : [],
    content: n.content ?? "",
    status: n.status ?? "Draft",
    createdAt: n.createdAt ?? now,
    updatedAt: n.updatedAt ?? now,
    startedAt: n.startedAt ?? null,
    completedAt: n.completedAt ?? null
  }));

  localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
})();

/* ===============================
   CORE ACCESSORS
   =============================== */
function getNotes() {
  return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
}

function saveNotes(notes) {
  localStorage.setItem(STORE_KEY, JSON.stringify(notes));
}

/* ===============================
   EVENT EMITTER
   =============================== */
function emitNotesUpdated() {
  window.dispatchEvent(new Event("notes:updated"));
}

/* ===============================
   CRUD OPERATIONS
   =============================== */

// CREATE
function addNote(note) {
  const notes = getNotes();
  const now = Date.now();

  notes.unshift({
    id: now,
    title: note.title ?? "",
    wallet: note.wallet ?? "",
    tags: Array.isArray(note.tags) ? note.tags : [],
    content: note.content ?? "",
    status: "Draft",
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null
  });

  saveNotes(notes);
  emitNotesUpdated();
}

// UPDATE
function updateNote(id, data) {
  const notes = getNotes();
  const index = notes.findIndex(n => String(n.id) === String(id));
  if (index === -1) return;

  const note = notes[index];
  const now = Date.now();

  const nextStartedAt =
    note.startedAt ??
    (note.status === "Draft" ? now : null);

  notes[index] = {
    ...note,
    ...data,
    updatedAt: now,
    startedAt: nextStartedAt
  };

  saveNotes(notes);
  emitNotesUpdated();
}

// DELETE
function deleteNote(id) {
  const notes = getNotes().filter(n => String(n.id) !== String(id));
  saveNotes(notes);
  emitNotesUpdated();
}
/* ===============================
   NOTE STATE (DERIVED LOGIC)
   =============================== */
function getNoteState(note) {
  if (!note) {
    return { state: "unknown", label: "Unknown" };
  }

  if (note.completedAt) {
    return { state: "done", label: "Done" };
  }

  if (note.status === "Draft") {
    return { state: "draft", label: "Draft" };
  }

  const now = Date.now();
  const baseTime = note.startedAt || note.updatedAt || note.createdAt;
  const diffDays = (now - baseTime) / (1000 * 60 * 60 * 24);

  if (diffDays >= 7) {
    return { state: "overdue", label: "Overdue" };
  }

  return { state: "active", label: "Active" };
}
/* ===============================
   GLOBAL EXPOSE (LOCKED)
   =============================== */
window.getNotes = getNotes;
window.addNote = addNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.getNoteState = getNoteState;

/* ===============================
   TEMP DELETE BUFFER (UNDO)
   =============================== */
window.__deletedNoteBuffer = null;
window.__deletedNoteTimer = null;

/* ===============================
   INTERNAL: FINALIZE DELETE
   =============================== */
function finalizePendingDelete() {
  // Untuk v1.1:
  // note sudah dihapus dari storage saat soft delete
  // finalize cukup dengan membuang buffer
  window.__deletedNoteBuffer = null;
  clearTimeout(window.__deletedNoteTimer);
  window.__deletedNoteTimer = null;
}

/* ===============================
   DELETE WITH UNDO (SINGLE)
   =============================== */
window.deleteNoteWithUndo = function (noteId, delay = 2500) {
  const notes = getNotes();
  const index = notes.findIndex(n => String(n.id) === String(noteId));
  if (index === -1) return;

  // 🔒 RULE: delete baru memfinalisasi undo lama
  if (window.__deletedNoteBuffer) {
    finalizePendingDelete();
  }

  const deleted = notes[index];

  // simpan buffer (hanya satu)
  window.__deletedNoteBuffer = deleted;

  // soft delete (hapus dari list, belum final secara UX)
  notes.splice(index, 1);
  saveNotes(notes);
  emitNotesUpdated();

  // undo window
  window.__deletedNoteTimer = setTimeout(() => {
    finalizePendingDelete();
  }, delay);
};

/* ===============================
   UNDO DELETE
   =============================== */
window.undoDeleteNote = function () {
  if (!window.__deletedNoteBuffer) return;

  const notes = getNotes();

  // restore (v1.1: restore ke atas, diterima)
  notes.unshift(window.__deletedNoteBuffer);
  saveNotes(notes);
  emitNotesUpdated();

  finalizePendingDelete();
};