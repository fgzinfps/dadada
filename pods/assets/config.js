/* ==========================================================================
   CONFIGURAÇÃO DA LOJA — edite aqui.
   Preços em CENTAVOS (ex.: 8990 = R$ 89,90) para evitar erro de arredondamento.
   Os produtos abaixo são EXEMPLOS: troque nomes, sabores, preços e estoque
   pelos que você realmente tem. Não anuncie o que não tem em mãos.
   ========================================================================== */
window.STORE = {
  name: "CloudBox",
  tagline: "Pods descartáveis originais",
  whatsapp: "5500000000000",   // TODO: só números, com DDI 55 + DDD
  instagram: "",               // TODO: @ sem o arroba (vazio = escondido)
  city: "",                    // TODO: cidade para entrega expressa (vazio = escondido)
  freeShippingFrom: 25000,     // frete grátis a partir de R$ 250
  shippingFlat: 1990,          // frete fixo abaixo do mínimo
  pixDiscount: 0.05,           // 5% no Pix
  maxInstallments: 3,          // parcelas sem juros no cartão
  coupons: { BEMVINDO10: 0.10 }, // cupom: desconto (fração)
  deliveryText: "Envio em até 24h úteis",

  categories: [
    { id: "all",   label: "Todos" },
    { id: "lt10k", label: "Até 10k puffs" },
    { id: "10k",   label: "10k – 20k" },
    { id: "20k",   label: "20k+" },
    { id: "kit",   label: "Kits" },
  ],

  /* Cada produto: id, nome, marca, puffs, preço, preço antigo (opcional),
     cor (gradiente do card), selo (opcional), estoque e sabores.
     Sabor: { name, color, stock } — stock 0 = esgotado. */
  products: [
    {
      id: "nb-8k", name: "Nimbus 8K", brand: "Nimbus", puffs: 8000,
      price: 7990, oldPrice: 9490, colors: ["#7c5cff", "#22d3ee"], badge: "Mais vendido",
      nicotine: "5%", battery: "650 mAh recarregável (USB-C)", liquid: "16 ml",
      flavors: [
        { name: "Grape Ice", color: "#8b5cf6", stock: 14 },
        { name: "Watermelon Ice", color: "#f43f5e", stock: 9 },
        { name: "Mint", color: "#10b981", stock: 22 },
        { name: "Blueberry Ice", color: "#3b82f6", stock: 0 },
      ],
    },
    {
      id: "vx-15k", name: "Vortex 15K", brand: "Vortex", puffs: 15000,
      price: 10990, oldPrice: 12990, colors: ["#f97316", "#ef4444"], badge: "Lançamento",
      nicotine: "5%", battery: "850 mAh recarregável (USB-C)", liquid: "22 ml",
      display: true,
      flavors: [
        { name: "Strawberry Kiwi", color: "#ef4444", stock: 6 },
        { name: "Peach Ice", color: "#fb923c", stock: 11 },
        { name: "Cherry Cola", color: "#991b1b", stock: 3 },
        { name: "Banana Ice", color: "#eab308", stock: 8 },
      ],
    },
    {
      id: "pf-25k", name: "Prism 25K", brand: "Prism", puffs: 25000,
      price: 13990, colors: ["#ec4899", "#8b5cf6"], badge: "Tela digital",
      nicotine: "5%", battery: "1000 mAh recarregável (USB-C)", liquid: "26 ml",
      display: true,
      flavors: [
        { name: "Triple Berry", color: "#a21caf", stock: 7 },
        { name: "Lime Mint", color: "#84cc16", stock: 5 },
        { name: "Passion Fruit", color: "#f59e0b", stock: 4 },
      ],
    },
    {
      id: "nb-5k", name: "Nimbus Mini 5K", brand: "Nimbus", puffs: 5000,
      price: 5490, colors: ["#06b6d4", "#3b82f6"],
      nicotine: "5%", battery: "500 mAh recarregável (USB-C)", liquid: "12 ml",
      flavors: [
        { name: "Ice Mint", color: "#14b8a6", stock: 18 },
        { name: "Lychee Ice", color: "#f472b6", stock: 10 },
        { name: "Mango", color: "#f59e0b", stock: 12 },
      ],
    },
    {
      id: "vx-12k", name: "Vortex Slim 12K", brand: "Vortex", puffs: 12000,
      price: 9490, oldPrice: 10490, colors: ["#22c55e", "#0ea5e9"],
      nicotine: "5%", battery: "650 mAh recarregável (USB-C)", liquid: "18 ml",
      flavors: [
        { name: "Green Apple", color: "#22c55e", stock: 9 },
        { name: "Blue Razz", color: "#2563eb", stock: 0 },
        { name: "Pineapple Ice", color: "#facc15", stock: 6 },
      ],
    },
    {
      id: "pf-40k", name: "Prism Max 40K", brand: "Prism", puffs: 40000,
      price: 17990, colors: ["#f43f5e", "#f59e0b"], badge: "Dual mesh",
      nicotine: "5%", battery: "1200 mAh recarregável (USB-C)", liquid: "30 ml",
      display: true,
      flavors: [
        { name: "Watermelon Bubblegum", color: "#fb7185", stock: 4 },
        { name: "Grape Mint", color: "#7c3aed", stock: 3 },
      ],
    },
    {
      id: "kit-3", name: "Kit 3 Pods 8K", brand: "Nimbus", puffs: 8000, kit: 3,
      price: 20990, oldPrice: 23970, colors: ["#0f172a", "#7c5cff"], badge: "Economize 12%",
      nicotine: "5%", battery: "650 mAh cada", liquid: "16 ml cada",
      flavors: [
        { name: "Mix sortido", color: "#7c5cff", stock: 10 },
        { name: "Só gelados", color: "#22d3ee", stock: 6 },
      ],
    },
    {
      id: "kit-5", name: "Kit 5 Pods 15K", brand: "Vortex", puffs: 15000, kit: 5,
      price: 47990, oldPrice: 54950, colors: ["#111827", "#f97316"], badge: "Revenda",
      nicotine: "5%", battery: "850 mAh cada", liquid: "22 ml cada",
      flavors: [
        { name: "Mix sortido", color: "#f97316", stock: 5 },
      ],
    },
  ],

  faq: [
    ["Os produtos são originais?", "Sim. Trabalhamos só com lotes lacrados e com código de verificação do fabricante na embalagem."],
    ["Como funciona a compra?", "Monte seu carrinho, informe o CEP e finalize. O pedido chega pronto no nosso WhatsApp, onde confirmamos estoque, frete e pagamento."],
    ["Quais formas de pagamento?", "Pix (com desconto) ou cartão em até 3x sem juros."],
    ["Quanto tempo demora a entrega?", "Despachamos em até 24h úteis após a confirmação do pagamento. O prazo dos Correios/transportadora depende do seu CEP."],
    ["E se o pod chegar com defeito?", "Troca garantida em até 7 dias após o recebimento, mediante vídeo de abertura da embalagem."],
    ["Vocês vendem para menores?", "Não. Venda exclusiva para maiores de 18 anos. Podemos pedir documento na entrega."],
  ],
};
