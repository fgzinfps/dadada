/* ==========================================================================
   Cliente mínimo da API VulcanoPay (https://api.vulcanopayments.com/v1).
   A chave fica SÓ na variável de ambiente PIX_API_KEY (vk_live_… ou vk_test_…).
   ========================================================================== */
const crypto = require("node:crypto");

const BASE = "https://api.vulcanopayments.com/v1";

function apiKey() {
  const k = process.env.PIX_API_KEY;
  if (!k) throw Object.assign(new Error("PIX_API_KEY não configurada"), { status: 500, code: "config" });
  return k;
}

const isTestKey = () => apiKey().startsWith("vk_test_");

async function call(method, path, body, extraHeaders = {}) {
  const r = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000)
  });
  const text = await r.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch (e) { /* resposta não-JSON */ }
  if (!r.ok) {
    const err = new Error((json.error && json.error.message) || `VulcanoPay HTTP ${r.status}`);
    err.status = r.status;
    err.code = (json.error && json.error.code) || "unknown";
    err.issues = json.error && json.error.issues;
    throw err;
  }
  return json;
}

const createCharge = (payload, idempotencyKey) =>
  call("POST", "/charges", payload, { "Idempotency-Key": idempotencyKey });

const getCharge = (id) => call("GET", `/charges/${encodeURIComponent(id)}`);

const sandboxPay = (id) => call("POST", `/sandbox/charges/${encodeURIComponent(id)}/pay`);

/* Assinatura do webhook: cabeçalho X-Vulcano-Signature "t=…,v1=…",
   v1 = HMAC-SHA256(segredo, `${t}.${corpoBruto}`) em hex. Rejeita > 5 min. */
function validWebhook(rawBody, header, secret) {
  if (!header || !secret) return false;
  const p = Object.fromEntries(String(header).split(",").map((x) => x.trim().split("=")));
  const t = Number(p.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(p.v1 || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { createCharge, getCharge, sandboxPay, validWebhook, isTestKey };
