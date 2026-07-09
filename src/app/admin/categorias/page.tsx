import { prisma } from "@/lib/prisma";
import { FormularioCategoria } from "@/components/FormularioCategoria";
import { ListaCategorias } from "@/components/ListaCategorias";

export default async function AdminCategoriasPage() {
  const categorias = await prisma.categoria.findMany({ orderBy: { nome: "asc" } });

  // Conta quantos produtos usam cada categoria (para avisar antes de excluir).
  const produtos = await prisma.produto.findMany({ select: { categoria: true } });
  const contagem = new Map<string, number>();
  for (const p of produtos) {
    contagem.set(p.categoria, (contagem.get(p.categoria) ?? 0) + 1);
  }

  const categoriasSerializadas = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    ativo: c.ativo,
    produtos: contagem.get(c.nome) ?? 0,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Categorias</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ListaCategorias categorias={categoriasSerializadas} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Nova categoria</h2>
          <FormularioCategoria />
        </div>
      </div>
    </div>
  );
}
