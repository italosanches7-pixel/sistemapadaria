"use client";

import { useActionState } from "react";
import { abrirTurno, type EstadoAbrirTurno } from "@/actions/turno";

const estadoInicial: EstadoAbrirTurno = {};

export default function AbrirCaixaPage() {
  const [estado, formAction, pendente] = useActionState(abrirTurno, estadoInicial);

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-neutral-900">Abrir caixa</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Ao abrir o caixa, as vendas que você registrar ficam no seu nome até você fechar o turno. No fechamento, o
        sistema mostra quanto entrou em dinheiro para você conferir com a gaveta.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          className="rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {pendente ? "Abrindo..." : "Iniciar meu turno"}
        </button>
      </form>
    </div>
  );
}
