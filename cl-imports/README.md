# CL Imports — site

Site estático (um único `index.html`, sem build). Abra o arquivo no navegador ou publique a pasta em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages).

Referências usadas: zennaoficial.com.br (hero preto com transição glitch, vitrine branca, abas de categoria, rodapé com wordmark) e assistrend.online (tipografia serifada, faixa de benefícios, comunidade).

## Como preencher

Tudo que muda fica no bloco **CONFIGURAÇÃO DA LOJA** no início do `<script>` em `index.html`:

- `LOJA` — WhatsApp (só números, `55` + DDD + número), Instagram, TikTok, e-mail, horário, % de desconto no Pix, avisos da faixa.
- `CATEGORIAS` — abas da vitrine.
- `PRODUTOS` — nome, categoria, preço, preço antigo (`de`), tamanhos, descrição e fotos.
  - Coloque as fotos em `assets/produtos/` e liste os nomes em `fotos: ["camiseta-1.jpg", "camiseta-2.jpg"]` (a 2ª aparece no hover).
  - Fotos com **fundo branco** ficam perfeitas na vitrine.
  - `destaque: true` coloca o produto no slider do topo. Para o topo, use `fotoDestaque` com **PNG sem fundo** — o produto fica flutuando no preto, igual à referência.
  - `novo: true` coloca em Lançamentos.
- `COMUNIDADE` — fotos de clientes (também em `assets/produtos/`).

## Checkout

Não há pagamento online: a sacola monta a mensagem do pedido (itens, tamanhos, códigos, subtotal e valor no Pix) e abre o WhatsApp da loja.
