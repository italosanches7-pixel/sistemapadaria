import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const loginAdmin = process.env.ADMIN_LOGIN ?? "admin";
  const senhaAdmin = process.env.ADMIN_SENHA ?? "admin123";

  const adminExistente = await prisma.usuario.findUnique({ where: { login: loginAdmin } });
  if (!adminExistente) {
    await prisma.usuario.create({
      data: {
        nome: "Administrador",
        login: loginAdmin,
        senhaHash: await bcrypt.hash(senhaAdmin, 10),
        papel: "ADMIN",
      },
    });
    console.log(`Usuário admin criado (login: ${loginAdmin}).`);
  } else {
    console.log("Usuário admin já existe, pulando criação.");
  }

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
