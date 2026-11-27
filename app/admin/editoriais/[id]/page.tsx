import Link from "next/link";
import {cookies} from "next/headers";
import {notFound,redirect} from "next/navigation";
import AdminArticleDrafts from "@/components/AdminArticleDrafts";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
export const dynamic="force-dynamic";
export const metadata={title:"Editoriais | Administração",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){
 if(!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value))redirect("/admin");
 const {id:secao}=await params;
 if(secao==="novo"||secao==="rascunhos")redirect("/admin/editoriais/producao");
 if(secao!=="producao"&&secao!=="publicados")notFound();
 const titulo=secao==="producao"?"Produção":"Publicados";
 return <main className="min-h-screen bg-[#eeeee9] px-8 py-10 text-[#151515]"><section className="mx-auto max-w-5xl"><Link href="/admin/editoriais" className="text-sm font-semibold underline">← Editoriais</Link><h1 className="mt-5 text-3xl font-bold">{titulo}</h1><AdminArticleDrafts key={secao} modo={secao==="producao"?"todos":"publicados"}/><Link href="/admin/editoriais" className="mt-8 inline-flex rounded-lg bg-[#0E1A29] px-5 py-3 font-semibold text-white">× Fechar</Link></section></main>;
}
