/* ==========================================================================
   GET /api/pix/status?id=<id da cobrança>  ->  { status }
   O checkout consulta a cada 5 s. Devolve só o status (nada de dados pessoais).
   ========================================================================== */
const { getCharge } = require("../_lib/vulcano");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const id = String((req.query && req.query.id) || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "id inválido" });

  try {
    const charge = await getCharge(id);
    return res.status(200).json({ status: charge.status }); // pending | paid | expired | refunded
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ status: "not_found" });
    console.error("Erro status VulcanoPay", err.status, err.code, err.message);
    return res.status(502).json({ status: "unknown" });
  }
};
