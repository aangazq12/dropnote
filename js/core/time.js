/* ===============================
   TIME UTIL (FINAL)
   =============================== */

function timeAgo(timestamp) {
  if (!timestamp) return "";

  const ts = Number(timestamp);
  if (Number.isNaN(ts)) return "";

  const now = Date.now();
  let diff = now - ts;

  // future timestamp guard
  if (diff < 0) diff = 0;

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 30) return "baru saja";
  if (min < 1) return `${sec} detik lalu`;
  if (min < 60) return `${min} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  if (day <= 7) return `${day} hari lalu`;

  return `⚠️ ${day} hari (OVERDUE)`;
}

window.timeAgo = timeAgo;