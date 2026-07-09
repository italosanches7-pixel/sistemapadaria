"use client";

import { useActionState } from "react";
import { cadastrarProduto, type EstadoProduto } from "@/actions/produto";

const estadoInicial: EstadoProduto = {};

const CATEGORIAS = [
  { valor: "PAES", rotulo: "Pães" },
  { valor: "CONFEITARIA", rotulo: "Confeitaria" },
  { valor: "SALGADOS", rotulo: "Salgados" },
  { valor: "BEBIDAS", rotulo: "Bebidas" },
  { valor: "MERCEARIA", rotulo: "Mercearia" },
];

export function FormularioProduto() {
  const [estado, formAction, pendente] = useActionState(cadastrarProduto, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="nome">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="preco">
          Preço (R$)
        </label>
        <input
          id="preco"
          name="preco"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="categoria">
          Categoria
        </label>
        <select id="categoria" name="categoria" className="w-full rounded-md border border-neutral-300 px-3 py-2">
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.rotulo}
            </option>
          ))}
        </select>
      </div>

      {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {pendente ? "Salvando..." : "Cadastrar produto"}
      </button>
    </form>
  );
}
