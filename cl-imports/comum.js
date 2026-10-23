/* =================================================================
   CL IMPORTS — partes comuns a todas as páginas
   (cabeçalho, rodapé, sacola, WhatsApp, card de produto, animações).
   Os dados ficam em dados.js — aqui não precisa mexer.
   ================================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brlC = v => brl(v).replace(/\s/g, "");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = msg => `https://wa.me/${LOJA.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
const foto = f => "assets/produtos/" + f;
const MONO = "assets/monograma-t.png", MONO_D = "assets/monograma-escuro.png";
const code = p => "CL-" + String(p.id).padStart(3, "0");
const catNome = id => (CATEGORIAS.find(c => c.id === id) || {}).nome || "";
const byId = id => PRODUTOS.find(p => p.id === id);
const pixDe = v => v * (1 - LOJA.descontoPix);
const linkProduto = p => `produto.html?id=${p.id}`;
const COM_PRECO = LOJA.mostrarPreco !== false;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICON_CLOSE = `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`;

/* ---------------- CABEÇALHO ----------------
   variante "home": transparente sobre o hero, fica sólido ao rolar.
   variante "interna": barra escura fixa, menu fino com espaçamento (estilo Assistrend). */
function montarCabecalho(variante) {
  const interna = variante === "interna";
  const links = interna
    ? [["catalogo.html", "Todos"], ["catalogo.html?cat=novos", "Lançamentos"], ...CATEGORIAS.slice(0, 4).map(c => [`catalogo.html?cat=${c.id}`, c.nome])]
    : [["catalogo.html", "Produtos"], ["catalogo.html?cat=novos", "Lançamentos"], ["#contato", "Contato"]];
  document.body.insertAdjacentHTML("afterbegin", `
  <header class="site ${interna ? "inner solid" : ""}" id="header">
    <div class="px head-row">
      <div style="display:flex;align-items:center">
        <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Abrir menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>
        <nav class="main" id="mainNav">${links.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join("")}</nav>
      </div>
      <a href="index.html" class="brand" aria-label="CL Imports — início">
        <img src="${MONO}" alt="CL">
        <span class="brand-txt"><b>IMPORTS</b><small>PREMIUM SELECTION</small></span>
      </a>
      <div class="head-actions">
        <button class="icon-btn" id="searchBtn" aria-label="Buscar"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg></button>
        <a class="icon-btn" href="${LOJA.instagram}" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/></svg></a>
        <button class="icon-btn" id="cartBtn" aria-label="Abrir sacola">
          <svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
          <span class="cart-count" id="cartCount">0</span>
        </button>
      </div>
    </div>
    <form class="search-bar" id="searchBar" action="catalogo.html"><div class="px"><input type="search" name="q" id="searchInput" placeholder="O que você procura?" aria-label="Buscar produtos"></div></form>
  </header>`);

  if (!interna) {
    const onScroll = () => $("#header").classList.toggle("solid", scrollY > 40);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  $("#cartBtn").onclick = abrirSacola;
  $("#menuBtn").onclick = () => { $("#mainNav").classList.add("open"); $("#overlay").classList.add("show"); };
  $$("#mainNav a").forEach(a => a.addEventListener("click", fecharTudo));
  $("#searchBtn").onclick = () => { $("#searchBar").classList.toggle("open"); setTimeout(() => $("#searchInput").focus(), 200); };
}

/* ---------------- RODAPÉ ---------------- */
function montarRodape() {
  const tick = Array(6).fill(LOJA.avisos).flat().map(a => `<span>${esc(a)}</span><span class="star">✦</span>`).join("");
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="site" id="contato">
    <div class="ticker" style="border-bottom:1px solid var(--line-d)"><div class="ticker-track">${tick}</div></div>
    <div class="px foot-top">
      <div>
        <h3>Entre para a lista</h3>
        <p class="lead">Receba drops, reposições e acessos antecipados antes de todo mundo.</p>
        <form class="news" id="newsForm"><input type="email" placeholder="seu@email.com" required aria-label="Seu e-mail"><button>Assinar</button></form>
      </div>
      <div><h4>Loja</h4><ul>
        <li><a href="catalogo.html">Todos os produtos</a></li><li><a href="catalogo.html?cat=novos">Lançamentos</a></li>
        ${CATEGORIAS.map(c => `<li><a href="catalogo.html?cat=${c.id}">${esc(c.nome)}</a></li>`).join("")}
      </ul></div>
      <div><h4>Ajuda</h4><ul><li><a href="index.html#duvidas">Trocas e devoluções</a></li><li><a href="index.html#duvidas">Prazos de entrega</a></li><li><a href="index.html#duvidas">Pagamento</a></li><li><a href="index.html#sobre">Sobre nós</a></li></ul></div>
      <div><h4>Contato</h4><ul><li>${esc(LOJA.email)}</li><li><a href="${waLink("Olá! Vim pelo site da CL Imports.")}" target="_blank" rel="noopener">WhatsApp</a></li><li>${esc(LOJA.horario)}</li></ul></div>
      <div><h4>Social</h4><ul><li><a href="${LOJA.instagram}" target="_blank" rel="noopener">Instagram</a></li><li><a href="${LOJA.tiktok}" target="_blank" rel="noopener">TikTok</a></li></ul></div>
    </div>
    <div class="wordmark" aria-hidden="true"><span>CL IMPORTS</span></div>
    <div class="px foot-bottom">
      <span>© ${new Date().getFullYear()} CL Imports. Streetwear e luxo importado com curadoria. Envio para todo o Brasil. ${esc(LOJA.cnpj)}</span>
      <div class="pay"><span>Pix</span><span>Visa</span><span>Mastercard</span><span>Elo</span><span>Amex</span><span>Boleto</span></div>
      <a href="#" class="to-top" onclick="scrollTo({top:0,behavior:'smooth'});return false">Voltar ao topo ↑</a>
    </div>
  </footer>`);
  $("#newsForm").onsubmit = e => { e.preventDefault(); e.target.reset(); toast("Pronto! Você está na lista."); };
}

/* ---------------- SACOLA + WHATSAPP + AVISO ---------------- */
function montarSacola() {
  document.body.insertAdjacentHTML("beforeend", `
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="drawer" aria-label="Sacola">
    <div class="drawer-head"><h3>Sua sacola</h3><button class="icon-btn" id="closeCart" aria-label="Fechar">${ICON_CLOSE}</button></div>
    <div class="drawer-items" id="cartItems"></div>
    <div class="drawer-foot" id="cartFoot">
      ${COM_PRECO ? `<div class="total-row"><span>Subtotal</span><b id="cartTotal">R$ 0,00</b></div>
      <small id="cartPix"></small>` : `<small>Os valores e o frete são enviados pelo nosso atendimento no WhatsApp.</small>`}
      <button class="btn-black" id="checkout">${COM_PRECO ? "Finalizar pelo WhatsApp" : "Pedir orçamento no WhatsApp"}</button>
    </div>
  </aside>
  <a class="wa-float" href="${waLink("Olá! Vim pelo site da CL Imports.")}" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg viewBox="0 0 32 32"><path d="M16.04 3C9 3 3.3 8.7 3.3 15.7c0 2.3.6 4.5 1.7 6.4L3.2 29l7.1-1.9a12.7 12.7 0 0 0 5.7 1.4h.1c7 0 12.7-5.7 12.7-12.7S23 3 16.04 3zm0 23.2c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.2 1.1 1.1-4.1-.3-.4a10.5 10.5 0 1 1 9.2 5.1zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.9 1.1 3.5.9 4.1.8.6-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z"/></svg>
  </a>
  <div class="toast" id="toast"><i></i><span id="toastMsg"></span></div>`);

  $("#closeCart").onclick = fecharTudo;
  $("#overlay").onclick = fecharTudo;
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharTudo(); });
  $("#checkout").onclick = () => {
    const linhas = cart.map(i => { const p = byId(i.id); return `• ${i.q}x ${p.nome} [${code(p)}]${i.t !== "Único" ? " — Tam " + i.t : ""}${COM_PRECO ? " — " + brl(p.preco * i.q) : ""}`; });
    const t = totalSacola();
    const fim = COM_PRECO ? `Subtotal: ${brl(t)} (${brl(pixDe(t))} no Pix)\n\nPode me passar o frete?` : "Pode me passar os valores e o frete?";
    window.open(waLink(`Olá, CL Imports! Quero fazer este pedido:\n\n${linhas.join("\n")}\n\n${fim}`), "_blank");
  };
}

let cart = [];
try { cart = JSON.parse(localStorage.getItem("cl-cart") || "[]").filter(i => byId(i.id)); } catch (e) {}
const salvarSacola = () => { try { localStorage.setItem("cl-cart", JSON.stringify(cart)); } catch (e) {} };
const totalSacola = () => cart.reduce((s, i) => s + byId(i.id).preco * i.q, 0);

function addSacola(id, t, q = 1) {
  const it = cart.find(i => i.id === id && i.t === t);
  it ? it.q += q : cart.push({ id, t, q });
  salvarSacola(); renderSacola(); toast("Adicionado à sacola");
}
function renderSacola() {
  const n = cart.reduce((s, i) => s + i.q, 0), total = totalSacola();
  $("#cartCount").textContent = n; $("#cartCount").classList.toggle("show", n > 0);
  $("#cartFoot").style.display = n ? "" : "none";
  if (COM_PRECO) {
    $("#cartTotal").textContent = brl(total);
    $("#cartPix").textContent = `${brl(pixDe(total))} no Pix · ou ${LOJA.parcelas}x de ${brl(total / LOJA.parcelas)}`;
  }
  $("#cartItems").innerHTML = n ? cart.map((i, k) => {
    const p = byId(i.id);
    return `<div class="ci">
      <a class="ci-thumb" href="${linkProduto(p)}">${p.fotos[0] ? `<img class="photo" src="${foto(p.fotos[0])}" alt="">` : `<img class="mono" src="${MONO_D}" alt="">`}</a>
      <div><div class="ci-name">${esc(p.nome)}</div><div class="ci-opt">${code(p)}${i.t !== "Único" ? " · TAM " + esc(i.t) : ""}</div>${COM_PRECO ? `<div class="ci-price">${brl(p.preco * i.q)}</div>` : ""}
        <div class="qty"><button data-d="-1" data-k="${k}" aria-label="Diminuir">−</button><span>${i.q}</span><button data-d="1" data-k="${k}" aria-label="Aumentar">+</button></div></div>
      <button class="ci-remove" data-r="${k}">Remover</button></div>`;
  }).join("") : `<div class="drawer-empty"><img src="${MONO_D}" alt="">Sua sacola está vazia.</div>`;
  $$("[data-d]", $("#cartItems")).forEach(b => b.onclick = () => { const it = cart[+b.dataset.k]; it.q += +b.dataset.d; if (it.q < 1) cart.splice(+b.dataset.k, 1); salvarSacola(); renderSacola(); });
  $$("[data-r]", $("#cartItems")).forEach(b => b.onclick = () => { cart.splice(+b.dataset.r, 1); salvarSacola(); renderSacola(); });
}
function abrirSacola() { $("#drawer").classList.add("open"); $("#overlay").classList.add("show"); }
function fecharTudo() {
  $("#drawer").classList.remove("open"); $("#overlay").classList.remove("show"); $("#mainNav").classList.remove("open");
}

let toastTimer;
function toast(m) { $("#toastMsg").textContent = m; $("#toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2200); }

/* ---------------- CARD DE PRODUTO (link para a página do produto) ---------------- */
function cardHTML(p, i = 0) {
  const media = p.fotos.length
    ? `<img class="photo" src="${foto(p.fotos[0])}" alt="${esc(p.nome)}" loading="lazy">` + (p.fotos[1] ? `<img class="photo alt" src="${foto(p.fotos[1])}" alt="" loading="lazy">` : "")
    : `<div class="ph"><img src="${MONO_D}" alt=""><small>Foto em breve</small></div>`;
  const off = COM_PRECO && p.de ? Math.round((1 - p.preco / p.de) * 100) : 0;
  return `<a class="pcard" href="${linkProduto(p)}" style="animation-delay:${i * 60}ms">
    <div class="pmedia">${off ? `<span class="ptag">-${off}%</span>` : p.novo ? `<span class="ptag">Novo</span>` : ""}${media}</div>
    <div class="pcat">${esc(p.marca || catNome(p.cat))}</div>
    <h3 class="pname">${esc(p.nome)}</h3>
    ${COM_PRECO ? `<div class="pprice">${p.de ? `<span class="pold">${brlC(p.de)}</span>` : ""}${brlC(p.preco)}</div>
    <div class="pinst">ou ${brlC(p.preco / LOJA.parcelas)} em ${LOJA.parcelas}x</div>` : `<div class="pconsult">Consultar valor</div>`}
  </a>`;
}

/* ---------------- ANIMAÇÃO AO ROLAR ---------------- */
function animarAoRolar() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    $$("[data-count]", e.target).forEach(el => {
      const alvo = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now();
      const step = t => { const k = Math.min((t - t0) / 1600, 1); el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))).toLocaleString("pt-BR") + (k === 1 ? suf : ""); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: .15 });
  $$(".reveal").forEach(el => io.observe(el));
}

/* Monta tudo que é comum. Chame no fim de cada página. */
function iniciarPagina(variante) {
  montarSacola();
  montarCabecalho(variante);
  montarRodape();
  renderSacola();
}
