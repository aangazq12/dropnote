/* ===============================
   HOME PAGE v1.1
   CLEAN FINAL – LOCKED
   =============================== */

(() => {

  /* ===============================
     TAG DICTIONARY (LOCKED)
     =============================== */
  const TAG_DICTIONARY = {
    "airdrop":      { label: "Airdrop",      icon: "📦" },
    "faucet":       { label: "Faucet",       icon: "🚰" },
    "social task":  { label: "Social Task",  icon: "👥" },
    "testnet":      { label: "Testnet",      icon: "🧪" },
    "daily task":   { label: "Daily Task",   icon: "📅" },
    "retro":        { label: "Retro",        icon: "🕰️" },
    "node":         { label: "Node",         icon: "🖥️" },
    "ido":          { label: "IDO",          icon: "🚀" },
    "staking":      { label: "Staking",      icon: "🔒" },
    "gamefi":       { label: "GameFi",       icon: "🎮" },
    "quest":        { label: "Quest",        icon: "🧭" },
    "bridge":       { label: "Bridge",       icon: "🌉" },
    "campaign":     { label: "Campaign",     icon: "🎯" },
    "whitelist":    { label: "Whitelist",    icon: "📝" },
    "snapshot":     { label: "Snapshot",     icon: "📸" },
    "claim":        { label: "Claim",        icon: "🎁" },
    "verify":       { label: "Verify",       icon: "✅" },
    "dao":          { label: "DAO",          icon: "🏛️" },
    "nft":          { label: "NFT",          icon: "🖼️" },
    "depin":        { label: "DePIN",        icon: "📡" },
    "yapping":      { label: "Yapping",      icon: "💬" }
  };

  /* ===============================
     WAIT DOM
     =============================== */
  const waitDom = () => {
    if (!document.getElementById("draftCount")) {
      requestAnimationFrame(waitDom);
      return;
    }
    /* ===============================
   THEME TOGGLE (HOME)
   =============================== */
const themeBtn = document.querySelector(".theme-btn");
if (themeBtn && window.toggleTheme) {
  themeBtn.onclick = toggleTheme;
}
    initHome();
  };

  function initHome() {
    const notes = getNotes();
    if (!Array.isArray(notes)) return;

    /* ===============================
       COUNTS
       =============================== */
    const draftNotes = notes.filter(
      n => !n.completedAt && n.status === "Draft"
    );

    const overdueNotes = notes.filter(
      n => getNoteState(n).state === "overdue"
    );

    const draftBox = document.getElementById("draftBox");
    const overdueBox = document.getElementById("overdueBox");
    const draftCountEl = document.getElementById("draftCount");
    const overdueCountEl = document.getElementById("overdueCount");

    if (draftBox && draftCountEl) {
      draftBox.classList.toggle("is-hidden", !draftNotes.length);
      draftCountEl.textContent = draftNotes.length || "";
    }

    if (overdueBox && overdueCountEl) {
      overdueBox.classList.toggle("is-hidden", !overdueNotes.length);
      overdueCountEl.textContent = overdueNotes.length || "";
    }

    /* ===============================
       STATUS SUMMARY WIDTH
       =============================== */
    const statusSummary = document.getElementById("statusSummary");
    if (statusSummary) {
      const visible =
        (draftNotes.length ? 1 : 0) +
        (overdueNotes.length ? 1 : 0);

      statusSummary.classList.toggle("single", visible === 1);
    }

    /* ===============================
       LAST ACTIVITY
       =============================== */
    const lastActivity = document.getElementById("lastActivity");
    const lastTitle = document.getElementById("lastTitle");
    const lastMeta = document.getElementById("lastMeta");
    const resumeContinue = document.getElementById("resumeContinue");

    const activeNotes = notes.filter(n => !n.completedAt);

    if (
      activeNotes.length &&
      lastActivity &&
      lastTitle &&
      lastMeta
    ) {
      const target = sortNotesSmart(activeNotes)[0];

      lastTitle.textContent = target.title;
      lastMeta.textContent =
        `${getNoteState(target).label} · ` +
        timeAgo(target.updatedAt || target.createdAt);

      lastActivity.classList.remove("is-hidden");

      if (resumeContinue) {
        resumeContinue.onclick = () => {
          sessionStorage.setItem("editNoteId", target.id);
          loadPage("editor");
        };
      }
    } else if (lastActivity) {
      lastActivity.classList.add("is-hidden");
    }

    /* ===============================
       TAG SUMMARY (FINAL)
       =============================== */
    const tagSummary = document.getElementById("tagSummary");
    if (tagSummary) {
      const tagCountMap = {};

      notes.forEach(note => {
        let tags = [];

        if (Array.isArray(note.tags)) {
          tags = note.tags;
        } else if (typeof note.tags === "string") {
          tags = note.tags.split(/[,\n|/]+/);
        }

        tags.forEach(raw => {
          const key = raw
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (TAG_DICTIONARY[key]) {
            tagCountMap[key] = (tagCountMap[key] || 0) + 1;
          }
        });
      });

      tagSummary.innerHTML = "";

      Object.entries(tagCountMap).forEach(([key, count]) => {
        const pill = document.createElement("span");
        pill.className = "tag-pill";
        pill.textContent =
          `${TAG_DICTIONARY[key].icon} ` +
          `${TAG_DICTIONARY[key].label} (${count})`;
        tagSummary.appendChild(pill);
      });

      tagSummary.classList.toggle(
        "is-hidden",
        !Object.keys(tagCountMap).length
      );
    }

    /* ===============================
       EMPTY STATE
       =============================== */
    const emptyState = document.getElementById("emptyState");
    if (emptyState) {
      emptyState.classList.toggle(
        "is-hidden",
        activeNotes.length ||
        draftNotes.length ||
        overdueNotes.length
      );
    }
  }

  window.addEventListener("notes:updated", initHome);
  waitDom();

})();

/* =========================
   HOME DRAWER LOGIC (LOCKED)
   ========================= */
(function(){
  const drawer    = document.getElementById("homeDrawer");
  const overlay   = document.getElementById("drawerOverlay");
  const menuBtn   = document.querySelector(".menu-btn");
  const bottomNav = document.querySelector(".bottom-nav");
  const lfgFab    = document.querySelector(".lfg-fab");
  const addFab    = document.querySelector(".add-fab");

  if (!drawer || !overlay || !menuBtn) return;

  let isOpen = false;

  function openDrawer(){
    if (isOpen) return;
    isOpen = true;

    drawer.classList.add("show");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";

    if (bottomNav) bottomNav.style.display = "none";
    if (lfgFab)    lfgFab.style.display = "none";
    if (addFab)    addFab.style.display = "none";
  }

  function closeDrawer(){
    if (!isOpen) return;
    isOpen = false;

    drawer.classList.remove("show");
    overlay.classList.remove("show");
    document.body.style.overflow = "";

    if (bottomNav) bottomNav.style.display = "";
    if (lfgFab)    lfgFab.style.display = "";
    if (addFab)    addFab.style.display = "";
  }

  // Drawer open / close
  menuBtn.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);

  // Add new note (clear editor)
  if (addFab) {
  addFab.addEventListener("click", () => {
    sessionStorage.setItem("editor:new", "1");
    sessionStorage.removeItem("editNoteId");
    localStorage.removeItem("dropnote_editor_draft");
    loadPage("editor");
  });
}

  // Swipe edge (LEFT → RIGHT)
  let startX = 0;

  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (isOpen) return;
    const currentX = e.touches[0].clientX;
    if (startX < 20 && currentX - startX > 60) {
      openDrawer();
    }
  }, { passive: true });

  // Drawer navigation
  drawer.querySelectorAll(".drawer-item[data-page]").forEach(item => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;
      if (!page) return;

      closeDrawer();
      setTimeout(() => loadPage(page), 200);
    });
  });
})();