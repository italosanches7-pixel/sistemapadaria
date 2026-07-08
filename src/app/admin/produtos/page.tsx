import { prisma } from "@/lib/prisma";
import { FormularioProduto } from "@/components/FormularioProduto";
import { ListaProdutos } from "@/components/ListaProdutos";

export default async function AdminProdutosPage() {
  const produtos = await prisma.produto.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }] });

  const produtosSerializados = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: Number(p.preco),
    categoria: p.categoria,
    ativo: p.ativo,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Produtos</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ListaProdutos produtos={produtosSerializados} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Novo produto</h2>
          <FormularioProduto />
        </div>
      </div>
    </div>
  );
}
