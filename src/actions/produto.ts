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
