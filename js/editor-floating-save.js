window.initEditorFloatingSave = function () {
  const legacySave = document.getElementById("saveBtn");
  const floatingSave = document.getElementById("editor-save-btn");
  if (!legacySave || !floatingSave) return;

  const fields = [
    "titleInput",
    "linkInput",
    "tagsInput",
    "contentInput"
  ].map(id => document.getElementById(id)).filter(Boolean);

  let dirty = false;

  fields.forEach(el => {
    const markDirty = () => {
      dirty = true;
      floatingSave.hidden = false;
      floatingSave.classList.add("is-visible");
    };
    el.addEventListener("input", markDirty);
    el.addEventListener("compositionend", markDirty);
  });

  floatingSave.addEventListener("click", () => {
    if (!dirty) return;
    legacySave.click();
    dirty = false;
    floatingSave.classList.remove("is-visible");
    setTimeout(() => floatingSave.hidden = true, 180);
  });
};