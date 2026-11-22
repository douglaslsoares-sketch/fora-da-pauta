import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { campaigns } from "@/data/campanhas";
import AdminArticleDrafts from "@/components/AdminArticleDrafts";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Artigos | Administração | Fora da Pauta",
  robots: { index: false, follow: false },
};

export default async function AdminArtigosPage() {
  const cookieStore = await cookies();
  if (!verifyQuestionsAdminSessionToken(cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Artigos</h1>
        <p className="mt-4 leading-7 text-black/65">Crie e salve rascunhos pelo painel. Os artigos do acervo anterior continuam disponíveis para consulta privada. Salvar um rascunho não publica o texto nem envia notificações.</p>
        <div className="mt-8 rounded-xl border border-[#d8b350] bg-[#fff9e7] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#806020]">Edição nº 1 · prévia não publicada</p>
          <h2 className="mt-2 text-xl font-bold">Por que pagamos tantos juros?</h2>
          <p className="mt-2 text-sm leading-6 text-black/70">Veja como a primeira publicação ficará no site e, depois, crie o rascunho para gerar e aprovar o áudio Marim. Nenhuma notificação será enviada.</p>
          <Link href="/admin/artigos/previa-primeira-edicao" className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-[#183352] px-5 py-3 font-bold text-white">Ver prévia da primeira edição</Link>
        </div>
        <AdminArticleDrafts />
        <h2 className="mt-12 text-2xl font-bold">Acervo anterior</h2>
        <div className="mt-8 space-y-3">
          {campaigns.map((item) => (
            <article key={item.slug} className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-black/60">{item.statement}</p>
              <p className="mt-3 text-xs text-black/50">Arquivo: {item.slug} · {item.sections.length} seções · Não publicado</p>
              <Link href={`/admin/artigos/${item.slug}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-black px-5 py-2 font-semibold text-white">Visualizar artigo</Link>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
