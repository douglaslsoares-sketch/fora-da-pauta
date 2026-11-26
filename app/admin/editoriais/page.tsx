import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminEditorialComentarios from "@/components/AdminEditorialComentarios";
import AdminArticleDrafts from "@/components/AdminArticleDrafts";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {title:"Editoriais | Administração",robots:{index:false,follow:false}};
export default async function Page(){
 const store=await cookies();
 if(!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin");
 return <main className="min-h-screen bg-[#eeeee9] px-8 py-10 text-[#151515]"><section className="mx-auto max-w-5xl"><h1 className="text-3xl font-bold">Editoriais</h1><p className="mt-3 text-sm">Crie, revise e publique os artigos do Fora da Pauta. Nenhum aviso é enviado automaticamente.</p><AdminArticleDrafts/><AdminEditorialComentarios/><Link href="/admin" className="mt-8 inline-block font-semibold underline">← Administração</Link></section></main>;
}