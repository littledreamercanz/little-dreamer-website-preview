const products = Array.from(document.querySelectorAll("[data-category]"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const addButtons = Array.from(document.querySelectorAll("[data-add]"));
const cart = document.querySelector("[data-cart]");
const cartItems = document.querySelector("[data-cart-items]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const openCartButton = document.querySelector("[data-open-cart]");
const closeCartButton = document.querySelector("[data-close-cart]");
const rxForm = document.querySelector("[data-rx-form]");
const rxTotal = document.querySelector("[data-rx-total]");
const rxNote = document.querySelector("[data-rx-note]");

let cartState = [];

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    products.forEach((product) => {
      product.classList.toggle("hidden", filter !== "all" && product.dataset.category !== filter);
    });
  });
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartState.push({
      name: button.dataset.add,
      price: Number(button.dataset.price),
    });

    renderCart();
    openCart();
  });
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cart.addEventListener("click", (event) => {
  if (event.target === cart) closeCart();
});

function openCart() {
  cart.classList.add("open");
  cart.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cart.classList.remove("open");
  cart.setAttribute("aria-hidden", "true");
}

function renderCart() {
  const total = cartState.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = String(cartState.length);
  cartTotal.textContent = `NZ$${total}`;

  if (cartState.length === 0) {
    cartItems.innerHTML = "<p>还没有加入商品。</p>";
    return;
  }

  cartItems.innerHTML = cartState
    .map(
      (item) => `
        <div class="cart-item">
          <span>${item.name}</span>
          <strong>NZ$${item.price}</strong>
        </div>
      `,
    )
    .join("");
}

rxForm.addEventListener("input", updateRxEstimate);
updateRxEstimate();
renderCart();

function updateRxEstimate() {
  const data = new FormData(rxForm);
  const base = Number(data.get("lens"));
  const sph = Number(data.get("sph")) || 0;
  const cyl = Number(data.get("cyl")) || 0;
  const pdReady = data.get("pd") === "on";
  const recent = data.get("recent") === "on";

  const complexity = sph > 6 || cyl > 2 ? 65 : sph > 4 || cyl > 1.25 ? 35 : 0;
  const total = base + complexity;
  rxTotal.textContent = `NZ$${total}`;

  if (!pdReady || !recent) {
    rxNote.textContent = "请补充 PD 和处方日期后再进入人工审核。";
    return;
  }

  if (sph > 6 || cyl > 2) {
    rxNote.textContent = "该处方复杂度较高，建议人工审核后再决定是否接单。";
    return;
  }

  rxNote.textContent = "适合进入 MVP 阶段的单光处方人工审核流程。";
}
