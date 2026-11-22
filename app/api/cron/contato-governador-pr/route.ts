import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { idsEleitosEm2026 } from "@/lib/eleicoes/acompanhamento-politico";
import { consultarContatoGovernadorEmExercicio } from "@/lib/eleicoes/contato-governador";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const semCache = { "Cache-Control": "private, no-store" };

// O Cron Secret configurado na Vercel é enviado como Authorization: Bearer.
// Se ausente, falhar fechado. Não aceitar query string, token em URL nem cookie.
function autorizado(request: NextRequest): boolean {
  const chave = process.env.CRON_SECRET;
  if (!chave) return false;
  const recebido = request.headers.get("authorization") || "";
  const esperado = "Bearer " + chave;
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function prepararTabelas() {
  await sql`CREATE TABLE IF NOT EXISTS public.contatos_governadores_monitorados (
    candidatura_id text PRIMARY KEY,
    nome_civil text NOT NULL,
    uf text NOT NULL,
    situacao text NOT NULL,
    nome_oficial text,
    email_institucional text,
    fonte_url text,
    fontes_conferidas jsonb NOT NULL DEFAULT '[]'::jsonb,
    verificado_em timestamptz NOT NULL,
    envio_habilitado boolean NOT NULL DEFAULT false CHECK (envio_habilitado = false),
    contato_aprovado boolean NOT NULL DEFAULT false CHECK (contato_aprovado = false)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS public.contatos_governadores_monitorados_historico (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidatura_id text NOT NULL,
    situacao text NOT NULL,
    email_institucional text,
    registrado_em timestamptz NOT NULL DEFAULT now()
  )`;
}

export async function GET(request: NextRequest) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ erro: "Monitoramento disponível somente em produção." }, { status: 403, headers: semCache });
  }
  // O cadastro eleitoral determina quem será pesquisado, NÃO comprova exercício.
  const elegiveis = candidaturas.filter(p =>
    p.uf === "PR" && p.cargo === "governador" && idsEleitosEm2026.has(p.id)
  );
  if (elegiveis.length !== 1) {
    return NextResponse.json({
      erro: "Não foi possível identificar unicamente o governador eleito do Paraná nas fontes eleitorais.",
      envioHabilitado: false,
    }, { status: 422, headers: semCache });
  }
  const pessoa = elegiveis[0];
  try {
    const resultado = await consultarContatoGovernadorEmExercicio(pessoa);
    const verificadoEm = new Date().toISOString();

    // Nunca salvar um endereço não confirmado: eventual dado antigo é descartado.
    const contatoConfirmado = resultado.situacao === "confirmado";
    const email = contatoConfirmado ? resultado.emailInstitucional : null;
    const nomeOficial = contatoConfirmado ? resultado.nomeOficial : null;
    const fonte = contatoConfirmado ? resultado.fonteUrl : null;
    const fontes = JSON.stringify(contatoConfirmado ? resultado.fontesConferidas : []);

    await prepararTabelas();
    await sql.begin(async tx => {
      const anterior = await tx`SELECT situacao, email_institucional
        FROM public.contatos_governadores_monitorados
        WHERE candidatura_id = ${pessoa.id} FOR UPDATE`;
      await tx`INSERT INTO public.contatos_governadores_monitorados
        (candidatura_id, nome_civil, uf, situacao, nome_oficial,
         email_institucional, fonte_url, fontes_conferidas, verificado_em,
         envio_habilitado, contato_aprovado)
        VALUES (${pessoa.id}, ${pessoa.nomeCompleto}, ${pessoa.uf},
          ${resultado.situacao}, ${nomeOficial}, ${email}, ${fonte}, ${fontes}::jsonb,
          ${verificadoEm}::timestamptz, false, false)
        ON CONFLICT (candidatura_id) DO UPDATE SET
          nome_civil = EXCLUDED.nome_civil,
          uf = EXCLUDED.uf,
          situacao = EXCLUDED.situacao,
          nome_oficial = EXCLUDED.nome_oficial,
          email_institucional = EXCLUDED.email_institucional,
          fonte_url = EXCLUDED.fonte_url,
          fontes_conferidas = EXCLUDED.fontes_conferidas,
          verificado_em = EXCLUDED.verificado_em,
          envio_habilitado = false,
          contato_aprovado = false`;
      if (!anterior[0] || anterior[0].situacao !== resultado.situacao ||
          anterior[0].email_institucional !== email) {
        await tx`INSERT INTO public.contatos_governadores_monitorados_historico
          (candidatura_id, situacao, email_institucional)
          VALUES (${pessoa.id}, ${resultado.situacao}, ${email})`;
      }
    });

    return NextResponse.json({
      monitoramento: "verificacao_registrada",
      estado: "PR",
      situacao: resultado.situacao,
      verificadoEm,
      contatoReconhecido: contatoConfirmado,
      envioHabilitado: false,
      contatoAprovado: false,
    }, { headers: semCache });
  } catch (error) {
    console.error("Falha no monitoramento institucional do governador do PR:", error);
    return NextResponse.json({
      erro: "Não foi possível concluir a conferência institucional.",
      envioHabilitado: false,
      contatoAprovado: false,
    }, { status: 503, headers: semCache });
  }
}
