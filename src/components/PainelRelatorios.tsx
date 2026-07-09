"use client";

import { useEffect, useState, useTransition } from "react";
import { gerarRelatorio, type RelatorioVendas } from "@/actions/relatorio";
import type { Periodo } from "@/lib/periodo";

const OPCOES_PERIODO: { valor: Periodo; rotulo: string }[] = [
  { valor: "dia", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Esta semana" },
  { valor: "quinzena", rotulo: "Esta quinzena" },
  { valor: "mes", rotulo: "Este mês" },
];

const ROTULOS_FORMA_PAGAMENTO: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  DEBITO: "Débito",
  CREDITO: "Crédito",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function PainelRelatorios() {
  const [periodo, setPeriodo] = useState<Periodo | "customizado">("dia");
  const [inicioCustom, setInicioCustom] = useState("");
  const [fimCustom, setFimCustom] = useState("");
  const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
  const [pendente, iniciarTransicao] = useTransition();

  function carregar(periodoSelecionado: Periodo | "customizado", inicio?: string, fim?: string) {
    iniciarTransicao(async () => {
      const dados = await gerarRelatorio(periodoSelecionado, inicio, fim);
      setRelatorio(dados);
    });
  }

  useEffect(() => {
    carregar("dia");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selecionarAtalho(valor: Periodo) {
    setPeriodo(valor);
    carregar(valor);
  }

  function aplicarIntervaloCustomizado() {
    if (!inicioCustom || !fimCustom) return;
    setPeriodo("customizado");
    carregar("customizado", inicioCustom, fimCustom);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {OPCOES_PERIODO.map((opcao) => (
          <button
            key={opcao.valor}
            onClick={() => selecionarAtalho(opcao.valor)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
              periodo === opcao.valor
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {opcao.rotulo}
          </button>
        ))}

        <div className="ml-2 flex items-center gap-2 text-sm">
          <input
            type="date"
            value={inicioCustom}
            onChange={(e) => setInicioCustom(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
          <span className="text-neutral-400">até</span>
          <input
            type="date"
            value={fimCustom}
            onChange={(e) => setFimCustom(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
          <button
            onClick={aplicarIntervaloCustomizado}
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Aplicar
          </button>
        </div>
      </div>

      {pendente && <p className="text-sm text-neutral-400">Carregando...</p>}

      {relatorio && !pendente && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-neutral-500">
            Período: {formatarData(relatorio.inicio)} até {formatarData(relatorio.fim)}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CardKPI titulo="Faturamento" valor={formatarMoeda(relatorio.faturamentoTotal)} />
            <CardKPI titulo="Nº de vendas" valor={String(relatorio.numeroVendas)} />
            <CardKPI titulo="Ticket médio" valor={formatarMoeda(relatorio.ticketMedio)} />
            <CardKPI titulo="Cancelamentos" valor={String(relatorio.quantidadeCancelamentos)} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Por forma de pagamento
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {relatorio.porFormaPagamento.map((linha) => (
                    <tr key={linha.formaPagamento} className="border-b border-neutral-100">
                      <td className="py-1.5">{ROTULOS_FORMA_PAGAMENTO[linha.formaPagamento] ?? linha.formaPagamento}</td>
                      <td className="py-1.5 text-neutral-500">{linha.quantidade} vendas</td>
                      <td className="py-1.5 text-right font-medium">{formatarMoeda(linha.total)}</td>
                    </tr>
                  ))}
                  {relatorio.porFormaPagamento.length === 0 && (
                    <tr>
                      <td className="py-1.5 text-neutral-400">Sem vendas no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Por operador</h2>
              <table className="w-full text-sm">
                <tbody>
                  {relatorio.porOperador.map((linha) => (
                    <tr key={linha.nome} className="border-b border-neutral-100">
                      <td className="py-1.5">{linha.nome}</td>
                      <td className="py-1.5 text-neutral-500">{linha.quantidade} vendas</td>
                      <td className="py-1.5 text-right font-medium">{formatarMoeda(linha.total)}</td>
                    </tr>
                  ))}
                  {relatorio.porOperador.length === 0 && (
                    <tr>
                      <td className="py-1.5 text-neutral-400">Sem vendas no período.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Produtos mais vendidos
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-1.5 font-medium">Produto</th>
                  <th className="py-1.5 font-medium">Quantidade</th>
                  <th className="py-1.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.rankingProdutos.map((linha) => (
                  <tr key={linha.nome} className="border-b border-neutral-100">
                    <td className="py-1.5">{linha.nome}</td>
                    <td className="py-1.5 text-neutral-500">{linha.quantidade}</td>
                    <td className="py-1.5 text-right font-medium">{formatarMoeda(linha.total)}</td>
                  </tr>
                ))}
                {relatorio.rankingProdutos.length === 0 && (
                  <tr>
                    <td className="py-1.5 text-neutral-400">Sem vendas no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CardKPI({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{titulo}</div>
      <div className="mt-1 text-lg font-semibold text-neutral-900">{valor}</div>
    </div>
  );
}
