(function () {
  "use strict";

  const L = window.LOJA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const whatsUrl = (msg) => `https://wa.me/${L.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;

  // Referência curta por produto (ordem do catálogo), estilo etiqueta de loja.
  L.produtos.forEach((p, i) => (p.ref = "REF " + String(i + 1).padStart(3, "0")));
  const porId = (id) => L.produtos.find((p) => p.id === id);

  const ORDEM_CATS = ["Conjuntos", "Macaquinhos e Macacões", "Leggings e Shorts", "Coleção Brasil", "Plus Size", "Camisetas"];
  const DESCRICAO = {
    Todos: "Conjuntos, macaquinhos, macacões e leggings para treinar com conforto. Escolha cor e tamanho e finalize o pedido direto no WhatsApp.",
    Conjuntos: "Top e short ou legging pensados para combinar. Tecidos com elasticidade para treino e para o dia a dia.",
    "Macaquinhos e Macacões": "Peça única, sem preocupação com combinação: veste e vai treinar.",
    "Leggings e Shorts": "Partes de baixo com cintura alta e boa sustentação.",
    "Coleção Brasil": "Verde e amarelo para torcer e para treinar.",
    "Plus Size": "Modelagens maiores, com o mesmo cuidado no caimento.",
    Camisetas: "Camisetas leves de treino, de secagem rápida.",
  };
  const FAIXAS = [
    { id: "ate25", nome: "Até R$ 25", ok: (v) => v <= 25 },
    { id: "25a35", nome: "R$ 25 a R$ 35", ok: (v) => v > 25 && v <= 35 },
    { id: "acima35", nome: "Acima de R$ 35", ok: (v) => v > 35 },
  ];
  const cats = ORDEM_CATS.filter((c) => L.produtos.some((p) => p.categoria === c));
  L.produtos.forEach((p) => !cats.includes(p.categoria) && cats.push(p.categoria));

  const estado = { cat: "Todos", faixa: null, busca: "", ordem: "destaque" };

  /* ------------------------------------------------------------------------
     Marca, links e avisos
     ------------------------------------------------------------------------ */
  document.title = `${L.marca} | Moda Fitness Feminina`;
  $$("[data-marca]").forEach((el) => (el.textContent = L.marca));
  $$("[data-whats-link]").forEach((el) => {
    el.href = whatsUrl(`Olá! Vim pelo site da ${L.marca} e gostaria de tirar uma dúvida.`);
    el.target = "_blank";
    el.rel = "noopener";
  });
  $$("[data-insta-link]").forEach((el) => (el.href = `https://instagram.com/${L.instagram}`));
  $("#ano").textContent = new Date().getFullYear();

  const avisos = [];
  if (L.pedidoMinimo > 0) avisos.push(`Pedido mínimo de ${brl(L.pedidoMinimo)}`);
  if (L.freteGratisAcimaDe > 0) avisos.push(`Frete grátis acima de ${brl(L.freteGratisAcimaDe)}`);
  if (L.parcelas > 1) avisos.push(`Pix ou cartão em até ${L.parcelas}x sem juros`);
  avisos.push("Enviamos para todo o Brasil");
  let aviso = 0;
  const trocarAviso = () => ($("#avisos").innerHTML = `<span>${esc(avisos[aviso++ % avisos.length])}</span>`);
  trocarAviso();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(trocarAviso, 4000);

  const minimoFaq = $("[data-minimo-faq]");
  if (L.pedidoMinimo > 0) {
    minimoFaq.textContent = `Sim, ${brl(L.pedidoMinimo)}. Dá para misturar modelos, cores e tamanhos para chegar no valor.`;
    $("[data-minimo-nota]").textContent = `Pedido mínimo de ${brl(L.pedidoMinimo)} · finalização pelo WhatsApp`;
  } else {
    minimoFaq.closest("details").remove();
  }

  /* ------------------------------------------------------------------------
     Navegação por categoria (atalhos, vitrine, menu, filtro)
     ------------------------------------------------------------------------ */
  const todas = ["Todos", ...cats];
  $("#atalhos").innerHTML = todas.map((c) => `<button data-cat="${esc(c)}">${esc(c === "Todos" ? "Novidades" : c)}</button>`).join("");
  $("#vitrine").innerHTML = cats
    .map((c) => {
      const capa = L.produtos.find((p) => p.categoria === c).fotos[0];
      return `<li><button data-cat="${esc(c)}"><img src="${capa}" alt="" loading="lazy"><span>${esc(c)}</span></button></li>`;
    })
    .join("");
  $("#menuCats").innerHTML = todas.map((c) => `<li><button data-cat="${esc(c)}" data-fechar>${esc(c === "Todos" ? "Ver todos" : c)}</button></li>`).join("");

  function desenharFiltroChips() {
    $("#filtroCats").innerHTML = todas
      .map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === estado.cat}">${esc(c)}</button>`)
      .join("");
    $("#filtroPreco").innerHTML = FAIXAS.map((f) => `<button class="chip" data-faixa="${f.id}" aria-pressed="${f.id === estado.faixa}">${f.nome}</button>`).join("");
  }

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat], [data-cat-link]");
    if (c) {
      e.preventDefault();
      estado.cat = c.dataset.cat || c.dataset.catLink;
      atualizar();
      if (!c.closest("#filtro")) $("#barra").scrollIntoView({ block: "start" });
    }
    const f = e.target.closest("[data-faixa]");
    if (f) {
      estado.faixa = estado.faixa === f.dataset.faixa ? null : f.dataset.faixa;
      atualizar();
    }
  });
  $("#ordem").addEventListener("change", (e) => {
    estado.ordem = e.target.value;
    desenharGrade();
  });
  const limpar = () => {
    Object.assign(estado, { cat: "Todos", faixa: null, busca: "" });
    $("#campoBusca").value = "";
    atualizar();
  };
  $("#limparFiltro").addEventListener("click", limpar);
  $("#limparTudo").addEventListener("click", limpar);

  /* ------------------------------------------------------------------------
     Busca
     ------------------------------------------------------------------------ */
  const normal = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  $("#abrirBusca").addEventListener("click", () => {
    $("#busca").hidden = false;
    $("#campoBusca").focus();
  });
  $("#fecharBusca").addEventListener("click", () => {
    $("#busca").hidden = true;
    estado.busca = "";
    $("#campoBusca").value = "";
    atualizar();
  });
  $("#campoBusca").addEventListener("input", (e) => {
    estado.busca = e.target.value;
    atualizar();
  });
  $("#busca").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#campoBusca").blur();
    $("#barra").scrollIntoView({ block: "start" });
  });

  /* ------------------------------------------------------------------------
     Grade
     ------------------------------------------------------------------------ */
  const parcelaTxt = (v) => (L.parcelas > 1 ? `${L.parcelas}x de ${brl(v / L.parcelas)} sem juros` : "");
  const ICONE_ADD = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11l-1-12Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1M12 11.5v5M9.5 14h5"/></svg>`;

  function filtrados() {
    const q = normal(estado.busca.trim());
    const faixa = FAIXAS.find((f) => f.id === estado.faixa);
    const lista = L.produtos.filter(
      (p) =>
        (estado.cat === "Todos" || p.categoria === estado.cat) &&
        (!faixa || (p.preco != null && faixa.ok(p.preco))) &&
        (!q || normal(p.nome + " " + p.categoria).includes(q))
    );
    const ordens = {
      menor: (a, b) => a.preco - b.preco,
      maior: (a, b) => b.preco - a.preco,
      az: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    };
    return ordens[estado.ordem] ? lista.sort(ordens[estado.ordem]) : lista;
  }

  function desenharGrade() {
    const lista = filtrados();
    $("#totalProdutos").textContent = `${lista.length} ${lista.length === 1 ? "produto" : "produtos"}`;
    $("#vazio").hidden = lista.length > 0;
    $("#grade").innerHTML = lista
      .map((p) => {
        const [f1, f2] = p.fotos;
        return `<li class="card">
          <div class="card__foto">
            ${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}
            <img src="${f1}" alt="${esc(p.nome)}" loading="lazy" width="1000" height="1250">
            ${f2 ? `<img src="${f2}" alt="" loading="lazy" width="1000" height="1250">` : ""}
            <button class="card__abrir" data-abrir="${p.id}" aria-label="Ver ${esc(p.nome)}"></button>
            <button class="card__add" data-abrir="${p.id}" aria-label="Adicionar ${esc(p.nome)} à sacola">${ICONE_ADD}</button>
          </div>
          <div class="card__info">
            <p class="ref">${p.ref}</p>
            <button class="card__nome" data-abrir="${p.id}">${esc(p.nome)}</button>
            <p class="preco">${p.preco == null ? "Consulte" : brl(p.preco)}</p>
            ${p.preco != null && L.parcelas > 1 ? `<p class="parcela">${parcelaTxt(p.preco)}</p>` : ""}
            <div class="tams">${p.tamanhos.map((t) => `<button class="tam" data-abrir="${p.id}" data-tam="${esc(t)}" aria-label="Tamanho ${esc(t)}">${esc(t)}</button>`).join("")}</div>
          </div>
        </li>`;
      })
      .join("");
  }

  function atualizar() {
    const titulo = estado.busca.trim() ? `Busca: “${estado.busca.trim()}”` : estado.cat === "Todos" ? "Todos os produtos" : estado.cat;
    $("#tituloColecao").textContent = titulo;
    $("#trilhaAtual").textContent = titulo;
    $("#descColecao").textContent = estado.busca.trim() ? "" : DESCRICAO[estado.cat] || "";
    $$("#atalhos button, #vitrine button").forEach((b) => b.setAttribute("aria-current", b.dataset.cat === estado.cat));
    const n = (estado.cat !== "Todos") + !!estado.faixa;
    $("#nFiltros").hidden = !n;
    $("#nFiltros").textContent = n;
    desenharFiltroChips();
    desenharGrade();
  }

  $("#grade").addEventListener("click", (e) => {
    const b = e.target.closest("[data-abrir]");
    if (b) abrirProduto(b.dataset.abrir, b.dataset.tam);
  });

  /* ------------------------------------------------------------------------
     Gavetas
     ------------------------------------------------------------------------ */
  const veu = $("#veu");
  let aberta = null;
  function abrir(id) {
    fechar(true);
    aberta = $("#" + id);
    aberta.hidden = false;
    veu.hidden = false;
    document.body.classList.add("travado");
    requestAnimationFrame(() => requestAnimationFrame(() => aberta && aberta.classList.add("aberta")));
  }
  function fechar(imediato) {
    if (!aberta) return;
    const g = aberta;
    aberta = null;
    g.classList.remove("aberta");
    veu.hidden = true;
    document.body.classList.remove("travado");
    if (imediato === true) g.hidden = true;
    else setTimeout(() => !g.classList.contains("aberta") && (g.hidden = true), 300);
  }
  veu.addEventListener("click", fechar);
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());
  document.addEventListener("click", (e) => e.target.closest("[data-fechar]") && fechar());
  $("#abrirMenu").addEventListener("click", () => abrir("menu"));
  $("#abrirFiltro").addEventListener("click", () => abrir("filtro"));
  $("#abrirSacola").addEventListener("click", () => abrir("sacola"));

  /* ------------------------------------------------------------------------
     Produto
     ------------------------------------------------------------------------ */
  let atual = null;
  let tamEscolhido = null;

  function abrirProduto(id, tam) {
    const p = (atual = porId(id));
    tamEscolhido = tam || null;
    $("#pRef").textContent = `${p.ref} · ${p.categoria}`;
    $("#pNome").textContent = p.nome;
    $("#pPreco").textContent = p.preco == null ? "Consulte o preço" : brl(p.preco);
    $("#pParcela").textContent = p.preco == null ? "" : parcelaTxt(p.preco);
    $("#pFotos").innerHTML = p.fotos.map((f, i) => `<img src="${f}" alt="${i ? "" : esc(p.nome)}">`).join("");
    $("#pFotos").scrollLeft = 0;
    $("#pPontos").innerHTML = p.fotos.length > 1 ? p.fotos.map((_, i) => `<span aria-current="${i === 0}"></span>`).join("") : "";
    $("#pTams").innerHTML = p.tamanhos
      .map((t) => `<button type="button" class="tam" data-tam="${esc(t)}" aria-pressed="${t === tamEscolhido}">${esc(t)}</button>`)
      .join("");
    $("#pCor").value = "";
    $("#pErro").textContent = "";
    abrir("produto");
    $("#produto").scrollTop = 0;
  }

  $("#pFotos").addEventListener("scroll", (e) => {
    const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
    $$("#pPontos span").forEach((s, j) => s.setAttribute("aria-current", i === j));
  });
  $("#pTams").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tam]");
    if (!b) return;
    tamEscolhido = b.dataset.tam;
    $$("#pTams .tam").forEach((x) => x.setAttribute("aria-pressed", x === b));
  });
  $("#pForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const cor = $("#pCor").value.trim();
    if (!cor) return void ($("#pErro").textContent = "Escreva a cor que você quer.");
    if (!tamEscolhido) return void ($("#pErro").textContent = "Escolha um tamanho.");
    adicionar(atual.id, cor, tamEscolhido);
    fechar();
    toast(`${atual.nome} na sacola`);
  });

  /* ------------------------------------------------------------------------
     Sacola (localStorage; se falhar, vale só nesta visita)
     ------------------------------------------------------------------------ */
  const CHAVE = "sacola-v1";
  let sacola = [];
  try {
    sacola = (JSON.parse(localStorage.getItem(CHAVE)) || []).filter((i) => porId(i.id));
  } catch (_) {}
  const salvar = () => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(sacola));
    } catch (_) {}
  };

  function adicionar(id, cor, tam) {
    const igual = sacola.find((i) => i.id === id && i.cor.toLowerCase() === cor.toLowerCase() && i.tam === tam);
    if (igual) igual.qtd++;
    else sacola.push({ id, cor, tam, qtd: 1 });
    salvar();
    desenharSacola();
  }

  const valor = (p, q) => (p.preco == null ? "a consultar" : brl(p.preco * q));
  const total = () => sacola.reduce((s, i) => s + (porId(i.id).preco || 0) * i.qtd, 0);
  const temSemPreco = () => sacola.some((i) => porId(i.id).preco == null);

  function desenharSacola() {
    const qtd = sacola.reduce((s, i) => s + i.qtd, 0);
    $("#qtdSacola").textContent = qtd;
    $("#qtdSacola").toggleAttribute("data-zero", qtd === 0);
    $("#sacolaQtd").textContent = qtd ? `(${qtd})` : "";
    $("#totalSacola").textContent = brl(total()) + (temSemPreco() ? " + a consultar" : "");

    // Pedido mínimo: com item sem preço, libera e confere no WhatsApp.
    const falta = L.pedidoMinimo > 0 ? L.pedidoMinimo - total() : 0;
    $("#finalizar").disabled = qtd === 0 || (falta > 0 && !temSemPreco());
    $("#minimo").hidden = !(qtd > 0 && falta > 0);
    if (qtd > 0 && falta > 0) {
      $("#minimoTexto").textContent = temSemPreco()
        ? `Pedido mínimo de ${brl(L.pedidoMinimo)}, conferido no WhatsApp.`
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
                <p class="item__var">Cor: ${esc(i.cor)} · Tam.: ${esc(i.tam)}</p>
                <div class="item__linha">
                  <div class="qtd"><button data-menos="${n}" aria-label="Diminuir">−</button><span>${i.qtd}</span><button data-mais="${n}" aria-label="Aumentar">+</button></div>
                  <span class="item__preco">${valor(p, i.qtd)}</span>
                </div>
                <button class="remover" data-remover="${n}">Remover</button>
              </div>
            </li>`;
          })
          .join("")
      : `<li class="vazio">Sua sacola está vazia.</li>`;
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

  $("#finalizar").addEventListener("click", () => {
    const linhas = sacola.map((i) => {
      const p = porId(i.id);
      return `• ${i.qtd}x ${p.nome} (${p.ref}) — cor ${i.cor}, tam. ${i.tam} — ${valor(p, i.qtd)}`;
    });
    const sub = `Subtotal: ${brl(total())}${temSemPreco() ? " (+ itens a consultar)" : ""}`;
    const msg = [`Olá! Quero fazer este pedido na ${L.marca}:`, "", ...linhas, "", sub, "", "Pode me passar o frete e as formas de pagamento?"].join("\n");
    window.open(whatsUrl(msg), "_blank", "noopener");
  });

  /* ------------------------------------------------------------------------ */
  let timer;
  function toast(txt) {
    const el = $("#toast");
    el.textContent = txt;
    el.classList.add("visivel");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("visivel"), 2200);
  }

  atualizar();
  desenharSacola();
})();
