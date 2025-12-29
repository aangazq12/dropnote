/* ===============================
   PRESET STATE — SHADOW ONLY
   DropNote v1.1.x (FINAL)
   =============================== */

/* ===============================
   PRESET DATA (EXAMPLE NOTES)
   =============================== */

const PRESET_NOTES = [
  {
    title: "Example · LFG (FCFS)",
    wallet: "",
    tags: ["FCFS"], // LFG only — NOT shown in Home summary
    content: `W EVM : 0x80F....A45195803
W SOL : FyTEFiVqy6.....sEaAn2dNuY

@ Twitter : Tuyul1`,
    status: "Draft"
  },
  {
    title: "Example · Airdrop",
    wallet: "",
    tags: ["Airdrop"],
    content: `This is an example airdrop note.

• Add steps
• Add links
• Track progress`,
    status: "Draft"
  },
  {
    title: "Example · Daily Task",
    wallet: "",
    tags: ["Daily"],
    content: `• Do daily task
• Check status
• Mark completed`,
    status: "Draft"
  }
];

/* ===============================
   INTERNAL INJECTOR
   =============================== */

function injectPresetNotes() {
  if (!Array.isArray(PRESET_NOTES)) return;

  const now = Date.now();

  const notes = PRESET_NOTES.map((n, i) => ({
    id: now + i + Math.floor(Math.random() * 1000),
    title: n.title,
    wallet: n.wallet || "",
    tags: n.tags || [],
    content: n.content || "",
    status: n.status || "Draft",
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null
  }));

  localStorage.setItem("dropnote_notes", JSON.stringify(notes));
}

/* ===============================
   GATE LOGIC (ONE-TIME, SAFE)
   =============================== */

function maybeInjectPreset() {
  const notes = window.getNotes?.() || [];
  const settings = window.getSettings?.() || {};

  // already has notes → never inject
  if (notes.length !== 0) return;

  // explicitly disabled
  if (settings?.editor?.presetState === false) return;

  injectPresetNotes();

  // lock state so it never re-injects
  window.updateSettings?.({
    editor: { presetState: true }
  });
}

/* ===============================
   EXPORT (GLOBAL — REQUIRED)
   =============================== */

window.maybeInjectPreset = maybeInjectPreset;