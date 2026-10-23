/* =================================================================
   CL IMPORTS — DADOS DA LOJA
   Contatos, categorias e FAQ. Os produtos ficam em produtos.js.
   ================================================================= */

const LOJA = {
  whatsapp: "5521996465566",            // só números: 55 + DDD + número
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
  email: "contato@climports.com.br",
  horario: "Seg a sex, 9h às 18h",
  cnpj: "",
  mostrarPreco: false,                  // false = site sem preços; o cliente consulta pelo WhatsApp
  descontoPix: 0.05,                    // 5% off no Pix
  parcelas: 12,
  avisos: ["Parcele em até 12x", "Frete grátis para todo o Brasil em compras acima de R$499", "5% off no Pix", "Atendimento direto no WhatsApp"],
  slideMs: 6000                         // tempo de cada destaque no topo
};

// Categorias (abas da vitrine e filtro do catálogo)
const CATEGORIAS = [
  { id: "tenis",     nome: "Tênis" },
  { id: "sandalias", nome: "Sandálias e Slides" },
  { id: "moletons",  nome: "Moletons" },
  { id: "camisetas", nome: "Camisetas" },
  { id: "polos",     nome: "Polos" },
  { id: "tricos",    nome: "Suéteres e Tricô" },
  { id: "jaquetas",  nome: "Jaquetas" },
  { id: "calcas",    nome: "Calças" },
  { id: "shorts",    nome: "Shorts" }
];

// Os produtos ficam em produtos.js (um por linha).

// Fotos da comunidade (clientes usando os produtos) — arquivos em assets/produtos/
const COMUNIDADE = ["", "", "", "", ""];

const FAQ = [
  { q: "Como sei se tem o meu tamanho?", a: "Chame a gente no WhatsApp com o código do produto (ex.: CL-061). Confirmamos numeração e disponibilidade na hora." },
  { q: "Como faço meu pedido?", a: "Adicione os produtos à sacola e clique em “Finalizar pelo WhatsApp”. O pedido chega pronto para a nossa equipe, que confirma estoque, frete e pagamento." },
  { q: "Quais as formas de pagamento?", a: "Pix com desconto, cartão de crédito em até 12x e boleto." },
  { q: "Qual o prazo de entrega?", a: "Enviamos para todo o Brasil com código de rastreio. O prazo depende do CEP e é informado no fechamento do pedido." },
  { q: "Posso trocar?", a: "Sim. Você tem até 7 dias após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor." }
];
