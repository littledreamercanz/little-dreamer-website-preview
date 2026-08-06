const products = [
  { id: "cloud-jacket", name: "Cloud Puff 狗狗轻暖背心", category: "dog", tags: ["狗狗", "衣服", "冬季"], price: 34.9, icon: "🧥", colors: ["Mint", "Coral", "Cream"], sizes: ["XS", "S", "M", "L"], stock: "Auckland 现货 18 件", description: "适合小型犬日常出门和拍照，轻量保暖，不涉及食品或医疗用途。" },
  { id: "city-harness", name: "City Walk 胸背牵引套装", category: "dog travel", tags: ["狗狗", "出行", "安全"], price: 44.9, icon: "🦮", colors: ["Teal", "Sand", "Black"], sizes: ["S", "M", "L"], stock: "Auckland 现货 12 件", description: "可调节胸背和牵引绳组合，适合日常散步。正式采购前需做扣具和缝线拉力测试。" },
  { id: "bubble-carrier", name: "Bubble Go 外出宠物包", category: "cat dog travel", tags: ["猫咪", "狗狗", "出行"], price: 89.0, icon: "🎒", colors: ["Pink", "Oat", "Charcoal"], sizes: ["One size"], stock: "Auckland 现货 5 件", description: "适合短途出行、看兽医和周末外出。体积较大，正式版需单独设置运费门槛。" },
  { id: "soft-slicker", name: "Soft Slicker 去浮毛梳", category: "cat dog grooming", tags: ["猫咪", "狗狗", "梳理"], price: 22.9, icon: "🪮", colors: ["Mint", "Sky"], sizes: ["Small", "Large"], stock: "Auckland 现货 26 件", description: "轻小刚需品，适合加购。针脚边角需要样品测试，避免刮伤宠物皮肤。" },
  { id: "cat-tunnel", name: "Pop Tunnel 猫咪隧道玩具", category: "cat", tags: ["猫咪", "玩具", "室内"], price: 29.9, icon: "🐈", colors: ["Aqua", "Yellow"], sizes: ["90cm", "120cm"], stock: "Auckland 现货 10 件", description: "可折叠收纳，适合室内猫运动和社交内容拍摄。不含羽毛或动物源材料。" },
  { id: "slow-bowl", name: "Wave 慢食碗", category: "cat dog", tags: ["猫狗", "饭碗", "日常"], price: 24.9, icon: "🥣", colors: ["Sage", "Peach", "Blue"], sizes: ["Small", "Medium"], stock: "Auckland 现货 22 件", description: "非食品类用品，主打材质安全和易清洁。正式采购需确认 PP/硅胶材质和异味测试。" },
  { id: "rope-ball", name: "Bounce Rope 互动绳球", category: "dog cat", tags: ["狗狗", "玩具", "加购"], price: 16.9, icon: "🎾", colors: ["Mint", "Pink", "Yellow"], sizes: ["Small", "Medium"], stock: "Auckland 现货 35 件", description: "适合作为满额赠品和加购品。避免小零件，需测试咬合后是否掉屑。" },
  { id: "fish-net", name: "Aqua Net 鱼缸捞鱼网", category: "aquarium", tags: ["水族", "清洁"], price: 9.9, icon: "🫧", colors: ["Black"], sizes: ["S", "M", "L"], stock: "Auckland 现货 30 件", description: "水族非食品周边，轻小易发货。适合和过滤棉、刮藻刀组合销售。" },
  { id: "filter-sponge", name: "CleanFlow 过滤棉套装", category: "aquarium", tags: ["水族", "过滤", "耗材"], price: 18.9, icon: "🧽", colors: ["Blue", "Black"], sizes: ["6 pack", "12 pack"], stock: "Auckland 现货 40 件", description: "鱼缸过滤耗材，不是鱼食或药品。需按尺寸和适配过滤器清楚标注。" },
  { id: "siphon-kit", name: "ClearTank 换水虹吸管", category: "aquarium", tags: ["水族", "清洁"], price: 26.9, icon: "〰️", colors: ["Clear"], sizes: ["1.5m", "2m"], stock: "Auckland 现货 14 件", description: "适合鱼缸换水清洁。正式版应提供使用图示和适用缸体尺寸。" },
  { id: "algae-scraper", name: "Glass Shine 刮藻清洁器", category: "aquarium", tags: ["水族", "清洁"], price: 19.9, icon: "🪟", colors: ["Black"], sizes: ["Short", "Long"], stock: "Auckland 现货 20 件", description: "鱼缸玻璃清洁工具，适合内容演示和套装销售。" },
  { id: "travel-bowl", name: "FoldCup 折叠外出水碗", category: "dog cat travel", tags: ["出行", "猫狗", "轻小"], price: 14.9, icon: "💧", colors: ["Aqua", "Coral", "Lime"], sizes: ["350ml", "500ml"], stock: "Auckland 现货 32 件", description: "轻小、好拍、适合加购。材质需确认食品接触安全，但产品本身不是食品。" }
];

const grid = document.querySelector("[data-product-grid]");
const filters = Array.from(document.querySelectorAll("[data-filter]"));
const searchToggle = document.querySelector("[data-search-toggle]");
const searchPanel = document.querySelector("[data-search-panel]");
const searchInput = document.querySelector("[data-search-input]");
const cart = document.querySelector("[data-cart]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const cartShipping = document.querySelector("[data-cart-shipping]");
const cartTotal = document.querySelector("[data-cart-total]");
const regionSelect = document.querySelector("[data-region]");
const checkoutNote = document.querySelector("[data-checkout-note]");
const dialog = document.querySelector("[data-product-dialog]");

const state = {
  filter: "all",
  search: "",
  selected: null,
  cart: []
};

function money(value) {
  return `NZ$${value.toFixed(2)}`;
}

function matches(product) {
  const filterOk = state.filter === "all" || product.category.includes(state.filter);
  const text = `${product.name} ${product.tags.join(" ")} ${product.description}`.toLowerCase();
  const searchOk = !state.search || text.includes(state.search.toLowerCase());
  return filterOk && searchOk;
}

function renderProducts() {
  grid.innerHTML = products
    .filter(matches)
    .map((product) => `
      <article class="product-card">
        <div class="product-art" aria-hidden="true">${product.icon}</div>
        <div class="product-body">
          <div class="product-tags">${product.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-meta">
            <strong>${money(product.price)}</strong>
            <button type="button" data-view-product="${product.id}">选规格</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  state.selected = product;
  dialog.querySelector("[data-dialog-art]").textContent = product.icon;
  dialog.querySelector("[data-dialog-category]").textContent = product.tags.join(" · ");
  dialog.querySelector("[data-dialog-name]").textContent = product.name;
  dialog.querySelector("[data-dialog-description]").textContent = product.description;
  dialog.querySelector("[data-dialog-stock]").textContent = product.stock;
  dialog.querySelector("[data-dialog-price]").textContent = money(product.price);
  dialog.querySelector("[data-option-color]").innerHTML = product.colors.map((item) => `<option>${item}</option>`).join("");
  dialog.querySelector("[data-option-size]").innerHTML = product.sizes.map((item) => `<option>${item}</option>`).join("");
  dialog.showModal();
}

function addSelected() {
  const product = state.selected;
  if (!product) return;
  const color = dialog.querySelector("[data-option-color]").value;
  const size = dialog.querySelector("[data-option-size]").value;
  state.cart.push({ ...product, color, size });
  dialog.close();
  renderCart();
  openCart();
}

function renderCart() {
  cartCount.textContent = String(state.cart.length);
  if (!state.cart.length) {
    cartItems.innerHTML = "<p>购物车还是空的。</p>";
  } else {
    cartItems.innerHTML = state.cart.map((item) => `
      <div class="cart-item">
        <div><strong>${item.name}</strong><small>${item.color} · ${item.size}</small></div>
        <strong>${money(item.price)}</strong>
      </div>
    `).join("");
  }
  const subtotal = state.cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal === 0 ? 0 : regionSelect.value === "au" ? 18.9 : subtotal >= 59 ? 0 : 6.9;
  cartSubtotal.textContent = money(subtotal);
  cartShipping.textContent = shipping === 0 ? "Free" : money(shipping);
  cartTotal.textContent = money(subtotal + shipping);
}

function openCart() {
  cart.classList.add("open");
  cart.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cart.classList.remove("open");
  cart.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
    document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-jump-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.jumpFilter;
    document.querySelector(`[data-filter="${filter}"]`)?.click();
  });
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view-product]");
  if (button) openProduct(button.dataset.viewProduct);
});

searchToggle.addEventListener("click", () => {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) searchInput.focus();
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderProducts();
});

document.querySelector("[data-open-cart]").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
cart.addEventListener("click", (event) => {
  if (event.target === cart) closeCart();
});
regionSelect.addEventListener("change", renderCart);
document.querySelector("[data-close-dialog]").addEventListener("click", () => dialog.close());
document.querySelector("[data-add-selected]").addEventListener("click", addSelected);
document.querySelector("[data-checkout]").addEventListener("click", () => {
  checkoutNote.textContent = state.cart.length
    ? "模拟订单已生成：正式版会把商品、规格、地址和付款状态同步到 Shopify/仓库后台。"
    : "请先选择商品。";
});

renderProducts();
renderCart();
