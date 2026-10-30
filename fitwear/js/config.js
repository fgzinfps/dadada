/*
  ============================================================================
  CONFIGURAÇÃO DA LOJA — edite SÓ este arquivo para trocar marca e catálogo.
  ============================================================================
  Campos marcados com TODO são placeholders: troque antes de publicar.
*/
window.LOJA = {
  marca: "LookFit",
  slogan: "Feita para treinar. Pensada para você.",
  whatsapp: "5511976809626",         // DDI + DDD + número, só dígitos
  instagram: "lookfit.sm",           // @ do Instagram, sem o @
  email: "contato@suamarca.com.br",  // TODO
  pedidoMinimo: 100,                 // valor mínimo do pedido em reais (0 = sem mínimo)
  freteGratisAcimaDe: 0,             // TODO: valor em reais para frete grátis (0 = não mostra)
  parcelas: 3,                       // TODO: parcelas sem juros exibidas no card

  // Black Friday: os preços de produtos.js já são os preços da Black ("Preço Black" no site).
  // Antes de "inicio" o site mostra a lista VIP; depois de "fim" o selo e o banner somem sozinhos.
  // "faixas" é opcional: deixe vazio para não dar desconto extra no pedido.
  blackFriday: {
    ativo: true,
    inicio: "2026-10-30T00:00:00-03:00",
    fim: "2026-11-30T23:59:59-03:00",
    faixas: [],  // ex.: [{ acima: 250, desconto: 5 }] daria 5% a mais em pedidos de R$ 250+
  },

  // Cores padrão oferecidas em todas as peças (cada peça pode ter "cores" próprias em produtos.js)
  cores: [
    { nome: "Preto", hex: "#111111" },
    { nome: "Branco", hex: "#ffffff" },
    { nome: "Cinza", hex: "#9ca3af" },
    { nome: "Bege", hex: "#d8c3a5" },
    { nome: "Marrom", hex: "#7a4a2c" },
    { nome: "Vinho", hex: "#7f1d2d" },
    { nome: "Vermelho", hex: "#dc2626" },
    { nome: "Laranja", hex: "#f97316" },
    { nome: "Amarelo", hex: "#facc15" },
    { nome: "Verde", hex: "#16a34a" },
    { nome: "Azul", hex: "#2563eb" },
    { nome: "Azul-marinho", hex: "#1e2a5a" },
    { nome: "Lilás", hex: "#b197fc" },
    { nome: "Roxo", hex: "#7e22ce" },
    { nome: "Rosa", hex: "#f9a8d4" },
    { nome: "Pink", hex: "#ec4899" },
  ],

  // Catálogo: veja js/produtos.js
  produtos: window.PRODUTOS || [],
};
