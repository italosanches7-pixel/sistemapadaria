-- Pagamentos por venda: uma venda pode ser paga em várias formas (ex.: parte
-- em dinheiro, parte no Pix).
CREATE TABLE "pagamentos_venda" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pagamentos_venda_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pagamentos_venda_vendaId_idx" ON "pagamentos_venda"("vendaId");

ALTER TABLE "pagamentos_venda"
  ADD CONSTRAINT "pagamentos_venda_vendaId_fkey"
  FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: cada venda existente vira um pagamento único com a forma e o
-- valor total que ela já tinha — nenhum dado é perdido.
INSERT INTO "pagamentos_venda" ("id", "vendaId", "formaPagamento", "valor")
SELECT gen_random_uuid()::text, "id", "formaPagamento", "valorTotal"
FROM "vendas";

-- A forma única por venda deixa de existir.
ALTER TABLE "vendas" DROP COLUMN "formaPagamento";

-- Novos turnos abrem sempre sem fundo de troco (coluna preservada para o
-- histórico dos turnos antigos).
ALTER TABLE "turnos" ALTER COLUMN "fundoTroco" SET DEFAULT 0;
