import { prisma } from "@/lib/prisma";
import { FormularioUsuario } from "@/components/FormularioUsuario";
import { ListaUsuarios } from "@/components/ListaUsuarios";

export default async function AdminUsuariosPage() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } });

  const usuariosSerializados = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    login: u.login,
    papel: u.papel,
    ativo: u.ativo,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">Usuários</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ListaUsuarios usuarios={usuariosSerializados} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Novo usuário</h2>
          <FormularioUsuario />
        </div>
      </div>
    </div>
  );
}
