/**
 * Roda as migrações e o seed no deploy, de forma resistente ao ambiente da
 * Neon + Vercel:
 *
 * - Migração exige conexão DIRETA: se a DATABASE_URL apontar para o pooler da
 *   Neon (host com "-pooler"), convertemos para o host direto automaticamente.
 * - Bancos gratuitos da Neon "dormem" quando ociosos: aumentamos o
 *   connect_timeout para dar tempo de acordar e tentamos mais de uma vez.
 */
import { spawnSync } from "node:child_process";

function urlDireta(url) {
  if (!url) return url;
  let direta = url.replace("-pooler.", ".");
  // pgbouncer=true só faz sentido no pooler; remove na conexão direta.
  direta = direta.replace(/([?&])pgbouncer=true&?/, "$1").replace(/[?&]$/, "");
  if (!/[?&]connect_timeout=/.test(direta)) {
    direta += (direta.includes("?") ? "&" : "?") + "connect_timeout=20";
  }
  return direta;
}

function rodar(comando, args, env) {
  const resultado = spawnSync(comando, args, { stdio: "inherit", env });
  return resultado.status === 0;
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const env = { ...process.env, DATABASE_URL: urlDireta(process.env.DATABASE_URL) };
const TENTATIVAS = 3;

for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
  console.log(`\n>> Aplicando migrações (tentativa ${tentativa}/${TENTATIVAS})...`);
  if (rodar("npx", ["prisma", "migrate", "deploy"], env)) {
    console.log(">> Rodando seed...");
    if (!rodar("npx", ["tsx", "prisma/seed.ts"], env)) {
      console.error(">> Seed falhou.");
      process.exit(1);
    }
    console.log(">> Banco pronto.");
    process.exit(0);
  }
  if (tentativa < TENTATIVAS) {
    console.log(">> O banco pode estar acordando; aguardando 8s para tentar de novo...");
    await esperar(8000);
  }
}

console.error(`>> Migração falhou após ${TENTATIVAS} tentativas.`);
process.exit(1);
