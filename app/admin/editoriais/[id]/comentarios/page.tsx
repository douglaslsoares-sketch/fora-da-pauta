import Link from "next/link";
import {cookies} from "next/headers";
import {notFound,redirect} from "next/navigation";
import {sql} from "@/lib/interesses/db";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
import AdminEditorialComentarios from "@/components/AdminEditorialComentarios";
export const dynamic="force-dynamic";
export const metadata={title:"Comentários | Administração",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){
 if(!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value))redirect("/admin");
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 const [artigo]=await sql<{titulo:string;status:string}[]>`SELECT titulo,status FROM public.admin_artigos WHERE id=${id}::uuid LIMIT 1`;
 if(!artigo)notFound();
 return <main className="min-h-screen bg-[#eeeee9] px-8 py-10 text-[#151515]"><section className="mx-auto max-w-5xl"><Link href="/admin/editoriais" className="text-sm font-semibold underline">← Editoriais</Link><h1 className="mt-5 text-3xl font-bold">{artigo.titulo}</h1><p className="mt-2 text-sm text-black/60">Situação: {artigo.status}</p><AdminEditorialComentarios slug={id} status={artigo.status}/><Link href="/admin/editoriais" className="mt-8 inline-flex rounded-lg bg-[#0E1A29] px-5 py-3 font-semibold text-white">× Fechar</Link></section></main>;
}
