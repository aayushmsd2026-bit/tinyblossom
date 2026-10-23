/* Shop logic. Settings and products live in products.js. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = (n) => `${SHOP.currency}${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get() { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } },
    set(v) { try { localStorage.setItem("cart", JSON.stringify(v)); } catch {} },
  };

  let cart = store.get().filter((i) => byId[i.id]);
  let filter = "All";
  let query = "";
  let sort = "featured";

  /* ---------- Shop info ---------- */
  $$(".shop-name").forEach((el) => (el.textContent = SHOP.name));
  $(".tagline").textContent = SHOP.tagline;
  $("#year").textContent = new Date().getFullYear();
  $("#footerLoc").textContent = SHOP.location;
  if (SHOP.freeDeliveryOver > 0) $("#announce").textContent = `Free US shipping on orders over ${money(SHOP.freeDeliveryOver)} 🎉`;
  if (!SHOP.whatsapp) $("#sendWhatsapp").remove();
  if (!SHOP.sms) $("#sendSms").remove();
  if (!SHOP.email) $("#sendEmail").remove();

  const links = [];
  if (SHOP.whatsapp) links.push(`<a class="btn btn-whatsapp" href="https://wa.me/${SHOP.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (SHOP.sms) links.push(`<a class="btn btn-ghost" href="sms:${SHOP.sms}">Text us</a>`);
  if (SHOP.email) links.push(`<a class="btn btn-ghost" href="mailto:${SHOP.email}">Email</a>`);
  if (SHOP.instagram) links.push(`<a class="btn btn-ghost" href="${SHOP.instagram}" target="_blank" rel="noopener">Instagram</a>`);
  if (SHOP.facebook) links.push(`<a class="btn btn-ghost" href="${SHOP.facebook}" target="_blank" rel="noopener">Facebook</a>`);
  $("#contactLinks").innerHTML = links.join("");

  $("#payOptions").innerHTML = (SHOP.paymentOptions || []).map((o, i) =>
    `<label class="radio"><input type="radio" name="payment" value="${esc(o)}"${i === 0 ? " checked" : ""} /> ${esc(o)}</label>`).join("");
  $("#payOptions").closest("fieldset").hidden = !(SHOP.paymentOptions || []).length;

  /* ---------- Products ---------- */
  const media = (p) => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />` : `<span aria-hidden="true">${p.emoji}</span>`;

  $("#chips").innerHTML = ["All", ...CATEGORIES]
    .map((c) => `<button class="chip" role="tab" aria-selected="${c === "All"}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");

  function renderGrid() {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => (filter === "All" || p.category === filter) &&
      (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

    $("#grid").innerHTML = list.map((p) => `
      <article class="card">
        <button class="card-media" style="background:${p.color}" data-open="${p.id}" aria-label="View ${esc(p.name)}">
          ${media(p)}
          ${!p.inStock ? `<span class="badge out">Sold out</span>` : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        </button>
        <div class="card-body">
          <span class="card-cat">${esc(p.category)}</span>
          <button class="card-title" data-open="${p.id}">${esc(p.name)}</button>
          <div class="price">${money(p.price)}${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}</div>
          <div class="card-foot">
            ${!p.inStock ? `<button class="btn btn-ghost" disabled>Sold out</button>`
              : p.sizes ? `<button class="btn btn-ghost" data-open="${p.id}">Choose size</button>`
              : `<button class="btn btn-primary" data-add="${p.id}">Add to cart</button>`}
          </div>
        </div>
      </article>`).join("");
    $("#empty").hidden = list.length > 0;
  }

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    filter = b.dataset.cat;
    $$(".chip").forEach((c) => c.setAttribute("aria-selected", c === b));
    renderGrid();
  });
  $("#search").addEventListener("input", (e) => { query = e.target.value; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { sort = e.target.value; renderGrid(); });
  $("#grid").addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add, null, 1);
    else if (open) openProduct(open.dataset.open);
  });

  /* ---------- Product modal ---------- */
  const modal = $("#productModal");
  function openProduct(id) {
    const p = byId[id];
    let size = p.sizes ? null : "";
    let qty = 1;
    $("#pmBody").innerHTML = `
      <div class="pm-media" style="background:${p.color}">${media(p)}</div>
      <div class="pm-info">
        <span class="card-cat">${esc(p.category)}</span>
        <h3 id="pmTitle">${esc(p.name)}</h3>
        <div class="price">${money(p.price)}${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}</div>
        <p>${esc(p.description)}</p>
        ${p.sizes ? `<span class="opt-label">Size</span><div class="sizes">${p.sizes.map((s) => `<button class="size" aria-pressed="false" data-size="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
        ${p.inStock ? `
          <div class="pm-actions">
            <div class="qty" aria-label="Quantity"><button data-q="-1" aria-label="Decrease">−</button><span id="pmQty">1</span><button data-q="1" aria-label="Increase">+</button></div>
            <button class="btn btn-primary" id="pmAdd">${p.sizes ? "Select a size" : "Add to cart"}</button>
          </div>` : `<button class="btn btn-ghost" disabled>Sold out — message us to reserve</button>`}
      </div>`;
    const addBtn = $("#pmAdd");
    if (addBtn && p.sizes) addBtn.disabled = true;

    $("#pmBody").onclick = (e) => {
      const s = e.target.closest("[data-size]");
      const q = e.target.closest("[data-q]");
      if (s) {
        size = s.dataset.size;
        $$(".size", modal).forEach((b) => b.setAttribute("aria-pressed", b === s));
        addBtn.disabled = false;
        addBtn.textContent = "Add to cart";
      }
      if (q) {
        qty = Math.max(1, Math.min(20, qty + Number(q.dataset.q)));
        $("#pmQty").textContent = qty;
      }
      if (e.target === addBtn && size !== null) {
        addToCart(p.id, size, qty);
        modal.close();
      }
    };
    modal.showModal();
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) modal.close();
  });

  /* ---------- Cart ---------- */
  const key = (i) => `${i.id}|${i.size || ""}`;

  function addToCart(id, size, qty) {
    const existing = cart.find((i) => key(i) === `${id}|${size || ""}`);
    if (existing) existing.qty = Math.min(20, existing.qty + qty);
    else cart.push({ id, size: size || "", qty });
    saveCart();
    toast(`Added ${byId[id].name} 🌸`);
    const btn = $("#cartBtn");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  }

  function totals() {
    const subtotal = Math.round(cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0) * 100) / 100;
    const free = SHOP.freeDeliveryOver > 0 && subtotal >= SHOP.freeDeliveryOver;
    const delivery = subtotal === 0 || free ? 0 : SHOP.deliveryFee;
    return { subtotal, delivery, total: Math.round((subtotal + delivery) * 100) / 100, free };
  }

  function saveCart() { store.set(cart); renderCart(); }

  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartBtn").setAttribute("aria-label", `Open cart, ${count} items`);
    $("#cartItems").innerHTML = cart.map((i) => {
      const p = byId[i.id];
      return `
        <div class="cart-item" data-key="${esc(key(i))}">
          <div class="ci-thumb" style="background:${p.color}">${media(p)}</div>
          <div>
            <div class="ci-name">${esc(p.name)}</div>
            <div class="ci-meta">${i.size ? `Size ${esc(i.size)} · ` : ""}${money(p.price)}</div>
          </div>
          <div class="ci-right">
            <div class="qty"><button data-d="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-d="1" aria-label="Increase">+</button></div>
            <button class="ci-remove" data-remove>Remove</button>
          </div>
        </div>`;
    }).join("");
    const empty = cart.length === 0;
    $("#cartEmpty").hidden = !empty;
    $("#drawerFoot").hidden = empty && view !== "done";
    const t = totals();
    $("#subtotal").textContent = money(t.subtotal);
    $("#delivery").textContent = t.delivery === 0 && t.subtotal > 0 ? "Free" : money(t.delivery);
    $("#total").textContent = money(t.total);
    const remaining = SHOP.freeDeliveryOver - t.subtotal;
    $("#freeNote").textContent = SHOP.freeDeliveryOver > 0 && !empty
      ? (t.free ? "You've got free shipping! 🎉" : `Add ${money(remaining)} more for free shipping`)
      : "";
  }

  $("#cartItems").addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const item = cart.find((i) => key(i) === row.dataset.key);
    const d = e.target.closest("[data-d]");
    if (d) item.qty = Math.max(1, Math.min(20, item.qty + Number(d.dataset.d)));
    if (e.target.closest("[data-remove]")) cart = cart.filter((i) => i !== item);
    saveCart();
  });

  /* ---------- Drawer & views ---------- */
  const drawer = $("#drawer");
  const overlay = $("#overlay");
  let view = "cart";
  let lastFocus = null;

  function setView(v) {
    view = v;
    $("#cartView").hidden = v !== "cart";
    $("#checkoutView").hidden = v !== "checkout";
    $("#doneView").hidden = v !== "done";
    $("#drawerTitle").textContent = v === "checkout" ? "Shipping details" : v === "done" ? "Order sent" : "Your cart";
    $("#checkoutBtn").hidden = v !== "cart";
    $("#sendBtns").hidden = v !== "checkout";
    $(".totals").hidden = v === "done";
    renderCart();
    if (v === "done") $("#drawerFoot").hidden = true;
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    setView("cart");
    overlay.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    $("#closeDrawer").focus();
  }
  function closeDrawer() {
    overlay.hidden = true;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    lastFocus?.focus();
  }

  $("#cartBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
  $("#keepShopping").addEventListener("click", () => { closeDrawer(); $("#shop").scrollIntoView(); });
  $("#checkoutBtn").addEventListener("click", () => { setView("checkout"); $("#checkoutView [name=name]").focus(); });
  $("#backToCart").addEventListener("click", () => setView("cart"));
  $("#doneBtn").addEventListener("click", closeDrawer);

  /* ---------- Checkout ---------- */
  const form = $("#checkoutView");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const via = e.submitter?.dataset.via || (SHOP.whatsapp ? "whatsapp" : SHOP.sms ? "sms" : "email");
    const data = Object.fromEntries(new FormData(form));
    let ok = true;
    ["name", "phone", "address"].forEach((n) => {
      const el = form.elements[n];
      const bad = !el.value.trim();
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { $("#formError").textContent = "Please fill in your name, phone and address."; return; }
    $("#formError").textContent = "";

    const t = totals();
    const lines = cart.map((i) => {
      const p = byId[i.id];
      return `• ${p.name}${i.size ? ` (${i.size})` : ""} × ${i.qty} = ${money(p.price * i.qty)}`;
    });
    const msg = [
      `Hello ${SHOP.name}! I'd like to order:`,
      "",
      ...lines,
      "",
      `Subtotal: ${money(t.subtotal)}`,
      `Shipping: ${t.delivery ? money(t.delivery) : "Free"}`,
      `Total: ${money(t.total)}`,
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Address: ${data.address}`,
      data.payment ? `Payment: ${data.payment}` : "",
      data.note ? `Note: ${data.note}` : "",
    ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();

    const url = via === "whatsapp" ? `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`
      : via === "sms" ? `sms:${SHOP.sms}?&body=${encodeURIComponent(msg)}`
      : `mailto:${SHOP.email}?subject=${encodeURIComponent(`New order from ${data.name}`)}&body=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");

    cart = [];
    store.set(cart);
    form.reset();
    setView("done");
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  renderGrid();
  renderCart();
})();
