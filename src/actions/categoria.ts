"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/sessao";
import { revalidatePath } from "next/cache";

export type EstadoCategoria = { erro?: string; ok?: boolean };
export type ResultadoCategoria = { sucesso: boolean; erro?: string };

export async function cadastrarCategoria(_estado: EstadoCategoria, formData: FormData): Promise<EstadoCategoria> {
  await exigirAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome da categoria." };

  const existente = await prisma.categoria.findUnique({ where: { nome } });
  if (existente) return { erro: "Já existe uma categoria com esse nome." };

  try {
    await prisma.categoria.create({ data: { nome } });
  } catch {
    return { erro: "Não foi possível salvar a categoria. Tente novamente." };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return { ok: true };
}

export async function renomearCategoria(categoriaId: string, novoNome: string): Promise<ResultadoCategoria> {
  await exigirAdmin();

  const nome = novoNome.trim();
  if (!nome) return { sucesso: false, erro: "Informe o nome da categoria." };

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) return { sucesso: false, erro: "Categoria não encontrada." };

  const conflito = await prisma.categoria.findUnique({ where: { nome } });
  if (conflito && conflito.id !== categoriaId) {
    return { sucesso: false, erro: "Já existe uma categoria com esse nome." };
  }

  // Renomeia a categoria e atualiza os produtos que a usavam, para manterem o vínculo.
  await prisma.$transaction([
    prisma.produto.updateMany({ where: { categoria: categoria.nome }, data: { categoria: nome } }),
    prisma.categoria.update({ where: { id: categoriaId }, data: { nome } }),
  ]);

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return { sucesso: true };
}

export async function alternarCategoriaAtiva(categoriaId: string): Promise<void> {
  await exigirAdmin();
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) return;

  await prisma.categoria.update({ where: { id: categoriaId }, data: { ativo: !categoria.ativo } });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
}

export async function excluirCategoria(categoriaId: string): Promise<ResultadoCategoria> {
  await exigirAdmin();

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) return { sucesso: false, erro: "Categoria não encontrada." };

  // Não permite excluir categoria que ainda tem produtos vinculados.
  const produtos = await prisma.produto.count({ where: { categoria: categoria.nome } });
  if (produtos > 0) {
    return {
      sucesso: false,
      erro: "Esta categoria tem produtos vinculados. Mova ou remova esses produtos, ou apenas desative a categoria.",
    };
  }

  await prisma.categoria.delete({ where: { id: categoriaId } });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/caixa");
  return { sucesso: true };
}
