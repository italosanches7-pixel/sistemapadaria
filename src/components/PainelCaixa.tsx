"use client";

import { useMemo, useState, useTransition } from "react";
import { registrarVenda } from "@/actions/venda";

type Produto = { id: string; nome: string; preco: number; categoria: string };
type ItemCarrinho = { produtoId: string; nome: string; preco: number; quantidade: number };

const ROTULOS_CATEGORIA: Record<string, string> = {
  PAES: "Pães",
  CONFEITARIA: "Confeitaria",
  SALGADOS: "Salgados",
  BEBIDAS: "Bebidas",
  MERCEARIA: "Mercearia",
};

const FORMAS_PAGAMENTO = [
  { valor: "DINHEIRO", rotulo: "Dinheiro" },
  { valor: "PIX", rotulo: "Pix" },
  { valor: "DEBITO", rotulo: "Débito" },
  { valor: "CREDITO", rotulo: "Crédito" },
] as const;

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PainelCaixa({ produtos }: { produtos: Produto[] }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<(typeof FORMAS_PAGAMENTO)[number]["valor"]>("DINHEIRO");
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [pendente, iniciarTransicao] = useTransition();

  const produtosPorCategoria = useMemo(() => {
    const grupos = new Map<string, Produto[]>();
    for (const produto of produtos) {
      const lista = grupos.get(produto.categoria) ?? [];
      lista.push(produto);
      grupos.set(produto.categoria, lista);
    }
    return grupos;
  }, [produtos]);

  const total = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  function adicionarAoCarrinho(produto: Produto) {
    setMensagem(null);
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id);
      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...atual, { produtoId: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 }];
    });
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho((atual) =>
      atual
        .map((item) => (item.produtoId === produtoId ? { ...item, quantidade: item.quantidade + delta } : item))
        .filter((item) => item.quantidade > 0)
    );
  }

  function finalizarVenda() {
    if (!carrinho.length) return;
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await registrarVenda(
        carrinho.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
        formaPagamento
      );
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Venda registrada com sucesso!" });
        setCarrinho([]);
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível registrar a venda." });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        {Array.from(produtosPorCategoria.entries()).map(([categoria, itens]) => (
          <div key={categoria} className="mb-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {ROTULOS_CATEGORIA[categoria] ?? categoria}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {itens.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm hover:border-brand-600 hover:bg-brand-50"
                >
                  <div className="text-sm font-medium text-neutral-900">{produto.nome}</div>
                  <div className="text-sm text-brand-800">{formatarMoeda(produto.preco)}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {produtos.length === 0 && (
          <p className="text-sm text-neutral-500">
            Nenhum produto cadastrado ainda. Peça a um administrador para cadastrar produtos.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:sticky md:top-4 md:h-fit">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Carrinho</h2>

        {carrinho.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhum item adicionado.</p>
        ) : (
          <ul className="mb-4 flex flex-col gap-2">
            {carrinho.map((item) => (
              <li key={item.produtoId} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-neutral-800">{item.nome}</div>
                  <div className="text-neutral-500">{formatarMoeda(item.preco)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => alterarQuantidade(item.produtoId, -1)}
                    className="h-6 w-6 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.quantidade}</span>
                  <button
                    onClick={() => alterarQuantidade(item.produtoId, 1)}
                    className="h-6 w-6 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-3 flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
          <span>Total</span>
          <span>{formatarMoeda(total)}</span>
        </div>

        <label className="mb-1 block text-sm font-medium text-neutral-700">Forma de pagamento</label>
        <select
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value as typeof formaPagamento)}
          className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2"
        >
          {FORMAS_PAGAMENTO.map((forma) => (
            <option key={forma.valor} value={forma.valor}>
              {forma.rotulo}
            </option>
          ))}
        </select>

        {mensagem && (
          <p className={`mb-3 text-sm ${mensagem.tipo === "sucesso" ? "text-green-700" : "text-red-600"}`}>
            {mensagem.texto}
          </p>
        )}

        <button
          onClick={finalizarVenda}
          disabled={pendente || carrinho.length === 0}
          className="w-full rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {pendente ? "Registrando..." : "Finalizar venda"}
        </button>
      </div>
    </div>
  );
}
