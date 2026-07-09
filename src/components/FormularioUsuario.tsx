"use client";

import { useActionState, useEffect, useRef } from "react";
import { cadastrarUsuario, type EstadoUsuario } from "@/actions/usuario";

const estadoInicial: EstadoUsuario = {};

export function FormularioUsuario() {
  const [estado, formAction, pendente] = useActionState(cadastrarUsuario, estadoInicial);
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
      {estado.ok && <p className="text-sm text-green-700">Usuário cadastrado com sucesso.</p>}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {pendente ? "Salvando..." : "Cadastrar usuário"}
      </button>
    </form>
  );
}
