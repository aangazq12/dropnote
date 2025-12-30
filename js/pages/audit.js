/* ===============================
   AUDIT PAGE – WALLET EVENTS (FINAL)
   DropNote v1.1.x — SPA SAFE
   =============================== */

(() => {

  function render() {
    const listEl = document.getElementById("auditList");
    const emptyEl = document.getElementById("auditEmpty");

    if (!listEl || !window.getWalletEvents) return;

    const { items } = getWalletEvents();

    listEl.innerHTML = "";

    if (!items.length) {
      emptyEl?.classList.remove("is-hidden");
      return;
    }

    emptyEl?.classList.add("is-hidden");

    items
      .sort((a, b) => b.time - a.time)
      .forEach(event => {
        const row = document.createElement("div");
        row.className = "audit-item";
        if (!event.reviewed) row.classList.add("unreviewed");

        /* ===============================
           WALLET LABEL RESOLUTION
           =============================== */
        const label = window.getWalletLabel?.(event.wallet);
        const walletText = label || event.wallet;

        row.innerHTML = `
          <div class="audit-main">
            <strong>${event.summary}</strong>
            <small>
              ${event.chain} · 
              <span class="audit-wallet">${walletText}</span>
            </small>
          </div>
          <button class="audit-action">
            ${event.reviewed ? "✓" : "Review"}
          </button>
        `;

        /* ===============================
           REVIEW ACTION
           =============================== */
        row.querySelector(".audit-action")?.addEventListener("click", () => {
          markWalletReviewed(event.id);
        });

        /* ===============================
           EDIT WALLET LABEL (INLINE)
           =============================== */
        row.querySelector(".audit-wallet")?.addEventListener("click", () => {
          const current =
            window.getWalletLabel?.(event.wallet) || "";

          const next = prompt(
            "Wallet label",
            current
          );

          if (next === null) return;

          if (next.trim() === "") {
            window.removeWalletLabel?.(event.wallet);
          } else {
            window.setWalletLabel?.(
              event.wallet,
              next.trim()
            );
          }

          // 🔄 refresh audit + home + signal strip
          window.dispatchEvent(new Event("wallet:updated"));
        });

        listEl.appendChild(row);
      });
  }

  /* ===============================
     INIT
     =============================== */
  render();
  window.addEventListener("wallet:updated", render);

})();