/* ==========================================================================
   POST /api/pix/simulate?id=…  — SÓ funciona com chave vk_test_ (sandbox).
   Marca a cobrança de teste como paga para você testar o fluxo inteiro.
   Com chave vk_live_ esta rota responde 404 e não faz nada.
   ========================================================================== */
const { sandboxPay, isTestKey } = require("../_lib/vulcano");

module.exports = async function handler(req, res) {
  if (req.method !== "POST" || !isTestKey()) return res.status(404).json({ error: "not_found" });
  const id = String((req.query && req.query.id) || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "id inválido" });
  try {
    const charge = await sandboxPay(id);
    return res.status(200).json({ status: charge.status });
  } catch (err) {
    return res.status(err.status || 502).json({ error: err.message });
  }
};
