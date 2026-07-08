import { NextRequest, NextResponse } from "next/server";
import { NOME_COOKIE_SESSAO, lerTokenSessao } from "@/lib/auth";

const ROTAS_PUBLICAS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(NOME_COOKIE_SESSAO)?.value;
  const sessao = token ? await lerTokenSessao(token) : null;

  const rotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!sessao && !rotaPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessao && rotaPublica) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessao && pathname.startsWith("/admin") && sessao.papel !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
