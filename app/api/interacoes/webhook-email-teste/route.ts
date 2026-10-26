import { NextResponse } from "next/server";
import { verificarAssinaturaResend } from "@/lib/interacoes/seguranca-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/**
 * Receptor exclusivo para o teste de comunicação do Resend.
 * NÃO busca mensagens na API, NÃO grava no banco, NÃO encaminha nem notifica.
 * Permanece indisponível em Production: a chave de habilitação é Preview-only.
 */
export async function POST(request: Request) {
  if (process.env.FDP_WEBHOOK_EMAIL_TESTE !== "1") {
    return NextResponse.json({ ok: false, codigo: "TESTE_DESATIVADO" },
      { status: 503, headers: noStore });
  }
  const segredo = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!segredo) {
    return NextResponse.json({ ok: false, codigo: "SEGREDO_NAO_CONFIGURADO" },
      { status: 503, headers: noStore });
  }

  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > 32768) {
    return NextResponse.json({ ok: false }, { status: 413, headers: noStore });
  }
  const payload = await request.text();
  if (payload.length > 32768 || !verificarAssinaturaResend(
    payload,
    request.headers.get("svix-id"),
    request.headers.get("svix-timestamp"),
    request.headers.get("svix-signature"),
    segredo,
  )) {
    return NextResponse.json({ ok: false, codigo: "ASSINATURA_INVALIDA" },
      { status: 401, headers: noStore });
  }

  let evento: unknown;
  try { evento = JSON.parse(payload); }
  catch {
    return NextResponse.json({ ok: false }, { status: 400, headers: noStore });
  }
  const tipo = evento && typeof evento === "object" &&
    "type" in evento ? (evento as { type?: unknown }).type : null;
  const permitido = new Set(["email.received", "email.delivered", "email.bounced", "email.failed"]);
  if (typeof tipo !== "string" || !permitido.has(tipo)) {
    return NextResponse.json({ ok: true, teste: true, ignorado: true },
      { headers: noStore });
  }
  return NextResponse.json({ ok: true, teste: true, evento: tipo },
    { headers: noStore });
}

export async function GET() {
  // Válido para verificação de existência sem expor configuração interna.
  return NextResponse.json({ ok: false, metodo: "POST" },
    { status: 405, headers: noStore });
}
