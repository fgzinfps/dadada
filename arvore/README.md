# Loja — Árvore de Natal 2,10m

Fluxo: anúncio → `index.html` (vendas) → `checkout.html` (dados + CEP + order bump + PIX VulcanoPay) → `obrigado.html`.

## Publicar na Vercel
1. Importe o repositório e defina **Root Directory = `arvore`**.
2. Em *Settings → Environment Variables*:
   - `PIX_API_KEY` = sua chave `vk_test_…` (para testar) ou `vk_live_…` (produção). **Nunca no código.**
   - `VULCANO_WEBHOOK_SECRET` = segredo `whsec_…` do webhook.
3. No painel da VulcanoPay → Webhooks, cadastre `https://SEU-DOMINIO/api/pix/webhook` (eventos `charge.paid`, `charge.refunded`).
4. Teste com `vk_test_`: no checkout aparece o botão "Simular pagamento aprovado". Depois troque para `vk_live_` e faça redeploy.

## Onde ficam os pedidos
Cada cobrança leva o pedido no `metadata` (itens, endereço, CEP, UTMs). Pedidos pagos: painel VulcanoPay (cobranças pagas) ou `GET /v1/charges?status=paid`. O webhook também registra cada `PEDIDO PAGO` nos logs da Vercel.
**Pedido com `charge.refunded` (MED) não deve ser enviado.**

## Preços
`assets/config.js` (visual) **e** `api/pix/create.js` (o que é cobrado). Mantenha iguais.
