import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { RecadosAdminPanel } from "@/components/RecadosAdminPanel";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recados recebidos | Fora da Pauta", robots: { index: false, follow: false } };
export default async function Page() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  return <main className="min-h-screen bg-[#eeeee9] px-5 py-12 text-[#151515]">
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">Recados recebidos</h1>
      <p className="mt-3 text-black/65">Leia os recados escritos e organize a análise. Marcar como respondido não envia uma resposta ao remetente.</p>
      <div className="mt-5"><Link href="/admin" className="font-semibold underline">← Painel administrativo</Link></div>
      <RecadosAdminPanel />
    </section>
  </main>;
}
