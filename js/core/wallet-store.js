/* ===============================
   WALLET STORE — CORE STATE
   DropNote v1.1 (LOCKED)
   =============================== */

/* ===============================
   STORAGE KEYS
   =============================== */
const WALLET_EVENT_KEY = "dropnote_wallet_events";
const WALLET_LABEL_KEY = "dropnote_wallet_labels";

/* ===============================
   INTERNAL HELPERS
   =============================== */
function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ===============================
   WALLET EVENTS
   =============================== */

/**
 * Get wallet event summary + items
 * Used by: home.js, audit.js
 */
window.getWalletEvents = function () {
  const items = loadJSON(WALLET_EVENT_KEY, []);

  const unreviewed = items.filter(e => !e.reviewed).length;

  return {
    total: items.length,
    unreviewed,
    items
  };
};

/**
 * Add new wallet events
 * Deduplicated by event.id
 */
window.addWalletEvents = function (events = []) {
  if (!Array.isArray(events) || events.length === 0) return;

  const current = loadJSON(WALLET_EVENT_KEY, []);
  const map = new Map(current.map(e => [e.id, e]));

  events.forEach(event => {
    if (!event?.id) return;

    map.set(event.id, {
      reviewed: false,
      createdAt: Date.now(),
      ...event
    });
  });

  saveJSON(WALLET_EVENT_KEY, Array.from(map.values()));
  window.dispatchEvent(new Event("wallet:updated"));
};

/**
 * Mark single wallet event as reviewed
 */
window.markWalletReviewed = function (id) {
  if (!id) return;

  const events = loadJSON(WALLET_EVENT_KEY, []);
  let changed = false;

  events.forEach(e => {
    if (e.id === id && !e.reviewed) {
      e.reviewed = true;
      changed = true;
    }
  });

  if (changed) {
    saveJSON(WALLET_EVENT_KEY, events);
    window.dispatchEvent(new Event("wallet:updated"));
  }
};

/**
 * Clear ALL wallet events
 * Used when wallet scope becomes empty
 */
window.clearWalletEvents = function () {
  saveJSON(WALLET_EVENT_KEY, []);
  window.dispatchEvent(new Event("wallet:updated"));
};

/* ===============================
   WALLET LABELS (METADATA)
   =============================== */

/**
 * Get label for wallet address
 */
window.getWalletLabel = function (address) {
  if (!address) return null;
  const map = loadJSON(WALLET_LABEL_KEY, {});
  return map[address.toLowerCase()] || null;
};

/**
 * Set / update wallet label
 */
window.setWalletLabel = function (address, label) {
  if (!address || !label) return;

  const map = loadJSON(WALLET_LABEL_KEY, {});
  map[address.toLowerCase()] = label.trim();

  saveJSON(WALLET_LABEL_KEY, map);
  window.dispatchEvent(new Event("wallet:updated"));
};

/**
 * Remove wallet label
 */
window.removeWalletLabel = function (address) {
  if (!address) return;

  const map = loadJSON(WALLET_LABEL_KEY, {});
  delete map[address.toLowerCase()];

  saveJSON(WALLET_LABEL_KEY, map);
  window.dispatchEvent(new Event("wallet:updated"));
};