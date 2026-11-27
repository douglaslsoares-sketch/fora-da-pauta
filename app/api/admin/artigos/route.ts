import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { ensureArticleAudioTable } from "@/lib/articleAudio";
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
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS slug text`;
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS capa_bytes bytea`;
  await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS capa_tipo text`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS admin_artigos_slug_unico ON public.admin_artigos(slug) WHERE slug IS NOT NULL`;
  await ensureArticleAudioTable();
}
export async function GET() {
  if (!(await authorized())) return reply({ erro: "Acesso não autorizado." }, 401);
  try {
    await ensureTable();
    const artigos = await sql<{ id: string; titulo: string; resumo: string; conteudo: string; fontes: string; audio_url: string; capa_url: string; status: string; updated_at: string }[]>`
      SELECT id::text, titulo, resumo, conteudo, fontes, audio_url, capa_url, slug, status, updated_at::text
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
  const body = await request.json().catch(() => null) as { id?: unknown; titulo?: unknown; resumo?: unknown; conteudo?: unknown; fontes?: unknown; audio_url?: unknown; capa_url?: unknown; slug?:unknown; capa_data?:unknown } | null;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const resumo = typeof body?.resumo === "string" ? body.resumo.trim() : "";
  const conteudo = typeof body?.conteudo === "string" ? body.conteudo.trim() : "";
  const fontes = typeof body?.fontes === "string" ? body.fontes.trim() : "";
  const audio_url = typeof body?.audio_url === "string" ? body.audio_url.trim() : "";
  let capa_url = typeof body?.capa_url === "string" ? body.capa_url.trim() : "";
  const slug=typeof body?.slug==="string"?body.slug.trim().toLowerCase():titulo.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100).replace(/-$/,"");
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100||/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(slug))return reply({erro:"Informe uma URL válida para o editorial, com letras, números e hífens."},400);
  let imagem:Buffer|null=null;let tipo:string|null=null;
  if(body?.capa_data!==undefined&&body.capa_data!==null){
    const m=typeof body.capa_data==="string"&&body.capa_data.length<=2800000?body.capa_data.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/):null;
    if(!m)return reply({erro:"Selecione uma imagem JPEG, PNG ou WebP de até 2 MB."},400);
    imagem=Buffer.from(m[2],"base64");tipo=m[1];
    const valida=tipo==="image/jpeg"?imagem.subarray(0,3).equals(Buffer.from([255,216,255])):tipo==="image/png"?imagem.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):imagem.subarray(0,4).toString()==="RIFF"&&imagem.subarray(8,12).toString()==="WEBP";
    if(!valida||imagem.length>2097152)return reply({erro:"Imagem inválida ou maior que 2 MB."},400);
  }
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
    const alvo=id??randomUUID();
    if(imagem)capa_url="https://foradapauta.org/api/artigos/capa/"+alvo;
    if (id) {
      const rows = await sql.begin(async tx => {
      const alterados = await tx<{ id: string }[]>`
        UPDATE public.admin_artigos
        SET titulo = ${titulo}, resumo = ${resumo}, conteudo = ${conteudo}, fontes = ${fontes}, audio_url = ${audio_url}, capa_url = ${capa_url}, slug=${slug}, status='rascunho', capa_bytes=CASE WHEN ${Boolean(imagem)} THEN ${imagem}::bytea WHEN ${capa_url} = capa_url THEN capa_bytes ELSE NULL END, capa_tipo=CASE WHEN ${Boolean(imagem)} THEN ${tipo}::text WHEN ${capa_url} = capa_url THEN capa_tipo ELSE NULL END, updated_at = now()
        WHERE id = ${id}::uuid AND status IN ('rascunho','revisao')
        RETURNING id::text
      `;
      if (alterados.length) await tx`UPDATE public.admin_artigos_audio SET aprovado = false, aprovado_em = null WHERE artigo_id = ${id}::uuid AND aprovado`;
      return alterados;
      });
      if (!rows.length) return reply({ erro: "Rascunho não encontrado ou indisponível para edição." }, 404);
      return reply({ ok: true, id: rows[0].id });
    }
    const rows = await sql<{ id: string }[]>`
      INSERT INTO public.admin_artigos (id,titulo, resumo, conteudo, fontes, audio_url, capa_url, slug, capa_bytes,capa_tipo,status)
      VALUES (${alvo}::uuid,${titulo}, ${resumo}, ${conteudo}, ${fontes}, ${audio_url}, ${capa_url}, ${slug}, ${imagem},${tipo},'rascunho')
      RETURNING id::text
    `;
    return reply({ ok: true, id: rows[0].id });
  } catch (e) {
    if((e as {code?:string}).code==="23505")return reply({erro:"Este endereço já pertence a outro editorial. Escolha outro."},409);
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
    await ensureTable();
    const rows=await sql`DELETE FROM public.admin_artigos WHERE id=${id}::uuid AND status IN ('rascunho','revisao') RETURNING id`;
    return rows.length?reply({ok:true}):reply({erro:"Editorial publicado ou indisponível: exclusão proibida."},409);
  }catch{return reply({erro:"Não foi possível excluir o rascunho."},503)}
}
