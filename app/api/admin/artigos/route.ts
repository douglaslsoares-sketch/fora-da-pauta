import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function authorized() {
  const store = await cookies();
  return verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
}
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.admin_artigos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo text NOT NULL,
      resumo text NOT NULL DEFAULT '',
      conteudo text NOT NULL DEFAULT '',
      fontes text NOT NULL DEFAULT '',
      audio_url text NOT NULL DEFAULT '',
      capa_url text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'publicado', 'arquivado')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS fontes text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS audio_url text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS capa_url text NOT NULL DEFAULT ''`;
}
export async function GET() {
  if (!(await authorized())) return reply({ erro: "Acesso não autorizado." }, 401);
  try {
    await ensureTable();
    const artigos = await sql<{ id: string; titulo: string; resumo: string; conteudo: string; fontes: string; audio_url: string; capa_url: string; status: string; updated_at: string }[]>`
      SELECT id::text, titulo, resumo, conteudo, fontes, audio_url, capa_url, status, updated_at::text
      FROM public.admin_artigos ORDER BY updated_at DESC LIMIT 100
    `;
    return reply({ artigos });
  } catch {
    return reply({ erro: "Banco de rascunhos indisponível." }, 503);
  }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return reply({ erro: "Origem não autorizada." }, 403);
  if (!(await authorized())) return reply({ erro: "Acesso não autorizado." }, 401);
  const limit = await consumeRateLimit({ request, scope: "admin:artigos:rascunhos", limit: 30, windowSeconds: 600 });
  if (!limit.allowed) return reply({ erro: "Muitas alterações. Aguarde." }, 429);
  const body = await request.json().catch(() => null) as { id?: unknown; titulo?: unknown; resumo?: unknown; conteudo?: unknown; fontes?: unknown; audio_url?: unknown; capa_url?: unknown } | null;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const resumo = typeof body?.resumo === "string" ? body.resumo.trim() : "";
  const conteudo = typeof body?.conteudo === "string" ? body.conteudo.trim() : "";
  const fontes = typeof body?.fontes === "string" ? body.fontes.trim() : "";
  const audio_url = typeof body?.audio_url === "string" ? body.audio_url.trim() : "";
  const capa_url = typeof body?.capa_url === "string" ? body.capa_url.trim() : "";
  let capaValida = !capa_url;
  if (capa_url && capa_url.length <= 2048) {
    try { const u = new URL(capa_url); capaValida = u.protocol === "https:" && !u.username && !u.password; } catch { capaValida = false; }
  }
  if (!capaValida) return reply({ erro: "Informe um endereço HTTPS válido da imagem de capa." }, 400);
  let audioValido = !audio_url;
  if (audio_url && audio_url.length <= 2048) {
    try {
      const u = new URL(audio_url);
      audioValido = u.protocol === "https:" && !u.username && !u.password && /\.(mp3|m4a|ogg|wav)$/i.test(u.pathname);
    } catch { audioValido = false; }
  }
  if (!audioValido) return reply({ erro: "O áudio deve ser um link HTTPS direto para arquivo MP3, M4A, OGG ou WAV." }, 400);
  if (!titulo || titulo.length > 200 || resumo.length > 1000 || conteudo.length > 100000 || fontes.length > 20000) return reply({ erro: "Título inválido ou limite dos campos excedido." }, 400);
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  if (body?.id && !id) return reply({ erro: "Identificador inválido." }, 400);
  try {
    await ensureTable();
    if (id) {
      const rows = await sql<{ id: string }[]>`
        UPDATE public.admin_artigos
        SET titulo = ${titulo}, resumo = ${resumo}, conteudo = ${conteudo}, fontes = ${fontes}, audio_url = ${audio_url}, capa_url = ${capa_url}, updated_at = now()
        WHERE id = ${id}::uuid AND status = 'rascunho'
        RETURNING id::text
      `;
      if (!rows.length) return reply({ erro: "Rascunho não encontrado ou indisponível para edição." }, 404);
      await sql`CREATE TABLE IF NOT EXISTS public.admin_artigos_audio (artigo_id uuid PRIMARY KEY REFERENCES public.admin_artigos(id) ON DELETE CASCADE, audio bytea NOT NULL, aprovado boolean NOT NULL DEFAULT false, gerado_em timestamptz NOT NULL DEFAULT now(), aprovado_em timestamptz)`;
      await sql`UPDATE public.admin_artigos_audio SET aprovado = false, aprovado_em = null WHERE artigo_id = ${id}::uuid`;
      return reply({ ok: true, id: rows[0].id });
    }
    const rows = await sql<{ id: string }[]>`
      INSERT INTO public.admin_artigos (titulo, resumo, conteudo, fontes, audio_url, capa_url, status)
      VALUES (${titulo}, ${resumo}, ${conteudo}, ${fontes}, ${audio_url}, ${capa_url}, 'rascunho')
      RETURNING id::text
    `;
    return reply({ ok: true, id: rows[0].id });
  } catch {
    return reply({ erro: "Não foi possível salvar. Nenhum artigo foi publicado." }, 503);
  }
}

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({erro:"Origem não autorizada."},403);
  if (!(await authorized())) return reply({erro:"Acesso não autorizado."},401);
  const body = await request.json().catch(()=>null) as {id?:unknown;confirmacao?:unknown}|null;
  const id = body?.id;
  if(typeof id!=="string"||!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))||body?.confirmacao!=="EXCLUIR RASCUNHO")return reply({erro:"Confirmação inválida."},400);
  try{
    const rows=await sql`DELETE FROM public.admin_artigos WHERE id=${id}::uuid AND status IN ('rascunho','revisao') RETURNING id`;
    return rows.length?reply({ok:true}):reply({erro:"Editorial publicado ou indisponível: exclusão proibida."},409);
  }catch{return reply({erro:"Não foi possível excluir o rascunho."},503)}
}
