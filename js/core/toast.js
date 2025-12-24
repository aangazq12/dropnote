/* =========================
   TOAST ENGINE (FINAL v1.1)
   Notification + Single Undo
   ========================= */

(() => {
  let queue = [];
  let isShowing = false;

  // 🔒 SINGLE UNDO STATE
  let activeUndoToast = null;
  let activeUndoTimer = null;

  function ensureRoot() {
    let root = document.getElementById("toastRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      document.body.appendChild(root);
    }
    return root;
  }

  function createToast({ message, duration = 1600, undo = false }) {
    const root = ensureRoot();

    // 🔒 RULE: undo toast TIDAK BOLEH queue
    if (undo) {
      clearUndoToast();
    }

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

      activeUndoToast = toast;
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
    const hide = () => {
      toast.classList.remove("show");

      toast.addEventListener(
        "transitionend",
        () => {
          toast.remove();

          if (undo) {
            clearUndoToast();
          } else {
            isShowing = false;
            processQueue();
          }
        },
        { once: true }
      );
    };

    const timer = setTimeout(hide, duration);

    if (undo) {
      activeUndoTimer = timer;
    }
  }

  function processQueue() {
    if (isShowing) return;
    if (!queue.length) return;

    isShowing = true;
    createToast(queue.shift());
  }

  function clearUndoToast() {
    if (activeUndoToast) {
      activeUndoToast.remove();
      activeUndoToast = null;
    }
    clearTimeout(activeUndoTimer);
    activeUndoTimer = null;
  }

  /* =========================
     GLOBAL API
     ========================= */
  window.showToast = function (message, options = {}) {
    const isUndo = options.undo === true;

    if (isUndo) {
      createToast({
        message,
        duration: options.duration || 2500,
        undo: true
      });
      return;
    }

    queue.push({
      message,
      duration: options.duration || 1600,
      undo: false
    });

    processQueue();
  };
})();

/* ===============================
   TOAST UNDO CLICK (GLOBAL)
   =============================== */
document.addEventListener("click", e => {
  const toast = e.target.closest(".toast[data-undo='true']");
  if (!toast) return;

  if (typeof undoDeleteNote === "function") {
    undoDeleteNote();
    showToast("↩️ Delete undone");
  }
});