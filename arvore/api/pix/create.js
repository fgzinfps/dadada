/* ==========================================================================
   POST /api/pix/create  (Vercel Serverless Function — Node 18+)
   Recebe o pedido, RECALCULA o valor pelo catálogo do servidor e cria a
   cobrança PIX no gateway. A chave da API fica em variável de ambiente
   (PIX_API_KEY) — NUNCA no front-end.

   >>> Ponto de integração: função `createChargeOnGateway` lá embaixo. <<<
   ========================================================================== */

// Catálogo oficial (preço em centavos). O navegador não decide preço.
const CATALOG = {
  "arvore-210":    { name: "Árvore de Natal Premium 2,10m 1200 galhos", price: 9990, maxQty: 5 },
  "kit-bolas-100": { name: "Kit 100 Bolas Estrela Dourada + Ponteira",   price: 4990, maxQty: 1 }
};
const MAIN_PRODUCT = "arvore-210";

const digits = (v) => String(v || "").replace(/\D/g, "");

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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { items = [], customer = {}, address = {}, tracking = {} } = body;

  // ---- Valida itens e calcula total no servidor ----
  let amount = 0;
  const lines = [];
  for (const it of items) {
    const p = CATALOG[it && it.id];
    const qty = parseInt(it && it.qty, 10);
    if (!p || !(qty >= 1 && qty <= p.maxQty)) return res.status(400).json({ error: "Item inválido no pedido." });
    amount += p.price * qty;
    lines.push({ id: it.id, name: p.name, qty, unitPrice: p.price });
  }
  if (!lines.some((l) => l.id === MAIN_PRODUCT)) return res.status(400).json({ error: "Pedido sem o produto principal." });

  // ---- Valida cliente / endereço ----
  if (!customer.name || customer.name.trim().split(/\s+/).length < 2) return res.status(400).json({ error: "Nome inválido." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email || "")) return res.status(400).json({ error: "E-mail inválido." });
  if (!validCPF(customer.cpf)) return res.status(400).json({ error: "CPF inválido." });
  if (digits(address.cep).length !== 8 || !address.street || !address.number || !address.city || !address.state)
    return res.status(400).json({ error: "Endereço incompleto." });

  const order = {
    id: "PED" + Date.now().toString(36).toUpperCase(),
    amount, lines, customer: { ...customer, cpf: digits(customer.cpf), phone: digits(customer.phone) },
    address: { ...address, cep: digits(address.cep) }, tracking,
    status: "pending", createdAt: new Date().toISOString()
  };

  try {
    const pix = await createChargeOnGateway(order);
    // TODO: SALVAR o pedido (order + pix.gatewayId) num banco (Supabase, planilha, etc.).
    // Sem isso você recebe o dinheiro e NÃO sabe para onde enviar a árvore.
    return res.status(200).json({
      id: pix.gatewayId,
      amount,
      copiaECola: pix.copiaECola,
      qrCodeBase64: pix.qrCodeBase64 || null,
      expiresAt: pix.expiresAt
    });
  } catch (err) {
    console.error("Erro no gateway PIX:", err);
    return res.status(502).json({ error: "Não foi possível gerar o PIX agora. Tente novamente em instantes." });
  }
};

/* --------------------------------------------------------------------------
   INTEGRAÇÃO COM O GATEWAY — substituir quando a documentação da API chegar.
   Deve devolver: { gatewayId, copiaECola, qrCodeBase64?, expiresAt (ISO) }
   -------------------------------------------------------------------------- */
async function createChargeOnGateway(order) {
  const apiKey = process.env.PIX_API_KEY;
  if (!apiKey) throw new Error("PIX_API_KEY não configurada");

  // Exemplo genérico (os nomes dos campos mudam em cada gateway):
  // const r = await fetch("https://api.SEU-GATEWAY.com/v1/pix", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     amount: order.amount,                 // centavos ou reais? confira na doc
  //     external_id: order.id,
  //     expires_in: 900,
  //     payer: { name: order.customer.name, document: order.customer.cpf, email: order.customer.email },
  //     webhook_url: `${process.env.SITE_URL}/api/pix/webhook`
  //   })
  // });
  // const j = await r.json();
  // if (!r.ok) throw new Error(JSON.stringify(j));
  // return { gatewayId: j.id, copiaECola: j.qr_code, qrCodeBase64: j.qr_code_base64, expiresAt: j.expires_at };

  throw new Error("Gateway PIX ainda não integrado");
}
