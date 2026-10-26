(function () {
  "use strict";

  const L = window.LOJA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const whatsUrl = (msg) => `https://wa.me/${L.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
  const MIN = L.pedidoMinimo > 0 ? L.pedidoMinimo : 0;
  // Meta Pixel: só dispara se o script carregou (bloqueadores de anúncio não quebram a loja).
  const pixel = (evento, dados) => {
    try {
      if (typeof window.fbq === "function") window.fbq("track", evento, { currency: "BRL", ...dados });
    } catch (_) {}
  };

  // Referência por produto, usada na mensagem do pedido para facilitar a separação.
  L.produtos.forEach((p, i) => (p.ref = "REF " + String(i + 1).padStart(3, "0")));
  const porId = (id) => L.produtos.find((p) => p.id === id);
  const coresDe = (p) => p.cores || L.cores || [];
  const hexDe = (p, nome) => (coresDe(p).find((c) => c.nome === nome) || {}).hex || "#ddd";
  // Estoque da peça somando todas as cores/tamanhos; sem o campo, não limita.
  const estoqueDe = (p) => (typeof p.estoque === "number" ? p.estoque : Infinity);
  const naSacola = (id) => sacola.filter((i) => i.id === id).reduce((s, i) => s + i.qtd, 0);
  const disponivel = (p) => estoqueDe(p) - naSacola(p.id);

  const ORDEM_CATS = ["Conjuntos", "Macaquinhos e Macacões", "Leggings e Shorts", "Coleção Brasil", "Plus Size", "Camisetas"];
  const APELIDO = { "Macaquinhos e Macacões": "Macaquinhos", "Leggings e Shorts": "Leggings e shorts", "Coleção Brasil": "Brasil" };
  const cats = ORDEM_CATS.filter((c) => L.produtos.some((p) => p.categoria === c));
  L.produtos.forEach((p) => !cats.includes(p.categoria) && cats.push(p.categoria));
  const FAIXAS = { ate30: (v) => v <= 30, "30mais": (v) => v > 30 };

  const estado = { cat: "Tudo", ordem: "destaque", faixa: null, busca: "" };

  /* ------------------------------------------------------------------------
     Links fixos
     ------------------------------------------------------------------------ */
  $$("[data-whats-link]").forEach((a) => {
    a.href = whatsUrl(`Olá! Vim pelo site da ${L.marca} e queria tirar uma dúvida.`);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-insta-link]").forEach((a) => {
    a.href = `https://instagram.com/${L.instagram}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-insta-nome]").forEach((s) => (s.textContent = "@" + L.instagram));
  $$("[data-minimo]").forEach((s) => (s.textContent = brl(MIN).replace(",00", "")));
  $("[data-minimo-faq]").textContent = MIN
    ? `${brl(MIN)} em peças. Pode misturar modelos, cores e tamanhos para chegar no valor.`
    : "Não há pedido mínimo.";
  $("#ano").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------------
     Destaques (categorias)
     ------------------------------------------------------------------------ */
  const capa = (c) => (c === "Tudo" ? "img/icone.svg" : L.produtos.find((p) => p.categoria === c).fotos[0]);
  $("#destaques").innerHTML = ["Tudo", ...cats]
    .map(
      (c) => `<li><button class="destaque" data-cat="${esc(c)}">
        <span class="destaque__foto"><img src="${capa(c)}" alt="" loading="lazy"></span>
        <span class="destaque__nome">${esc(APELIDO[c] || c)}</span>
      </button></li>`
    )
    .join("");

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (c) {
      estado.cat = c.dataset.cat;
      desenhar();
      rolarParaLista();
      return;
    }
    const o = e.target.closest("[data-ordem]");
    if (o) {
      estado.ordem = o.dataset.ordem;
      desenhar();
      return;
    }
    const f = e.target.closest("[data-faixa]");
    if (f) {
      estado.faixa = estado.faixa === f.dataset.faixa ? null : f.dataset.faixa;
      desenhar();
    }
  });
  function rolarParaLista() {
    const y = $("#controles").getBoundingClientRect().top + scrollY - 60;
    if (scrollY > y + 4 || scrollY < y - 400) scrollTo({ top: y, behavior: "smooth" });
  }
  $("#limpar").addEventListener("click", () => {
    Object.assign(estado, { cat: "Tudo", faixa: null, busca: "" });
    $("#campoBusca").value = "";
    $("#busca").hidden = true;
    desenhar();
  });

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
    desenhar();
  });
  $("#campoBusca").addEventListener("input", (e) => {
    estado.busca = e.target.value;
    desenhar();
  });
  $("#busca").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#campoBusca").blur();
    rolarParaLista();
  });

  /* ------------------------------------------------------------------------
     Vitrine
     ------------------------------------------------------------------------ */
  const ICONE_MAIS = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;
  const ICONE_OK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`;

  function lista() {
    const q = normal(estado.busca.trim());
    const r = L.produtos.filter(
      (p) =>
        (estado.cat === "Tudo" || p.categoria === estado.cat) &&
        (!estado.faixa || (p.preco != null && FAIXAS[estado.faixa](p.preco))) &&
        (!q || normal(`${p.nome} ${p.categoria}`).includes(q))
    );
    if (estado.ordem === "menor") r.sort((a, b) => a.preco - b.preco);
    if (estado.ordem === "maior") r.sort((a, b) => b.preco - a.preco);
    return r;
  }

  function desenhar() {
    const r = lista();
    const buscando = estado.busca.trim();
    $("#titulo").textContent = buscando ? `“${buscando}”` : estado.cat;
    $("#total").textContent = `${r.length} ${r.length === 1 ? "peça" : "peças"}`;
    $$(".destaque").forEach((b) => b.setAttribute("aria-current", b.dataset.cat === estado.cat));
    $$("[data-ordem]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ordem === estado.ordem));
    $$("[data-faixa]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.faixa === estado.faixa));
    $("#vazio").hidden = r.length > 0;

    const noLook = new Set(sacola.map((i) => i.id));
    // Uma peça em destaque (2 colunas) a cada 7, só em listas grandes e sem busca.
    const grande = (i) => !buscando && r.length > 6 && i % 7 === 0;
    $("#vitrine").innerHTML = r
      .map((p, i) => {
        const tem = noLook.has(p.id);
        const cs = coresDe(p);
        const esgotado = estoqueDe(p) <= 0;
        return `<li class="peca${grande(i) ? " peca--grande" : ""}">
          <div class="peca__foto">
            ${p.selo ? `<span class="peca__selo">${esc(p.selo)}</span>` : ""}
            ${esgotado ? `<span class="peca__esgotado">Esgotado</span>` : ""}
            <img src="${p.fotos[0]}" alt="${esc(p.nome)}" loading="${i < 4 ? "eager" : "lazy"}" width="1000" height="1250">
            <button class="peca__abrir" data-abrir="${p.id}" aria-label="Ver ${esc(p.nome)}"></button>
            <button class="peca__add${tem ? " tem" : ""}" data-abrir="${p.id}" aria-label="${tem ? "Já está no seu look. Adicionar outro" : "Adicionar ao look"}: ${esc(p.nome)}">${tem ? ICONE_OK : ICONE_MAIS}</button>
          </div>
          <div class="peca__info">
            <span class="peca__preco">${p.preco == null ? "Consulte" : brl(p.preco)}</span>
            <span class="peca__nome">${esc(p.nome)}</span>
            ${cs.length ? `<span class="peca__cores" aria-label="${cs.length} cores">${cs.slice(0, 6).map((c) => `<i style="--c:${c.hex}"></i>`).join("")}${cs.length > 6 ? `<span>+${cs.length - 6}</span>` : ""}</span>` : ""}
          </div>
        </li>`;
      })
      .join("");
  }
  $("#vitrine").addEventListener("click", (e) => {
    const b = e.target.closest("[data-abrir]");
    if (b) abrirProduto(b.dataset.abrir, b);
  });

  // Linha sob os controles só quando eles grudam no topo
  const sentinela = document.createElement("div");
  $("#controles").before(sentinela);
  new IntersectionObserver(([en]) => $("#controles").classList.toggle("colado", !en.isIntersecting), { rootMargin: "-61px 0px 0px 0px" }).observe(sentinela);

  /* ------------------------------------------------------------------------
     Folhas (produto, sacola)
     ------------------------------------------------------------------------ */
  let aberta = null;
  let voltarFoco = null;
  function abrir(id, origem) {
    if (aberta) fechar(true);
    aberta = $("#" + id);
    voltarFoco = origem || document.activeElement;
    $("#toast").classList.remove("visivel");
    aberta.hidden = false;
    document.body.classList.add("travado");
    requestAnimationFrame(() => requestAnimationFrame(() => aberta && aberta.classList.add("aberta")));
  }
  function fechar(imediato) {
    if (!aberta) return;
    const f = aberta;
    aberta = null;
    f.classList.remove("aberta");
    document.body.classList.remove("travado");
    const sumir = () => !f.classList.contains("aberta") && (f.hidden = true);
    imediato === true ? sumir() : setTimeout(sumir, 300);
    if (voltarFoco && imediato !== true) voltarFoco.focus({ preventScroll: true });
  }
  $$(".folha").forEach((f) => f.addEventListener("click", (e) => (e.target === f || e.target.closest("[data-fechar]")) && fechar()));
  document.addEventListener("keydown", (e) => e.key === "Escape" && fechar());

  /* ------------------------------------------------------------------------
     Produto
     ------------------------------------------------------------------------ */
  let atual = null;
  let tam = null;
  let cor = null;
  let qtd = 1;
  function desenharQtd() {
    const p = atual;
    const d = Math.max(0, disponivel(p));
    qtd = Math.max(1, Math.min(qtd, d || 1));
    $("#pQtd").textContent = qtd;
    $("#pMenos").disabled = qtd <= 1;
    $("#pMais").disabled = qtd >= d;
    if (d > 0) $("#pAdd").textContent = p.preco == null ? `Adicionar ${qtd} ao look` : `Adicionar ${qtd} ao look · ${brl(p.preco * qtd)}`;
  }
  function desenharEstoque() {
    const p = atual;
    const d = disponivel(p);
    const el = $("#pEstoque");
    el.hidden = estoqueDe(p) === Infinity;
    el.className = "estoque" + (d <= 0 ? " zero" : d <= 5 ? " baixo" : "");
    el.textContent = estoqueDe(p) <= 0 ? "Esgotado" : d <= 0 ? "Você já pegou todas as peças em estoque" : `${d} em estoque`;
    const add = $("#pAdd");
    add.disabled = d <= 0;
    add.textContent = estoqueDe(p) <= 0 ? "Esgotado" : d <= 0 ? "Limite do estoque" : "Adicionar ao look";
  }
  function abrirProduto(id, origem) {
    const p = (atual = porId(id));
    tam = null;
    $("#pCat").textContent = `${p.categoria} · ${p.ref}`;
    $("#pNome").textContent = p.nome;
    $("#pPreco").textContent = p.preco == null ? "Consulte o preço" : brl(p.preco);
    $("#pFotos").innerHTML = p.fotos.map((f, i) => `<img src="${f}" alt="${i ? `${esc(p.nome)}, foto ${i + 1}` : esc(p.nome)}">`).join("");
    $("#pPontos").innerHTML = p.fotos.length > 1 ? p.fotos.map((_, i) => `<span aria-current="${i === 0}"></span>`).join("") : "";
    $("#pTams").innerHTML = p.tamanhos.map((t) => `<button type="button" class="tam" data-tam="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("");
    cor = null;
    $("#pCores").innerHTML = coresDe(p)
      .map((c) => `<button type="button" class="cor" style="--c:${c.hex}" data-cor="${esc(c.nome)}" aria-pressed="false" aria-label="${esc(c.nome)}" title="${esc(c.nome)}"></button>`)
      .join("");
    $("#pCorNome").textContent = "escolha";
    qtd = 1;
    desenharEstoque();
    desenharQtd();
    $("#pErro").textContent = "";
    abrir("produto", origem);
    pixel("ViewContent", { content_ids: [p.id], content_name: p.nome, content_type: "product", value: p.preco || 0 });
    $("#produto .folha__painel").scrollTop = 0;
    $("#pFotos").scrollLeft = 0;
  }
  $("#pFotos").addEventListener("scroll", (e) => {
    const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
    $$("#pPontos span").forEach((s, j) => s.setAttribute("aria-current", i === j));
  });
  $("#pTams").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tam]");
    if (!b) return;
    tam = b.dataset.tam;
    $$("#pTams .tam").forEach((x) => x.setAttribute("aria-pressed", x === b));
    if ($("#pErro").textContent.includes("tamanho")) $("#pErro").textContent = "";
  });
  $("#pMenos").addEventListener("click", () => {
    qtd--;
    desenharQtd();
  });
  $("#pMais").addEventListener("click", () => {
    qtd++;
    desenharQtd();
  });
  $("#pCores").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cor]");
    if (!b) return;
    cor = b.dataset.cor;
    $$("#pCores .cor").forEach((x) => x.setAttribute("aria-pressed", x === b));
    $("#pCorNome").textContent = cor;
    if ($("#pErro").textContent.includes("cor")) $("#pErro").textContent = "";
  });
  $("#pForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (disponivel(atual) <= 0) return;
    if (!cor) {
      $("#pErro").textContent = "Escolha uma cor.";
      return;
    }
    if (!tam) {
      $("#pErro").textContent = "Escolha um tamanho.";
      return;
    }
    const antes = total();
    const n = Math.min(qtd, disponivel(atual));
    adicionar(atual.id, cor, tam, n);
    pixel("AddToCart", { content_ids: [atual.id], content_name: atual.nome, content_type: "product", value: (atual.preco || 0) * n, num_items: n });
    fechar();
    const depois = total();
    if (MIN && antes < MIN && depois >= MIN) {
      toast("Pedido mínimo atingido. Já pode enviar.");
      $("#look").classList.remove("pulso");
      void $("#look").offsetWidth;
      $("#look").classList.add("pulso");
    } else {
      const ad = n > 1 ? `${n} peças adicionadas` : "Adicionado";
      toast(MIN && depois < MIN ? `${ad}. Faltam ${brl(MIN - depois)} para o mínimo.` : `${ad} ao look.`);
    }
  });

  /* ------------------------------------------------------------------------
     Sacola ("Seu look")
     ------------------------------------------------------------------------ */
  const CHAVE = "lookfit-sacola";
  let sacola = [];
  try {
    sacola = (JSON.parse(localStorage.getItem(CHAVE) || localStorage.getItem("sacola-v1")) || []).filter((i) => porId(i.id));
  } catch (_) {}
  const salvar = () => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(sacola));
    } catch (_) {}
  };
  function adicionar(id, cor, t, n = 1) {
    const igual = sacola.find((i) => i.id === id && i.cor.toLowerCase() === cor.toLowerCase() && i.tam === t);
    igual ? (igual.qtd += n) : sacola.push({ id, cor, tam: t, qtd: n });
    salvar();
    atualizarSacola();
  }
  const total = () => sacola.reduce((s, i) => s + (porId(i.id).preco || 0) * i.qtd, 0);
  const pecas = () => sacola.reduce((s, i) => s + i.qtd, 0);
  const valor = (p, q) => (p.preco == null ? "a consultar" : brl(p.preco * q));

  function mensagem() {
    const linhas = sacola.map((i) => {
      const p = porId(i.id);
      return `• ${i.qtd}x ${p.nome} (${p.ref}) — cor ${i.cor}, tam. ${i.tam} — ${valor(p, i.qtd)}`;
    });
    return [`Olá! Quero fazer este pedido na ${L.marca}:`, "", ...linhas, "", `Total das peças: ${brl(total())}`, "", "Pode me passar o frete e as formas de pagamento?"].join("\n");
  }

  function atualizarSacola() {
    const n = pecas();
    const t = total();
    const falta = Math.max(0, MIN - t);
    const pronto = n > 0 && falta === 0;

    // Barra fixa: dois elos que enchem até o mínimo (cada elo = metade)
    const prog = MIN ? Math.min(1, t / MIN) : n ? 1 : 0;
    $("#elo1").style.strokeDasharray = `${Math.min(1, prog * 2) * 100} 100`;
    $("#elo2").style.strokeDasharray = `${Math.max(0, prog * 2 - 1) * 100} 100`;
    $("#look").dataset.estado = n === 0 ? "vazio" : pronto ? "pronto" : "parcial";
    $("#lookRotulo").textContent = n === 0 ? "Seu look" : `${n} ${n === 1 ? "peça" : "peças"} · ${brl(t)}`;
    $("#lookInfo").textContent = n === 0 ? (MIN ? `Pedido mínimo ${brl(MIN)}` : "Escolha suas peças") : pronto ? "Pedido liberado" : `Faltam ${brl(falta)} para o mínimo`;
    $("#lookAcao").textContent = pronto ? "Enviar" : "Ver";

    // Folha da sacola
    $("#sTitulo").textContent = n ? `Seu look (${n})` : "Seu look";
    $("#sTotal").textContent = brl(t);
    $("#meta").hidden = !MIN || n === 0;
    $("#meta").classList.toggle("ok", pronto);
    $("#metaBarra").style.width = `${prog * 100}%`;
    $("#metaTxt").textContent = pronto ? "Pedido mínimo atingido." : `Faltam ${brl(falta)} para o pedido mínimo de ${brl(MIN)}.`;
    const env = $("#enviar");
    env.setAttribute("aria-disabled", !pronto);
    if (pronto) env.href = whatsUrl(mensagem());
    else env.removeAttribute("href");

    $("#itens").innerHTML = n
      ? sacola
          .map((i, k) => {
            const p = porId(i.id);
            return `<li class="item">
              <img src="${p.fotos[0]}" alt="">
              <div>
                <div class="item__topo"><p class="item__nome">${esc(p.nome)}</p><span class="item__preco">${valor(p, i.qtd)}</span></div>
                <p class="item__var"><i class="item__cor" style="--c:${hexDe(p, i.cor)}"></i>${esc(i.cor)} · Tam. ${esc(i.tam)}</p>
                <div class="item__acoes">
                  <div class="qtd"><button data-menos="${k}" aria-label="Tirar uma">−</button><span>${i.qtd}</span><button data-mais="${k}" aria-label="Mais uma"${disponivel(p) <= 0 ? " disabled" : ""}>+</button></div>
                  <button class="remover" data-remover="${k}">Remover</button>
                </div>
              </div>
            </li>`;
          })
          .join("")
      : `<li class="vazio"><p>Seu look está vazio.</p><button class="btn btn--claro" data-fechar>Escolher peças</button></li>`;

    if (!aberta || aberta.id !== "produto") desenhar();
  }

  $("#itens").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mais],[data-menos],[data-remover]");
    if (!b) return;
    const { mais, menos, remover } = b.dataset;
    if (mais !== undefined && disponivel(porId(sacola[mais].id)) > 0) sacola[mais].qtd++;
    if (menos !== undefined && --sacola[menos].qtd === 0) sacola.splice(menos, 1);
    if (remover !== undefined) sacola.splice(remover, 1);
    salvar();
    atualizarSacola();
  });
  $("#abrirSacola").addEventListener("click", (e) => abrir("sacola", e.currentTarget));
  $$("[data-whats-link]").forEach((a) => a.addEventListener("click", () => pixel("Contact", {})));
  $("#enviar").addEventListener("click", (e) => {
    if (e.currentTarget.getAttribute("aria-disabled") === "true") return e.preventDefault();
    // O pedido termina no WhatsApp; o envio da mensagem é o mais perto de uma compra que o site enxerga.
    pixel("InitiateCheckout", { content_ids: sacola.map((i) => i.id), content_type: "product", value: total(), num_items: pecas() });
  });

  /* ------------------------------------------------------------------------ */
  let timer;
  function toast(txt) {
    const el = $("#toast");
    el.textContent = txt;
    el.classList.add("visivel");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("visivel"), 2600);
  }

  atualizarSacola();
})();
