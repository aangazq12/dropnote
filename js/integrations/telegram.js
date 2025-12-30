/* ===============================
   TELEGRAM ADAPTER — FINAL
   DropNote v1.1.x (LOCK SAFE)
   =============================== */

const TELEGRAM_WORKER_URL =
  "https://telegram-proxy-dropnote.thelastaank.workers.dev";

/* ===============================
   PARSER (ETHERDROP + LEGACY)
   =============================== */
function parseTelegramMessage(text = "", updateId) {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  let chain = "UNKNOWN";
  let direction = null;
  let amount = null;
  let symbol = "";
  let wallet = null;

  /* HEADER
     Oxenks · BASE | ✏️
  */
  if (lines[0]?.includes("·")) {
    const header = lines[0].split("|")[0];
    const parts = header.split("·");
    chain = parts[1]?.trim().toUpperCase() || chain;
  }

  lines.forEach(line => {
    // Sent / Received
    if (line.startsWith("Sent:") || line.startsWith("Received:")) {
      direction = line.startsWith("Sent:")
        ? "Sent"
        : "Received";

      const main = line.split(":")[1]?.trim();
      if (main) {
        const clean = main.split("(~")[0].trim();
        const parts = clean.split(" ");
        amount = parts[0];
        symbol = parts.slice(1).join(" ");
      }

      if (line.includes(" To: ")) {
        wallet = line.split(" To: ")[1]?.trim();
      }
      if (line.includes(" From: ")) {
        wallet = line.split(" From: ")[1]?.trim();
      }
    }

    // Legacy fallback
    if (line.startsWith("From:") || line.startsWith("To:")) {
      wallet = line.split(":")[1]?.trim();
    }
  });

  // 🚫 Guard wajib
  if (!amount || !wallet) return null;

  // 🚫 Hanya address valid
  const isAddress =
    wallet.startsWith("0x") ||
    wallet.length > 30; // solana / long addr

  if (!isAddress) {
    console.info("[telegram] skipped non-address:", wallet);
    return null;
  }

  return {
    id: `tg-${updateId}`,
    chain,
    summary: `${direction} ${amount} ${symbol}`.trim(),
    wallet: wallet.toLowerCase(),
    source: "telegram",
    time: Date.now()
  };
}

/* ===============================
   MAIN SYNC (WALLET GUARDED)
   =============================== */
async function syncTelegramToWallet() {
  if (
    !window.addWalletEvents ||
    !window.getWalletScope
  ) return;

  try {
    const res = await fetch(TELEGRAM_WORKER_URL);
    const data = await res.json();

    if (!Array.isArray(data.result)) return;

    const scope = window.getWalletScope() || [];

    // 🔒 FINAL GUARD
    if (!scope.length) {
      console.info("[wallet] scope empty, telegram sync paused");
      return;
    }

    const events = [];

    data.result.forEach(update => {
      const text = update?.channel_post?.text;
      if (!text) return;

      const parsed = parseTelegramMessage(
        text,
        update.update_id
      );
      if (!parsed) return;

      // 🔒 WALLET ISOLATION
      if (!scope.includes(parsed.wallet)) return;

      events.push(parsed);
    });

    if (events.length) {
      window.addWalletEvents(events);
    }
  } catch (err) {
    console.warn("[telegram adapter]", err);
  }
}

/* ===============================
   EXPOSE + AUTO RUN
   =============================== */
window.syncTelegramToWallet = syncTelegramToWallet;
syncTelegramToWallet();