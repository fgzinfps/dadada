/* ==========================================================================
   POST /api/pix/create  — cria a cobrança PIX na VulcanoPay.
   O servidor RECALCULA o valor pelo catálogo abaixo; o total enviado pelo
   navegador é ignorado. O pedido completo (itens + endereço) vai no
   `metadata` da cobrança, então todo pedido pago fica consultável no painel
   da VulcanoPay e em GET /charges?status=paid — mesmo sem banco de dados.
   ========================================================================== */
const crypto = require("node:crypto");
const { createCharge, isTestKey } = require("../_lib/vulcano");

// Catálogo oficial (centavos). Mantenha igual ao assets/config.js.
const CATALOG = {
  "arvore-210":    { name: "Arvore Natal 2,10m 1200 galhos", price: 9990, maxQty: 4 },
  "kit-bolas-100": { name: "Kit 100 bolas + ponteira",       price: 4990, maxQty: 1 }
};
const MAIN_PRODUCT = "arvore-210";

const digits = (v) => String(v || "").replace(/\D/g, "");
const clip = (v, n) => String(v || "").trim().slice(0, n);

function validCPF(c) {
  c = digits(c);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (let t = 9; t < 11; t++) {
    let s = 0;
    for (let i = 0; i < t; i++) s += +c[i] * (t + 1 - i);
    if (((10 * s) % 11) % 10 !== +c[t]) return false;
  }
  return true;
}

// Erros da VulcanoPay que fazem sentido mostrar ao cliente (mensagem já vem em PT)
const SHOW_TO_CUSTOMER = new Set(["payer_blocked", "payer_limit", "amount_too_high", "amount_too_low"]);

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON inválido" }); } }
  const { items = [], customer = {}, address = {}, tracking = {} } = body;

  // ---- Itens e total (no servidor) ----
  let amount = 0;
  const lines = [];
  for (const it of Array.isArray(items) ? items : []) {
    const p = CATALOG[it && it.id];
    const qty = parseInt(it && it.qty, 10);
    if (!p || !(qty >= 1 && qty <= p.maxQty) || lines.some((l) => l.id === it.id))
      return res.status(400).json({ error: "Item inválido no pedido." });
    amount += p.price * qty;
    lines.push({ id: it.id, name: p.name, qty });
  }
  if (!lines.some((l) => l.id === MAIN_PRODUCT)) return res.status(400).json({ error: "Pedido sem o produto principal." });

  // ---- Cliente e endereço ----
  const name = clip(customer.name, 120);
  const email = clip(customer.email, 120);
  const phone = digits(customer.phone).slice(0, 11);
  const cpf = digits(customer.cpf);
  if (name.split(/\s+/).length < 2) return res.status(400).json({ error: "Informe nome e sobrenome." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "E-mail inválido." });
  if (phone.length < 10) return res.status(400).json({ error: "Telefone inválido." });
  if (!validCPF(cpf)) return res.status(400).json({ error: "CPF inválido." });
  const cep = digits(address.cep);
  if (cep.length !== 8 || !address.street || !address.number || !address.district || !address.city || !/^[A-Z]{2}$/.test(address.state || ""))
    return res.status(400).json({ error: "Endereço incompleto." });

  const orderId = "PED-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  // metadata: até 30 campos / 4.000 caracteres — só strings curtas
  const metadata = {
    pedido: orderId,
    itens: lines.map((l) => `${l.qty}x ${l.name}`).join(" | "),
    tem_bump: lines.some((l) => l.id === "kit-bolas-100") ? "sim" : "nao",
    cep,
    rua: clip(address.street, 120),
    numero: clip(address.number, 20),
    complemento: clip(address.complement, 80),
    bairro: clip(address.district, 80),
    cidade: clip(address.city, 80),
    uf: address.state
  };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    if (tracking && tracking[k]) metadata[k] = clip(tracking[k], 100);
  }

  try {
    const charge = await createCharge({
      amount,
      description: clip(`Pedido ${orderId} - ${metadata.itens}`, 140),
      external_id: orderId,
      customer: { name, document: cpf, email, phone },
      metadata
    }, orderId);

    console.log("PIX criado", JSON.stringify({ orderId, chargeId: charge.id, amount, livemode: charge.livemode }));

    return res.status(200).json({
      id: charge.id,
      orderId,
      amount: charge.amount,
      copiaECola: charge.pix && charge.pix.copy_paste,
      qrCodeBase64: charge.pix && charge.pix.qr_code,
      expiresAt: charge.expires_at,
      livemode: charge.livemode,
      sandbox: isTestKey()
    });
  } catch (err) {
    console.error("Erro VulcanoPay", err.status, err.code, err.message, JSON.stringify(err.issues || null));
    if (SHOW_TO_CUSTOMER.has(err.code)) return res.status(422).json({ error: err.message });
    return res.status(502).json({ error: "Não foi possível gerar o PIX agora. Tente novamente em instantes." });
  }
};
