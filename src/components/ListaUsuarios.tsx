"use client";

import { useTransition } from "react";
import { alternarUsuarioAtivo } from "@/actions/usuario";

type Usuario = { id: string; nome: string; login: string; papel: string; ativo: boolean };

export function ListaUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  const [pendente, iniciarTransicao] = useTransition();

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-neutral-500">
          <th className="py-1.5 font-medium">Nome</th>
          <th className="py-1.5 font-medium">Login</th>
          <th className="py-1.5 font-medium">Papel</th>
          <th className="py-1.5 font-medium">Status</th>
          <th className="py-1.5"></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id} className="border-b border-neutral-100">
            <td className="py-1.5">{usuario.nome}</td>
            <td className="py-1.5 text-neutral-500">{usuario.login}</td>
            <td className="py-1.5">{usuario.papel === "ADMIN" ? "Admin" : "Operador"}</td>
            <td className="py-1.5">
              <span className={usuario.ativo ? "text-green-700" : "text-neutral-400"}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td className="py-1.5 text-right">
              <button
                disabled={pendente}
                onClick={() => iniciarTransicao(() => alternarUsuarioAtivo(usuario.id))}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
              >
                {usuario.ativo ? "Desativar" : "Ativar"}
              </button>
            </td>
          </tr>
        ))}
        {usuarios.length === 0 && (
          <tr>
            <td className="py-1.5 text-neutral-400">Nenhum usuário cadastrado.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
