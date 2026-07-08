"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { gerarHashSenha, criarTokenSessao, NOME_COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS } from "@/lib/auth";

export type EstadoSetup = { erro?: string };

/**
 * Cria o primeiro administrador pelo navegador. Só funciona enquanto não existe
 * nenhum usuário no sistema — depois disso fica bloqueado.
 */
export async function criarPrimeiroAdmin(_estado: EstadoSetup, formData: FormData): Promise<EstadoSetup> {
  const totalUsuarios = await prisma.usuario.count();
  if (totalUsuarios > 0) {
    return { erro: "O sistema já tem um administrador. Use a tela de login." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (!nome || !login) return { erro: "Informe seu nome e um login." };
  if (senha.length < 6) return { erro: "A senha deve ter ao menos 6 caracteres." };
  if (senha !== confirmarSenha) return { erro: "As senhas não conferem." };

  const usuario = await prisma.usuario.create({
    data: { nome, login, senhaHash: await gerarHashSenha(senha), papel: "ADMIN" },
  });

  // Já deixa o administrador logado após criar a conta.
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
