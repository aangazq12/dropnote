/* ===============================
   PRESET STATE — SHADOW ONLY
   DropNote v1.1.x
   =============================== */

/* ===============================
   PRESET DATA (EXAMPLE NOTES)
   =============================== */

const PRESET_NOTES = [
  {
    id: Date.now() + 1,
    title: "Example · LFG (FCFS)",
    wallet: "",
    tags: ["FCFS"],
    content: `W EVM : 0x80F....A45195803
W SOL : FyTEFiVqy6.....sEaAn2dNuY

@ Twitter : Tuyul1`,
    status: "Draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startedAt: null,
    completedAt: null
  },
  {
    id: Date.now() + 2,
    title: "Example · Airdrop",
    wallet: "",
    tags: ["Airdrop"],
    content: `This is an example airdrop note.

• Add steps
• Add links
• Track progress`,
    status: "Draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startedAt: null,
    completedAt: null
  },
  {
    id: Date.now() + 3,
    title: "Example · Daily Task",
    wallet: "",
    tags: ["Daily"],
    content: `• Do daily task
• Check status
• Mark completed`,
    status: "Draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startedAt: null,
    completedAt: null
  }
];

/* ===============================
   SHADOW INJECTOR
   (NOT CALLED BY DEFAULT)
   =============================== */

function injectPresetNotes() {
  if (!Array.isArray(PRESET_NOTES)) return;

  const now = Date.now();

  const notes = PRESET_NOTES.map(n => ({
    ...n,
    id: now + Math.floor(Math.random() * 1000),
    createdAt: now,
    updatedAt: now
  }));

  localStorage.setItem("dropnote_notes", JSON.stringify(notes));
}

/* ===============================
   GATE LOGIC (SHADOW)
   =============================== */

function maybeInjectPreset() {
  const notes = window.getNotes?.() || [];
  const settings = window.getSettings?.() || {};

  if (notes.length !== 0) return;
  if (settings?.editor?.presetState === false) return;

  injectPresetNotes();
  window.updateSettings?.({ editor: { presetState: true } });
}

/* ===============================
   EXPORT (OPTIONAL)
   =============================== */

// window.PRESET_NOTES = PRESET_NOTES;
// window.maybeInjectPreset = maybeInjectPreset;