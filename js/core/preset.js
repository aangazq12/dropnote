/* ===============================
   PRESET STATE — ONE TIME ONLY
   DropNote v1.1.x (FINAL FIX)
   =============================== */

/* ===============================
   PRESET DATA
   =============================== */

const PRESET_NOTES = [
  {
    title: "Example · LFG (FCFS)",
    wallet: "",
    tags: ["FCFS"], // LFG only — NOT shown in Home summary
    content: `W EVM : 0x80F....A45195803
W SOL : FyTEFiVqy6.....sEaAn2dNuY

@ Twitter : Tuyul1
UID Binance : 123456`,
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
   GATE LOGIC (HARD LOCK)
   =============================== */

function maybeInjectPreset() {
  const settings = window.getSettings?.() || {};

  // 🔒 SUDAH PERNAH INJECT → STOP SELAMANYA
  if (settings?.editor?.presetInjected === true) {
    return;
  }

  const notes = window.getNotes?.() || [];

  // inject hanya jika benar-benar kosong
  if (notes.length === 0) {
    injectPresetNotes();
  }

  // 🔒 KUNCI PERMANEN
  window.updateSettings?.({
    editor: {
      presetInjected: true
    }
  });
}

/* ===============================
   EXPORT GLOBAL
   =============================== */

window.maybeInjectPreset = maybeInjectPreset;