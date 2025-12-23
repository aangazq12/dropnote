/* =========================
   TOAST QUEUE ENGINE (FINAL)
   ========================= */

(() => {
  const queue = [];
  let isShowing = false;

  function createToast({ message, duration = 5000, undo = false }) {
    const root = document.getElementById("toastRoot");
    if (!root) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    let progress;
    let animation;

    if (undo) {
      toast.dataset.undo = "true";
      progress = document.createElement("div");
      progress.className = "toast-progress";
      toast.appendChild(progress);
    }

    root.appendChild(toast);

    // SHOW
    requestAnimationFrame(() => {
      toast.classList.add("show");

      if (progress) {
        animation = progress.animate(
          [
            { transform: "scaleX(1)" },
            { transform: "scaleX(0)" }
          ],
          {
            duration,
            easing: "linear",
            fill: "forwards"
          }
        );
      }
    });

    /* ===============================
       PAUSE / RESUME ON PRESS
       =============================== */
    const pause = () => {
  animation?.pause();
  toast.classList.add("paused");
};

const resume = () => {
  animation?.play();
  toast.classList.remove("paused");
};

    toast.addEventListener("pointerdown", pause);
    toast.addEventListener("pointerup", resume);
    toast.addEventListener("pointercancel", resume);
    toast.addEventListener("pointerleave", resume);

    // HIDE
    setTimeout(() => {
      toast.classList.remove("show");

      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();
          isShowing = false;
          processQueue();
        },
        { once: true }
      );
    }, duration);
  }

  function processQueue() {
    if (isShowing) return;
    if (!queue.length) return;

    isShowing = true;
    createToast(queue.shift());
  }

  /* =========================
     GLOBAL API
     ========================= */
  window.showToast = function (message, options = {}) {
    queue.push({
      message,
      duration: options.duration || 1600,
      undo: options.undo || false
    });
    processQueue();
  };
})();

/* ===============================
   TOAST UNDO CLICK (GLOBAL)
   =============================== */
document.addEventListener("click", e => {
  const toast = e.target.closest(".toast");
  if (!toast) return;

  if (toast.dataset.undo === "true") {
    if (typeof undoDeleteNote === "function") {
      undoDeleteNote();
      showToast("↩️ Delete undone");
      window.dispatchEvent(new Event("notes:updated"));
    }
  }
});