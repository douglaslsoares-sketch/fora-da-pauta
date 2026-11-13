import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
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
        <p className="mt-4 leading-7 text-black/65">Central de preparação dos avisos do Fora da Pauta. Nenhuma mensagem é enviada ao abrir esta página.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-bold">Teste individual</h2>
            <p className="mt-3 text-sm leading-6 text-black/65">Enviar somente à conta de teste autorizada, depois de confirmar a identidade do destinatário e o vínculo com o Telegram.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-black/45">Envio desativado — integração em preparação</p>
          </section>
          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="text-xl font-bold">Aviso aos inscritos</h2>
            <p className="mt-3 text-sm leading-6 text-black/65">Preparar notificações gerais e conferir o público antes de qualquer disparo.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-black/45">Envio desativado — integração em preparação</p>
          </section>
        </div>
        <p className="mt-7 text-sm leading-6 text-black/60">Publicar um artigo não autoriza automaticamente o envio de mensagens. O teste individual e o envio geral terão controles separados e confirmação explícita.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
