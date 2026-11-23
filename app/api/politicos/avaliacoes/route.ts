import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Antigo endpoint de notas 1–5 desativado.
 * O Políticos recebe exclusivamente feedbacks de voz em /api/politicos/avaliacoes/voz.
 * Avaliações históricas não são apagadas por esta mudança.
 */
export async function POST() {
  return NextResponse.json(
    { erro: "A avaliação por notas foi desativada. Envie sua opinião por voz." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
