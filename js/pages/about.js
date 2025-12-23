(function () {
  const items = document.querySelectorAll(".acc-item");

  items.forEach(item => {
    const header = item.querySelector(".acc-header");
    header.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });
})();