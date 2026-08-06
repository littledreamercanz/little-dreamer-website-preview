const resourceSearch = document.querySelector("#resourceSearch");
const resourceButtons = document.querySelectorAll("#resourceFilters button");
const resourceCards = document.querySelectorAll(".resource-card");
let activeResourceFilter = "all";

function applyResourceFilter() {
  const query = (resourceSearch?.value || "").toLowerCase().trim();
  resourceCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    const text = `${card.textContent} ${tags}`.toLowerCase();
    const filterOk = activeResourceFilter === "all" || tags.includes(activeResourceFilter);
    const queryOk = !query || text.includes(query);
    card.hidden = !(filterOk && queryOk);
  });
}

resourceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeResourceFilter = button.dataset.filter;
    resourceButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    applyResourceFilter();
  });
});

resourceSearch?.addEventListener("input", applyResourceFilter);
