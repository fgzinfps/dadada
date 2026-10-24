# Site — Moda Fitness Feminina

Site estático (HTML/CSS/JS puro, sem build). Abra `index.html` ou publique a pasta `fitwear/` em qualquer hospedagem estática (Vercel, Netlify, GitHub Pages).

## Antes de publicar
- `js/config.js`: `marca`, `whatsapp`, `instagram`, `email`, `freteGratisAcimaDe`, `parcelas`
- `js/produtos.js`: catálogo (63 produtos). `preco: null` aparece como "Consulte o preço";
  troque por um número (ex.: `39.9`). Confirme os tamanhos de cada peça.

Também revise em `index.html`: tabela de medidas e textos de prazo/pagamento do FAQ.

## Adicionar produto
Coloque as fotos em `img/` (WebP, retrato 4:5 de preferência) e copie uma linha em `js/produtos.js`. Os filtros por categoria aparecem sozinhos quando houver 2+ categorias.

## Como o pedido funciona
A cliente monta a sacola e clica em "Finalizar pelo WhatsApp": abre uma conversa com o pedido já escrito (itens, cor, tamanho, subtotal). Não há pagamento online.
