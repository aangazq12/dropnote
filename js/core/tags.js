/* ===============================
   TAGS — SUGGESTION SOURCE
   Single source of truth
   =============================== */

(() => {
  const TAGS = [
    // core
    "airdrop",
    "fcfs",
    "testnet",
    "daily",
    "retro",

    // infra
    "node",
    "ido",
    "staking",
    "dao",
    "depin",

    // campaign / task
    "quest",
    "campaign",
    "whitelist",
    "snapshot",
    "claim",
    "verify",

    // ecosystem
    "nft",
    "gamefi",
    "bridge"
  ];

  function search(query) {
    const q = String(query || "")
      .toLowerCase()
      .trim();

    if (!q) return [];

    return TAGS.filter(tag =>
      tag.startsWith(q)
    );
  }

  // Expose (read-only contract)
  window.Tags = Object.freeze({
    search
  });
})();