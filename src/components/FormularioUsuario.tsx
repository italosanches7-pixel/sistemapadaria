"use client";

import { useActionState } from "react";
import { cadastrarUsuario, type EstadoUsuario } from "@/actions/usuario";

const estadoInicial: EstadoUsuario = {};

export function FormularioUsuario() {
  const [estado, formAction, pendente] = useActionState(cadastrarUsuario, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="nome">
          Nome
        </label>
        <input id="nome" name="nome" required className="w-full rounded-md border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="login">
          Login
        </label>
        <input id="login" name="login" required className="w-full rounded-md border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="senha">
          Senha (mín. 6 caracteres)
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          minLength={6}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="papel">
          Papel
        </label>
        <select id="papel" name="papel" className="w-full rounded-md border border-neutral-300 px-3 py-2">
          <option value="OPERADOR">Operador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {pendente ? "Salvando..." : "Cadastrar usuário"}
      </button>
    </form>
  );
}
