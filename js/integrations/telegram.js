/* ===============================
   TELEGRAM ADAPTER – Step C
   =============================== */

const TELEGRAM_WORKER_URL =
  "https://telegram-proxy-dropnote.thelastaank.workers.dev";

/* ===============================
   PARSER
   =============================== */
function parseTelegramMessage(text = "", updateId) {
  const obj = {};

  text.split("\n").forEach(line => {
    const idx = line.indexOf(": ");
    if (idx === -1) return;

    const key = line.slice(0, idx).trim().toUpperCase();
    const value = line.slice(idx + 2).trim();
    obj[key] = value;
  });

  if (!obj.WALLET || !obj.AMOUNT) return null;

  return {
    id: `tg-${updateId}`,
    chain: obj.CHAIN || "UNKNOWN",
    summary: `Received ${obj.AMOUNT} ${obj.SYMBOL || ""}`.trim(),
    wallet: obj.WALLET,
    tx: obj.TX || null,
    source: "telegram",
    time: Date.now()
  };
}

/* ===============================
   MAIN SYNC
   =============================== */
async function syncTelegramToWallet() {
  if (!window.addWalletEvents) return;

  try {
    const res = await fetch(TELEGRAM_WORKER_URL);
    const data = await res.json();

    if (!Array.isArray(data.result)) return;

    const events = [];

    data.result.forEach(update => {
      const text = update?.channel_post?.text;
      if (!text) return;

      const parsed = parseTelegramMessage(text, update.update_id);
      if (parsed) events.push(parsed);
    });

    if (events.length) {
      window.addWalletEvents(events);
    }
  } catch (err) {
    console.warn("[telegram adapter]", err);
  }
}

/* ===============================
   EXPOSE FOR DEBUG
   =============================== */
window.syncTelegramToWallet = syncTelegramToWallet;

/* ===============================
   AUTO RUN (SAFE)
   =============================== */
syncTelegramToWallet();