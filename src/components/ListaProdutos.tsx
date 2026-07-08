"use client";

import { useTransition } from "react";
import { alternarProdutoAtivo } from "@/actions/produto";

type Produto = { id: string; nome: string; preco: number; categoria: string; ativo: boolean };

const ROTULOS_CATEGORIA: Record<string, string> = {
  PAES: "Pães",
  CONFEITARIA: "Confeitaria",
  SALGADOS: "Salgados",
  BEBIDAS: "Bebidas",
  MERCEARIA: "Mercearia",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ListaProdutos({ produtos }: { produtos: Produto[] }) {
  const [pendente, iniciarTransicao] = useTransition();

  return (
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
        {produtos.map((produto) => (
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
              <button
                disabled={pendente}
                onClick={() => iniciarTransicao(() => alternarProdutoAtivo(produto.id))}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
              >
                {produto.ativo ? "Desativar" : "Ativar"}
              </button>
            </td>
          </tr>
        ))}
        {produtos.length === 0 && (
          <tr>
            <td className="py-1.5 text-neutral-400">Nenhum produto cadastrado.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
