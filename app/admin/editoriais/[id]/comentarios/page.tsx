import EditorialTexto from "@/components/EditorialTexto";
import Link from "next/link";
import {cookies} from "next/headers";
import {notFound,redirect} from "next/navigation";
import {sql} from "@/lib/interesses/db";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
import AdminEditorialComentarios from "@/components/AdminEditorialComentarios";
export const dynamic="force-dynamic";
export const metadata={title:"Acervo editorial | Administração",robots:{index:false,follow:false}};
type Artigo={titulo:string;status:string;resumo:string;conteudo:string;fontes:string;capa_url:string;updated_at:string};
export default async function Page({params}:{params:Promise<{id:string}>}){
 if(!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value))redirect("/admin");
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 const [artigo]=await sql<Artigo[]>`SELECT titulo,status,resumo,conteudo,fontes,COALESCE(to_jsonb(admin_artigos)->>'capa_url','') AS capa_url,updated_at::text FROM public.admin_artigos WHERE id=${id}::uuid AND status IN ('publicado','arquivado') LIMIT 1`;
 if(!artigo)notFound();
 return <main className="min-h-screen bg-[#eeeee9] px-8 py-10 text-[#151515]"><section className="mx-auto max-w-5xl">
 <Link href="/admin/editoriais/publicados" className="text-sm font-semibold underline">← Publicados</Link>
 <article className="mt-5 rounded-xl border border-black/10 bg-white p-7">
 <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Acervo permanente · somente leitura</p>
 <h1 className="mt-3 text-3xl font-bold">{artigo.titulo}</h1>
 <p className="mt-2 text-sm text-black/60">{artigo.status==="publicado"?"Publicado":"Arquivado anteriormente"} · {new Date(artigo.updated_at).toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo"})}</p>
 {artigo.capa_url&&<img src={artigo.capa_url} alt={artigo.titulo} referrerPolicy="no-referrer" className="mt-5 max-h-96 w-full rounded-lg object-contain"/>}
 {artigo.resumo&&<p className="mt-5 text-lg text-black/75">{artigo.resumo}</p>}
 <audio controls preload="none" src={`/api/artigos/audio/${id}`} className="mt-5 w-full"/>
 <div className="mt-8 space-y-5 text-base leading-7"><EditorialTexto texto={artigo.conteudo}/></div>
 <section className="mt-8 border-t pt-5"><h2 className="text-lg font-bold">Fontes e referências</h2><ul className="mt-3 list-disc space-y-2 pl-5">{artigo.fontes.split("\n").filter(Boolean).map((s,i)=><li className="break-words" key={i}>{s}</li>)}</ul></section>
 </article>
 <AdminEditorialComentarios slug={id} status={artigo.status}/>
 <Link href="/admin/editoriais/publicados" className="mt-8 inline-flex rounded-lg bg-[#0E1A29] px-5 py-3 font-semibold text-white">× Fechar</Link></section></main>;
}
