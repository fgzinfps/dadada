# CL Imports — site

Site estático, sem build. Páginas: `index.html` (home), `catalogo.html` (catálogo com filtros) e `produto.html?id=N` (página do produto). Abra o arquivo no navegador ou publique a pasta em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages).

Referências: zennaoficial.com.br na home (topo preto com transição glitch, rodapé com wordmark) e assistrend.online nas páginas internas (fundo claro, títulos serifados, catálogo e página de produto).

Arquivos: `dados.js` (conteúdo), `comum.js`/`comum.css` (cabeçalho, rodapé, sacola), `interna.css` (catálogo e produto).

## Como preencher

Contatos, categorias e FAQ ficam em **`dados.js`**; os produtos ficam em **`produtos.js`** (um por linha, gerado a partir das fotos do Drive). Fotos em `assets/produtos/` (WebP otimizado).

- `LOJA.mostrarPreco` — `false` (padrão) esconde todos os preços: aparece "Consultar valor" e o pedido vai como orçamento pelo WhatsApp. Mude para `true` para exibir os preços.
- `LOJA` — WhatsApp (só números, `55` + DDD + número), Instagram, TikTok, e-mail, horário, % de desconto no Pix, avisos da faixa.
- `CATEGORIAS` — abas da vitrine.
- `PRODUTOS` (em `produtos.js`) — marca, nome, categoria, tamanhos, descrição e fotos. `preco`/`de` só aparecem com `mostrarPreco: true`.
  - Coloque as fotos em `assets/produtos/` e liste os nomes em `fotos: ["camiseta-1.jpg", "camiseta-2.jpg"]` (a 2ª aparece no hover).
  - Fotos com **fundo branco** ficam perfeitas na vitrine.
  - `destaque: true` coloca o produto no slider do topo. Para o topo, use `fotoDestaque` com **PNG sem fundo** — o produto fica flutuando no preto, igual à referência.
  - `novo: true` coloca em Lançamentos.

## Checkout

Não há pagamento online: a sacola monta a mensagem do pedido (itens, tamanhos, códigos, subtotal e valor no Pix) e abre o WhatsApp da loja.
