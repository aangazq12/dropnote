/* ===============================
   WALLET STORE – CORE STATE
   DropNote v1.0
   =============================== */

const STORAGE_KEY = "dropnote_wallet_events";

/* ===============================
   INTERNAL HELPERS
   =============================== */
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* ===============================
   PUBLIC API
   =============================== */

/**
 * Get wallet event summary + items
 * Used by: home.js, wallet page (later)
 */
window.getWalletEvents = function () {
  const items = loadEvents();

  const unreviewed = items.filter(e => !e.reviewed).length;

  return {
    total: items.length,
    unreviewed,
    items
  };
};

/**
 * Add new wallet events
 * events: Array of event objects
 */
window.addWalletEvents = function (events = []) {
  if (!Array.isArray(events) || !events.length) return;

  const current = loadEvents();
  const map = new Map(current.map(e => [e.id, e]));

  events.forEach(event => {
    if (!event.id) return;

    map.set(event.id, {
      reviewed: false,
      createdAt: Date.now(),
      ...event
    });
  });

  saveEvents(Array.from(map.values()));

  // 🔔 notify app
  window.dispatchEvent(new Event("wallet:updated"));
};

/**
 * Mark event as reviewed
 */
window.markWalletReviewed = function (id) {
  const events = loadEvents();
  let changed = false;

  events.forEach(e => {
    if (e.id === id && !e.reviewed) {
      e.reviewed = true;
      changed = true;
    }
  });

  if (changed) {
    saveEvents(events);
    window.dispatchEvent(new Event("wallet:updated"));
  }
};

/**
 * Clear all wallet events (debug / reset)
 */
window.clearWalletEvents = function () {
  saveEvents([]);
  window.dispatchEvent(new Event("wallet:updated"));
};

/* ===============================
   DEV DUMMY (REMOVE LATER)
   =============================== */
// Uncomment for quick test
/*
addWalletEvents([
  {
    id: "dummy-1",
    chain: "EVM",
    summary: "Received 0.98 USDC",
    wallet: "0x27..24a5",
    tx: "0xabc",
    time: Date.now()
  }
]);
*/
/* ===============================
   WALLET LABEL MAP
   =============================== */

const WALLET_LABEL_KEY = "dropnote_wallet_labels";

function loadWalletLabels() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_LABEL_KEY)) || {};
  } catch {
    return {};
  }
}

function saveWalletLabels(map) {
  localStorage.setItem(WALLET_LABEL_KEY, JSON.stringify(map));
}

/* ===============================
   PUBLIC WALLET LABEL API
   =============================== */

// get label by address
window.getWalletLabel = function (address) {
  if (!address) return null;
  const map = loadWalletLabels();
  return map[address.toLowerCase()] || null;
};

// set / update label
window.setWalletLabel = function (address, label) {
  if (!address || !label) return;
  const map = loadWalletLabels();
  map[address.toLowerCase()] = label;
  saveWalletLabels(map);
};

// remove label
window.removeWalletLabel = function (address) {
  const map = loadWalletLabels();
  delete map[address.toLowerCase()];
  saveWalletLabels(map);
};

/* ===============================
   WALLET SCOPE (USER ISOLATION)
   =============================== */

const WALLET_SCOPE_KEY = "dropnote_wallet_scope";

function loadWalletScope() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_SCOPE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Get active wallet scope (lowercase addresses)
 */
window.getWalletScope = function () {
  return loadWalletScope();
};

/**
 * Replace wallet scope (array of addresses)
 */
window.setWalletScope = function (wallets = []) {
  if (!Array.isArray(wallets)) return;
  const normalized = wallets.map(w => w.toLowerCase());
  localStorage.setItem(WALLET_SCOPE_KEY, JSON.stringify(normalized));
};

/**
 * Add single wallet to scope
 */
window.addWalletToScope = function (address) {
  if (!address) return;
  const list = loadWalletScope();
  const lower = address.toLowerCase();
  if (!list.includes(lower)) {
    list.push(lower);
    localStorage.setItem(WALLET_SCOPE_KEY, JSON.stringify(list));
  }
};

/**
 * Clear wallet scope (DEV / reset)
 */
window.clearWalletScope = function () {
  localStorage.removeItem(WALLET_SCOPE_KEY);
};