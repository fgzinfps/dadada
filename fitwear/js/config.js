/*
  ============================================================================
  CONFIGURAÇÃO DA LOJA — edite SÓ este arquivo para trocar marca e catálogo.
  ============================================================================
  Campos marcados com TODO são placeholders: troque antes de publicar.
*/
window.LOJA = {
  marca: "Sua Marca Fit",            // TODO: nome real da empresa
  slogan: "Feita para treinar. Pensada para você.",
  whatsapp: "5500000000000",         // TODO: DDI + DDD + número, só dígitos (ex.: 5511987654321)
  instagram: "suamarcafit",          // TODO: @ do Instagram, sem o @
  email: "contato@suamarca.com.br",  // TODO
  freteGratisAcimaDe: 0,             // TODO: valor em reais para frete grátis (0 = não mostra)
  parcelas: 3,                       // TODO: parcelas sem juros exibidas no card

  // Catálogo: veja js/produtos.js
  produtos: window.PRODUTOS || [],
};
