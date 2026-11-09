import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tokenSessao, inscricaoAtiva } from "@/lib/telegram/sessao-site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const jar = await cookies();
  const pendente = jar.get("fdp_primeira_inscricao")?.value === "1";
  const token = await tokenSessao();
  const ativo = token ? await inscricaoAtiva(token) : false;
  const destino = ativo
    ? (pendente ? "/escolher-quem-acompanhar" : "/ha-mais-para-entender")
    : "/";
  const resposta = NextResponse.redirect(new URL(destino, request.url), 303);
  resposta.cookies.set("fdp_primeira_inscricao", "", {
    path: "/", maxAge: 0, sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}
