import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { bancoEditoriais } from "@/lib/editoriais/db";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Administração de Editoriais", robots: { index:false, follow:false } };
export const dynamic = "force-dynamic";
export default async function AdminEditoriais() {
 if (!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin");
 let dados: {estado:string;total:string}[] | null = null;
 try { dados = await bancoEditoriais()< {estado:string;total:string}[] >`SELECT estado, count(*)::text AS total FROM editoriais.publicacoes GROUP BY estado`; } catch { /* Banco ainda indisponível. */ }
 return <main className="p-10 text-slate-900 bg-[#eeeee9] min-h-screen">
 <h1 className="text-3xl font-bold">Administração de Editoriais</h1>
 <p className="mt-3">Publicações e inscrições exclusivas deste aplicativo.</p>
 {dados === null ? <p className="mt-6">Banco de Editoriais ainda indisponível.</p> : <div className="mt-6 grid grid-cols-3 gap-4">{["rascunho","publicado","arquivado"].map(estado=><div key={estado} className="rounded-xl bg-white p-6"><p>{estado}</p><strong>{dados?.find(d=>d.estado===estado)?.total ?? "0"}</strong></div>)}</div>}
 <p className="mt-8">Ferramentas de edição e envio de avisos em preparação.</p>
 </main>;
}
