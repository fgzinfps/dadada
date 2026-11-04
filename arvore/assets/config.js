/* ==========================================================================
   CONFIGURAÇÃO DA LOJA — edite aqui (preços em CENTAVOS para evitar erro de
   arredondamento). ATENÇÃO: o servidor (api/pix/create.js) tem o MESMO
   catálogo e é ele que define o valor cobrado. Se mudar preço aqui, mude lá.
   ========================================================================== */
window.STORE = {
  name: "Natal Total",
  legalName: "NATAL TOTAL COMERCIO DE ARTIGOS NATALINOS E PRESENTES LTDA - ME",
  cnpj: "11.003.477/0001-47",
  email: "contato@suaarvorefeliz.com",
  whatsapp: "",                     // TODO: só números, com DDI 55 (vazio = botão escondido)
  metaPixelId: "1829995411297791",  // Meta Pixel (vazio = desligado)
  deliveryText: "Entrega em 7 a 15 dias úteis", // TODO: confirme com seu fornecedor

  // false = usa a VulcanoPay de verdade (precisa estar publicado na Vercel com
  // PIX_API_KEY configurada). true = simula tudo no navegador, sem servidor.
  demoMode: false,
  api: { create: "api/pix/create", status: "api/pix/status", simulate: "api/pix/simulate" },

  product: {
    id: "arvore-210",
    title: "Árvore De Natal Grande 2,10m 1200 Galhos Pinheiro Luxo Premium Verde Cheia Pé De Ferro Galho Grosso 210cm Base Metal",
    shortTitle: "Árvore de Natal Premium 2,10m · 1200 galhos",
    price: 9990,
    rating: 4.8,
    sold: "+1000 vendidos",
    stock: 561,
    maxQty: 4,   // 4 árvores + kit = R$ 449,50 (limite por cobrança da rota: confira em GET /balance)
    images: [
      "assets/img/arvore-principal.jpg",
      "assets/img/arvore-montagem.jpg",
      "assets/img/arvore-guardar.jpg"
    ]
  },

  bump: {
    id: "kit-bolas-100",
    title: "Kit 100 Bolas Estrela Decoração Enfeite Árvore De Natal Pendente Brinde Ponteira Bolinhas Dourada Gold",
    shortTitle: "Kit 100 Enfeites Dourados + Ponteira Estrela",
    price: 4990
  }
};

window.fmtBRL = function (cents) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
