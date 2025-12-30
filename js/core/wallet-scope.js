/* ===============================
   WALLET SCOPE – CORE
   DropNote v1.0 (FINAL)
   =============================== */

const WALLET_SCOPE_KEY = "dropnote_wallet_scope";

/* ===============================
   INTERNAL
   =============================== */
function loadScope() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_SCOPE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveScope(list) {
  localStorage.setItem(WALLET_SCOPE_KEY, JSON.stringify(list));
}

/* ===============================
   PUBLIC API
   =============================== */

// get all scoped wallets
window.getWalletScope = function () {
  return loadScope();
};

// add wallet to scope
window.addWalletToScope = function (address) {
  if (!address) return;

  const key = address.toLowerCase();
  const scope = loadScope();

  if (!scope.includes(key)) {
    scope.push(key);
    saveScope(scope);
  }
};

// remove wallet from scope
window.removeWalletFromScope = function (address) {
  if (!address) return;

  const key = address.toLowerCase();
  const scope = loadScope().filter(w => w !== key);

  saveScope(scope);
};

// clear scope (debug / reset)
window.clearWalletScope = function () {
  saveScope([]);
};