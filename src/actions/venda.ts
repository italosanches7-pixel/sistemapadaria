"use server";

import { prisma } from "@/lib/prisma";
import { exigirSessao, exigirAdmin } from "@/lib/sessao";
import { calcularTotalVenda } from "@/lib/calculos";
import { obterTurnoAbertoDoOperador } from "@/actions/turno";
import { revalidatePath } from "next/cache";
import type { FormaPagamento } from "@prisma/client";

export type ItemCarrinhoEntrada = { produtoId: string; quantidade: number };

export type ResultadoVenda = { sucesso: boolean; erro?: string; vendaId?: string };

export async function registrarVenda(
  itens: ItemCarrinhoEntrada[],
  formaPagamento: FormaPagamento
): Promise<ResultadoVenda> {
  const sessao = await exigirSessao();

  if (!itens.length) {
    return { sucesso: false, erro: "Adicione ao menos um item à venda." };
  }
  if (itens.some((item) => item.quantidade <= 0)) {
    return { sucesso: false, erro: "Quantidade deve ser maior que zero." };
  }

  const turno = await obterTurnoAbertoDoOperador(sessao.usuarioId);
  if (!turno) {
    return { sucesso: false, erro: "Abra o caixa antes de registrar vendas." };
  }

  const produtoIds = itens.map((item) => item.produtoId);
  const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds }, ativo: true } });

  if (produtos.length !== new Set(produtoIds).size) {
    return { sucesso: false, erro: "Um ou mais produtos não foram encontrados." };
  }

  const itensComPreco = itens.map((item) => {
    const produto = produtos.find((p) => p.id === item.produtoId)!;
    return {
      produtoId: produto.id,
      nomeProduto: produto.nome,
      quantidade: item.quantidade,
      precoUnitario: Number(produto.preco),
    };
  });

  const valorTotal = calcularTotalVenda(itensComPreco);

  const venda = await prisma.venda.create({
    data: {
      turnoId: turno.id,
      operadorId: sessao.usuarioId,
      formaPagamento,
      valorTotal,
      itens: {
        create: itensComPreco,
      },
    },
  });

  revalidatePath("/caixa");
  revalidatePath("/relatorios");
  return { sucesso: true, vendaId: venda.id };
}

export async function cancelarVenda(vendaId: string, motivo: string): Promise<ResultadoVenda> {
  const sessao = await exigirAdmin();

  const venda = await prisma.venda.findUnique({ where: { id: vendaId } });
  if (!venda) {
    return { sucesso: false, erro: "Venda não encontrada." };
  }
  if (venda.status === "CANCELADA") {
    return { sucesso: false, erro: "Esta venda já está cancelada." };
  }

  await prisma.venda.update({
    where: { id: vendaId },
    data: {
      status: "CANCELADA",
      canceladoPorId: sessao.usuarioId,
      canceladoEm: new Date(),
      motivoCancelamento: motivo || null,
    },
  });

  revalidatePath("/admin/vendas");
  revalidatePath("/relatorios");
  return { sucesso: true };
}
