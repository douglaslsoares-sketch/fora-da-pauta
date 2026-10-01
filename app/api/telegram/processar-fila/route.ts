import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET?.trim();

  if (!segredo) {
    return NextResponse.json(
      { ok: false, codigo: "CRON_SECRET_NAO_CONFIGURADO" },
      { status: 503 },
    );
  }

  const recebido = Buffer.from(
    request.headers.get("authorization") ?? "",
    "utf8",
  );
  const esperado = Buffer.from(`Bearer ${segredo}`, "utf8");

  if (
    recebido.length !== esperado.length ||
    !timingSafeEqual(recebido, esperado)
  ) {
    return NextResponse.json(
      { ok: false },
      { status: 401 },
    );
  }

  try {
    // Carrega o banco apenas depois de validar a autorização.
    const { processarFilaTelegram } = await import(
      "@/lib/telegram/processar-fila"
    );

    const { coletarNovidadesCandidatos } = await import(
      "@/lib/telegram/coletar-novidades"
    );

    const coleta = await coletarNovidadesCandidatos();
    const envio = await processarFilaTelegram();
    const resumo = { coleta, envio };

    return NextResponse.json(
      { ok: true, ...resumo },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Não inclui tokens, mensagens ou conexão do banco no log.
    console.error("Falha ao processar a fila de avisos do Telegram.");

    return NextResponse.json(
      { ok: false, codigo: "PROCESSAMENTO_FALHOU" },
      { status: 500 },
    );
  }
}