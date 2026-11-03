/* ==========================================================================
   GET /api/pix/status?id=...  ->  { status: "pending" | "paid" | "expired" }
   O checkout consulta isto a cada 5 s. O ideal é o gateway avisar via
   webhook e você gravar "paid" no banco; aqui só lemos esse status.
   ========================================================================== */
module.exports = async function handler(req, res) {
  const id = req.query && req.query.id;
  if (!id) return res.status(400).json({ error: "id obrigatório" });

  try {
    const status = await getStatusFromGateway(id);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ status });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ status: "unknown" });
  }
};

// TODO: substituir pela chamada real (ou leitura do banco atualizado pelo webhook)
async function getStatusFromGateway(id) {
  // const r = await fetch(`https://api.SEU-GATEWAY.com/v1/pix/${id}`, {
  //   headers: { Authorization: `Bearer ${process.env.PIX_API_KEY}` }
  // });
  // const j = await r.json();
  // return j.status === "PAID" ? "paid" : j.status === "EXPIRED" ? "expired" : "pending";
  return "pending";
}
