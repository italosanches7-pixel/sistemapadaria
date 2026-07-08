import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// O administrador NÃO é criado aqui. Ele é criado pela tela de "Primeiro acesso"
// (/setup) diretamente no navegador, na primeira vez que o sistema é aberto.
// Este seed cuida apenas de deixar alguns produtos de exemplo cadastrados.
async function main() {
  const totalProdutos = await prisma.produto.count();
  if (totalProdutos === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: "Pão Francês (kg)", preco: 14.9, categoria: "PAES" },
        { nome: "Pão de Queijo (un)", preco: 4.5, categoria: "PAES" },
        { nome: "Croissant", preco: 8.9, categoria: "CONFEITARIA" },
        { nome: "Bolo de Chocolate (fatia)", preco: 9.5, categoria: "CONFEITARIA" },
        { nome: "Sonho", preco: 6.0, categoria: "CONFEITARIA" },
        { nome: "Coxinha", preco: 7.5, categoria: "SALGADOS" },
        { nome: "Esfiha", preco: 6.5, categoria: "SALGADOS" },
        { nome: "Café Expresso", preco: 5.0, categoria: "BEBIDAS" },
        { nome: "Suco Natural", preco: 8.0, categoria: "BEBIDAS" },
        { nome: "Refrigerante Lata", preco: 6.0, categoria: "BEBIDAS" },
        { nome: "Leite Integral (litro)", preco: 6.5, categoria: "MERCEARIA" },
      ],
    });
    console.log("Produtos de exemplo cadastrados.");
  } else {
    console.log("Já existem produtos cadastrados, pulando seed de produtos.");
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
