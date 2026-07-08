"use client";

import { useActionState } from "react";
import { abrirTurno, type EstadoAbrirTurno } from "@/actions/turno";

const estadoInicial: EstadoAbrirTurno = {};

export default function AbrirCaixaPage() {
  const [estado, formAction, pendente] = useActionState(abrirTurno, estadoInicial);

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-neutral-900">Abrir caixa</h1>
      <p className="mb-6 text-sm text-neutral-500">Informe o fundo de troco para iniciar o seu turno.</p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="fundoTroco">
            Fundo de troco (R$)
          </label>
          <input
            id="fundoTroco"
            name="fundoTroco"
            type="number"
            step="0.01"
            min="0"
            required
            autoFocus
            defaultValue="0"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
          />
        </div>

        {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {pendente ? "Abrindo..." : "Abrir caixa"}
        </button>
      </form>
    </div>
  );
}
