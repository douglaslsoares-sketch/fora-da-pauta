import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { verificarAssinaturaResend, extrairProtocoloDestino } from "@/lib/interacoes/seguranca-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Evento = { type?: string; data?: { email_id?: string; to?: string[] } };
type EmailRecebido = { to?: string[]; from?: string; text?: string; headers?: Record<string,string> };

export async function POST(request: Request) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const chave = process.env.RESEND_API_KEY?.trim();
  const dominio = process.env.FDP_INTERACOES_DOMINIO_RESPOSTAS?.trim();
  if (process.env.FDP_INTERACOES_AUTOMATICAS !== "1" || !segredo || !chave || !dominio) {
    return NextResponse.json({ ok: false }, { status: 503, headers: noStore });
  }
  const payload = await request.text();
  if (payload.length > 30000 || !verificarAssinaturaResend(payload,
    request.headers.get("svix-id"), request.headers.get("svix-timestamp"),
    request.headers.get("svix-signature"), segredo)) {
    return NextResponse.json({ ok: false }, { status: 401, headers: noStore });
  }
  const evento = JSON.parse(payload) as Evento;
  if (evento.type !== "email.received") {
    // Eventos de entrega serão tratados em etapa independente.
    return NextResponse.json({ ok: true, ignorado: true }, { headers: noStore });
  }
  const emailId = evento.data?.email_id;
  if (!emailId || !uuid.test(emailId)) return NextResponse.json({ ok: false }, { status: 400, headers: noStore });

  // O webhook contém metadados; recuperar corpo do e-mail pela API autenticada.
  const r = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
    headers: { Authorization: `Bearer ${chave}` }, cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return NextResponse.json({ ok: false }, { status: 503, headers: noStore });
  const recebido = await r.json() as EmailRecebido;
  const protocolo = extrairProtocoloDestino(recebido.to ?? [], dominio);
  if (!protocolo || !uuid.test(protocolo)) {
    return NextResponse.json({ ok: true, ignorado: true }, { headers: noStore });
  }
  const endereco = /^.*?<([^<>]+)>$/.exec(recebido.from ?? "")?.[1] ?? recebido.from ?? "";
  const remetente = endereco.trim().toLowerCase();
  const corpo = typeof recebido.text === "string" ? recebido.text.trim() : "";
  const auth = Object.entries(recebido.headers ?? {})
    .find(([k]) => k.toLowerCase() === "authentication-results")?.[1] ?? "";
  // Origem não pode ser atribuída somente pelo campo From ou protocolo.
  // Sem DMARC alinhado aprovado, não atribuir resposta automaticamente.
  const autenticado = /\bdmarc=pass\b/i.test(auth);
  if (!autenticado || corpo.length < 1 || corpo.length > 2400) {
    return NextResponse.json({ ok: true, naoVerificado: true }, { headers: noStore });
  }

  const resultado = await sql.begin(async tx => {
    const registros = await tx<{
      id: string; email_destino: string; status: string;
    }[]>`
      SELECT p.id::text AS id, lower(r.endereco_destino) AS email_destino, p.status
      FROM public.interacoes_politicas p
      JOIN public.interacoes_remessas r ON r.interacao_id = p.id
      WHERE p.id = ${protocolo}::uuid AND r.status IN ('aceita_pelo_provedor','entregue')
        AND p.status IN ('em_analise','encaminhada')
      FOR UPDATE OF p
    `;
    const registro = registros[0];
    if (!registro || registro.email_destino !== remetente) return "nao_atribuivel";
    const eventoId = `received:${emailId}`;
    const novo = await tx<{ evento_id: string }[]>`
      INSERT INTO public.interacoes_webhooks_email (evento_id, evento_tipo)
      VALUES (${eventoId}, 'email.received')
      ON CONFLICT (evento_id) DO NOTHING RETURNING evento_id
    `;
    if (novo.length === 0) return "duplicado";
    await tx`
      UPDATE public.interacoes_politicas SET
        status = 'respondida', resposta_texto = ${corpo},
        resposta_autoria = 'assessoria', resposta_origem_verificada =
          'E-MAIL_INSTITUCIONAL_COM_DMARC_PASS',
        resposta_confirmada_at = now(), notificacao_status = 'pendente', updated_at = now()
      WHERE id = ${protocolo}::uuid
    `;
    await tx`
      INSERT INTO public.interacoes_politicas_historico (interacao_id, evento, observacao)
      VALUES (${protocolo}::uuid, 'respondida', 'RESPOSTA_EMAIL_INSTITUCIONAL_AUTENTICADO')
    `;
    return "registrado";
  });
  return NextResponse.json({ ok: true, resultado }, { headers: noStore });
}
