-- Converte produtos.categoria de enum para TEXT preservando os dados,
-- traduzindo os códigos antigos para nomes amigáveis.
ALTER TABLE "produtos"
  ALTER COLUMN "categoria" TYPE TEXT
  USING (
    CASE "categoria"::text
      WHEN 'PAES' THEN 'Pães'
      WHEN 'CONFEITARIA' THEN 'Confeitaria'
      WHEN 'SALGADOS' THEN 'Salgados'
      WHEN 'BEBIDAS' THEN 'Bebidas'
      WHEN 'MERCEARIA' THEN 'Mercearia'
      ELSE "categoria"::text
    END
  );

-- Remove o enum antigo (não é mais usado).
DROP TYPE "Categoria";

-- Nova tabela de categorias gerenciáveis.
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- Categorias padrão + quaisquer categorias já em uso pelos produtos existentes,
-- para que a lista já venha preenchida.
INSERT INTO "categorias" ("id", "nome", "ativo", "criadoEm")
SELECT gen_random_uuid()::text, nome, true, CURRENT_TIMESTAMP
FROM (
  SELECT unnest(ARRAY['Pães', 'Confeitaria', 'Salgados', 'Bebidas', 'Mercearia']) AS nome
  UNION
  SELECT DISTINCT "categoria" AS nome FROM "produtos"
) AS nomes
ON CONFLICT ("nome") DO NOTHING;
