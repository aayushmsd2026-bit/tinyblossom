/* Shop logic. Settings live in products.js; products come from the Google Sheet. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = (n) => `${SHOP.currency}${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  let products = [];
  let byId = {};
  let categories = [];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get() { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } },
    set(v) { try { localStorage.setItem("cart", JSON.stringify(v)); } catch {} },
  };

  let cart = store.get();
  let filter = "All";
  let query = "";
  let sort = "featured";

  /* ---------- Shop info ---------- */
  $$(".shop-name").forEach((el) => (el.textContent = SHOP.name));
  $("#year").textContent = new Date().getFullYear();
  $$("[data-return-days]").forEach((el) => (el.textContent = SHOP.returnDays));
  $("#announce").textContent = SHOP.freeShippingOver > 0
    ? `Free US shipping on orders over ${money(SHOP.freeShippingOver)}`
    : "Order by text. Your total is confirmed before you pay.";
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

  /* ---------- Illustrations ----------
     Line drawings shown until a product has a real photo. */
  const ICONS = {
    onesie: '<path d="M25 9c1.5 3.5 4 5 7 5s5.5-1.5 7-5l9 4 6 11-7 4-4-6v24c0 3-2 5-5 6l-2 4h-8l-2-4c-3-1-5-3-5-6V22l-4 6-7-4 6-11z"/><path d="M29 50.5h6"/>',
    cap: '<path d="M13 40c0-12 8.5-21 19-21s19 9 19 21"/><rect x="11" y="40" width="42" height="9" rx="3"/><circle cx="32" cy="14" r="5"/><path d="M22 40v9M32 40v9M42 40v9"/>',
    socks: '<path d="M24 8h14v24l7 7c3.5 3.5 3.5 9 0 12.5s-9 3.5-12.5 0L24 43z"/><path d="M24 15h14"/>',
    bottle: '<path d="M28 15c0-4 1.8-7 4-7s4 3 4 7"/><rect x="24" y="15" width="16" height="6" rx="1.5"/><path d="M25 21h14v31a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z"/><path d="M25 31h5M25 38h5M25 45h5"/>',
    bib: '<path d="M16 12h6c0 5.5 4.5 10 10 10s10-4.5 10-10h6c0 5-2 8-4 10v18c0 8-5.5 14-12 14s-12-6-12-14V22c-2-2-4-5-4-10z"/><path d="M26 43c3.5 3 8.5 3 12 0"/>',
    spoon: '<ellipse cx="32" cy="19" rx="8" ry="11"/><path d="M32 30v25"/>',
    towel: '<path d="M16 14h32"/><path d="M21 14v36a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V14"/><path d="M21 40h22M21 45h22"/>',
    duck: '<circle cx="27" cy="21" r="9"/><path d="M18.5 22.5 11 24l6.5 3.5"/><path d="M28.5 19h.01" stroke-width="2.6"/><path d="M21 29.5C15 31 11 35 11 40c0 8.5 9 14 21 14s21-5.5 21-14c0-6-3-10-7-11.5-3 4-8 5.5-13 4.5"/><path d="M31 41c4 3 10 3 14-1"/>',
    lotion: '<rect x="21" y="28" width="22" height="28" rx="3"/><path d="M28 28v-6h8v6M32 22v-8h9"/><path d="M27 38h10M27 44h7"/>',
    moon: '<path d="M40 12a19 19 0 1 0 12 31A16 16 0 0 1 40 12z"/><path d="M47 15v5M44.5 17.5h5"/>',
    sleepbag: '<path d="M22 10h20a6 6 0 0 1 6 6v32c0 5-7 8-16 8s-16-3-16-8V16a6 6 0 0 1 6-6z"/><path d="M26 10c0 4 2.5 6 6 6s6-2 6-6"/><path d="M38 23v25"/>',
    bear: '<circle cx="21" cy="14" r="5"/><circle cx="43" cy="14" r="5"/><circle cx="32" cy="24" r="12"/><ellipse cx="32" cy="28.5" rx="4.5" ry="3.5"/><path d="M27.5 21.5h.01M36.5 21.5h.01" stroke-width="2.6"/><path d="M22 36c-5 3-8 8-8 13 0 5 6 7 18 7s18-2 18-7c0-5-3-10-8-13"/>',
    rattle: '<circle cx="32" cy="21" r="12"/><path d="M32 33v14"/><circle cx="32" cy="51" r="4"/><path d="M25 17c1.5-2.5 4-4 7-4"/>',
    blossom: '<circle cx="32" cy="18" r="8"/><circle cx="45.3" cy="27.7" r="8"/><circle cx="40.2" cy="43.3" r="8"/><circle cx="23.8" cy="43.3" r="8"/><circle cx="18.7" cy="27.7" r="8"/><circle cx="32" cy="32" r="3"/>',
  };
  const NAME_ICONS = [
    [/onesie|bodysuit|romper|outfit|sleepsuit/, "onesie"], [/cap|hat|beanie|bonnet/, "cap"], [/sock|bootie|shoe/, "socks"],
    [/bottle|sippy|cup/, "bottle"], [/\bbibs?\b/, "bib"], [/spoon|fork|bowl|plate/, "spoon"], [/towel|washcloth|robe/, "towel"],
    [/lotion|cream|oil|shampoo|wash|balm|soap/, "lotion"], [/sleeping bag|sleep sack|sleepsack/, "sleepbag"],
    [/swaddle|blanket|muslin|sheet/, "moon"], [/teddy|bear|plush|stuffed/, "bear"], [/rattle|teether|toy/, "rattle"],
  ];
  const CAT_ICONS = [[/cloth|wear|outfit/, "onesie"], [/feed/, "bottle"], [/bath|care/, "duck"], [/sleep/, "moon"], [/toy|play/, "bear"]];
  const TINTS = ["blush", "sage", "mist", "stone"];

  const catIcon = (c) => (CAT_ICONS.find(([re]) => re.test(c.toLowerCase())) || [, "blossom"])[1];
  const iconFor = (p) => (NAME_ICONS.find(([re]) => re.test(p.name.toLowerCase())) || [, catIcon(p.category)])[1];
  const tintOf = (c) => `tint-${TINTS[Math.max(0, categories.indexOf(c)) % TINTS.length]}`;
  const svg = (name) => `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[name]}</svg>`;
  const media = (p) => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />` : svg(iconFor(p));
  const priceHtml = (p) => `<div class="price${p.oldPrice ? " on-sale" : ""}"><span class="now">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}</div>`;

  $("#heroArt").innerHTML = [["onesie", "blush"], ["bottle", "sage"], ["bear", "mist"]]
    .map(([icon, tint]) => `<div class="tile tint-${tint}">${svg(icon)}</div>`).join("");

  const header = $(".header");
  addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 8), { passive: true });

  /* ---------- Products ---------- */

  function renderChips() {
    $("#chips").innerHTML = ["All", ...categories]
      .map((c) => `<button class="seg" role="tab" aria-selected="${c === filter}" data-cat="${esc(c)}">${esc(c)}</button>`)
      .join("");
    $("#catRow").innerHTML = categories.map((c) => {
      const n = products.filter((p) => p.category === c).length;
      return `<button class="cat" data-cat="${esc(c)}"><div class="tile ${tintOf(c)}">${svg(catIcon(c))}</div><span class="cat-name">${esc(c)}</span><span class="cat-count">${n} item${n === 1 ? "" : "s"}</span></button>`;
    }).join("");
  }

  function setFilter(c) {
    filter = c;
    $$(".seg").forEach((b) => b.setAttribute("aria-selected", b.dataset.cat === c));
    renderGrid();
  }
  $("#catRow").addEventListener("click", (e) => {
    const b = e.target.closest(".cat");
    if (!b) return;
    setFilter(b.dataset.cat);
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });

  const isLow = (p) => p.inStock && p.stock != null && p.stock <= lowStockAt;
  function tagHtml(p) {
    if (p.comingSoon) return `<span class="tag soon">Coming soon</span>`;
    if (!p.inStock) return `<span class="tag out">Sold out</span>`;
    if (isLow(p)) return `<span class="tag low">Only ${p.stock} left</span>`;
    if (p.oldPrice) return `<span class="tag sale">${esc(p.badge || "Sale")}</span>`;
    return p.badge ? `<span class="tag">${esc(p.badge)}</span>` : "";
  }
  const maxQty = (p) => Math.min(20, p.stock ?? 20);
  const inBag = (id) => cart.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0);

  function renderGrid() {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => (filter === "All" || p.category === filter) &&
      (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));
    if (sort === "featured") list = [...list].sort((a, b) =>
      (b.featured - a.featured) || (a.comingSoon - b.comingSoon) || (b.inStock - a.inStock) ||
      ((a.order ?? Infinity) - (b.order ?? Infinity)) || (a.row - b.row));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);

    const plus = '<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 2.5v11M2.5 8h11"/></svg>';
    $("#grid").innerHTML = list.map((p) => `
      <article class="card${p.inStock ? "" : p.comingSoon ? " coming-soon" : " sold-out"}">
        <div class="card-media tile ${tintOf(p.category)}">
          <button class="art" data-open="${p.id}" aria-label="View ${esc(p.name)}">${media(p)}</button>
          ${tagHtml(p)}
          ${p.inStock ? `<button class="quick-add" ${p.sizes ? `data-open="${p.id}"` : `data-add="${p.id}"`} aria-label="${p.sizes ? "Choose size for" : "Add to bag:"} ${esc(p.name)}">${plus}</button>` : ""}
        </div>
        <div class="card-info">
          <button class="card-title" data-open="${p.id}">${esc(p.name)}</button>
          <div class="card-meta">${esc(p.age || (p.sizes ? `${p.sizes.length} sizes` : p.category))}</div>
          ${priceHtml(p)}
        </div>
      </article>`).join("");
    $("#empty").hidden = list.length > 0;
  }

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".seg");
    if (b) setFilter(b.dataset.cat);
  });
  $("#search").addEventListener("input", (e) => { query = e.target.value; renderGrid(); });
  $("#sort").addEventListener("change", (e) => { sort = e.target.value; renderGrid(); });
  $("#grid").addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add, null, 1);
      add.classList.add("added");
      setTimeout(() => add.classList.remove("added"), 900);
    }
    else if (open) openProduct(open.dataset.open);
  });

  /* ---------- Product modal ---------- */
  const modal = $("#productModal");
  function openProduct(id) {
    const p = byId[id];
    let size = p.sizes ? null : "";
    let qty = 1;
    $("#pmBody").innerHTML = `
      <div class="pm-gallery">
        <div class="pm-media tile ${tintOf(p.category)}" id="pmMain">${media(p)}</div>
        ${p.photos.length > 1 ? `<div class="pm-thumbs">${p.photos.map((src, n) => `<button class="pm-thumb" data-photo="${n}" aria-pressed="${n === 0}" aria-label="Photo ${n + 1}"><img src="${esc(src)}" alt="" loading="lazy" /></button>`).join("")}</div>` : ""}
      </div>
      <div class="pm-info">
        <span class="pm-cat">${esc(p.category)}${p.badge ? ` · ${esc(p.badge)}` : ""}${p.age ? ` · ${esc(p.age)}` : ""}</span>
        <h3 id="pmTitle">${esc(p.name)}</h3>
        ${priceHtml(p)}
        <span class="price-note">Plus shipping and tax, confirmed with you before you pay.</span>
        ${isLow(p) ? `<span class="low-note">Only ${p.stock} left</span>` : ""}
        ${p.description ? `<p class="pm-desc">${esc(p.description)}</p>` : ""}
        ${p.material || p.care || p.age ? `<dl class="pm-details">
          ${p.age ? `<div><dt>Age</dt><dd>${esc(p.age)}</dd></div>` : ""}
          ${p.material ? `<div><dt>Material</dt><dd>${esc(p.material)}</dd></div>` : ""}
          ${p.care ? `<div><dt>Care</dt><dd>${esc(p.care)}</dd></div>` : ""}
        </dl>` : ""}
        ${p.sizes ? `<span class="opt-label">Size</span><div class="sizes">${p.sizes.map((s) => `<button class="size" aria-pressed="false" data-size="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
        ${p.inStock ? `
          <div class="pm-actions">
            <div class="qty" aria-label="Quantity"><button data-q="-1" aria-label="Decrease">−</button><span id="pmQty">1</span><button data-q="1" aria-label="Increase">+</button></div>
            <button class="btn btn-primary" id="pmAdd">${p.sizes ? "Select a size" : "Add to Bag"}</button>
          </div>` : `<p class="sold-note">${p.comingSoon ? "Coming soon. Text us and we'll let you know the moment it arrives." : "This one is sold out for now. Text us and we'll let you know when it's back."}</p>`}
      </div>`;
    const addBtn = $("#pmAdd");
    if (addBtn && p.sizes) addBtn.disabled = true;

    $("#pmBody").onclick = (e) => {
      const s = e.target.closest("[data-size]");
      const q = e.target.closest("[data-q]");
      const ph = e.target.closest("[data-photo]");
      if (ph) {
        $("#pmMain").innerHTML = `<img src="${esc(p.photos[ph.dataset.photo])}" alt="${esc(p.name)}" />`;
        $$(".pm-thumb", modal).forEach((b) => b.setAttribute("aria-pressed", b === ph));
      }
      if (s) {
        size = s.dataset.size;
        $$(".size", modal).forEach((b) => b.setAttribute("aria-pressed", b === s));
        addBtn.disabled = false;
        addBtn.textContent = "Add to Bag";
      }
      if (q) {
        qty = Math.max(1, Math.min(Math.max(1, maxQty(p) - inBag(p.id)), qty + Number(q.dataset.q)));
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
    const p = byId[id];
    const room = maxQty(p) - inBag(id);
    if (room <= 0) { toast(p.stock != null ? `Only ${p.stock} available` : "That's the most per order"); return; }
    qty = Math.min(qty, room);
    const existing = cart.find((i) => key(i) === `${id}|${size || ""}`);
    if (existing) existing.qty += qty;
    else cart.push({ id, size: size || "", qty });
    saveCart();
    toast(`Added to your bag`);
    const btn = $("#cartBtn");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  }

  function totals() {
    const subtotal = Math.round(cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0) * 100) / 100;
    const free = SHOP.freeShippingOver > 0 && subtotal >= SHOP.freeShippingOver;
    return { subtotal, free };
  }

  function saveCart() { store.set(cart); renderCart(); }

  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartCount").hidden = count === 0;
    $("#cartBtn").setAttribute("aria-label", `Open bag, ${count} items`);
    $("#cartItems").innerHTML = cart.map((i) => {
      const p = byId[i.id];
      return `
        <div class="cart-item" data-key="${esc(key(i))}">
          <div class="ci-thumb tile ${tintOf(p.category)}">${media(p)}</div>
          <div>
            <div class="ci-top">
              <div class="ci-name">${esc(p.name)}</div>
              <div class="ci-price">${money(p.price * i.qty)}</div>
            </div>
            <div class="ci-meta">${i.size ? `Size ${esc(i.size)}` : esc(p.category)}${i.qty > 1 ? ` · ${money(p.price)} each` : ""}</div>
            <div class="ci-bottom">
              <div class="qty"><button data-d="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-d="1" aria-label="Increase">+</button></div>
              <button class="ci-remove" data-remove>Remove</button>
            </div>
          </div>
        </div>`;
    }).join("");
    const empty = cart.length === 0;
    $("#cartEmpty").hidden = !empty;
    $("#drawerFoot").hidden = empty && view !== "done";
    const t = totals();
    $("#delivery").textContent = t.free ? "Free shipping · tax by text" : "Confirmed by text";
    $("#checkoutBtn").disabled = !!vacation;
    $("#checkoutBtn").textContent = vacation ? "Ordering is paused" : "Check out";
    $("#vacationNote").textContent = vacation || "";
    $("#total").textContent = money(t.subtotal);
    const remaining = SHOP.freeShippingOver - t.subtotal;
    $("#freeNote").textContent = SHOP.freeShippingOver > 0 && !empty
      ? (t.free ? "Your order ships free." : `Add ${money(remaining)} more for free shipping`)
      : "";
  }

  $("#cartItems").addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const item = cart.find((i) => key(i) === row.dataset.key);
    const d = e.target.closest("[data-d]");
    if (d) {
      const p = byId[item.id];
      const room = maxQty(p) - inBag(item.id) + item.qty;
      if (Number(d.dataset.d) > 0 && item.qty >= room) toast(p.stock != null ? `Only ${p.stock} available` : "That's the most per order");
      item.qty = Math.max(1, Math.min(room, item.qty + Number(d.dataset.d)));
    }
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
    $("#drawerTitle").textContent = v === "checkout" ? "Checkout" : v === "done" ? "" : "Your bag";
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
    const agree = form.elements.agree;
    agree.closest("label").classList.toggle("invalid", !agree.checked);
    if (!agree.checked) { $("#formError").textContent = "Please tick the box to agree to the Terms of Sale."; return; }
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
      `Items total: ${money(t.subtotal)}`,
      t.free ? "Shipping: Free (sales tax, if any, to be confirmed)" : "Shipping & tax: please send me my final total to approve",
      "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Address: ${data.address}`,
      data.payment ? `Payment: ${data.payment}` : "",
      data.note ? `Note: ${data.note}` : "",
      "",
      "I agree to the Terms of Sale.",
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

  /* ---------- Load products from the Google Sheet ---------- */
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') quoted = false;
        else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // Turns a Google Drive share link into a direct image link; other links pass through.
  function photoUrl(link) {
    const m = link.match(/drive\.google\.com\/.*(?:\/d\/|[?&]id=)([\w-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : link;
  }

  const num = (v) => parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  const yes = (v) => /^(yes|y|true|1|✓|x)$/i.test(String(v).trim());

  // Sale ends at the end of the given day, local time.
  function saleActive(ends) {
    if (!ends) return true;
    const d = new Date(ends);
    if (isNaN(d)) return true;
    d.setHours(23, 59, 59, 999);
    return Date.now() <= d.getTime();
  }

  function productsFromSheet(rows) {
    const head = rows.shift().map((h) => h.trim().toLowerCase());
    const col = (...names) => head.findIndex((h) => names.some((n) => h.startsWith(n)));
    const c = {
      name: col("product name", "name"), category: col("category"), price: col("price"),
      sale: col("sale price"), saleEnds: col("sale ends"), oldPrice: col("was price", "old price"),
      status: col("status", "in stock"), stock: col("stock left", "stock"), featured: col("featured"),
      badge: col("label", "badge"), sizes: col("sizes"), age: col("age"), description: col("description"),
      material: col("material"), care: col("care"), order: col("sort"),
    };
    const photoCols = head.map((h, i) => (h.startsWith("photo") || h.startsWith("image") ? i : -1)).filter((i) => i >= 0);
    const get = (r, k) => (c[k] >= 0 ? (r[c[k]] || "").trim() : "");
    const used = new Set();
    return rows
      .map((r, row) => ({ r, row }))
      .filter(({ r }) => get(r, "name") && num(get(r, "price")) > 0 && !/^hid/i.test(get(r, "status")))
      .map(({ r, row }) => {
        let id = get(r, "name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${row}`;
        while (used.has(id)) id += "-2";
        used.add(id);

        const regular = num(get(r, "price"));
        const sale = num(get(r, "sale"));
        const onSale = sale > 0 && sale < regular && saleActive(get(r, "saleEnds"));
        const was = num(get(r, "oldPrice"));
        const status = get(r, "status").toLowerCase();
        const stockRaw = get(r, "stock");
        const stock = stockRaw === "" || isNaN(num(stockRaw)) ? null : Math.max(0, Math.floor(num(stockRaw)));
        const comingSoon = status.startsWith("coming");
        const soldOut = /^(sold|no|n|false|out)/.test(status) || stock === 0;
        const sizes = get(r, "sizes").split(",").map((x) => x.trim()).filter(Boolean);
        const photos = photoCols.map((i) => (r[i] || "").trim()).filter(Boolean).map(photoUrl);
        const order = num(get(r, "order"));

        return {
          id,
          row,
          name: get(r, "name"),
          category: get(r, "category") || "Other",
          price: onSale ? sale : regular,
          oldPrice: onSale ? regular : was > regular ? was : null,
          inStock: !soldOut && !comingSoon,
          comingSoon,
          stock,
          featured: yes(get(r, "featured")),
          order: isNaN(order) ? null : order,
          badge: get(r, "badge"),
          sizes: sizes.length ? sizes : null,
          age: get(r, "age"),
          description: get(r, "description"),
          material: get(r, "material"),
          care: get(r, "care"),
          photos,
          image: photos[0] || "",
        };
      });
  }

  async function fetchTab(id, tab) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}&_=${Date.now()}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`${tab}: ${res.status}`);
      return parseCSV(await res.text());
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadShop() {
    const m = (SHOP.productsSheet || "").match(/\/d\/([\w-]+)/);
    if (m) {
      const [prod, cats, sets] = await Promise.allSettled(["Products", "Categories", "Settings"].map((t) => fetchTab(m[1], t)));
      try {
        if (prod.status !== "fulfilled") throw prod.reason;
        const list = productsFromSheet(prod.value);
        if (list.length) {
          const catOrder = cats.status === "fulfilled" ? cats.value.slice(1).map((r) => (r[0] || "").trim()).filter(Boolean) : [];
          const settings = {};
          if (sets.status === "fulfilled") sets.value.slice(1).forEach((r) => { if (r[0]) settings[r[0].trim().toLowerCase()] = (r[1] || "").trim(); });
          return { list, catOrder, settings };
        }
      } catch (err) {
        console.warn("Could not load the products sheet, using products.js instead.", err);
      }
    }
    return { list: PRODUCTS.map((p, row) => ({ ...p, row, photos: p.image ? [p.image] : [] })), catOrder: CATEGORIES, settings: {} };
  }

  /* ---------- Settings from the sheet ---------- */
  let vacation = null;
  let lowStockAt = 3;

  function applySettings(st) {
    const has = (k) => Object.prototype.hasOwnProperty.call(st, k);
    if (has("free shipping over ($)")) SHOP.freeShippingOver = num(st["free shipping over ($)"]) || 0;
    if (has("low stock warning at") && !isNaN(num(st["low stock warning at"]))) lowStockAt = num(st["low stock warning at"]);
    if (st["homepage headline"]) $(".hero h1").textContent = st["homepage headline"];
    if (st["homepage text"]) $(".hero .lead").textContent = st["homepage text"];
    if (yes(st["vacation mode"])) vacation = st["vacation message"] || "Ordering is paused for a little while. Please check back soon.";

    const bar = $("#announce");
    if (vacation) {
      bar.textContent = vacation;
      bar.classList.add("vacation");
    } else if (has("announcement bar")) {
      bar.textContent = st["announcement bar"];
    }
    if (SHOP.freeShippingOver > 0 && !vacation && !st["announcement bar"]) bar.textContent = `Free US shipping on orders over ${money(SHOP.freeShippingOver)}`;
  }

  loadShop().then(({ list, catOrder, settings }) => {
    applySettings(settings);
    products = list;
    byId = Object.fromEntries(products.map((p) => [p.id, p]));
    const present = new Set(products.map((p) => p.category));
    categories = [...new Set([...catOrder.filter((c) => present.has(c)), ...products.map((p) => p.category)])];
    cart = cart.filter((i) => byId[i.id] && byId[i.id].inStock).map((i) => ({ ...i, qty: Math.min(i.qty, maxQty(byId[i.id])) }));
    store.set(cart);
    renderChips();
    renderGrid();
    renderCart();
  });
})();
