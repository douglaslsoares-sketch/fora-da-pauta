import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { ensureArticleAudioTable } from "@/lib/articleAudio";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: unknown; action?: unknown; confirmation?: unknown; versao?:unknown } | null;
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  const action = body?.action;
  const confirmation = "PUBLICAR ARTIGO";
  if (!id || action !== "publicar" || body?.confirmation !== confirmation) return NextResponse.json({ erro: "Confirmação inválida." }, { status: 400 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        artigo_id uuid NOT NULL,
        acao text NOT NULL,
        registrado_em timestamptz NOT NULL DEFAULT now()
      )
    `;
    if (action === "publicar") {
      await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS capa_url text NOT NULL DEFAULT ''`;
      await ensureArticleAudioTable();
    }
    const resultado=await sql.begin(async tx=>{
      const [artigo]=await tx<{status:string;slug:string|null;titulo:string;conteudo:string;fontes:string;capa_url:string;updated_at:string;texto_hash:string}[]>`
        SELECT status,slug,titulo,conteudo,fontes,capa_url,updated_at::text,md5(jsonb_build_array(titulo,resumo,conteudo)::text) AS texto_hash
        FROM public.admin_artigos WHERE id=${id}::uuid FOR UPDATE
      `;
      if(!artigo||!["rascunho","revisao"].includes(artigo.status))return "Editorial indisponível para publicação.";
      if(body?.versao!==artigo.updated_at)return "O editorial foi alterado. Abra novamente a versão salva.";
      if(!artigo.slug||!artigo.titulo.trim()||!artigo.conteudo.trim()||!artigo.fontes.trim()||!artigo.capa_url.startsWith("https://"))return "Preencha título, URL, texto, fontes e capa.";
      const audio=await tx`UPDATE public.admin_artigos_audio SET aprovado=true,aprovado_em=now() WHERE artigo_id=${id}::uuid AND texto_hash=${artigo.texto_hash} RETURNING artigo_id`;
      if(!audio.length)return "Gere o áudio correspondente à versão salva do editorial.";
      await tx`UPDATE public.admin_artigos SET status='publicado',updated_at=now() WHERE id=${id}::uuid`;
      await tx`INSERT INTO public.admin_artigos_historico(artigo_id,acao) VALUES(${id}::uuid,'publicado')`;
      return null;
    });
    if(resultado)return NextResponse.json({erro:resultado},{status:409});
    return NextResponse.json({ ok: true, status: "publicado" });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar a publicação." }, { status: 503 });
  }
}
