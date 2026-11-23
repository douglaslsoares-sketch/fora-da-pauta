import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";
import { garantirTabelaFeedbackVozPoliticos } from "@/lib/politicos/feedbackVoz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };
const LIMITE_BYTES = 3_000_000;
const MIMES = new Set(["audio/webm", "audio/mp4", "audio/ogg"]);

function falha(erro: string, status: number) {
  return NextResponse.json({ erro }, { status, headers });
}

function identificarTipo(buffer: Buffer): "audio/webm" | "audio/mp4" | "audio/ogg" | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(0, 4).toString("hex") === "1a45dfa3") return "audio/webm";
  if (buffer.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") return "audio/mp4";
  return null;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return falha("Origem inválida.", 403);
  }
  const tipoConteudo = request.headers.get("content-type") ?? "";
  if (!tipoConteudo.toLowerCase().startsWith("multipart/form-data")) {
    return falha("Envie um áudio gravado pelo aplicativo.", 415);
  }
  const tamanhoDeclarado = Number(request.headers.get("content-length") ?? "0");
  if (tamanhoDeclarado > LIMITE_BYTES + 150_000) {
    return falha("O áudio ultrapassou o limite de 3 MB.", 413);
  }

  try {
    const limite = await consumeRateLimit({
      request, scope: "politicos:feedback-voz", limit: 4, windowSeconds: 3600,
    });
    if (!limite.allowed) {
      const response = falha("Muitos envios em pouco tempo. Tente novamente mais tarde.", 429);
      response.headers.set("Retry-After", String(limite.retryAfterSeconds));
      return response;
    }

    const formulario = await request.formData();
    const arquivo = formulario.get("audio");
    const duracaoTexto = formulario.get("duracao");
    if (!(arquivo instanceof File) || typeof duracaoTexto !== "string") {
      return falha("Gravação não encontrada.", 400);
    }
    const duracao = Number(duracaoTexto);
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 300) {
      return falha("Duração da gravação inválida.", 400);
    }
    if (arquivo.size < 800 || arquivo.size > LIMITE_BYTES) {
      return falha("A gravação precisa ter até 3 MB.", 413);
    }
    const tipoDeclarado = arquivo.type.split(";")[0].trim().toLowerCase();
    if (!MIMES.has(tipoDeclarado)) return falha("Formato de áudio incompatível.", 415);

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const tipoReal = identificarTipo(buffer);
    if (!tipoReal || tipoReal !== tipoDeclarado) {
      return falha("Arquivo não reconhecido como áudio gravado.", 415);
    }
    await garantirTabelaFeedbackVozPoliticos();
    await sql\`
      INSERT INTO public.politicos_feedback_voz
        (id, audio, mime_type, duracao_segundos)
      VALUES
        (\${randomUUID()}::uuid, decode(\${buffer.toString("hex")}, 'hex'),
          \${tipoReal}, \${duracao})
    \`;
    return NextResponse.json({ recebido: true }, { status: 201, headers });
  } catch (error) {
    console.error("Falha ao receber feedback de voz do Políticos:", error);
    return falha("Não foi possível enviar o áudio. Tente novamente.", 503);
  }
}
