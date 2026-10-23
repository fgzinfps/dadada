/* =================================================================
   CL IMPORTS — DADOS DA LOJA
   Edite só este arquivo: contatos, categorias, produtos, FAQ.
   ================================================================= */

const LOJA = {
  whatsapp: "5500000000000",            // só números: 55 + DDD + número
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
  email: "contato@climports.com.br",
  horario: "Seg a sex, 9h às 18h",
  cnpj: "",
  mostrarPreco: false,                  // false = site sem preços; o cliente consulta pelo WhatsApp
  descontoPix: 0.05,                    // 5% off no Pix
  parcelas: 12,
  avisos: ["Parcele em até 12x", "Frete grátis para todo o Brasil em compras acima de R$499", "5% off no Pix", "100% original"],
  slideMs: 6000                         // tempo de cada destaque no topo
};

// Categorias (abas da vitrine)
const CATEGORIAS = [
  { id: "moletons",   nome: "Moletons" },
  { id: "camisetas",  nome: "Camisetas" },
  { id: "calcas",     nome: "Calças" },
  { id: "shorts",     nome: "Shorts" },
  { id: "tenis",      nome: "Tênis" },
  { id: "acessorios", nome: "Acessórios" }
];

/* Produtos — troque pelos reais.
   fotos:    arquivos em assets/produtos/ (1ª = principal, 2ª = troca no hover). Fundo branco fica perfeito na vitrine.
   destaque: true = aparece no slider do topo. Para o topo, use "fotoDestaque" com PNG SEM FUNDO (fica flutuando no preto).
   novo:     true = aparece em Lançamentos.
   marca:    aparece acima do nome no catálogo e na página do produto (ex.: "Birkenstock").
   preco/de: só aparecem se LOJA.mostrarPreco for true. */
const PRODUTOS = [
  { id: 1, marca: "", nome: "Produto Exemplo 01", cat: "moletons",   preco: 699.90, de: null,   novo: true,  destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["P","M","G","GG"], desc: "Descrição do produto: tecido, modelagem, detalhes e cuidados." },
  { id: 2, marca: "", nome: "Produto Exemplo 02", cat: "camisetas",  preco: 459.90, de: null,   novo: true,  destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["P","M","G","GG"], desc: "Descrição do produto: tecido, modelagem, detalhes e cuidados." },
  { id: 3, marca: "", nome: "Produto Exemplo 03", cat: "tenis",      preco: 899.90, de: 999.90, novo: true,  destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["38","39","40","41","42","43"], desc: "Descrição do produto: material, solado e detalhes." },
  { id: 4, marca: "", nome: "Produto Exemplo 04", cat: "shorts",     preco: 449.90, de: null,   novo: true,  destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["P","M","G","GG"], desc: "Descrição do produto: tecido, modelagem, detalhes e cuidados." },
  { id: 5, marca: "", nome: "Produto Exemplo 05", cat: "moletons",   preco: 719.90, de: null,   novo: true,  destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["P","M","G","GG"], desc: "Descrição do produto: tecido, modelagem, detalhes e cuidados." },
  { id: 6, marca: "", nome: "Produto Exemplo 06", cat: "calcas",     preco: 589.90, de: null,   novo: false, destaque: true, fotos: [], fotoDestaque: "", tamanhos: ["38","40","42","44"], desc: "Descrição do produto: tecido, modelagem, detalhes e cuidados." },
  { id: 7, marca: "", nome: "Produto Exemplo 07", cat: "acessorios", preco: 249.90, de: 299.90, novo: false, destaque: false, fotos: [], fotoDestaque: "", tamanhos: ["Único"], desc: "Descrição do produto." },
  { id: 8, marca: "", nome: "Produto Exemplo 08", cat: "camisetas",  preco: 389.90, de: null,   novo: false, destaque: false, fotos: [], fotoDestaque: "", tamanhos: ["P","M","G","GG"], desc: "Descrição do produto." }
];

// Fotos da comunidade (clientes usando os produtos) — arquivos em assets/produtos/
const COMUNIDADE = ["", "", "", "", ""];

const FAQ = [
  { q: "Os produtos são originais?", a: "Sim. Trabalhamos apenas com produtos originais, com procedência garantida." },
  { q: "Como faço meu pedido?", a: "Adicione os produtos à sacola e clique em “Finalizar pelo WhatsApp”. O pedido chega pronto para a nossa equipe, que confirma estoque, frete e pagamento." },
  { q: "Quais as formas de pagamento?", a: "Pix com desconto, cartão de crédito em até 12x e boleto." },
  { q: "Qual o prazo de entrega?", a: "Enviamos para todo o Brasil com código de rastreio. O prazo depende do CEP e é informado no fechamento do pedido." },
  { q: "Posso trocar?", a: "Sim. Você tem até 7 dias após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor." }
];
