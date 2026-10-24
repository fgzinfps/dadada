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
  freteGratisAcimaDe: 299,           // TODO: valor em reais (0 desliga a faixa)
  parcelas: 3,                       // TODO: parcelas sem juros exibidas no card

  // ---------------------------------------------------------------------------
  // CATÁLOGO
  // Para adicionar um produto: copie um bloco { ... }, mude o id e os dados,
  // e coloque as fotos em /img. "categoria" alimenta os filtros automaticamente.
  // ---------------------------------------------------------------------------
  produtos: [
    {
      id: "conjunto-compact",
      nome: "Conjunto Compact ARM — Top + Short",
      categoria: "Conjuntos",
      preco: 159.9,                  // TODO: preço real
      precoAntigo: null,             // ex.: 189.9 para mostrar "de/por"
      selo: "Novo",
      cores: [{ nome: "Preto", hex: "#141414" }],
      tamanhos: ["P", "M", "G", "GG"],
      fotos: ["img/conjunto-frente.webp", "img/conjunto-costas.webp"],
      descricao:
        "Top de alcinhas finas com faixa inferior e short de cintura alta com cós largo. Um básico preto que combina com qualquer treino.",
      // TODO: confirme com o fornecedor. Só listei o que dá para ver na foto —
      // não prometa bojo, proteção UV etc. sem ter certeza.
      detalhes: [
        "Top de alcinhas finas com faixa inferior",
        "Short de cintura alta com cós largo",
        "Comprimento médio (acima do joelho)",
      ],
    },
  ],
};
