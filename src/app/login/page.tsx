import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormularioLogin } from "@/components/FormularioLogin";

// Sempre consulta o banco a cada acesso (não pode ser estático).
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Se ainda não existe nenhum usuário, leva para o primeiro acesso (criar admin).
  const totalUsuarios = await prisma.usuario.count();
  if (totalUsuarios === 0) {
    redirect("/setup");
  }

  return <FormularioLogin />;
}
