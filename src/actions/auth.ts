"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarTokenSessao, verificarSenha, NOME_COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

export async function autenticarUsuario(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!login || !senha) {
    return { erro: "Informe login e senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { login } });
  if (!usuario || !usuario.ativo) {
    return { erro: "Usuário ou senha inválidos." };
  }

  const senhaValida = await verificarSenha(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { erro: "Usuário ou senha inválidos." };
  }

  const token = await criarTokenSessao({ usuarioId: usuario.id, nome: usuario.nome, papel: usuario.papel });

  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
    path: "/",
  });

  redirect("/");
}

export async function sairDaSessao(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE_SESSAO);
  redirect("/login");
}
