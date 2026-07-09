"use client";

import { useActionState } from "react";
import { criarPrimeiroAdmin, type EstadoSetup } from "@/actions/setup";
import { Marca } from "@/components/Marca";

const estadoInicial: EstadoSetup = {};

export function FormularioSetup() {
  const [estado, formAction, pendente] = useActionState(criarPrimeiroAdmin, estadoInicial);

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
      <div className="mb-2 flex justify-center">
        <Marca tamanho="lg" />
      </div>
      <h1 className="mb-1 text-center text-lg font-semibold text-neutral-800">Primeiro acesso</h1>
      <p className="mb-6 text-center text-sm text-neutral-500">
        Crie a conta do administrador. Ela terá acesso total ao sistema.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="nome">
            Seu nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="login">
            Login (o que você vai digitar para entrar)
          </label>
          <input
            id="login"
            name="login"
            type="text"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
          />
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
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="confirmarSenha">
            Confirme a senha
          </label>
          <input
            id="confirmarSenha"
            name="confirmarSenha"
            type="password"
            minLength={6}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-brand-600 focus:outline-none"
          />
        </div>

        {estado.erro && <p className="text-sm text-red-600">{estado.erro}</p>}

        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {pendente ? "Criando..." : "Criar administrador e entrar"}
        </button>
      </form>
    </div>
  );
}
