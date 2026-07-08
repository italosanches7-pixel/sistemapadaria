import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const NOME_COOKIE_SESSAO = "sessao";
const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 12; // 12 horas de turno

function chaveSecreta() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    throw new Error("JWT_SECRET não configurado");
  }
  return new TextEncoder().encode(segredo);
}

export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export type SessaoPayload = {
  usuarioId: string;
  nome: string;
  papel: "ADMIN" | "OPERADOR";
};

export async function criarTokenSessao(payload: SessaoPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(chaveSecreta());
}

export async function lerTokenSessao(token: string): Promise<SessaoPayload | null> {
  try {
    const { payload } = await jwtVerify(token, chaveSecreta());
    return payload as unknown as SessaoPayload;
  } catch {
    return null;
  }
}

export { NOME_COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS };
