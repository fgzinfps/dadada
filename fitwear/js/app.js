(function () {
  "use strict";

  const L = window.LOJA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const porId = (id) => L.produtos.find((p) => p.id === id);
  const whatsUrl = (msg) => `https://wa.me/${L.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;

  /* ------------------------------------------------------------------------
     Dados da marca espalhados pela página
     ------------------------------------------------------------------------ */
  document.title = `${L.marca} — Moda Fitness Feminina`;
  $$("[data-marca]").forEach((el) => (el.textContent = L.marca));
  $$("[data-slogan]").forEach((el) => (el.textContent = L.slogan));
  $$("[data-whats-link]").forEach((el) => {
    el.href = whatsUrl(`Olá! Vim pelo site da ${L.marca} e gostaria de tirar uma dúvida.`);
    el.target = "_blank";
    el.rel = "noopener";
  });
  $$("[data-insta-link]").forEach((el) => (el.href = `https://instagram.com/${L.instagram}`));
  $$("[data-email-link]").forEach((el) => {
    el.href = `mailto:${L.email}`;
    el.textContent = L.email;
  });
  $("#ano").textContent = new Date().getFullYear();
  const avisosPromo = [];
  if (L.pedidoMinimo > 0) avisosPromo.push(`Pedido mínimo de ${brl(L.pedidoMinimo)}`);
  if (L.freteGratisAcimaDe > 0) {
    avisosPromo.push(`Frete grátis acima de ${brl(L.freteGratisAcimaDe)}`);
    $("[data-frete-texto]").textContent = `Frete grátis acima de ${brl(L.freteGratisAcimaDe)}`;
  }
  if (avisosPromo.length) {
    $("#promo").textContent = avisosPromo.join(" · ");
    $("#promo").hidden = false;
  }
  $("[data-minimo-faq]").textContent =
    L.pedidoMinimo > 0
      ? `Sim, o pedido mínimo é de ${brl(L.pedidoMinimo)}. Pode misturar modelos, cores e tamanhos para chegar no valor.`
      : "Não, você pode comprar a partir de uma peça.";
  if (!(L.pedidoMinimo > 0)) $("[data-minimo-faq]").closest("details").remove();

  /* ------------------------------------------------------------------------
     Catálogo + filtros
     ------------------------------------------------------------------------ */
  const categorias = ["Todos", ...new Set(L.produtos.map((p) => p.categoria))];
  let filtroAtual = "Todos";

  function desenharFiltros() {
    // Com uma categoria só, o filtro não ajuda em nada — esconde.
    if (categorias.length <= 2) return;
    $("#filtros").innerHTML = categorias
      .map((c) => `<button class="filtro" role="tab" aria-selected="${c === filtroAtual}" data-cat="${esc(c)}">${esc(c)}</button>`)
      .join("");
  }

  // preco null = produto ainda sem preço definido; o valor é passado no WhatsApp.
  const valor = (p, qtd = 1) => (p.preco == null ? "a consultar" : brl(p.preco * qtd));

  function precoHtml(p) {
    if (p.preco == null) return "Consulte o preço";
    return (p.precoAntigo ? `<s>${brl(p.precoAntigo)}</s>` : "") + brl(p.preco);
  }

  function desenharGrade() {
    // Produtos com preço aparecem antes dos "consulte o preço".
    const lista = L.produtos
      .filter((p) => filtroAtual === "Todos" || p.categoria === filtroAtual)
      .sort((a, b) => (a.preco == null) - (b.preco == null));
    $("#grade").innerHTML = lista
      .map((p) => {
        const [f1, f2] = p.fotos;
        const parcela = L.parcelas > 1 && p.preco != null ? `<p class="parcela">ou ${L.parcelas}x de ${brl(p.preco / L.parcelas)} sem juros</p>` : "";
        return `<li class="card">
          <div class="card__foto">
            ${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}
            <img src="${f1}" alt="${esc(p.nome)}" loading="lazy" width="1000" height="1250">
            ${f2 ? `<img src="${f2}" alt="" loading="lazy" width="1000" height="1250">` : ""}
          </div>
          <div class="card__info">
            <button class="card__nome" data-abrir="${p.id}">${esc(p.nome)}</button>
            <p class="preco">${precoHtml(p)}</p>
            ${parcela}
          </div>
        </li>`;
      })
      .join("");
  }

  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    filtroAtual = b.dataset.cat;
    desenharFiltros();
    desenharGrade();
  });
  $("#grade").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) abrirProduto($("[data-abrir]", card).dataset.abrir);
  });

  /* ------------------------------------------------------------------------
     Modal do produto
     ------------------------------------------------------------------------ */
  const modal = $("#modal");
  let produtoAberto = null;

  function trocarFoto(i) {
    $("#modalFoto").src = produtoAberto.fotos[i];
    $$("#modalMinis button").forEach((b, j) => b.setAttribute("aria-current", i === j));
  }

  function abrirProduto(id) {
    const p = (produtoAberto = porId(id));
    $("#modalCat").textContent = p.categoria;
    $("#modalNome").textContent = p.nome;
    $("#modalPreco").innerHTML = precoHtml(p);
    $("#modalDesc").textContent = p.descricao || "";
    $("#modalFoto").alt = p.nome;
    $("#modalMinis").innerHTML =
      p.fotos.length > 1
        ? p.fotos.map((f, i) => `<button type="button" data-foto="${i}" aria-label="Foto ${i + 1}"><img src="${f}" alt=""></button>`).join("")
        : "";
    // A maioria das fotos mostra várias cores; a cliente escreve qual quer.
    $("#modalCor").value = "";
    $("#modalTams").innerHTML = p.tamanhos
      .map((t, i) => `<input type="radio" name="tam" id="tam${i}" value="${esc(t)}"><label for="tam${i}">${esc(t)}</label>`)
      .join("");
    $("#modalDetalhes").innerHTML = (p.detalhes || []).map((d) => `<li>${esc(d)}</li>`).join("");
    $("#modalErro").textContent = "";
    trocarFoto(0);
    modal.showModal();
  }

  $("#modalMinis").addEventListener("click", (e) => {
    const b = e.target.closest("[data-foto]");
    if (b) trocarFoto(+b.dataset.foto);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-fechar]")) modal.close();
  });

  $("#modalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(e.target);
    const cor = (dados.get("cor") || "").trim();
    if (!cor) {
      $("#modalErro").textContent = "Escreva a cor que você quer.";
      return;
    }
    if (!dados.get("tam")) {
      $("#modalErro").textContent = "Escolha um tamanho.";
      return;
    }
    adicionar(produtoAberto.id, cor, dados.get("tam"));
    modal.close();
    avisar("Adicionado à sacola");
  });

  /* ------------------------------------------------------------------------
     Sacola (salva no navegador; se o storage falhar, funciona só na sessão)
     ------------------------------------------------------------------------ */
  const CHAVE = "sacola-v1";
  let sacola = [];
  try {
    sacola = (JSON.parse(localStorage.getItem(CHAVE)) || []).filter((i) => porId(i.id));
  } catch (_) {}

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(sacola));
    } catch (_) {}
  }

  function adicionar(id, cor, tam) {
    const existente = sacola.find((i) => i.id === id && i.cor === cor && i.tam === tam);
    if (existente) existente.qtd++;
    else sacola.push({ id, cor, tam, qtd: 1 });
    salvar();
    desenharSacola();
  }

  const total = () => sacola.reduce((s, i) => s + (porId(i.id).preco || 0) * i.qtd, 0);
  const temSemPreco = () => sacola.some((i) => porId(i.id).preco == null);

  function desenharSacola() {
    const qtd = sacola.reduce((s, i) => s + i.qtd, 0);
    const badge = $("#qtdSacola");
    badge.textContent = qtd;
    badge.toggleAttribute("data-zero", qtd === 0);
    $("#totalSacola").textContent = brl(total()) + (temSemPreco() ? " + itens a consultar" : "");
    // Pedido mínimo: só dá para garantir com itens de preço conhecido.
    // Se houver item "a consultar", libera e o mínimo é conferido no WhatsApp.
    const falta = L.pedidoMinimo > 0 ? L.pedidoMinimo - total() : 0;
    const bloqueia = falta > 0 && !temSemPreco();
    $("#finalizar").disabled = qtd === 0 || bloqueia;
    $("#minimo").hidden = !(qtd > 0 && falta > 0);
    if (qtd > 0 && falta > 0) {
      $("#minimoTexto").textContent = temSemPreco()
        ? `Pedido mínimo: ${brl(L.pedidoMinimo)}. Como há itens a consultar, conferimos o valor no WhatsApp.`
        : `Faltam ${brl(falta)} para o pedido mínimo de ${brl(L.pedidoMinimo)}.`;
      $("#minimoBarra").style.width = `${Math.min(100, (total() / L.pedidoMinimo) * 100)}%`;
    }
    $("#itensSacola").innerHTML = qtd
      ? sacola
          .map((i, n) => {
            const p = porId(i.id);
            return `<li class="item">
              <img src="${p.fotos[0]}" alt="">
              <div>
                <p class="item__nome">${esc(p.nome)}</p>
                <p class="item__var">${esc(i.cor)} · ${esc(i.tam)}</p>
                <div class="qtd">
                  <button data-menos="${n}" aria-label="Diminuir">−</button><span>${i.qtd}</span><button data-mais="${n}" aria-label="Aumentar">+</button>
                </div>
              </div>
              <div class="item__dir">
                <strong>${valor(p, i.qtd)}</strong>
                <button class="remover" data-remover="${n}">Remover</button>
              </div>
            </li>`;
          })
          .join("")
      : `<li class="sacola__vazia">Sua sacola está vazia.</li>`;
  }

  $("#itensSacola").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const { mais, menos, remover } = b.dataset;
    if (mais !== undefined) sacola[mais].qtd++;
    if (menos !== undefined && --sacola[menos].qtd === 0) sacola.splice(menos, 1);
    if (remover !== undefined) sacola.splice(remover, 1);
    salvar();
    desenharSacola();
  });

  const painel = $("#sacola");
  const veu = $("#veu");
  function abrirSacola(abrir) {
    painel.classList.toggle("aberta", abrir);
    painel.setAttribute("aria-hidden", !abrir);
    veu.hidden = !abrir;
    if (abrir) $("#fecharSacola").focus();
  }
  $("#abrirSacola").addEventListener("click", () => abrirSacola(true));
  $("#fecharSacola").addEventListener("click", () => abrirSacola(false));
  veu.addEventListener("click", () => abrirSacola(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && abrirSacola(false));

  $("#finalizar").addEventListener("click", () => {
    const linhas = sacola.map((i) => {
      const p = porId(i.id);
      return `• ${i.qtd}x ${p.nome} — cor ${i.cor}, tam. ${i.tam} — ${valor(p, i.qtd)}`;
    });
    const msg = [`Olá! Quero fazer este pedido na ${L.marca}:`, "", ...linhas, "", `Subtotal: ${brl(total())}${temSemPreco() ? " (+ itens com preço a consultar)" : ""}`, "", "Pode me passar o frete e as formas de pagamento?"].join("\n");
    window.open(whatsUrl(msg), "_blank", "noopener");
  });

  /* ------------------------------------------------------------------------ */
  let timer;
  function avisar(txt) {
    const el = $("#aviso");
    el.textContent = txt;
    el.classList.add("visivel");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("visivel"), 2200);
  }

  desenharFiltros();
  desenharGrade();
  desenharSacola();
})();
