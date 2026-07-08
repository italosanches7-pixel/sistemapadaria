"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSessao } from "@/lib/sessao";
import { calcularValorEsperadoFechamento, calcularDiferencaFechamento } from "@/lib/calculos";

export type EstadoAbrirTurno = { erro?: string };
export type EstadoFecharTurno = { erro?: string; valorEsperado?: number; diferenca?: number };

export async function obterTurnoAbertoDoOperador(operadorId: string) {
  return prisma.turno.findFirst({
    where: { operadorId, status: "ABERTO" },
    orderBy: { dataAbertura: "desc" },
  });
}

export async function abrirTurno(_estado: EstadoAbrirTurno, formData: FormData): Promise<EstadoAbrirTurno> {
  const sessao = await exigirSessao();
  const fundoTroco = Number(formData.get("fundoTroco"));

  if (Number.isNaN(fundoTroco) || fundoTroco < 0) {
    return { erro: "Informe um valor de fundo de troco válido." };
  }

  const turnoExistente = await obterTurnoAbertoDoOperador(sessao.usuarioId);
  if (turnoExistente) {
    redirect("/caixa");
  }

  await prisma.turno.create({
    data: {
      operadorId: sessao.usuarioId,
      fundoTroco,
    },
  });

  redirect("/caixa");
}

export async function fecharTurno(_estado: EstadoFecharTurno, formData: FormData): Promise<EstadoFecharTurno> {
  const sessao = await exigirSessao();
  const valorContado = Number(formData.get("valorContado"));

  if (Number.isNaN(valorContado) || valorContado < 0) {
    return { erro: "Informe um valor contado válido." };
  }

  const turno = await obterTurnoAbertoDoOperador(sessao.usuarioId);
  if (!turno) {
    return { erro: "Não há turno aberto para fechar." };
  }

  const vendasDinheiro = await prisma.venda.aggregate({
    where: { turnoId: turno.id, formaPagamento: "DINHEIRO", status: "CONCLUIDA" },
    _sum: { valorTotal: true },
  });

  const totalVendasDinheiro = Number(vendasDinheiro._sum.valorTotal ?? 0);
  const valorEsperado = calcularValorEsperadoFechamento(Number(turno.fundoTroco), totalVendasDinheiro);
  const diferenca = calcularDiferencaFechamento(valorContado, valorEsperado);

  await prisma.turno.update({
    where: { id: turno.id },
    data: {
      status: "FECHADO",
      dataFechamento: new Date(),
      valorContado,
      valorEsperado,
    },
  });

  return { valorEsperado, diferenca };
}
