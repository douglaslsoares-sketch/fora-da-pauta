import { telegramLiberadoNesteAmbiente } from "@/lib/telegram/ambiente";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!telegramLiberadoNesteAmbiente()) return NextResponse.json({ ok: false, codigo: "PREVIEW_TELEGRAM_NAO_ISOLADA" }, { status: 503 });
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
    const { coletarNovidadesEdicoes } = await import("@/lib/telegram/coletar-novidades-edicoes");
    const edicoes = await coletarNovidadesEdicoes();
    const envio = await processarFilaTelegram();
    // As respostas individuais dependem da migração de interações no banco.
    // Não interromper a fila editorial enquanto a implantação não for concluída.
    const interacoesHabilitadas = process.env.FDP_INTERACOES_HABILITADAS === "1";
    const respostas = interacoesHabilitadas
      ? await (await import("@/lib/telegram/processar-respostas-interacoes")).processarRespostasInteracoes()
      : { pendenteDeAtivacao: true };
    const resumo = { coleta, edicoes, envio, respostas };

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