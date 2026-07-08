import type { Metadata } from "next";
import "./globals.css";
import { obterSessao } from "@/lib/sessao";
import { Cabecalho } from "@/components/Cabecalho";

export const metadata: Metadata = {
  title: "Sistema de Caixa - Padaria",
  description: "Registro de vendas e relatórios para o caixa da padaria",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessao = await obterSessao();

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {sessao && <Cabecalho nome={sessao.nome} papel={sessao.papel} />}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
