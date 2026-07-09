"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  criarTokenSessao,
  verificarSenha,
  gerarHashSenha,
  NOME_COOKIE_SESSAO,
  DURACAO_SESSAO_SEGUNDOS,
} from "@/lib/auth";

export type EstadoLogin = { erro?: string };

async function iniciarSessao(usuario: { id: string; nome: string; papel: "ADMIN" | "OPERADOR" }): Promise<void> {
  const token = await criarTokenSessao({ usuarioId: usuario.id, nome: usuario.nome, papel: usuario.papel });

  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
    path: "/",
  });
}

/**
 * Chave-mestra de recuperação: se ADMIN_LOGIN e ADMIN_SENHA estiverem definidos no
 * ambiente e as credenciais digitadas forem exatamente essas, garante esse admin no
 * banco (cria ou redefine senha/papel/ativo) e autentica. Funciona em tempo de
 * execução — não depende de seed nem de rebuild.
 */
async function autenticarPorRecuperacao(login: string, senha: string): Promise<boolean> {
  const loginRecuperacao = process.env.ADMIN_LOGIN?.trim();
  const senhaRecuperacao = process.env.ADMIN_SENHA;

  if (!loginRecuperacao || !senhaRecuperacao) return false;
  if (login !== loginRecuperacao || senha !== senhaRecuperacao) return false;

  const senhaHash = await gerarHashSenha(senha);
  const usuario = await prisma.usuario.upsert({
    where: { login: loginRecuperacao },
    update: { senhaHash, papel: "ADMIN", ativo: true },
    create: { nome: "Administrador", login: loginRecuperacao, senhaHash, papel: "ADMIN" },
  });

  await iniciarSessao(usuario);
  return true;
}

export async function autenticarUsuario(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!login || !senha) {
    return { erro: "Informe login e senha." };
  }

  if (await autenticarPorRecuperacao(login, senha)) {
    redirect("/");
  }

  const usuario = await prisma.usuario.findUnique({ where: { login } });
  if (!usuario || !usuario.ativo) {
    return { erro: "Usuário ou senha inválidos." };
  }

  const senhaValida = await verificarSenha(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { erro: "Usuário ou senha inválidos." };
  }

  await iniciarSessao(usuario);
  redirect("/");
}

export async function sairDaSessao(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE_SESSAO);
  redirect("/login");
}
