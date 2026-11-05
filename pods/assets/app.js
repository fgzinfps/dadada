(() => {
  "use strict";
  const track = window.track || (() => {});
  const S = window.STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (c) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const fmtPuffs = (n) => (n ? `${n.toLocaleString("pt-BR")} puffs` : "");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const MAX_QTY = 50;

  const pixPrice = (c) => Math.round(c * (1 - S.pixDiscount));
  const pctOff = (p) => (p.oldPrice && p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const perK = (p) => (p.price && p.puffs ? p.price / (p.puffs / 1000) : Infinity);
  const instOf = (c) => Math.min(S.maxInstallments, ((S.installmentRules || []).find(([min]) => c >= min) || [0, S.maxInstallments])[1]);
  const instText = (c) => { const n = instOf(c); return n > 1 ? `ou ${n}x de ${brl(Math.ceil(c / n))} sem juros` : `ou ${brl(c)} no cartão`; };
  const findP = (id) => S.products.find((p) => p.id === id);
  const isSingle = (p) => p.flavors.length === 1 && p.flavors[0].name === "Padrão";
  const waLink = (text = "") => `https://wa.me/${S.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
  const waPretty = S.whatsapp.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");

  /* ---------- textos da config ---------- */
  $$("[data-store]").forEach((el) => { const k = el.dataset.store; el.textContent = k === "maxInstallments-x" ? `${S.maxInstallments}x` : S[k]; });
  $$("[data-money]").forEach((el) => (el.textContent = brl(S[el.dataset.money])));
  $$("[data-pix-pct]").forEach((el) => (el.textContent = `${Math.round(S.pixDiscount * 100)}%`));
  $$("[data-pix-pct-off]").forEach((el) => (el.textContent = `-${Math.round(S.pixDiscount * 100)}%`));
  $("#topbar-msg").textContent = `${Math.round(S.pixDiscount * 100)}% off no Pix · Frete grátis acima de ${brl(S.freeShippingFrom).replace(",00", "")}`;
  $("#year").textContent = new Date().getFullYear();
  $("#footer-wa").href = waLink(); $("#footer-wa-num").textContent = waPretty;
  $("#wa-float").href = waLink(`Olá! Vim pelo site da ${S.name}.`);
  if (S.instagram) { const ig = $("#footer-ig"); ig.href = `https://instagram.com/${S.instagram}`; ig.hidden = false; }

  /* ---------- idade ---------- */
  const age = $("#age");
  if (!store.get("age-ok", false)) { age.hidden = false; document.body.classList.add("locked"); }
  $("#age-yes").onclick = () => { store.set("age-ok", true); age.hidden = true; document.body.classList.remove("locked"); };
  $("#age-no").onclick = () => { location.href = "https://www.google.com"; };

  /* ---------- toast ---------- */
  let toastT;
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2000); };

  const img = (p, eager) => `<img src="${esc(p.image)}" alt="${esc(p.brand + " " + p.name)}" ${eager ? "" : 'loading="lazy"'} width="480" height="480">`;

  /* ---------- filtros ---------- */
  const state = { cat: "all", brand: "", q: "", sort: "featured" };
  $("#chips").innerHTML = S.categories.map((c) => `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="${c.id === "all"}">${esc(c.label)}</button>`).join("");
  $("#chips").onclick = (e) => { const b = e.target.closest("[data-cat]"); if (b) { state.cat = b.dataset.cat; render(); } };

  const brandCount = {};
  S.products.forEach((p) => { brandCount[p.brand] = (brandCount[p.brand] || 0) + 1; });
  const brands = Object.keys(brandCount).sort((a, b) => brandCount[b] - brandCount[a]);
  $("#brands").innerHTML = brands.map((b) => `<button class="brand-chip" data-brand="${esc(b)}" aria-pressed="false">${esc(b)} <small>${brandCount[b]}</small></button>`).join("");
  $("#brands").onclick = (e) => {
    const b = e.target.closest("[data-brand]"); if (!b) return;
    state.brand = state.brand === b.dataset.brand ? "" : b.dataset.brand;
    render(); $("#catalogo").scrollIntoView({ block: "start" });
  };

  const inCat = (p) => ({
    lt20k: p.type === "pod" && p.puffs && p.puffs < 20000,
    "20k": p.type === "pod" && p.puffs >= 20000 && p.puffs < 35000,
    "35k": p.type === "pod" && p.puffs >= 35000,
    refil: p.type === "refil",
    acessorio: p.type === "acessorio",
  }[state.cat] ?? true);
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const matches = (p) => { if (!state.q) return true; const hay = norm([p.name, p.brand, ...p.flavors.map((f) => f.name)].join(" ")); return norm(state.q).split(/\s+/).every((w) => hay.includes(w)); };

  function render() {
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.cat === state.cat));
    $$(".brand-chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.brand === state.brand));
    let list = S.products.filter((p) => inCat(p) && (!state.brand || p.brand === state.brand) && matches(p));
    const sorters = {
      "price-asc": (a, b) => (a.price || 1e9) - (b.price || 1e9),
      "price-desc": (a, b) => (b.price || 0) - (a.price || 0),
      "puffs-desc": (a, b) => (b.puffs || 0) - (a.puffs || 0),
      ppk: (a, b) => perK(a) - perK(b),
    };
    if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
    list = [...list].sort((a, b) => (a.price ? 0 : 1) - (b.price ? 0 : 1)); // "consultar preço" por último
    $("#count").textContent = `${list.length} ${list.length === 1 ? "produto" : "produtos"}${state.brand ? " · " + state.brand : ""}`;
    $("#empty").hidden = list.length > 0;
    $("#grid").innerHTML = list.map(card).join("");
  }

  const priceBlock = (p, lg) => p.price ? `
    <div class="price ${p.oldPrice ? "price--sale" : ""} ${lg ? "price--lg" : ""}">
      ${p.oldPrice ? `<span class="price__old">${brl(p.oldPrice)}</span>` : p.fromPrice ? `<span class="price__from">a partir de</span>` : ""}
      <span class="price__now">${brl(pixPrice(p.price))} <small>no Pix</small></span>
      <span class="price__inst">${instText(p.price)}</span>
    </div>` : `<div class="price price--ask ${lg ? "price--lg" : ""}"><span class="price__now">Preço no WhatsApp</span><span class="price__inst">Disponível · consulte o valor</span></div>`;

  function card(p) {
    const off = pctOff(p);
    const meta = [fmtPuffs(p.puffs), isSingle(p) ? "" : `${p.flavors.length} sabores`].filter(Boolean).join(" · ");
    return `
    <article class="card">
      <button class="card__art" data-open="${p.id}" aria-label="Ver ${esc(p.brand + " " + p.name)}">
        ${img(p)}
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        ${off ? `<span class="badge badge--off">-${off}%</span>` : ""}
      </button>
      <div class="card__body">
        <span class="brand">${esc(p.brand)}</span>
        <h3 class="card__name">${esc(p.name)}</h3>
        ${meta ? `<span class="card__meta">${meta}</span>` : ""}
        <div class="card__price">${priceBlock(p)}</div>
        <button class="btn ${p.price ? "btn--dark" : "btn--line"}" data-open="${p.id}">${p.price ? "Comprar" : "Consultar"}</button>
      </div>
    </article>`;
  }

  $("#grid").onclick = (e) => { const b = e.target.closest("[data-open]"); if (b) openModal(b.dataset.open); };
  let qT;
  $("#search").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 160); });
  $("#search").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.target.blur(); $("#catalogo").scrollIntoView({ block: "start" }); } });
  $("#sort").onchange = (e) => { state.sort = e.target.value; render(); };
  $("#clear-filters").onclick = () => { state.q = ""; $("#search").value = ""; state.brand = ""; state.cat = "all"; render(); };

  /* ---------- produto ---------- */
  const modal = $("#modal");
  let cur = null, curFlavor = null, curQty = 1, lastFocus = null;

  function openModal(id) {
    const p = findP(id); if (!p) return;
    cur = p; curQty = 1; curFlavor = p.flavors[0]; lastFocus = document.activeElement;
    $("#m-art").innerHTML = img(p, true);
    $("#m-brand").textContent = p.brand;
    $("#m-title").textContent = p.name;
    $("#m-meta").textContent = [fmtPuffs(p.puffs), { pod: "Pod descartável", refil: "Refil / cartucho", acessorio: "Acessório" }[p.type]].filter(Boolean).join(" · ");
    $("#m-price").outerHTML = priceBlock(p, true).replace('<div class="price', '<div id="m-price" class="price');
    $("#m-flavors-wrap").hidden = isSingle(p);
    renderModal();
    track("ViewContent", { content_ids: [p.id], content_name: `${p.brand} ${p.name}`, content_type: "product", value: (p.price || 0) / 100, currency: "BRL" });
    modal.hidden = false; document.body.classList.add("locked");
    $(".modal__body").scrollTop = 0;
  }
  function renderModal() {
    $("#m-flavors").innerHTML = cur.flavors.map((f, i) => `
      <button class="flavor" data-i="${i}" aria-pressed="${f === curFlavor}"><span class="sw" style="background:${f.color}"></span>${esc(f.name)}<span class="chk"></span></button>`).join("");
    $("#m-qty").textContent = curQty;
    $("#m-add").className = `btn ${cur.price ? "btn--dark" : "btn--wa"} btn--grow btn--lg`;
    $("#m-add").textContent = cur.price ? `Adicionar · ${brl(pixPrice(cur.price) * curQty)}` : "Pedir no WhatsApp";
  }
  $("#m-flavors").onclick = (e) => { const b = e.target.closest("[data-i]"); if (!b) return; curFlavor = cur.flavors[+b.dataset.i]; renderModal(); };
  $("#m-minus").onclick = () => { if (curQty > 1) { curQty--; renderModal(); } };
  $("#m-plus").onclick = () => { if (curQty < MAX_QTY) { curQty++; renderModal(); } };
  $("#m-add").onclick = () => {
    const label = `${cur.brand} ${cur.name}${isSingle(cur) ? "" : " — " + curFlavor.name}`;
    if (!cur.price) { // sem preço cadastrado: consulta direta no WhatsApp
      track("Contact", { content_ids: [cur.id] });
      window.open(waLink(`Olá! Quero ${curQty}x ${label}. Qual o valor?`), "_blank", "noopener");
      return;
    }
    track("AddToCart", { content_ids: [cur.id], content_name: label, content_type: "product", value: (cur.price * curQty) / 100, currency: "BRL" });
    addToCart(cur.id, curFlavor.name, curQty); closeModal(); toast(`Adicionado: ${label}`);
  };
  function closeModal() { modal.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus({ preventScroll: true }); }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });

  /* ---------- carrinho ---------- */
  let cart = store.get("pods-cart-v2", []).filter((l) => { const p = findP(l.id); return p && p.price && p.flavors.some((f) => f.name === l.flavor); });
  let coupon = store.get("pods-coupon", null);
  if (coupon && !S.coupons[coupon]) coupon = null;
  let pay = "pix";
  const save = () => { store.set("pods-cart-v2", cart); store.set("pods-coupon", coupon); };

  function addToCart(id, flavor, qty) {
    const line = cart.find((l) => l.id === id && l.flavor === flavor);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + qty); else cart.push({ id, flavor, qty });
    save(); renderCart();
    const b = $("#open-cart"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }
  function totals() {
    const sub = cart.reduce((a, l) => a + findP(l.id).price * l.qty, 0);
    const cDisc = coupon ? Math.round(sub * S.coupons[coupon]) : 0;
    const after = sub - cDisc;
    const pDisc = pay === "pix" ? Math.round(after * S.pixDiscount) : 0;
    const ship = sub === 0 || sub >= S.freeShippingFrom ? 0 : S.shippingFlat;
    return { sub, cDisc, pDisc, ship, total: after - pDisc + ship };
  }
  function renderCart() {
    $("#cart-count").textContent = cart.reduce((a, l) => a + l.qty, 0);
    const t = totals(), missing = S.freeShippingFrom - t.sub;
    $("#ship-msg").innerHTML = t.sub === 0 ? `Frete grátis acima de <b>${brl(S.freeShippingFrom)}</b>`
      : missing > 0 ? `Faltam <b>${brl(missing)}</b> para o frete grátis` : `<b>Frete grátis</b> no seu pedido`;
    $("#ship-fill").style.width = Math.min(100, (t.sub / S.freeShippingFrom) * 100) + "%";
    $("#cart-foot").hidden = cart.length === 0;
    $("#cart-items").innerHTML = cart.length === 0
      ? `<div class="cart-empty"><p>Seu carrinho está vazio.</p><button class="btn btn--line" data-close-cart>Ver produtos</button></div>`
      : cart.map((l, i) => { const p = findP(l.id); return `
        <div class="line">
          <div class="line__art">${img(p)}</div>
          <div><b>${esc(p.brand)} ${esc(p.name)}</b>${isSingle(p) ? "" : `<small>${esc(l.flavor)}</small>`}<small>${brl(p.price)} un.</small></div>
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
      ${pay === "card" ? `<dt></dt><dd class="small">${instText(t.total).replace(/^ou /, "")}</dd>` : ""}`;
    $("#coupon").value = coupon || "";
  }
  $("#cart-items").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.inc !== undefined) { const l = cart[+b.dataset.inc]; l.qty = Math.min(MAX_QTY, l.qty + 1); }
    else if (b.dataset.dec !== undefined) { const l = cart[+b.dataset.dec]; l.qty--; if (l.qty <= 0) cart.splice(+b.dataset.dec, 1); }
    else if (b.dataset.rm !== undefined) cart.splice(+b.dataset.rm, 1);
    else return;
    save(); renderCart();
  };
  $("#apply-coupon").onclick = () => {
    const c = $("#coupon").value.trim().toUpperCase();
    if (!c) { coupon = null; save(); renderCart(); return; }
    if (S.coupons[c]) { coupon = c; save(); renderCart(); toast(`Cupom ${c} aplicado: -${Math.round(S.coupons[c] * 100)}%`); } else toast("Cupom inválido");
  };
  $$('input[name="pay"]').forEach((r) => (r.onchange = () => { pay = r.value; renderCart(); }));

  /* CEP (ViaCEP). Se o serviço cair, não trava a venda */
  const cepIn = $("#cep");
  let address = store.get("pods-addr", null);
  if (address) { cepIn.value = address.cep; $("#cep-out").textContent = address.localidade ? `${address.localidade}/${address.uf}` : ""; }
  cepIn.addEventListener("input", async () => {
    const v = cepIn.value.replace(/\D/g, "").slice(0, 8);
    cepIn.value = v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
    const out = $("#cep-out");
    if (v.length < 8) { out.textContent = ""; address = null; return; }
    out.textContent = "Buscando…";
    let d;
    try { d = await (await fetch(`https://viacep.com.br/ws/${v}/json/`)).json(); }
    catch { address = { cep: cepIn.value }; out.textContent = "Confirmamos no WhatsApp"; return; }
    if (d.erro) { out.textContent = "CEP não encontrado"; address = null; return; }
    address = { cep: cepIn.value, logradouro: d.logradouro, bairro: d.bairro, localidade: d.localidade, uf: d.uf };
    out.textContent = `${d.localidade}/${d.uf}`; store.set("pods-addr", address);
  });

  const drawer = $("#drawer");
  const openCart = () => { drawer.hidden = false; document.body.classList.add("locked"); renderCart(); };
  const closeCart = () => { drawer.hidden = true; document.body.classList.remove("locked"); };
  $("#open-cart").onclick = openCart;
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close-cart]")) closeCart(); });

  $("#checkout").onclick = () => {
    if (!cart.length) return;
    if (!address) { toast("Informe seu CEP para calcular o frete"); cepIn.focus(); return; }
    const t = totals();
    const lines = cart.map((l) => { const p = findP(l.id); return `• ${l.qty}x ${p.brand} ${p.name}${isSingle(p) ? "" : " — " + l.flavor} (${brl(p.price * l.qty)})`; });
    const msg = [
      `Olá! Quero fazer este pedido na ${S.name}:`, "", ...lines, "",
      `Subtotal: ${brl(t.sub)}`,
      t.cDisc ? `Cupom ${coupon}: -${brl(t.cDisc)}` : null,
      t.pDisc ? `Desconto Pix: -${brl(t.pDisc)}` : null,
      `Frete: ${t.ship ? brl(t.ship) : "Grátis"}`,
      `*Total: ${brl(t.total)}*`,
      `Pagamento: ${pay === "pix" ? "Pix" : `Cartão (até ${instOf(t.total)}x)`}`, "",
      `CEP: ${[address.cep, address.logradouro, address.bairro, address.localidade && `${address.localidade}/${address.uf}`].filter(Boolean).join(", ")}`,
      "Declaro ter 18 anos ou mais.",
    ].filter((x) => x !== null).join("\n");
    // O pagamento fecha no WhatsApp: este é o último evento mensurável do funil.
    track("InitiateCheckout", { content_ids: cart.map((l) => l.id), content_type: "product", num_items: cart.reduce((a, l) => a + l.qty, 0), value: t.total / 100, currency: "BRL" }, { eventID: "wa-" + Date.now() });
    track("Contact");
    window.open(waLink(msg), "_blank", "noopener");
  };

  /* ---------- FAQ ---------- */
  $("#faq-list").innerHTML = S.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (!modal.hidden) closeModal(); else if (!drawer.hidden) closeCart(); } });

  render();
  renderCart();
})();
