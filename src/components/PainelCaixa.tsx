"use client";

import { useMemo, useState, useTransition } from "react";
import { registrarVenda } from "@/actions/venda";

type Produto = { id: string; nome: string; preco: number; categoria: string };
type ItemCarrinho = { produtoId: string; nome: string; preco: number; quantidade: number };

const FORMAS_PAGAMENTO = [
  { valor: "DINHEIRO", rotulo: "Dinheiro" },
  { valor: "PIX", rotulo: "Pix" },
  { valor: "DEBITO", rotulo: "Débito" },
  { valor: "CREDITO", rotulo: "Crédito" },
] as const;

type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]["valor"];
type LinhaPagamento = { forma: FormaPagamento; valor: string };

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function arredondar(valor: number) {
  return Math.round(valor * 100) / 100;
}

export function PainelCaixa({ produtos }: { produtos: Produto[] }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("DINHEIRO");
  const [dividido, setDividido] = useState(false);
  const [linhasPagamento, setLinhasPagamento] = useState<LinhaPagamento[]>([]);
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

  const total = arredondar(carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0));

  const somaPagamentos = arredondar(
    linhasPagamento.reduce((soma, linha) => soma + (Number(linha.valor) || 0), 0)
  );
  const restante = arredondar(total - somaPagamentos);
  const pagamentosConferem = dividido
    ? Math.abs(restante) < 0.005 && linhasPagamento.every((l) => Number(l.valor) > 0)
    : true;

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

  function iniciarDivisao() {
    setMensagem(null);
    setDividido(true);
    // Começa com a forma já selecionada e o valor total; o operador ajusta e
    // adiciona as demais partes.
    setLinhasPagamento([{ forma: formaPagamento, valor: total > 0 ? String(total) : "" }]);
  }

  function cancelarDivisao() {
    setDividido(false);
    setLinhasPagamento([]);
  }

  function adicionarLinhaPagamento() {
    setLinhasPagamento((atual) => {
      const usadas = new Set(atual.map((l) => l.forma));
      const proximaForma = FORMAS_PAGAMENTO.find((f) => !usadas.has(f.valor))?.valor ?? "DINHEIRO";
      const faltante = arredondar(total - atual.reduce((s, l) => s + (Number(l.valor) || 0), 0));
      return [...atual, { forma: proximaForma, valor: faltante > 0 ? String(faltante) : "" }];
    });
  }

  function alterarLinhaPagamento(indice: number, mudanca: Partial<LinhaPagamento>) {
    setLinhasPagamento((atual) => atual.map((linha, i) => (i === indice ? { ...linha, ...mudanca } : linha)));
  }

  function removerLinhaPagamento(indice: number) {
    setLinhasPagamento((atual) => atual.filter((_, i) => i !== indice));
  }

  function finalizarVenda() {
    if (!carrinho.length) return;
    setMensagem(null);

    const pagamentos = dividido
      ? linhasPagamento.map((linha) => ({ formaPagamento: linha.forma, valor: Number(linha.valor) || 0 }))
      : [{ formaPagamento: formaPagamento, valor: total }];

    iniciarTransicao(async () => {
      const resultado = await registrarVenda(
        carrinho.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
        pagamentos
      );
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Venda registrada com sucesso!" });
        setCarrinho([]);
        setDividido(false);
        setLinhasPagamento([]);
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
              {categoria}
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

        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Pagamento</label>
        <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!dividido}
            onClick={() => dividido && cancelarDivisao()}
            className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition ${
              !dividido ? "bg-white text-brand-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Uma forma
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={dividido}
            onClick={() => !dividido && iniciarDivisao()}
            disabled={carrinho.length === 0}
            className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              dividido ? "bg-white text-brand-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M16 3h5v5" />
              <path d="M8 3H3v5" />
              <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
              <path d="m15 9 6-6" />
            </svg>
            Dividir
          </button>
        </div>

        {!dividido ? (
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
            className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            {FORMAS_PAGAMENTO.map((forma) => (
              <option key={forma.valor} value={forma.valor}>
                {forma.rotulo}
              </option>
            ))}
          </select>
        ) : (
          <div className="mb-3">
            <div className="flex flex-col gap-1.5">
              {linhasPagamento.map((linha, indice) => {
                // Cada linha só oferece formas ainda não usadas nas demais,
                // impedindo repetir a mesma forma de pagamento.
                const usadasEmOutras = new Set(
                  linhasPagamento.filter((_, i) => i !== indice).map((l) => l.forma)
                );
                const opcoesDisponiveis = FORMAS_PAGAMENTO.filter(
                  (forma) => forma.valor === linha.forma || !usadasEmOutras.has(forma.valor)
                );
                return (
                <div key={indice} className="flex items-center gap-1.5">
                  <select
                    value={linha.forma}
                    onChange={(e) => alterarLinhaPagamento(indice, { forma: e.target.value as FormaPagamento })}
                    className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                  >
                    {opcoesDisponiveis.map((forma) => (
                      <option key={forma.valor} value={forma.valor}>
                        {forma.rotulo}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="R$"
                    value={linha.valor}
                    onChange={(e) => alterarLinhaPagamento(indice, { valor: e.target.value })}
                    className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                  />
                  {linhasPagamento.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerLinhaPagamento(indice)}
                      aria-label="Remover pagamento"
                      className="h-7 w-7 rounded border border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                    >
                      ×
                    </button>
                  )}
                </div>
                );
              })}
            </div>

            {linhasPagamento.length < FORMAS_PAGAMENTO.length && (
              <button
                type="button"
                onClick={adicionarLinhaPagamento}
                className="mt-1.5 text-sm font-medium text-brand-700 hover:underline"
              >
                + Adicionar forma de pagamento
              </button>
            )}

            <p
              className={`mt-1.5 text-sm font-medium ${
                pagamentosConferem ? "text-green-700" : "text-red-600"
              }`}
            >
              {pagamentosConferem
                ? "✓ Os pagamentos somam o total."
                : restante > 0
                  ? `Falta ${formatarMoeda(restante)}`
                  : `Passou ${formatarMoeda(Math.abs(restante))}`}
            </p>
          </div>
        )}

        {mensagem && (
          <p className={`mb-3 text-sm ${mensagem.tipo === "sucesso" ? "text-green-700" : "text-red-600"}`}>
            {mensagem.texto}
          </p>
        )}

        <button
          onClick={finalizarVenda}
          disabled={pendente || carrinho.length === 0 || !pagamentosConferem}
          className="w-full rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {pendente ? "Registrando..." : "Finalizar venda"}
        </button>
      </div>
    </div>
  );
}
