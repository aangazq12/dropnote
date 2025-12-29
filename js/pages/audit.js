/* ===============================
   AUDIT PAGE – WALLET EVENTS
   =============================== */

(() => {

  function render() {
    const listEl = document.getElementById("auditList");
    const emptyEl = document.getElementById("auditEmpty");

    if (!listEl) return;

    const { items } = getWalletEvents();

    listEl.innerHTML = "";

    if (!items.length) {
      emptyEl.classList.remove("is-hidden");
      return;
    }

    emptyEl.classList.add("is-hidden");

    items
      .sort((a, b) => b.time - a.time)
      .forEach(event => {
        const row = document.createElement("div");
        row.className = "audit-item";
        if (!event.reviewed) row.classList.add("unreviewed");

        row.innerHTML = `
          <div class="audit-main">
            <strong>${event.summary}</strong>
            <small>${event.chain} · ${event.wallet}</small>
          </div>
          <button class="audit-action">
            ${event.reviewed ? "✓" : "Review"}
          </button>
        `;

        row.querySelector(".audit-action").onclick = () => {
          markWalletReviewed(event.id);
        };

        listEl.appendChild(row);
      });
  }

  render();
  window.addEventListener("wallet:updated", render);

})();