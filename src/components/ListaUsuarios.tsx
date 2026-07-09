"use client";

import { useState, useTransition } from "react";
import { alternarUsuarioAtivo, redefinirSenhaUsuario, excluirUsuario } from "@/actions/usuario";

type Usuario = { id: string; nome: string; login: string; papel: string; ativo: boolean };

export function ListaUsuarios({ usuarios, usuarioAtualId }: { usuarios: Usuario[]; usuarioAtualId: string }) {
  const [pendente, iniciarTransicao] = useTransition();
  const [usuarioEmReset, setUsuarioEmReset] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  function confirmarReset(usuarioId: string) {
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await redefinirSenhaUsuario(usuarioId, novaSenha);
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Senha redefinida com sucesso." });
        setUsuarioEmReset(null);
        setNovaSenha("");
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível redefinir a senha." });
      }
    });
  }

  function confirmarExclusao(usuario: Usuario) {
    if (!window.confirm(`Excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`)) return;
    setMensagem(null);
    iniciarTransicao(async () => {
      const resultado = await excluirUsuario(usuario.id);
      if (resultado.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Usuário excluído." });
      } else {
        setMensagem({ tipo: "erro", texto: resultado.erro ?? "Não foi possível excluir o usuário." });
      }
    });
  }

  return (
    <div>
      {mensagem && (
        <p className={`mb-3 text-sm ${mensagem.tipo === "sucesso" ? "text-green-700" : "text-red-600"}`}>
          {mensagem.texto}
        </p>
      )}

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
            <tr key={usuario.id} className="border-b border-neutral-100 align-top">
              <td className="py-1.5">
                {usuario.nome}
                {usuario.id === usuarioAtualId && <span className="ml-1 text-xs text-neutral-400">(você)</span>}
              </td>
              <td className="py-1.5 text-neutral-500">{usuario.login}</td>
              <td className="py-1.5">{usuario.papel === "ADMIN" ? "Admin" : "Operador"}</td>
              <td className="py-1.5">
                <span className={usuario.ativo ? "text-green-700" : "text-neutral-400"}>
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="py-1.5 text-right">
                {usuarioEmReset === usuario.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <input
                      autoFocus
                      type="password"
                      placeholder="Nova senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-32 rounded-md border border-neutral-300 px-2 py-1 text-xs"
                    />
                    <button
                      disabled={pendente}
                      onClick={() => confirmarReset(usuario.id)}
                      className="rounded-md bg-brand-700 px-2 py-1 text-xs text-white hover:bg-brand-800"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setUsuarioEmReset(null);
                        setNovaSenha("");
                      }}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <button
                      disabled={pendente}
                      onClick={() => iniciarTransicao(() => alternarUsuarioAtivo(usuario.id))}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      {usuario.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      disabled={pendente}
                      onClick={() => {
                        setMensagem(null);
                        setUsuarioEmReset(usuario.id);
                        setNovaSenha("");
                      }}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                    >
                      Redefinir senha
                    </button>
                    {usuario.id !== usuarioAtualId && (
                      <button
                        disabled={pendente}
                        onClick={() => confirmarExclusao(usuario)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                )}
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
    </div>
  );
}
