import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminWhatsappAvisoManual from "@/components/AdminWhatsappAvisoManual";


import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Notificações | Administração | Fora da Pauta",
  robots: { index: false, follow: false },
};

export default async function AdminNotificacoesPage() {
  const cookieStore = await cookies();
  if (!verifyQuestionsAdminSessionToken(cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Notificações</h1>
        <p className="mt-4 leading-7 text-black/65">Painel de consulta e preparação. O canal atual do projeto é o WhatsApp. Nenhuma mensagem é enviada ao abrir esta página.</p>
        <AdminWhatsappAvisoManual />
        <p className="mt-7 text-sm leading-6 text-black/60">Publicar um artigo não envia avisos automaticamente. Esta página apenas prepara o texto para você publicar no canal.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
