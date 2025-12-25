/* ===============================
   DROPNOTE SETTINGS STORE (FINAL)
   GLOBAL SETTINGS CONTRACT 🔒
   =============================== */

const SETTINGS_KEY = "dropnote_settings";
const SETTINGS_VERSION = 1;

/* ===============================
   DEFAULT SETTINGS (LOCKED)
   =============================== */
const DEFAULT_SETTINGS = {
  _v: SETTINGS_VERSION,

  appearance: {
    theme: "system",      // system | dark | light
    fontSize: "default"   // small | default | large
  },

  editor: {
  autofocus: false,
  autosave: false,
  defaultWallet: ""
},

  notes: {
    sort: "newest",       // newest | oldest
    showPreview: true,
    autoScrollTop: true
  },

  pwa: {
    showInstallButton: true
  }
};

/* ===============================
   UTIL (PURE & SAFE)
   =============================== */
function deepMerge(target, source) {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return target;

  const out = Array.isArray(target) ? [...target] : { ...target };

  for (const key in source) {
    if (key in target) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

/* ===============================
   MIGRATION (IDEMPOTENT)
   =============================== */
(function migrateSettings() {
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  } catch {
    raw = null;
  }

  // fresh install
  if (!raw || typeof raw !== "object") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return;
  }

  // version check (future-proof)
  const version = raw._v ?? 0;

  let migrated = raw;

  if (version < SETTINGS_VERSION) {
    // v0 → v1 (merge defaults safely)
    migrated = deepMerge(raw, DEFAULT_SETTINGS);
    migrated._v = SETTINGS_VERSION;
  }

  // normalize + save
  const normalized = deepMerge(DEFAULT_SETTINGS, migrated);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
})();

/* ===============================
   CORE ACCESSORS
   =============================== */
function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(next) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

/* ===============================
   UPDATE HELPERS
   =============================== */
function updateSettings(patch) {
  const current = getSettings();
  const next = deepMerge(current, patch);
  saveSettings(next);
  emitSettingsUpdated();
  return next;
}

function resetSettings() {
  saveSettings({ ...DEFAULT_SETTINGS });
  emitSettingsUpdated();
  return { ...DEFAULT_SETTINGS };
}

/* ===============================
   EVENT EMITTER
   =============================== */
function emitSettingsUpdated() {
  window.dispatchEvent(new Event("settings:updated"));
}

/* ===============================
   GLOBAL EXPOSE (LOCKED)
   =============================== */
window.getSettings = getSettings;
window.updateSettings = updateSettings;
window.resetSettings = resetSettings;