import { redirect } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { obterTurnoAbertoDoOperador } from "@/actions/turno";

export default async function Home() {
  const sessao = await exigirSessao();
  const turnoAberto = await obterTurnoAbertoDoOperador(sessao.usuarioId);

  redirect(turnoAberto ? "/caixa" : "/caixa/abrir");
}
