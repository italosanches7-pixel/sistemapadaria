import { redirect } from "next/navigation";
import Link from "next/link";
import { exigirSessao } from "@/lib/sessao";
import { obterTurnoAbertoDoOperador } from "@/actions/turno";
import { prisma } from "@/lib/prisma";
import { PainelCaixa } from "@/components/PainelCaixa";

export default async function CaixaPage() {
  const sessao = await exigirSessao();
  const turno = await obterTurnoAbertoDoOperador(sessao.usuarioId);

  if (!turno) {
    redirect("/caixa/abrir");
  }

  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });

  const produtosSerializados = produtos.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.preco),
    categoria: produto.categoria,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Caixa</h1>
        <Link
          href="/caixa/fechar"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        >
          Fechar caixa
        </Link>
      </div>
      <PainelCaixa produtos={produtosSerializados} />
    </div>
  );
}
