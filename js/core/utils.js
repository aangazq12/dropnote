/* ===============================
   DROPNOTE UTILITIES (FINAL)
   LOGIC ENGINE 🔒
   =============================== */

/* ===============================
   REMINDER LEVEL ENGINE
   =============================== */
function getReminderLevel(note) {
  if (!note || note.completedAt) return null;

  const now = Date.now();
  const baseTime = note.updatedAt || note.createdAt;
  if (!baseTime) return null;

  const age = now - baseTime;
  const DAY = 1000 * 60 * 60 * 24;

  if (age > DAY * 7) return "critical";
  if (age > DAY * 3) return "overdue";
  if (age > DAY * 1) return "active";

  return "draft";
}

/* ===============================
   SMART SORT (GLOBAL ORDER)
   =============================== */
function sortNotesSmart(notes = []) {
  const priority = {
    overdue: 1,
    active: 2,
    draft: 3,
    done: 4
  };

  return [...notes].sort((a, b) => {
    const aState = window.getNoteState(a).state;
    const bState = window.getNoteState(b).state;

    if (priority[aState] !== priority[bState]) {
      return priority[aState] - priority[bState];
    }

    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
}

/* ===============================
   STATUS FROM TAGS (OPTIONAL)
   =============================== */
function statusFromTags(tags = []) {
  const t = tags.map(v => String(v).toLowerCase());

  if (t.includes("done")) return "Done";
  if (t.includes("active")) return "Active";
  if (t.includes("draft")) return "Draft";

  return null;
}

/* ===============================
   GLOBAL EXPOSE (LOCKED)
   =============================== */
window.getReminderLevel = getReminderLevel;
window.sortNotesSmart = sortNotesSmart;
window.statusFromTags = statusFromTags;

/* =========================
   TOAST HELPER (GLOBAL)
   ========================= */
window.showToast = function (message, duration = 1600) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
};