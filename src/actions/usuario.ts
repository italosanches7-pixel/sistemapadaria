"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/sessao";
import { gerarHashSenha } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Papel } from "@prisma/client";

export type EstadoUsuario = { erro?: string };

export async function cadastrarUsuario(_estado: EstadoUsuario, formData: FormData): Promise<EstadoUsuario> {
  await exigirAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "OPERADOR") as Papel;

  if (!nome || !login) return { erro: "Informe nome e login." };
  if (senha.length < 6) return { erro: "A senha deve ter ao menos 6 caracteres." };

  const existente = await prisma.usuario.findUnique({ where: { login } });
  if (existente) return { erro: "Já existe um usuário com este login." };

  const senhaHash = await gerarHashSenha(senha);
  await prisma.usuario.create({ data: { nome, login, senhaHash, papel } });

  revalidatePath("/admin/usuarios");
  return {};
}

export async function alternarUsuarioAtivo(usuarioId: string): Promise<void> {
  await exigirAdmin();
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return;

  await prisma.usuario.update({ where: { id: usuarioId }, data: { ativo: !usuario.ativo } });
  revalidatePath("/admin/usuarios");
}
