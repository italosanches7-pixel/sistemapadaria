"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/sessao";
import { gerarHashSenha } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Papel } from "@prisma/client";

export type EstadoUsuario = { erro?: string; ok?: boolean };

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
  try {
    await prisma.usuario.create({ data: { nome, login, senhaHash, papel } });
  } catch {
    return { erro: "Não foi possível salvar o usuário. Tente novamente." };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function alternarUsuarioAtivo(usuarioId: string): Promise<void> {
  await exigirAdmin();
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return;

  await prisma.usuario.update({ where: { id: usuarioId }, data: { ativo: !usuario.ativo } });
  revalidatePath("/admin/usuarios");
}

export type ResultadoUsuario = { sucesso: boolean; erro?: string };

export async function redefinirSenhaUsuario(usuarioId: string, novaSenha: string): Promise<ResultadoUsuario> {
  await exigirAdmin();

  if (novaSenha.length < 6) {
    return { sucesso: false, erro: "A nova senha deve ter ao menos 6 caracteres." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    return { sucesso: false, erro: "Usuário não encontrado." };
  }

  const senhaHash = await gerarHashSenha(novaSenha);
  await prisma.usuario.update({ where: { id: usuarioId }, data: { senhaHash } });

  revalidatePath("/admin/usuarios");
  return { sucesso: true };
}

export async function excluirUsuario(usuarioId: string): Promise<ResultadoUsuario> {
  const sessao = await exigirAdmin();

  if (usuarioId === sessao.usuarioId) {
    return { sucesso: false, erro: "Você não pode excluir a própria conta." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    return { sucesso: false, erro: "Usuário não encontrado." };
  }

  const [turnos, vendas, vendasCanceladas] = await Promise.all([
    prisma.turno.count({ where: { operadorId: usuarioId } }),
    prisma.venda.count({ where: { operadorId: usuarioId } }),
    prisma.venda.count({ where: { canceladoPorId: usuarioId } }),
  ]);

  if (turnos > 0 || vendas > 0 || vendasCanceladas > 0) {
    return {
      sucesso: false,
      erro: "Este usuário tem histórico de caixa e não pode ser excluído. Use 'Desativar' para impedir novos acessos preservando o histórico.",
    };
  }

  await prisma.usuario.delete({ where: { id: usuarioId } });

  revalidatePath("/admin/usuarios");
  return { sucesso: true };
}
