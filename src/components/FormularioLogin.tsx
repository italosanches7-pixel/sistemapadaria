"use client";

import { useActionState } from "react";
import { autenticarUsuario, type EstadoLogin } from "@/actions/auth";

const estadoInicial: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, formAction, pendente] = useActionState(autenticarUsuario, estadoInicial);

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-center text-2xl font-semibold text-amber-800">🥖 Padaria</h1>
      <p className="mb-6 text-center text-sm text-neutral-500">Entre com seu usuário para abrir o caixa</p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="login">
            Login
          </label>
          <input
            id="login"
            name="login"
            type="text"
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
          />
        </div>

        {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {pendente ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
