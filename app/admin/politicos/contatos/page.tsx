import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import VerificarContatosPoliticos from "@/components/VerificarContatosPoliticos";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verificar contatos | Administração | Fora da Pauta", robots: { index: false, follow: false } };
export default async function Page() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin");
  return <main className="min-h-screen bg-[#eeeee9] px-5 py-10 text-[#151515]">
    <section className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
      <h1 className="mt-3 text-3xl font-bold">Verificar contatos de parlamentares</h1>
      <p className="mt-3 text-sm leading-6 text-black/70">Consulta preliminar à Câmara e ao Senado, sem envio de mensagens nem aprovação automática de destinatários.</p>
      <VerificarContatosPoliticos />
      <p className="mt-8 text-center"><Link href="/admin/politicos" className="font-semibold text-blue-800 underline">Voltar a Políticos</Link></p>
    </section>
  </main>;
}
