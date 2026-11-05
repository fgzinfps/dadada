# Loja de Pods (estática)

Site estático, sem build e sem dependências: `index.html` + `assets/`.

## Editar
Tudo fica em `assets/config.js`: nome da loja, WhatsApp, frete, desconto Pix, cupons,
produtos, sabores e **estoque por sabor**. O catálogo veio do PDF da Vitrine do Vapor (76 itens, com fotos em `assets/img`). **Sabores e estoque são provisórios**: confira antes de vender.

## Fluxo de compra
Catálogo → modal (sabor + quantidade) → carrinho (cupom, CEP via ViaCEP, Pix/cartão)
→ o pedido vai formatado para o seu WhatsApp. **Não há cobrança online**: você confirma e cobra no WhatsApp.

## O que já tem
- Verificação de idade 18+ (lembrada no navegador) e advertência sanitária no rodapé
- Busca por nome/marca/sabor, filtros por faixa de puffs, "só com estoque", ordenação
  (incluindo **custo por 1k puffs**)
- Estoque por sabor (impede adicionar acima do estoque), esgotados vão pro fim
- Barra de progresso de frete grátis, cupom, desconto Pix, parcelamento
- Carrinho salvo no navegador, responsivo, sem imagens externas (pods desenhados em CSS)

## Testar localmente
```
cd pods && python3 -m http.server 8000
```

## Publicar
Na Vercel, crie um projeto com **Root Directory = `pods`** (o `vercel.json` da raiz redireciona `/` para a árvore).

## Fotos reais
Os pods são desenhados em CSS. Para usar fotos, adicione `image: "assets/img/x.webp"` no produto
e troque `podArt(p)` em `assets/app.js` por um `<img>` quando `p.image` existir.
