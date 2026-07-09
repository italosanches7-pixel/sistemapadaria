import { PrismaClient } from "@prisma/client";

/**
 * Em serverless (Vercel) com a conexão "pooled" da Neon (host ...-pooler...),
 * o Prisma precisa do parâmetro `pgbouncer=true` para não usar prepared
 * statements — sem ele ocorrem falhas intermitentes de escrita/leitura
 * ("prepared statement already exists"), que se manifestam como cadastros que
 * parecem salvar mas não persistem. Ajustamos a URL aqui, de forma automática,
 * apenas quando o host é o pooler e o parâmetro ainda não está presente.
 */
function normalizarUrlBanco(url: string | undefined): string | undefined {
  if (!url) return url;
  if (!url.includes("-pooler")) return url;
  if (/[?&]pgbouncer=/.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true";
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: normalizarUrlBanco(process.env.DATABASE_URL) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
