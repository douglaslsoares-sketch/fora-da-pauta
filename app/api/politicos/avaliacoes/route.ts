import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";
import { garantirTabelaAvaliacoesPoliticos } from "@/lib/politicos/avaliacoes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function erro(mensagem: string, status: number) {
  return NextResponse.json({ erro: mensagem }, { status, headers: noStore });
}

export async function POST(request: Request) {
  const origem = request.headers.get("origin");
  if (!origem || origem !== new URL(request.url).origin) {
    return erro("Origem não autorizada.", 403);
  }

  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return erro("Formato de envio inválido.", 415);
  }
  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > 8192) return erro("Mensagem muito longa.", 413);

  let dados: unknown;
  try {
    const conteudo = await request.text();
    if (Buffer.byteLength(conteudo, "utf8") > 8192) return erro("Mensagem muito longa.", 413);
    dados = JSON.parse(conteudo);
  } catch {
    return erro("Dados inválidos.", 400);
  }

  if (dados === null || typeof dados !== "object" || Array.isArray(dados)) {
    return erro("Dados inválidos.", 400);
  }
  const entrada = dados as Record<string, unknown>;
  const nota = entrada.nota;
  const comentarioBruto = entrada.comentario ?? "";
  if (!Number.isInteger(nota) || Number(nota) < 1 || Number(nota) > 5 ||
      typeof comentarioBruto !== "string" || comentarioBruto.length > 1200) {
    return erro("Escolha uma nota de 1 a 5 e escreva até 1.200 caracteres.", 400);
  }
  const comentario = comentarioBruto.trim();

  try {
    const limite = await consumeRateLimit({
      request, scope: "politicos:avaliacoes", limit: 5, windowSeconds: 3600,
    });
    if (!limite.allowed) {
      const resposta = erro("Muitas avaliações em pouco tempo. Tente mais tarde.", 429);
      resposta.headers.set("Retry-After", String(limite.retryAfterSeconds));
      return resposta;
    }

    await garantirTabelaAvaliacoesPoliticos();
    await sql`
      INSERT INTO public.politicos_avaliacoes(id, nota, comentario)
      VALUES (${randomUUID()}::uuid, ${nota as number}, ${comentario || null})
    `;

    return NextResponse.json({ recebido: true }, { status: 201, headers: noStore });
  } catch (error) {
    console.error("Não foi possível registrar avaliação do Políticos:", error);
    return erro("Não foi possível enviar sua avaliação. Tente novamente.", 503);
  }
}
