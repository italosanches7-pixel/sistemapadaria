import type { Metadata } from "next";
import "./globals.css";
import { obterSessao } from "@/lib/sessao";
import { Cabecalho } from "@/components/Cabecalho";

export const metadata: Metadata = {
  title: "Panificadora Pão Nobre — Caixa",
  description: "Sistema de caixa da Panificadora Pão Nobre: registro de vendas e relatórios",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessao = await obterSessao();

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-50 text-neutral-900 antialiased">
        {sessao && <Cabecalho nome={sessao.nome} papel={sessao.papel} />}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
