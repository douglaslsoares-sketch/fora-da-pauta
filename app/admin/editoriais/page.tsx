import Link from "next/link";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
export const dynamic="force-dynamic";
export const metadata={title:"Editoriais | Administração",robots:{index:false,follow:false}};
const acessos=[{nome:"Novo",descricao:"Criar um editorial",href:"novo"},{nome:"Rascunhos",descricao:"Continuar a edição e revisar artigos",href:"rascunhos"},{nome:"Publicados",descricao:"Gerenciar publicações e comentários",href:"publicados"}];
export default async function Page(){
 if(!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value))redirect("/admin");
 return <main className="min-h-screen bg-[#eeeee9] px-8 py-10 text-[#151515]"><section className="mx-auto max-w-5xl"><h1 className="text-3xl font-bold">Editoriais</h1><div className="mt-8 grid gap-4 md:grid-cols-3">{acessos.map(a=><Link key={a.href} href={"/admin/editoriais/"+a.href} className="rounded-xl border border-black/10 bg-white p-6 hover:border-[#315b92] hover:shadow-sm"><h2 className="text-xl font-bold">{a.nome}</h2><p className="mt-2 text-sm text-black/60">{a.descricao}</p></Link>)}</div><Link href="/admin" className="mt-8 inline-block font-semibold underline">← Administração</Link></section></main>;
}
