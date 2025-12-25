(function(){
  const page = document.querySelector(".lfg-page");
  if(!page) return;

  const listEl = document.getElementById("lfgList");
  const searchEl = document.getElementById("lfgSearch");
  const titleEl = document.getElementById("lfgTitle");
  const bottomNav = document.querySelector(".bottom-nav");
/* ===============================
   LFG PAGE LIFECYCLE (SPA SAFE)
   =============================== */

// HIDE bottom nav saat LFG aktif
if (bottomNav) {
  bottomNav.style.display = "none";
}

// RESTORE bottom nav saat keluar page
function cleanupLFG() {
  if (bottomNav) {
    bottomNav.style.display = "";
  }
}

// SPA cleanup hook
window.addEventListener("page:leave", cleanupLFG, { once: true });

  let activeTag = "fcfs";
  const copiedRows = {}; // runtime only

  /* ===============================
     NORMALIZE LABEL (LOCKED)
     =============================== */
  function normalizeLabel(rawKey=""){
    const parts = rawKey.trim().split(/\s+/);
    if(parts.length === 1) return rawKey.trim();
    const prefix = parts[0].toLowerCase();
    const rest = parts.slice(1).join(" ").trim();
    const removable = ["w","wallet","@","uid"];
    if(removable.includes(prefix) && rest) return rest;
    return rawKey.trim();
  }

  /* ===============================
     PARSE CONTENT (LOCKED)
     =============================== */
  function parseContent(content=""){
    const lines = content.split("\n");
    const rows = [];
    const notes = [];

    lines.forEach(l=>{
      const t=l.trim(); if(!t) return;
      const i=t.indexOf(":");
      if(i>-1){
        const k=t.slice(0,i).trim();
        const v=t.slice(i+1).trim();
        if(k && v){
          rows.push({ label: normalizeLabel(k), value:v });
          return;
        }
      }
      notes.push(t);
    });

    return { rows, noteText: notes.join(" ") };
  }

  /* ===============================
     IDENT FROM SECOND FIELD (LOCKED)
     =============================== */
  function identFromSecondField(link=""){
    if(!link) return "";
    try{
      const u=new URL(link);
      return u.hostname.replace(/^www\./,"");
    }catch{
      const p=link.split(/[\/\s]+/).filter(Boolean);
      return p[p.length-1] || "";
    }
  }


  /* ===============================
     RENDER (LOCKED)
     =============================== */
  function render(){
    listEl.innerHTML="";

    const notes = (window.getNotes?.() || [])
      .filter(n =>
        Array.isArray(n.tags) &&
        n.tags.some(t => String(t).toLowerCase().includes(activeTag))
      );

    if(!notes.length){
      listEl.innerHTML =
        `<div class="lfg-empty">
          Tidak ada data untuk tag "${activeTag.toUpperCase()}"
        </div>`;
      return;
    }

    notes.forEach(note=>{
      const { rows, noteText } = parseContent(note.content||"");
      const card=document.createElement("div");
      card.className="lfg-item";
      card.dataset.id=note.id;

      copiedRows[note.id] = copiedRows[note.id] || new Set();

      /* TITLE */
      const title=document.createElement("div");
      title.className="lfg-title";
      title.innerHTML = `<span>${note.title || "Tanpa Judul"}</span>`;

      const ident = identFromSecondField(note.link||note.ref||"");
      if(ident){
        const s=document.createElement("span");
        s.className="lfg-ident";
        s.textContent="| "+ident;
        title.appendChild(s);
      }
      card.appendChild(title);

      /* ROWS */
      if(!rows.length){
        const e=document.createElement("div");
        e.className="lfg-empty";
        e.textContent="Tidak ada data copy";
        card.appendChild(e);
      }else{
        rows.forEach(r=>{
          const row=document.createElement("div");
          row.className="lfg-row";
          row.innerHTML =
            `<span class="lfg-key">${r.label}</span>
             <span class="lfg-value">${r.value}</span>`;

          if(copiedRows[note.id].has(r.label))
            row.classList.add("copied");

          row.onclick = () => {
  navigator.clipboard.writeText(r.value);

  // FLASH + COPIED
  row.classList.add("flash","copied");
  setTimeout(()=>row.classList.remove("flash"),350);

  copiedRows[note.id].add(r.label);

  // NEXT ROW HINT
  card.querySelectorAll(".lfg-row.next")
    .forEach(el=>el.classList.remove("next"));

  const next = row.nextElementSibling;
  if(next && next.classList.contains("lfg-row"))
    next.classList.add("next");

  // CARD DONE — LANGSUNG DI COPY PERTAMA
  if (!card.classList.contains("done")) {
    card.classList.add("done");
  }
};

          card.appendChild(row);
        });
      }

      /* NOTE */
      if(noteText){
        const n=document.createElement("div");
        n.className="lfg-note";
        n.textContent=noteText;
        card.appendChild(n);
      }

      listEl.appendChild(card);
    });
  }

  /* ===============================
     EVENTS (LOCKED + ADD)
     =============================== */
  searchEl.addEventListener("input", e=>{
    activeTag = e.target.value.trim().toLowerCase() || "fcfs";
    render();
  });

  // HOLD HEADER → BACK (ADD ONLY)
  if (titleEl) {
    let holdTimer = null;

    const startHold = () => {
  holdTimer = setTimeout(() => {
    loadPage("home");
  }, 600);
};
    const endHold = () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    };

    titleEl.addEventListener("touchstart", startHold);
    titleEl.addEventListener("touchend", endHold);
    titleEl.addEventListener("mousedown", startHold);
    titleEl.addEventListener("mouseup", endHold);
    titleEl.addEventListener("mouseleave", endHold);
  }

  render();
})();