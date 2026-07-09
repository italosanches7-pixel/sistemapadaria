import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Criação/recuperação do administrador:
// - Se NÃO houver ADMIN_LOGIN/ADMIN_SENHA definidos, o admin é criado pela tela de
//   "Primeiro acesso" (/setup) no navegador, na primeira vez que o sistema é aberto.
// - Se ESSAS variáveis estiverem definidas, este seed GARANTE um admin com esse login
//   e senha a cada publicação — criando se não existir, ou REDEFININDO a senha se já
//   existir. É a alavanca de recuperação de acesso (basta ajustar as variáveis e
//   republicar). Também cadastra alguns produtos de exemplo em bancos vazios.
async function main() {
  const loginAdmin = process.env.ADMIN_LOGIN?.trim();
  const senhaAdmin = process.env.ADMIN_SENHA;

  if (loginAdmin && senhaAdmin) {
    const senhaHash = await bcrypt.hash(senhaAdmin, 10);
    await prisma.usuario.upsert({
      where: { login: loginAdmin },
      update: { senhaHash, papel: "ADMIN", ativo: true },
      create: { nome: "Administrador", login: loginAdmin, senhaHash, papel: "ADMIN" },
    });
    console.log(`Administrador garantido (login: ${loginAdmin}); senha (re)definida a partir de ADMIN_SENHA.`);
  } else {
    console.log("ADMIN_LOGIN/ADMIN_SENHA não definidos — o admin será criado pela tela de Primeiro acesso.");
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
