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
   DELETE WITH UNDO
   =============================== */
window.deleteNoteWithUndo = function (noteId, delay = 5000) {
  const notes = getNotes();
  const index = notes.findIndex(n => String(n.id) === String(noteId));
  if (index === -1) return;

  const deleted = notes[index];

  // simpan buffer
  window.__deletedNoteBuffer = deleted;

  // hapus dari list
  notes.splice(index, 1);
  saveNotes(notes);
  emitNotesUpdated(); // 🔒 FIX

  // final delete timer
  clearTimeout(window.__deletedNoteTimer);
  window.__deletedNoteTimer = setTimeout(() => {
    window.__deletedNoteBuffer = null;
  }, delay);
};

/* ===============================
   UNDO DELETE
   =============================== */
window.undoDeleteNote = function () {
  if (!window.__deletedNoteBuffer) return;

  const notes = getNotes();
  notes.unshift(window.__deletedNoteBuffer);
  saveNotes(notes);
  emitNotesUpdated(); // 🔒 FIX

  window.__deletedNoteBuffer = null;
  clearTimeout(window.__deletedNoteTimer);
};