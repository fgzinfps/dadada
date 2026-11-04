(() => {
  "use strict";
  const S = window.STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (c) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const fmtPuffs = (n) => (n >= 1000 ? `${n / 1000}k` : n) + " puffs";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  const stockOf = (p) => p.flavors.reduce((a, f) => a + f.stock, 0);
  const pixPrice = (c) => Math.round(c * (1 - S.pixDiscount));
  const pctOff = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const perK = (p) => p.price / ((p.puffs * (p.kit || 1)) / 1000);
  const findP = (id) => S.products.find((p) => p.id === id);

  /* ---------- textos vindos da config ---------- */
  $$("[data-store]").forEach((el) => {
    const k = el.dataset.store;
    el.textContent = k === "maxInstallments-x" ? `${S.maxInstallments}x` : S[k];
  });
  $$("[data-money]").forEach((el) => (el.textContent = brl(S[el.dataset.money])));
  $$("[data-pix-pct]").forEach((el) => (el.textContent = `${Math.round(S.pixDiscount * 100)}%`));
  $$("[data-pix-pct-off]").forEach((el) => (el.textContent = `-${Math.round(S.pixDiscount * 100)}%`));
  $("#year").textContent = new Date().getFullYear();
  const waLink = (text = "") => `https://wa.me/${S.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
  $("#footer-wa").href = waLink();
  if (S.instagram) { const ig = $("#footer-ig"); ig.href = `https://instagram.com/${S.instagram}`; ig.hidden = false; }

  /* ---------- verificação de idade ---------- */
  const age = $("#age");
  if (!store.get("age-ok", false)) { age.hidden = false; document.body.classList.add("locked"); $("#age-yes").focus(); }
  $("#age-yes").onclick = () => { store.set("age-ok", true); age.hidden = true; document.body.classList.remove("locked"); };
  $("#age-no").onclick = () => { location.href = "https://www.google.com"; };

  /* ---------- toast ---------- */
  let toastT;
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); };

  /* ---------- arte do pod ---------- */
  const podArt = (p) => `<div class="mini-pod ${p.kit ? "kit-2" : ""}" style="--c1:${p.colors[0]};--c2:${p.colors[1]}" data-puffs="${p.kit ? p.kit + "x " : ""}${p.puffs / 1000}K"></div>`;

  /* ---------- catálogo ---------- */
  const state = { cat: "all", q: "", sort: "featured", inStock: false };
  const chips = $("#chips");
  chips.innerHTML = S.categories.map((c) => `<button class="chip" role="tab" data-cat="${c.id}" aria-selected="${c.id === "all"}">${esc(c.label)}</button>`).join("");
  chips.onclick = (e) => { const b = e.target.closest("[data-cat]"); if (b) setCat(b.dataset.cat); };
  function setCat(id) { state.cat = id; $$(".chip").forEach((c) => c.setAttribute("aria-selected", c.dataset.cat === id)); render(); }
  $$("[data-cat-link]").forEach((a) => a.addEventListener("click", () => setCat(a.dataset.catLink)));

  const inCat = (p) => {
    switch (state.cat) {
      case "lt10k": return !p.kit && p.puffs < 10000;
      case "10k": return !p.kit && p.puffs >= 10000 && p.puffs < 20000;
      case "20k": return !p.kit && p.puffs >= 20000;
      case "kit": return !!p.kit;
      default: return true;
    }
  };
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const matches = (p) => { if (!state.q) return true; const hay = norm([p.name, p.brand, ...p.flavors.map((f) => f.name)].join(" ")); return norm(state.q).split(/\s+/).every((w) => hay.includes(w)); };

  function render() {
    let list = S.products.filter((p) => inCat(p) && matches(p) && (!state.inStock || stockOf(p) > 0));
    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "puffs-desc": (a, b) => b.puffs * (b.kit || 1) - a.puffs * (a.kit || 1),
      ppk: (a, b) => perK(a) - perK(b),
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    // esgotados sempre por último
    list = [...list].sort((a, b) => (stockOf(a) > 0 ? 0 : 1) - (stockOf(b) > 0 ? 0 : 1));

    $("#count").textContent = `${list.length} ${list.length === 1 ? "produto" : "produtos"}`;
    $("#empty").hidden = list.length > 0;
    $("#grid").innerHTML = list.map(card).join("");
  }

  function card(p) {
    const stock = stockOf(p), off = pctOff(p), sold = stock === 0;
    const inst = Math.ceil(p.price / S.maxInstallments);
    return `
    <article class="card ${sold ? "soldout" : ""}">
      <button class="card__art" data-open="${p.id}" style="--c2:${p.colors[1]}" aria-label="Ver ${esc(p.name)}">
        ${podArt(p)}
        ${sold ? `<span class="card__badge">Esgotado</span>` : p.badge ? `<span class="card__badge">${esc(p.badge)}</span>` : ""}
        ${off && !sold ? `<span class="card__off">-${off}%</span>` : ""}
      </button>
      <div class="card__body">
        <span class="card__brand">${esc(p.brand)}</span>
        <h3 class="card__name">${esc(p.name)}</h3>
        <div class="card__meta">
          <span class="tag">${fmtPuffs(p.puffs)}${p.kit ? " cada" : ""}</span>
          <span class="tag">${brl(Math.round(perK(p)))}/1k</span>
          ${p.display ? `<span class="tag">Tela</span>` : ""}
        </div>
        <div class="dots" title="${p.flavors.length} sabores">${p.flavors.map((f) => `<i class="${f.stock ? "" : "out"}" style="background:${f.color}" title="${esc(f.name)}"></i>`).join("")}</div>
        <div class="card__foot">
          <div class="price">
            ${p.oldPrice ? `<span class="price__old">${brl(p.oldPrice)}</span>` : ""}
            <span class="price__now">${brl(pixPrice(p.price))}</span>
            <span class="price__pix">no Pix</span>
            <span class="price__inst">ou ${S.maxInstallments}x ${brl(inst)}</span>
          </div>
          <button class="btn btn--primary" data-open="${p.id}" ${sold ? "disabled" : ""}>${sold ? "Esgotado" : "Comprar"}</button>
        </div>
      </div>
    </article>`;
  }

  $("#grid").onclick = (e) => { const b = e.target.closest("[data-open]"); if (b && !b.disabled) openModal(b.dataset.open); };
  let qT;
  $("#search").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value.trim(); render(); if (state.q) $("#catalogo").scrollIntoView({ block: "start" }); }, 180); });
  $("#sort").onchange = (e) => { state.sort = e.target.value; render(); };
  $("#instock").onchange = (e) => { state.inStock = e.target.checked; render(); };
  $("#clear-filters").onclick = () => { state.q = ""; $("#search").value = ""; state.inStock = false; $("#instock").checked = false; setCat("all"); };

  /* ---------- modal de produto ---------- */
  const modal = $("#modal");
  let cur = null, curFlavor = null, curQty = 1, lastFocus = null;

  function openModal(id) {
    const p = findP(id); if (!p) return;
    cur = p; curQty = 1; lastFocus = document.activeElement;
    curFlavor = p.flavors.find((f) => f.stock > 0) || null;
    const art = $("#m-art"); art.style.setProperty("--c2", p.colors[1]); art.innerHTML = podArt(p);
    $("#m-brand").textContent = p.brand;
    $("#m-title").textContent = p.name;
    $("#m-price").innerHTML = `
      ${p.oldPrice ? `<span class="price__old">${brl(p.oldPrice)}</span>` : ""}
      <span class="price__now">${brl(pixPrice(p.price))} <small class="price__pix">no Pix</small></span>
      <span class="price__inst">${brl(p.price)} em até ${S.maxInstallments}x de ${brl(Math.ceil(p.price / S.maxInstallments))} sem juros</span>`;
    $("#m-specs").innerHTML = [
      ["Puffs", fmtPuffs(p.puffs) + (p.kit ? ` × ${p.kit}` : "")],
      ["Nicotina", p.nicotine],
      ["Bateria", p.battery],
      ["Líquido", p.liquid],
    ].map(([k, v]) => `<div><small>${k}</small>${esc(v)}</div>`).join("");
    renderFlavors();
    modal.hidden = false; document.body.classList.add("locked");
    $(".modal__close").focus();
  }
  function renderFlavors() {
    $("#m-flavors").innerHTML = cur.flavors.map((f, i) => `
      <button class="flavor" data-i="${i}" aria-pressed="${f === curFlavor}" ${f.stock ? "" : "disabled"}>
        <i style="background:${f.color}"></i>${esc(f.name)}
      </button>`).join("");
    const note = $("#m-stock");
    if (!curFlavor) { note.textContent = "Todos os sabores esgotados."; note.className = "stock-note low"; }
    else {
      const left = curFlavor.stock - inCartQty(cur.id, curFlavor.name);
      note.textContent = left <= 0 ? "Você já tem todo o estoque deste sabor no carrinho." : left <= 5 ? `Restam só ${left} unidades deste sabor` : `Em estoque · ${S.deliveryText.toLowerCase()}`;
      note.className = "stock-note " + (left <= 5 ? "low" : "ok");
      curQty = Math.max(1, Math.min(curQty, left));
    }
    $("#m-qty").textContent = curQty;
    const left = curFlavor ? curFlavor.stock - inCartQty(cur.id, curFlavor.name) : 0;
    $("#m-add").disabled = left <= 0;
    $("#m-add").textContent = left <= 0 ? "Indisponível" : `Adicionar · ${brl(pixPrice(cur.price) * curQty)}`;
  }
  $("#m-flavors").onclick = (e) => { const b = e.target.closest("[data-i]"); if (!b || b.disabled) return; curFlavor = cur.flavors[+b.dataset.i]; curQty = 1; renderFlavors(); };
  $("#m-minus").onclick = () => { if (curQty > 1) { curQty--; renderFlavors(); } };
  $("#m-plus").onclick = () => {
    const left = curFlavor ? curFlavor.stock - inCartQty(cur.id, curFlavor.name) : 0;
    if (curQty < left) { curQty++; renderFlavors(); } else toast("Limite de estoque deste sabor");
  };
  $("#m-add").onclick = () => { addToCart(cur.id, curFlavor.name, curQty); closeModal(); toast(`${cur.name} · ${curFlavor.name} adicionado`); };
  function closeModal() { modal.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus(); }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });

  /* ---------- carrinho ---------- */
  let cart = store.get("pods-cart", []).filter((l) => findP(l.id));
  let coupon = store.get("pods-coupon", null);
  if (coupon && !S.coupons[coupon]) coupon = null;
  let pay = "pix";
  const save = () => { store.set("pods-cart", cart); store.set("pods-coupon", coupon); };
  const inCartQty = (id, flavor) => cart.filter((l) => l.id === id && l.flavor === flavor).reduce((a, l) => a + l.qty, 0);
  const flavorStock = (id, flavor) => (findP(id).flavors.find((f) => f.name === flavor) || { stock: 0 }).stock;

  function addToCart(id, flavor, qty) {
    const line = cart.find((l) => l.id === id && l.flavor === flavor);
    const max = flavorStock(id, flavor);
    if (line) line.qty = Math.min(max, line.qty + qty); else cart.push({ id, flavor, qty: Math.min(max, qty) });
    save(); renderCart();
    const b = $("#open-cart"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }

  function totals() {
    const sub = cart.reduce((a, l) => a + findP(l.id).price * l.qty, 0);
    const cDisc = coupon ? Math.round(sub * S.coupons[coupon]) : 0;
    const afterCoupon = sub - cDisc;
    const pDisc = pay === "pix" ? Math.round(afterCoupon * S.pixDiscount) : 0;
    const ship = sub === 0 || sub >= S.freeShippingFrom ? 0 : S.shippingFlat;
    return { sub, cDisc, pDisc, ship, total: afterCoupon - pDisc + ship };
  }

  function renderCart() {
    const count = cart.reduce((a, l) => a + l.qty, 0);
    $("#cart-count").textContent = count;
    const t = totals();
    const missing = S.freeShippingFrom - t.sub;
    $("#ship-msg").innerHTML = t.sub === 0 ? `Frete grátis acima de <b>${brl(S.freeShippingFrom)}</b>`
      : missing > 0 ? `Faltam <b>${brl(missing)}</b> para o frete grátis` : `🎉 Você ganhou <b>frete grátis</b>`;
    $("#ship-fill").style.width = Math.min(100, (t.sub / S.freeShippingFrom) * 100) + "%";

    $("#cart-foot").hidden = cart.length === 0;
    $("#cart-items").innerHTML = cart.length === 0
      ? `<div class="cart-empty"><p>Seu carrinho está vazio.</p><button class="btn btn--ghost" data-close-cart>Ver pods</button></div>`
      : cart.map((l, i) => { const p = findP(l.id); return `
        <div class="line">
          <div class="line__art">${podArt(p)}</div>
          <div><b>${esc(p.name)}</b><small>${esc(l.flavor)}</small><br><small>${brl(p.price)} un.</small></div>
          <div class="line__right">
            <div class="qty qty--sm"><button data-dec="${i}" aria-label="Diminuir">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Aumentar">+</button></div>
            <button class="line__rm" data-rm="${i}">remover</button>
          </div>
        </div>`; }).join("");

    $("#totals").innerHTML = `
      <dt>Subtotal</dt><dd>${brl(t.sub)}</dd>
      ${t.cDisc ? `<dt>Cupom ${esc(coupon)}</dt><dd class="disc">−${brl(t.cDisc)}</dd>` : ""}
      ${t.pDisc ? `<dt>Desconto Pix</dt><dd class="disc">−${brl(t.pDisc)}</dd>` : ""}
      <dt>Frete</dt><dd>${t.ship ? brl(t.ship) : "Grátis"}</dd>
      <dt class="grand">Total</dt><dd class="grand">${brl(t.total)}</dd>
      ${pay === "card" ? `<dt></dt><dd class="muted small">ou ${S.maxInstallments}x de ${brl(Math.ceil(t.total / S.maxInstallments))}</dd>` : ""}`;
    $("#coupon").value = coupon || "";
  }

  $("#cart-items").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.inc !== undefined) { const l = cart[+b.dataset.inc]; if (l.qty < flavorStock(l.id, l.flavor)) l.qty++; else toast("Limite de estoque deste sabor"); }
    else if (b.dataset.dec !== undefined) { const l = cart[+b.dataset.dec]; l.qty--; if (l.qty <= 0) cart.splice(+b.dataset.dec, 1); }
    else if (b.dataset.rm !== undefined) cart.splice(+b.dataset.rm, 1);
    else return;
    save(); renderCart();
  };
  $("#apply-coupon").onclick = () => {
    const c = $("#coupon").value.trim().toUpperCase();
    if (!c) { coupon = null; save(); renderCart(); return; }
    if (S.coupons[c]) { coupon = c; save(); renderCart(); toast(`Cupom ${c} aplicado: -${Math.round(S.coupons[c] * 100)}%`); }
    else toast("Cupom inválido");
  };
  $$('input[name="pay"]').forEach((r) => (r.onchange = () => { pay = r.value; renderCart(); }));

  /* CEP via ViaCEP */
  const cepIn = $("#cep");
  let address = store.get("pods-addr", null);
  if (address) { cepIn.value = address.cep; $("#cep-out").textContent = `${address.localidade}/${address.uf}`; }
  cepIn.addEventListener("input", async () => {
    let v = cepIn.value.replace(/\D/g, "").slice(0, 8);
    cepIn.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
    const out = $("#cep-out");
    if (v.length < 8) { out.textContent = ""; address = null; return; }
    out.textContent = "Buscando…";
    try {
      const r = await fetch(`https://viacep.com.br/ws/${v}/json/`);
      const d = await r.json();
      if (d.erro) throw 0;
      address = { cep: cepIn.value, logradouro: d.logradouro, bairro: d.bairro, localidade: d.localidade, uf: d.uf };
      out.textContent = `${d.localidade}/${d.uf}`; store.set("pods-addr", address);
    } catch { out.textContent = "CEP não encontrado"; address = null; }
  });

  const drawer = $("#drawer");
  const openCart = () => { drawer.hidden = false; document.body.classList.add("locked"); renderCart(); };
  const closeCart = () => { drawer.hidden = true; document.body.classList.remove("locked"); };
  $("#open-cart").onclick = openCart;
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close-cart]")) closeCart(); });

  $("#checkout").onclick = () => {
    if (!cart.length) return;
    if (!address) { toast("Informe um CEP válido"); cepIn.focus(); return; }
    const t = totals();
    const lines = cart.map((l) => { const p = findP(l.id); return `• ${l.qty}x ${p.name} — ${l.flavor} (${brl(p.price * l.qty)})`; });
    const msg = [
      `Olá! Quero fazer este pedido na ${S.name}:`, "", ...lines, "",
      `Subtotal: ${brl(t.sub)}`,
      t.cDisc ? `Cupom ${coupon}: -${brl(t.cDisc)}` : null,
      t.pDisc ? `Desconto Pix: -${brl(t.pDisc)}` : null,
      `Frete: ${t.ship ? brl(t.ship) : "Grátis"}`,
      `*Total: ${brl(t.total)}*`,
      `Pagamento: ${pay === "pix" ? "Pix" : `Cartão (até ${S.maxInstallments}x)`}`, "",
      `CEP: ${address.cep} — ${[address.logradouro, address.bairro, `${address.localidade}/${address.uf}`].filter(Boolean).join(", ")}`,
      "Declaro ter 18 anos ou mais.",
    ].filter((x) => x !== null).join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  };

  /* ---------- FAQ ---------- */
  $("#faq-list").innerHTML = S.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

  /* ---------- teclado ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!modal.hidden) closeModal(); else if (!drawer.hidden) closeCart();
  });

  render();
  renderCart();
})();
