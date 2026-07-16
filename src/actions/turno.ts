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

export async function abrirTurno(_estado: EstadoAbrirTurno, _formData: FormData): Promise<EstadoAbrirTurno> {
  const sessao = await exigirSessao();

  const turnoExistente = await obterTurnoAbertoDoOperador(sessao.usuarioId);
  if (turnoExistente) {
    redirect("/caixa");
  }

  try {
    // Turnos novos abrem sempre sem fundo de troco — a conferência do
    // fechamento compara a gaveta com o que entrou em dinheiro nas vendas.
    await prisma.turno.create({
      data: { operadorId: sessao.usuarioId },
    });
  } catch {
    return { erro: "Não foi possível abrir o caixa. Tente novamente." };
  }

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

  // Soma apenas as partes pagas em dinheiro (uma venda dividida conta só a
  // fração em dinheiro), ignorando vendas canceladas.
  const pagamentosDinheiro = await prisma.pagamentoVenda.aggregate({
    where: {
      formaPagamento: "DINHEIRO",
      venda: { turnoId: turno.id, status: "CONCLUIDA" },
    },
    _sum: { valor: true },
  });

  const totalVendasDinheiro = Number(pagamentosDinheiro._sum.valor ?? 0);
  // fundoTroco é 0 em turnos novos; mantido na soma pelos turnos antigos.
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
