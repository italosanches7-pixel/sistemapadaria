"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/sessao";
import { revalidatePath } from "next/cache";
import type { Categoria } from "@prisma/client";

export type EstadoProduto = { erro?: string };

export async function cadastrarProduto(_estado: EstadoProduto, formData: FormData): Promise<EstadoProduto> {
  await exigirAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const preco = Number(formData.get("preco"));
  const categoria = String(formData.get("categoria") ?? "") as Categoria;

  if (!nome) return { erro: "Informe o nome do produto." };
  if (Number.isNaN(preco) || preco <= 0) return { erro: "Informe um preço maior que zero." };

  await prisma.produto.create({ data: { nome, preco, categoria } });

  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return {};
}

export async function alternarProdutoAtivo(produtoId: string): Promise<void> {
  await exigirAdmin();
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) return;

  await prisma.produto.update({ where: { id: produtoId }, data: { ativo: !produto.ativo } });
  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
}

export type ResultadoProduto = { sucesso: boolean; erro?: string };

export async function editarProduto(
  produtoId: string,
  dados: { nome: string; preco: number; categoria: Categoria }
): Promise<ResultadoProduto> {
  await exigirAdmin();

  const nome = dados.nome.trim();
  if (!nome) return { sucesso: false, erro: "Informe o nome do produto." };
  if (Number.isNaN(dados.preco) || dados.preco <= 0) {
    return { sucesso: false, erro: "Informe um preço maior que zero." };
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) return { sucesso: false, erro: "Produto não encontrado." };

  await prisma.produto.update({
    where: { id: produtoId },
    data: { nome, preco: dados.preco, categoria: dados.categoria },
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return { sucesso: true };
}

export async function excluirProduto(produtoId: string): Promise<ResultadoProduto> {
  await exigirAdmin();

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) return { sucesso: false, erro: "Produto não encontrado." };

  // Produtos que já aparecem em vendas não podem ser apagados (o histórico e os
  // relatórios os referenciam). Nesse caso, oriente a inativar.
  const itens = await prisma.itemVenda.count({ where: { produtoId } });
  if (itens > 0) {
    return {
      sucesso: false,
      erro: "Este produto já foi usado em vendas e não pode ser excluído. Use 'Inativar' para tirá-lo do caixa preservando o histórico.",
    };
  }

  await prisma.produto.delete({ where: { id: produtoId } });

  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return { sucesso: true };
}
