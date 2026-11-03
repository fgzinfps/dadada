/* ==========================================================================
   POST /api/pix/webhook  — recebe avisos da VulcanoPay.
   Cadastre no painel (Webhooks): https://SEU-DOMINIO/api/pix/webhook
   e coloque o segredo (whsec_…) na variável VULCANO_WEBHOOK_SECRET.

   Hoje ele só confere a assinatura e registra o pedido pago nos logs da
   Vercel. Próximo passo: gravar no banco / avisar você no WhatsApp/e-mail.
   ========================================================================== */
const { validWebhook } = require("../_lib/vulcano");

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const raw = await readRaw(req);
  if (!validWebhook(raw, req.headers["x-vulcano-signature"], process.env.VULCANO_WEBHOOK_SECRET)) {
    console.warn("Webhook com assinatura inválida rejeitado");
    return res.status(401).json({ error: "assinatura inválida" });
  }

  let evt;
  try { evt = JSON.parse(raw); } catch { return res.status(400).end(); }

  // Nunca liberar pedido real com evento de teste (e vice-versa)
  const expectLive = String(process.env.PIX_API_KEY || "").startsWith("vk_live_");
  if (evt.livemode !== expectLive) {
    console.warn("Webhook ignorado: livemode", evt.livemode, "não bate com a chave configurada");
    return res.status(200).json({ ignored: true });
  }

  const c = evt.data || {};
  if (evt.event === "charge.paid") {
    const m = c.metadata || {};
    console.log("PEDIDO PAGO", JSON.stringify({
      evento: evt.id, cobranca: c.id, pedido: c.external_id, valor: c.amount, liquido: c.net,
      cliente: c.customer && c.customer.name, telefone: c.customer && c.customer.phone,
      itens: m.itens, endereco: `${m.rua}, ${m.numero} ${m.complemento || ""} - ${m.bairro} - ${m.cidade}/${m.uf} - CEP ${m.cep}`
    }));
    // TODO: salvar no banco (idempotente por evt.id) e notificar você.
  } else if (evt.event === "charge.refunded") {
    console.warn("ESTORNO (MED)", c.id, c.external_id, c.amount, "— NÃO envie / bloqueie este pedido");
  } else {
    console.log("Webhook", evt.event, c.id);
  }

  return res.status(200).json({ ok: true });
}

module.exports = handler;
// Necessário para ler o corpo bruto (a assinatura é sobre o corpo exato)
module.exports.config = { api: { bodyParser: false } };
