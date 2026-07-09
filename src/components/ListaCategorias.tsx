"use client";

import { useState, useTransition } from "react";
import { alternarCategoriaAtiva, renomearCategoria, excluirCategoria } from "@/actions/categoria";

type Categoria = { id: string; nome: string; ativo: boolean; produtos: number };

export function ListaCategorias({ categorias }: { categorias: Categoria[] }) {
  const [pendente, iniciarTransicao] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  function salvarRenome(categoriaId: string) {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await renomearCategoria(categoriaId, rascunho);
      if (resultado.sucesso) {
        setEditandoId(null);
        setMensagem({ tipo: "sucesso", texto: "Categoria atualizada." });
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível salvar." });
      }
    });
  }

  function confirmarExclusao(categoria: Categoria) {
    if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await excluirCategoria(categoria.id);
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Categoria excluída." });
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
            <th className="py-1.5 font-medium">Produtos</th>
            <th className="py-1.5 font-medium">Status</th>
            <th className="py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) =>
            editandoId === categoria.id ? (
              <tr key={categoria.id} className="border-b border-neutral-100 align-top">
                <td className="py-1.5 pr-2">
                  <input
                    autoFocus
                    value={rascunho}
                    onChange={(e) => setRascunho(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-2 py-1"
                  />
                </td>
                <td className="py-1.5 text-neutral-500">{categoria.produtos}</td>
                <td className="py-1.5 text-neutral-400">—</td>
                <td className="py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      disabled={pendente}
                      onClick={() => salvarRenome(categoria.id)}
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
              <tr key={categoria.id} className="border-b border-neutral-100">
                <td className="py-1.5">{categoria.nome}</td>
                <td className="py-1.5 text-neutral-500">{categoria.produtos}</td>
                <td className="py-1.5">
                  <span className={categoria.ativo ? "text-green-700" : "text-neutral-400"}>
                    {categoria.ativo ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="py-1.5 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <button
                      disabled={pendente}
                      onClick={() => {
                        setMensagem(null);
                        setEditandoId(categoria.id);
                        setRascunho(categoria.nome);
                      }}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Renomear
                    </button>
                    <button
                      disabled={pendente}
                      onClick={() => iniciarTransicao(() => alternarCategoriaAtiva(categoria.id))}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      {categoria.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      disabled={pendente}
                      onClick={() => confirmarExclusao(categoria)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
          {categorias.length === 0 && (
            <tr>
              <td className="py-1.5 text-neutral-400">Nenhuma categoria cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
