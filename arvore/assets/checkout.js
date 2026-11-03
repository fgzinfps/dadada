/* ==========================================================================
   Checkout: dados, CEP (ViaCEP), order bump, geração e acompanhamento do PIX.
   O valor mostrado aqui é só visual — quem define o valor cobrado é o servidor
   (api/pix/create.js). Nunca confie no total enviado pelo navegador.
   ========================================================================== */
(function () {
  "use strict";
  var S = window.STORE, P = S.product, B = S.bump;
  var $ = function (id) { return document.getElementById(id); };
  var onlyDigits = function (v) { return (v || "").replace(/\D/g, ""); };

  // ---------------- Estado ----------------
  var params = new URLSearchParams(location.search);
  var state = {
    qty: Math.max(1, Math.min(P.maxQty, parseInt(params.get("qtd"), 10) || 1)),
    bump: false
  };
  function total() { return P.price * state.qty + (state.bump ? B.price : 0); }

  // ---------------- Render ----------------
  document.querySelectorAll("[data-store]").forEach(function (el) { el.textContent = S[el.dataset.store]; });
  document.querySelectorAll("[data-p]").forEach(function (el) { el.textContent = P[el.dataset.p]; });
  document.querySelectorAll("[data-b]").forEach(function (el) {
    var k = el.dataset.b; el.textContent = k === "price" ? fmtBRL(B.price) : B[k];
  });

  function render() {
    $("sumQty").textContent = state.qty;
    $("sumProd").textContent = fmtBRL(P.price * state.qty);
    $("sumBump").hidden = !state.bump;
    $("bump").classList.toggle("on", state.bump);
    document.querySelectorAll("[data-total]").forEach(function (el) { el.textContent = fmtBRL(total()); });
  }

  $("bumpCheck").addEventListener("change", function (e) { state.bump = e.target.checked; render(); });
  render();

  // ---------------- UFs ----------------
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").forEach(function (uf) {
    var o = document.createElement("option"); o.value = o.textContent = uf; $("uf").appendChild(o);
  });

  // ---------------- Máscaras ----------------
  function mask(el, fn) { el.addEventListener("input", function () { el.value = fn(onlyDigits(el.value)); }); }
  mask($("cpf"), function (d) {
    d = d.slice(0, 11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  });
  mask($("telefone"), function (d) {
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  });
  mask($("cep"), function (d) { d = d.slice(0, 8); return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d; });

  // ---------------- CEP -> endereço (ViaCEP) ----------------
  var lastCep = "";
  function revealAddress() { $("addrRest").hidden = false; }
  function setInvalid(id, bad) { $(id).closest(".field").classList.toggle("invalid", !!bad); }

  $("cep").addEventListener("input", function () {
    var cep = onlyDigits(this.value);
    setInvalid("cep", false);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    $("cepHint").textContent = "Buscando endereço…";
    fetch("https://viacep.com.br/ws/" + cep + "/json/")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.erro) {
          $("cepHint").textContent = "";
          $("cepMsg").textContent = "CEP não encontrado. Confira os números.";
          setInvalid("cep", true);
          return;
        }
        $("rua").value = d.logradouro || "";
        $("bairro").value = d.bairro || "";
        $("cidade").value = d.localidade || "";
        $("uf").value = d.uf || "";
        ["rua", "bairro", "cidade", "uf"].forEach(function (k) { if (rules[k]($(k).value)) setInvalid(k, false); });
        $("cepHint").textContent = (d.localidade || "") + " - " + (d.uf || "");
        revealAddress();
        // CEP de cidade pequena não traz rua: foca no primeiro campo vazio
        ($("rua").value ? $("numero") : $("rua")).focus();
      })
      .catch(function () {
        // ViaCEP fora do ar: deixa o cliente digitar o endereço manualmente
        $("cepHint").textContent = "Preencha o endereço abaixo.";
        revealAddress();
        $("rua").focus();
      });
  });

  // ---------------- Validação ----------------
  function validCPF(c) {
    c = onlyDigits(c);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var t = 9; t < 11; t++) {
      var s = 0;
      for (var i = 0; i < t; i++) s += +c[i] * (t + 1 - i);
      if (((10 * s) % 11) % 10 !== +c[t]) return false;
    }
    return true;
  }
  var rules = {
    nome: function (v) { return v.trim().split(/\s+/).length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    telefone: function (v) { var d = onlyDigits(v); return d.length === 10 || d.length === 11; },
    cpf: validCPF,
    cep: function (v) { return onlyDigits(v).length === 8; },
    rua: function (v) { return v.trim().length > 1; },
    numero: function (v) { return v.trim().length > 0; },
    bairro: function (v) { return v.trim().length > 1; },
    cidade: function (v) { return v.trim().length > 1; },
    uf: function (v) { return v.length === 2; }
  };
  Object.keys(rules).forEach(function (id) {
    $(id).addEventListener("input", function () { if (rules[id](this.value)) setInvalid(id, false); });
    $(id).addEventListener("change", function () { if (rules[id](this.value)) setInvalid(id, false); });
    $(id).addEventListener("blur", function () { if (this.value) setInvalid(id, !rules[id](this.value)); });
  });

  function validate() {
    var firstBad = null;
    if (onlyDigits($("cep").value).length === 8) revealAddress();
    Object.keys(rules).forEach(function (id) {
      var ok = rules[id]($(id).value);
      if (id === "cep" && !ok) $("cepMsg").textContent = "CEP inválido.";
      setInvalid(id, !ok);
      if (!ok && !firstBad) firstBad = $(id);
    });
    if (firstBad) {
      if ($("addrRest").hidden && firstBad.closest("#addrRest")) revealAddress();
      firstBad.focus();
      firstBad.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    return !firstBad;
  }

  // ---------------- Envio / PIX ----------------
  function collectOrder() {
    return {
      items: [{ id: P.id, qty: state.qty }].concat(state.bump ? [{ id: B.id, qty: 1 }] : []),
      customer: {
        name: $("nome").value.trim(),
        email: $("email").value.trim(),
        phone: onlyDigits($("telefone").value),
        cpf: onlyDigits($("cpf").value)
      },
      address: {
        cep: onlyDigits($("cep").value),
        street: $("rua").value.trim(),
        number: $("numero").value.trim(),
        complement: $("complemento").value.trim(),
        district: $("bairro").value.trim(),
        city: $("cidade").value.trim(),
        state: $("uf").value
      },
      // UTMs do anúncio, para saber qual campanha vendeu
      tracking: Object.fromEntries(Array.from(params.entries()).filter(function (e) { return /^(utm_|fbclid|gclid|ttclid|src)/.test(e[0]); }))
    };
  }

  // Resposta de api/pix/create:
  // { id (cobrança VulcanoPay), orderId, amount (centavos), copiaECola, qrCodeBase64 (data URL), expiresAt, sandbox }
  function createPix(order) {
    if (S.demoMode) {
      return new Promise(function (res) {
        setTimeout(function () {
          res({
            id: "DEMO-" + Date.now().toString(36).toUpperCase(),
            orderId: "DEMO",
            sandbox: true,
            amount: total(),
            copiaECola: "00020126580014BR.GOV.BCB.PIX0136DEMO-NAO-PAGUE-ESTE-CODIGO-0000000000005204000053039865405" + (total() / 100).toFixed(2) + "5802BR5913LOJA DEMO6009SAO PAULO62070503***6304ABCD",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          });
        }, 700);
      });
    }
    return fetch(S.api.create, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Não foi possível gerar o PIX.");
        return j;
      });
    });
  }

  function checkStatus(id) {
    if (S.demoMode) return Promise.resolve({ status: "pending" });
    return fetch(S.api.status + "?id=" + encodeURIComponent(id)).then(function (r) { return r.json(); });
  }

  var pollTimer, clockTimer;

  function showPix(pix, order) {
    // Guarda o pedido para a página de obrigado (sem CPF)
    try {
      localStorage.setItem("lastOrder", JSON.stringify({
        id: pix.id, orderId: pix.orderId, amount: pix.amount, items: order.items,
        name: order.customer.name, email: order.customer.email, phone: order.customer.phone,
        address: order.address, createdAt: new Date().toISOString()
      }));
    } catch (e) {}

    $("checkoutView").hidden = true;
    $("pixView").hidden = false;
    window.scrollTo(0, 0);

    $("pixAmount").textContent = fmtBRL(pix.amount);
    $("pixCode").value = pix.copiaECola;

    var qr = $("pixQr");
    if (pix.qrCodeBase64) {
      var src = pix.qrCodeBase64.indexOf("data:") === 0 ? pix.qrCodeBase64 : "data:image/png;base64," + pix.qrCodeBase64;
      qr.innerHTML = '<img alt="QR Code PIX" src="' + src + '">';
    } else if (window.qrcode) {
      var q = qrcode(0, "M"); q.addData(pix.copiaECola); q.make();
      qr.innerHTML = q.createImgTag(5, 0);
      qr.querySelector("img").alt = "QR Code PIX";
    } else {
      qr.textContent = "Use o código copia e cola abaixo.";
    }

    if (S.demoMode) $("demoBanner").hidden = false;
    if (pix.sandbox) $("simulateBtn").hidden = false; // só com chave vk_test_ ou demoMode

    // Contagem regressiva real (vem do gateway)
    var exp = new Date(pix.expiresAt).getTime();
    function tick() {
      var s = Math.max(0, Math.round((exp - Date.now()) / 1000));
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), pad = function (n) { return String(n).padStart(2, "0"); };
      $("pixTimer").textContent = (h ? h + "h " : "") + pad(m) + ":" + pad(s % 60);
      if (s === 0) expired();
    }
    tick(); clockTimer = setInterval(tick, 1000);

    pollTimer = setInterval(function () {
      checkStatus(pix.id).then(function (r) {
        if (r && r.status === "paid") paid(pix.orderId);
        else if (r && r.status === "expired") expired();
      }).catch(function () {});
    }, 5000);
  }

  function expired() {
    clearInterval(clockTimer); clearInterval(pollTimer);
    document.querySelector(".pix-status").innerHTML = 'PIX expirado. <a href="">Gerar um novo</a>';
  }

  function paid(id) {
    clearInterval(pollTimer); clearInterval(clockTimer);
    location.href = "obrigado.html?pedido=" + encodeURIComponent(id);
  }

  $("copyBtn").addEventListener("click", function () {
    var btn = this, code = $("pixCode");
    function done() { btn.textContent = "CÓDIGO COPIADO ✓"; setTimeout(function () { btn.textContent = "COPIAR CÓDIGO PIX"; }, 2500); }
    if (navigator.clipboard) navigator.clipboard.writeText(code.value).then(done, function () { code.select(); document.execCommand("copy"); done(); });
    else { code.select(); document.execCommand("copy"); done(); }
  });

  $("simulateBtn").addEventListener("click", function () {
    var o = {};
    try { o = JSON.parse(localStorage.getItem("lastOrder") || "{}"); } catch (e) {}
    if (S.demoMode) return paid(o.orderId || "DEMO");
    // Sandbox VulcanoPay: marca como paga; o polling detecta e redireciona
    this.disabled = true; this.textContent = "Simulando…";
    fetch(S.api.simulate + "?id=" + encodeURIComponent(o.id), { method: "POST" });
  });

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("formError").classList.remove("show");
    if (!validate()) return;

    var btn = $("submitBtn"), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = "Gerando PIX…";
    var order = collectOrder();

    createPix(order)
      .then(function (pix) { showPix(pix, order); })
      .catch(function (err) {
        $("formError").textContent = err.message || "Erro ao gerar o PIX. Tente novamente.";
        $("formError").classList.add("show");
      })
      .finally(function () { btn.disabled = false; btn.innerHTML = label; render(); });
  });
})();
