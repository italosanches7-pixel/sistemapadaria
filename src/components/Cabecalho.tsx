import Link from "next/link";
import { sairDaSessao } from "@/actions/auth";
import { Marca } from "@/components/Marca";

export function Cabecalho({ nome, papel }: { nome: string; papel: "ADMIN" | "OPERADOR" }) {
  return (
    <header className="border-b border-brand-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/caixa" aria-label="Pão Nobre">
            <Marca tamanho="sm" />
          </Link>
          <nav className="flex gap-3 text-sm font-medium text-neutral-600">
            <Link href="/caixa" className="hover:text-brand-800">
              Caixa
            </Link>
            <Link href="/relatorios" className="hover:text-brand-800">
              Relatórios
            </Link>
            {papel === "ADMIN" && (
              <>
                <Link href="/admin/produtos" className="hover:text-brand-800">
                  Produtos
                </Link>
                <Link href="/admin/categorias" className="hover:text-brand-800">
                  Categorias
                </Link>
                <Link href="/admin/usuarios" className="hover:text-brand-800">
                  Usuários
                </Link>
                <Link href="/admin/vendas" className="hover:text-brand-800">
                  Histórico
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>
            {nome} <span className="text-neutral-400">({papel === "ADMIN" ? "Admin" : "Operador"})</span>
          </span>
          <form action={sairDaSessao}>
            <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-100">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
