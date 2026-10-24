import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function assinaturaValida(texto: string, id: string | null, tempo: string | null, assinatura: string | null, segredo: string): boolean {
  if (!segredo.startsWith("whsec_") || !id || !tempo || !assinatura || !/^[0-9]{10}$/.test(tempo)) return false;
  if (Math.abs(Date.now() / 1000 - Number(tempo)) > 300) return false;
  const chave = Buffer.from(segredo.slice(6), "base64");
  if (chave.length < 16) return false;
  const esperado = createHmac("sha256", chave).update(`${id}.${tempo}.${texto}`).digest();
  return assinatura.split(" ").some(parte => {
    if (!parte.startsWith("v1,")) return false;
    const obtido = Buffer.from(parte.slice(3), "base64");
    return obtido.length === esperado.length && timingSafeEqual(obtido, esperado);
  });
}

/** Apenas confirma um aviso assinado; não acessa banco, Telegram, nem serviços externos. */
export async function POST(request: Request) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET_TESTE?.trim();
  if (process.env.FDP_WEBHOOK_RESEND_TESTE_PUBLICO !== "1" || !segredo) {
    return NextResponse.json({ ok: false, codigo: "INATIVO" }, { status: 503, headers });
  }
  if (Number(request.headers.get("content-length") || "0") > 16384) {
    return NextResponse.json({ ok: false }, { status: 413, headers });
  }
  const corpo = await request.text();
  if (corpo.length > 16384 || !assinaturaValida(corpo, request.headers.get("svix-id"),
      request.headers.get("svix-timestamp"), request.headers.get("svix-signature"), segredo)) {
    return NextResponse.json({ ok: false }, { status: 401, headers });
  }
  let evento: unknown;
  try { evento = JSON.parse(corpo); } catch {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }
  const tipo = evento && typeof evento === "object" && "type" in evento
    ? (evento as { type?: unknown }).type : null;
  return NextResponse.json({ ok: true, teste: true,
    reconhecido: typeof tipo === "string" &&
      ["email.received", "email.delivered", "email.bounced", "email.failed"].includes(tipo) },
    { headers });
}
