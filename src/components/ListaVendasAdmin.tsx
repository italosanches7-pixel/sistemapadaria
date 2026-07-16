"use client";

import { useState, useTransition } from "react";
import { cancelarVenda } from "@/actions/venda";

type Venda = {
  id: string;
  dataHora: string;
  operador: string;
  pagamentos: { formaPagamento: string; valor: number }[];
  valorTotal: number;
  status: string;
  canceladoPor: string | null;
  motivoCancelamento: string | null;
  itens: { nomeProduto: string; quantidade: number }[];
};

const ROTULOS_FORMA_PAGAMENTO: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  DEBITO: "Débito",
  CREDITO: "Crédito",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function ListaVendasAdmin({ vendas }: { vendas: Venda[] }) {
  const [vendaEmCancelamento, setVendaEmCancelamento] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pendente, iniciarTransicao] = useTransition();

  function confirmarCancelamento(vendaId: string) {
    iniciarTransicao(async () => {
      await cancelarVenda(vendaId, motivo);
      setVendaEmCancelamento(null);
      setMotivo("");
    });
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-neutral-500">
          <th className="py-1.5 font-medium">Data</th>
          <th className="py-1.5 font-medium">Operador</th>
          <th className="py-1.5 font-medium">Itens</th>
          <th className="py-1.5 font-medium">Pagamento</th>
          <th className="py-1.5 font-medium">Total</th>
          <th className="py-1.5 font-medium">Status</th>
          <th className="py-1.5"></th>
        </tr>
      </thead>
      <tbody>
        {vendas.map((venda) => (
          <tr key={venda.id} className="border-b border-neutral-100 align-top">
            <td className="py-1.5 whitespace-nowrap">{formatarDataHora(venda.dataHora)}</td>
            <td className="py-1.5">{venda.operador}</td>
            <td className="py-1.5 text-neutral-500">
              {venda.itens.map((i) => `${i.quantidade}x ${i.nomeProduto}`).join(", ")}
            </td>
            <td className="py-1.5">
              {venda.pagamentos.length === 1 ? (
                ROTULOS_FORMA_PAGAMENTO[venda.pagamentos[0].formaPagamento] ?? venda.pagamentos[0].formaPagamento
              ) : (
                <div className="flex flex-col gap-0.5">
                  {venda.pagamentos.map((pagamento, i) => (
                    <span key={i} className="whitespace-nowrap text-neutral-600">
                      {ROTULOS_FORMA_PAGAMENTO[pagamento.formaPagamento] ?? pagamento.formaPagamento}{" "}
                      <span className="text-neutral-400">{formatarMoeda(pagamento.valor)}</span>
                    </span>
                  ))}
                </div>
              )}
            </td>
            <td className="py-1.5 font-medium">{formatarMoeda(venda.valorTotal)}</td>
            <td className="py-1.5">
              {venda.status === "CONCLUIDA" ? (
                <span className="text-green-700">Concluída</span>
              ) : (
                <span className="text-red-600" title={venda.motivoCancelamento ?? undefined}>
                  Cancelada{venda.canceladoPor ? ` por ${venda.canceladoPor}` : ""}
                </span>
              )}
            </td>
            <td className="py-1.5 text-right">
              {venda.status === "CONCLUIDA" &&
                (vendaEmCancelamento === venda.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <input
                      autoFocus
                      placeholder="Motivo"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs"
                    />
                    <button
                      disabled={pendente}
                      onClick={() => confirmarCancelamento(venda.id)}
                      className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setVendaEmCancelamento(null)}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setVendaEmCancelamento(venda.id)}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                  >
                    Cancelar venda
                  </button>
                ))}
            </td>
          </tr>
        ))}
        {vendas.length === 0 && (
          <tr>
            <td className="py-1.5 text-neutral-400">Nenhuma venda registrada ainda.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
