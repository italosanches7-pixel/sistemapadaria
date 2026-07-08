"use client";

import { useActionState } from "react";
import Link from "next/link";
import { fecharTurno, type EstadoFecharTurno } from "@/actions/turno";

const estadoInicial: EstadoFecharTurno = {};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FecharCaixaPage() {
  const [estado, formAction, pendente] = useActionState(fecharTurno, estadoInicial);
  const fechado = estado.valorEsperado !== undefined && estado.diferenca !== undefined;

  if (fechado) {
    const diferenca = estado.diferenca as number;
    const bateu = Math.abs(diferenca) < 0.01;

    return (
      <div className="mx-auto mt-10 max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold text-neutral-900">Caixa fechado</h1>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Valor esperado</dt>
            <dd className="font-medium">{formatarMoeda(estado.valorEsperado as number)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Diferença</dt>
            <dd className={`font-medium ${bateu ? "text-green-700" : "text-red-600"}`}>
              {formatarMoeda(diferenca)}
            </dd>
          </div>
        </dl>
        <p className={`mt-3 text-sm ${bateu ? "text-green-700" : "text-red-600"}`}>
          {bateu ? "Caixa bateu certinho ✅" : diferenca > 0 ? "Sobrou dinheiro no caixa." : "Faltou dinheiro no caixa."}
        </p>
        <Link
          href="/caixa/abrir"
          className="mt-6 block rounded-md bg-amber-700 px-3 py-2 text-center font-medium text-white hover:bg-amber-800"
        >
          Abrir novo turno
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-neutral-900">Fechar caixa</h1>
      <p className="mb-6 text-sm text-neutral-500">Conte o dinheiro em caixa e informe o valor abaixo.</p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="valorContado">
            Valor contado (R$)
          </label>
          <input
            id="valorContado"
            name="valorContado"
            type="number"
            step="0.01"
            min="0"
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
          />
        </div>

        {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {pendente ? "Fechando..." : "Fechar caixa"}
        </button>
      </form>
    </div>
  );
}
