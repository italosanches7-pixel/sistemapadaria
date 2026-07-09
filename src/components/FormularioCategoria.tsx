"use client";

import { useActionState, useEffect, useRef } from "react";
import { cadastrarCategoria, type EstadoCategoria } from "@/actions/categoria";

const estadoInicial: EstadoCategoria = {};

export function FormularioCategoria() {
  const [estado, formAction, pendente] = useActionState(cadastrarCategoria, estadoInicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="nome">
          Nome da categoria
        </label>
        <input
          id="nome"
          name="nome"
          required
          placeholder="Ex.: Tortas"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
      {estado.ok && <p className="text-sm text-green-700">Categoria cadastrada com sucesso.</p>}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {pendente ? "Salvando..." : "Cadastrar categoria"}
      </button>
    </form>
  );
}
