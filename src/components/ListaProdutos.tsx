"use client";

import { useState, useTransition } from "react";
import { alternarProdutoAtivo, editarProduto, excluirProduto } from "@/actions/produto";
import type { Categoria } from "@prisma/client";

type Produto = { id: string; nome: string; preco: number; categoria: string; ativo: boolean };

const CATEGORIAS = [
  { valor: "PAES", rotulo: "Pães" },
  { valor: "CONFEITARIA", rotulo: "Confeitaria" },
  { valor: "SALGADOS", rotulo: "Salgados" },
  { valor: "BEBIDAS", rotulo: "Bebidas" },
  { valor: "MERCEARIA", rotulo: "Mercearia" },
];

const ROTULOS_CATEGORIA: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.valor, c.rotulo])
);

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ListaProdutos({ produtos }: { produtos: Produto[] }) {
  const [pendente, iniciarTransicao] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<{ nome: string; preco: string; categoria: string }>({
    nome: "",
    preco: "",
    categoria: "PAES",
  });
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  function iniciarEdicao(produto: Produto) {
    setMensagem(null);
    setEditandoId(produto.id);
    setRascunho({ nome: produto.nome, preco: String(produto.preco), categoria: produto.categoria });
  }

  function salvarEdicao(produtoId: string) {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await editarProduto(produtoId, {
        nome: rascunho.nome,
        preco: Number(rascunho.preco),
        categoria: rascunho.categoria as Categoria,
      });
      if (resultado.sucesso) {
        setEditandoId(null);
        setMensagem({ tipo: "sucesso", texto: "Produto atualizado." });
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível salvar." });
      }
    });
  }

  function confirmarExclusao(produto: Produto) {
    if (!window.confirm(`Excluir o produto "${produto.nome}"? Esta ação não pode ser desfeita.`)) return;
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await excluirProduto(produto.id);
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Produto excluído." });
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível excluir." });
      }
    });
  }

  return (
    <div>
      {mensagem && (
        <p className={`mb-3 text-sm ${mensagem.tipo === "sucesso" ? "text-green-700" : "text-red-600"}`}>
          {mensagem.texto}
        </p>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-1.5 font-medium">Nome</th>
            <th className="py-1.5 font-medium">Categoria</th>
            <th className="py-1.5 font-medium">Preço</th>
            <th className="py-1.5 font-medium">Status</th>
            <th className="py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) =>
            editandoId === produto.id ? (
              <tr key={produto.id} className="border-b border-neutral-100 align-top">
                <td className="py-1.5 pr-2">
                  <input
                    value={rascunho.nome}
                    onChange={(e) => setRascunho((r) => ({ ...r, nome: e.target.value }))}
                    className="w-full rounded-md border border-neutral-300 px-2 py-1"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <select
                    value={rascunho.categoria}
                    onChange={(e) => setRascunho((r) => ({ ...r, categoria: e.target.value }))}
                    className="w-full rounded-md border border-neutral-300 px-2 py-1"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.valor} value={c.valor}>
                        {c.rotulo}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={rascunho.preco}
                    onChange={(e) => setRascunho((r) => ({ ...r, preco: e.target.value }))}
                    className="w-24 rounded-md border border-neutral-300 px-2 py-1"
                  />
                </td>
                <td className="py-1.5 text-neutral-400">—</td>
                <td className="py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      disabled={pendente}
                      onClick={() => salvarEdicao(produto.id)}
                      className="rounded-md bg-brand-700 px-2 py-1 text-xs text-white hover:bg-brand-800"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={produto.id} className="border-b border-neutral-100">
                <td className="py-1.5">{produto.nome}</td>
                <td className="py-1.5 text-neutral-500">{ROTULOS_CATEGORIA[produto.categoria] ?? produto.categoria}</td>
                <td className="py-1.5">{formatarMoeda(produto.preco)}</td>
                <td className="py-1.5">
                  <span className={produto.ativo ? "text-green-700" : "text-neutral-400"}>
                    {produto.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-1.5 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <button
                      disabled={pendente}
                      onClick={() => iniciarEdicao(produto)}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Editar
                    </button>
                    <button
                      disabled={pendente}
                      onClick={() => iniciarTransicao(() => alternarProdutoAtivo(produto.id))}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      {produto.ativo ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      disabled={pendente}
                      onClick={() => confirmarExclusao(produto)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
          {produtos.length === 0 && (
            <tr>
              <td className="py-1.5 text-neutral-400">Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
