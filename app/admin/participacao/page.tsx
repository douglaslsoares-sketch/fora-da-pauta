import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { AdminParticipacaoNome } from "@/components/AdminParticipacaoNome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Participação | Administração | Fora da Pauta", robots: { index: false, follow: false } };

export default async function AdminParticipacaoPage() {
  if (!verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin");
  return <main className="min-h-screen bg-[#eeeee9] px-5 py-10 text-[#151515]">
    <section className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
      <h1 className="mt-3 text-3xl font-extrabold">Participação</h1>
      <p className="mt-3 leading-7 text-black/65">Convites e sugestões das pessoas que acompanham o Fora da Pauta.</p>
      <AdminParticipacaoNome />
      <div className="mt-9 text-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-bold text-white">× Fechar</Link></div>
    </section>
  </main>;
}
