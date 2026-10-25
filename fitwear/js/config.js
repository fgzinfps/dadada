/*
  ============================================================================
  CONFIGURAÇÃO DA LOJA — edite SÓ este arquivo para trocar marca e catálogo.
  ============================================================================
  Campos marcados com TODO são placeholders: troque antes de publicar.
*/
window.LOJA = {
  marca: "LookFit",
  slogan: "Feita para treinar. Pensada para você.",
  whatsapp: "5521984508660",         // DDI + DDD + número, só dígitos
  instagram: "lookfit.sm",           // @ do Instagram, sem o @
  email: "contato@suamarca.com.br",  // TODO
  pedidoMinimo: 100,                 // valor mínimo do pedido em reais (0 = sem mínimo)
  freteGratisAcimaDe: 0,             // TODO: valor em reais para frete grátis (0 = não mostra)
  parcelas: 3,                       // TODO: parcelas sem juros exibidas no card

  // Catálogo: veja js/produtos.js
  produtos: window.PRODUTOS || [],
};
