import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql, administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return reply({ ok: false, error: "Origem inválida." }, 403);
  }
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    return reply({ ok: false, error: "Acesso administrativo necessário." }, 401);
  }
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.VERCEL_GIT_COMMIT_REF !== "revisao-admin-20261113" ||
    !administrativeDatabaseWritesAllowed()
  ) {
    return reply({ ok: false, error: "Diagnóstico disponível somente no banco isolado da prévia de revisão." }, 403);
  }
  try {
    const rate = await consumeRateLimit({
      request, scope: "admin:articles:diagnostic", limit: 3, windowSeconds: 3600,
    });
    if (!rate.allowed) {
      return reply({ ok: false, error: "Limite de diagnósticos atingido. Tente mais tarde." }, 429);
    }
  } catch {
    return reply({ ok: false, error: "Proteção do teste indisponível. Nenhuma alteração realizada." }, 503);
  }

  const etapas: string[] = [];
  try {
    await sql.begin(async (tx) => {
      // A transação mantém o artigo temporário invisível para os visitantes.
      // Um erro desfaz todas as etapas automaticamente.
      const inserted = await tx`
        INSERT INTO public.admin_artigos (titulo, resumo, conteudo, fontes, status)
        VALUES (
          'DIAGNÓSTICO INTERNO — NÃO PUBLICAR',
          'Registro técnico temporário de teste.',
          'Este texto serve apenas para conferir o funcionamento do banco isolado.',
          'Diagnóstico técnico interno (não é uma fonte jornalística).',
          'rascunho'
        )
        RETURNING id::text AS id, status
      ` as { id: string; status: string }[];
      const id = inserted[0]?.id;
      if (!id || inserted[0]?.status !== "rascunho") throw new Error("Falha na criação do rascunho.");
      etapas.push("Rascunho criado");

      const review = await tx`
        UPDATE public.admin_artigos SET status = 'revisao', updated_at = now()
        WHERE id = ${id}::uuid AND status = 'rascunho'
          AND length(trim(titulo)) > 0
          AND length(trim(conteudo)) > 0
          AND length(trim(fontes)) > 0
        RETURNING status
      ` as { status: string }[];
      if (review.length !== 1 || review[0].status !== "revisao") throw new Error("Falha na revisão.");
      etapas.push("Revisão validada");

      const published = await tx`
        UPDATE public.admin_artigos SET status = 'publicado', updated_at = now()
        WHERE id = ${id}::uuid AND status = 'revisao'
          AND length(trim(titulo)) > 0
          AND length(trim(conteudo)) > 0
          AND length(trim(fontes)) > 0
        RETURNING status
      ` as { status: string }[];
      if (published.length !== 1 || published[0].status !== "publicado") throw new Error("Falha na transição para publicado.");
      const visible = await tx`
        SELECT id::text AS id FROM public.admin_artigos
        WHERE id = ${id}::uuid AND status = 'publicado'
        LIMIT 1
      ` as { id: string }[];
      if (visible.length !== 1) throw new Error("A consulta de artigos publicados não encontrou o teste.");
      etapas.push("Publicação e consulta de dados validadas");

      const archived = await tx`
        UPDATE public.admin_artigos SET status = 'arquivado', updated_at = now()
        WHERE id = ${id}::uuid AND status = 'publicado'
        RETURNING status
      ` as { status: string }[];
      if (archived.length !== 1 || archived[0].status !== "arquivado") throw new Error("Falha no arquivamento.");
      const noLongerPublished = await tx`
        SELECT id FROM public.admin_artigos
        WHERE id = ${id}::uuid AND status = 'publicado'
      `;
      if (noLongerPublished.length !== 0) throw new Error("Artigo arquivado ainda aparece como publicado.");
      etapas.push("Arquivamento validado");

      const deleted = await tx`
        DELETE FROM public.admin_artigos WHERE id = ${id}::uuid
        RETURNING id
      `;
      if (deleted.length !== 1) throw new Error("Falha na limpeza do teste.");
      etapas.push("Registro temporário apagado");
    });
    return reply({
      ok: true,
      etapas,
      observacao: "Transições e consultas do banco isolado verificadas. A abertura da página pública não foi testada e nenhuma mensagem foi enviada.",
    });
  } catch {
    return reply({
      ok: false,
      error: "O diagnóstico não foi concluído. A transação foi desfeita; não houve publicação pública nem envio ao Telegram.",
    }, 503);
  }
}
