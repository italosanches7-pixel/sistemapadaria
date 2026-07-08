import { prisma } from "@/lib/prisma";
import { ListaVendasAdmin } from "@/components/ListaVendasAdmin";

export default async function AdminVendasPage() {
  const vendas = await prisma.venda.findMany({
    orderBy: { dataHora: "desc" },
    take: 100,
    include: { operador: true, canceladoPor: true, itens: true },
  });

  const vendasSerializadas = vendas.map((v) => ({
    id: v.id,
    dataHora: v.dataHora.toISOString(),
    operador: v.operador.nome,
    formaPagamento: v.formaPagamento,
    valorTotal: Number(v.valorTotal),
    status: v.status,
    canceladoPor: v.canceladoPor?.nome ?? null,
    motivoCancelamento: v.motivoCancelamento,
    itens: v.itens.map((i) => ({ nomeProduto: i.nomeProduto, quantidade: i.quantidade })),
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Histórico de vendas</h1>
      <ListaVendasAdmin vendas={vendasSerializadas} />
    </div>
  );
}
