# Loja — Árvore de Natal 2,10m

Fluxo: anúncio → `index.html` (vendas) → `checkout.html` (dados + CEP + order bump + PIX) → `obrigado.html`.

- Preços, estoque, nome da loja, CNPJ, prazo: `assets/config.js` **e** `api/pix/create.js` (o servidor é quem define o valor cobrado).
- `demoMode: true` simula o PIX. Para produção: implementar `createChargeOnGateway` (api/pix/create.js) e `getStatusFromGateway` (api/pix/status.js), configurar `PIX_API_KEY` e mudar `demoMode` para `false`.
- Deploy na Vercel com **Root Directory = `arvore`** (as funções em `api/` só rodam assim).
- Os pedidos ainda NÃO são salvos em lugar nenhum — ver TODO em `api/pix/create.js`.
