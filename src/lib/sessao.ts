import "server-only";
import { cookies } from "next/headers";
import { NOME_COOKIE_SESSAO, lerTokenSessao, type SessaoPayload } from "@/lib/auth";

export async function obterSessao(): Promise<SessaoPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE_SESSAO)?.value;
  if (!token) return null;
  return lerTokenSessao(token);
}

export async function exigirSessao(): Promise<SessaoPayload> {
  const sessao = await obterSessao();
  if (!sessao) {
    throw new Error("Sessão não encontrada");
  }
  return sessao;
}

export async function exigirAdmin(): Promise<SessaoPayload> {
  const sessao = await exigirSessao();
  if (sessao.papel !== "ADMIN") {
    throw new Error("Acesso restrito ao administrador");
  }
  return sessao;
}
