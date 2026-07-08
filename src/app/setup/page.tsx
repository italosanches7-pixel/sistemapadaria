import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FormularioSetup } from "@/components/FormularioSetup";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // Se já existe qualquer usuário, o primeiro acesso não é mais permitido.
  const totalUsuarios = await prisma.usuario.count();
  if (totalUsuarios > 0) {
    redirect("/login");
  }

  return <FormularioSetup />;
}
