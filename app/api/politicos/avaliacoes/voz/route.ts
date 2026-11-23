import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";
import { garantirTabelaFeedbackVozPoliticos } from "@/lib/politicos/feedbackVoz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };
const MAX_AUDIO = 3_000_000;
const MAX_VIDEO = 3_400_000;
const TIPOS = new Set(["audio/webm", "audio/mp4", "audio/ogg", "video/webm", "video/mp4"]);
const PAGINA = /^\/politicos(?:\/(?:escolher|acompanhados|historico(?:\/[0-9]{8,20})?|avisos|qr-code|compartilhar|avaliar|sobre|loja|outra-pagina))?\/?$/;
const ACOES = new Set([
  "Deixar de acompanhar", "Ver histórico", "Acompanhar", "Voltar",
  "Mostrar mais resultados", "Ordenar: mais recentes", "Ordenar: mais antigos",
  "Abrir escolha de político", "Abrir acompanhados", "Abrir histórico",
  "Compartilhar", "Toque em um controle",
]);
type Passo = { t: number; tipo: "pagina" | "acao" | "rolagem"; pagina: string; detalhe?: string; porcentagem?: number };

function falha(erro: string, status: number) {
  return NextResponse.json({ erro }, { status, headers });
}

function identificar(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(0, 4).toString("hex") === "1a45dfa3") {
    // Contêiner WebM: classificação final confere com o tipo enviado pelo navegador.
    return "webm";
  }
  if (buffer.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") return "mp4";
  return null;
}

function validarPercurso(valor: string, duracao: number): Passo[] | null {
  if (valor.length > 50_000) return null;
  let json: unknown;
  try { json = JSON.parse(valor); } catch { return null; }
  if (!Array.isArray(json) || json.length > 220) return null;
  const passos: Passo[] = [];
  let anterior = 0;
  for (const passo of json) {
    if (!passo || typeof passo !== "object" || Array.isArray(passo)) return null;
    const p = passo as Record<string, unknown>;
    if (!Number.isInteger(p.t) || Number(p.t) < anterior || Number(p.t) > duracao * 1000 + 1500 ||
        typeof p.pagina !== "string" || !PAGINA.test(p.pagina) ||
        !["pagina", "acao", "rolagem"].includes(String(p.tipo))) return null;
    anterior = Number(p.t);
    if (p.tipo === "acao" && (typeof p.detalhe !== "string" || !ACOES.has(p.detalhe))) return null;
    if (p.tipo === "rolagem" &&
        (!Number.isInteger(p.porcentagem) || Number(p.porcentagem) < 0 || Number(p.porcentagem) > 100)) return null;
    passos.push({
      t: Number(p.t), tipo: p.tipo as Passo["tipo"], pagina: p.pagina,
      ...(p.tipo === "acao" ? { detalhe: p.detalhe as string } : {}),
      ...(p.tipo === "rolagem" ? { porcentagem: p.porcentagem as number } : {}),
    });
  }
  return passos;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return falha("Origem inválida.", 403);
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("multipart/form-data"))
    return falha("Envie uma gravação feita no aplicativo.", 415);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_VIDEO + 100_000) return falha("O arquivo excedeu o limite.", 413);

  try {
    const limite = await consumeRateLimit({
      request, scope: "politicos:feedback-voz", limit: 4, windowSeconds: 3600,
    });
    if (!limite.allowed) {
      const response = falha("Muitos envios. Tente novamente mais tarde.", 429);
      response.headers.set("Retry-After", String(limite.retryAfterSeconds));
      return response;
    }
    const formulario = await request.formData();
    const arquivo = formulario.get("audio");
    const duracaoTexto = formulario.get("duracao");
    const percursoTexto = formulario.get("percurso");
    if (!(arquivo instanceof File) || typeof duracaoTexto !== "string" ||
        typeof percursoTexto !== "string") return falha("Gravação ou percurso ausente.", 400);
    const duracao = Number(duracaoTexto);
    if (!Number.isInteger(duracao) || duracao < 1 || duracao > 300)
      return falha("Duração inválida.", 400);
    const percurso = validarPercurso(percursoTexto, duracao);
    if (!percurso) return falha("Percurso de navegação inválido.", 400);
    const tipo = arquivo.type.split(";")[0].trim().toLowerCase();
    if (!TIPOS.has(tipo)) return falha("Formato de gravação incompatível.", 415);
    const video = tipo.startsWith("video/");
    if (video && duracao > 120) return falha("Vídeo limitado a 2 minutos.", 400);
    if (arquivo.size < 800 || arquivo.size > (video ? MAX_VIDEO : MAX_AUDIO))
      return falha("Arquivo muito grande ou vazio.", 413);

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const assinatura = identificar(buffer);
    if (!assinatura || (assinatura === "webm" && !tipo.endsWith("/webm")) ||
      (assinatura === "mp4" && !tipo.endsWith("/mp4")) ||
      (assinatura === "audio/ogg" && tipo !== "audio/ogg")) {
      return falha("Arquivo de mídia não reconhecido.", 415);
    }
    await garantirTabelaFeedbackVozPoliticos();
    await sql `
      INSERT INTO public.politicos_feedback_voz
        (id, audio, mime_type, duracao_segundos, percurso, tipo_midia)
      VALUES
        (${randomUUID()}::uuid, decode(${buffer.toString("hex")}, 'hex'),
          ${tipo}, ${duracao}, ${JSON.stringify(percurso)}::jsonb, ${video ? "video" : "audio"})
    `;
    return NextResponse.json({ recebido: true }, { status: 201, headers });
  } catch (error) {
    console.error("Falha ao receber feedback do Políticos:", error);
    return falha("Não foi possível enviar a gravação. Tente novamente.", 503);
  }
}
