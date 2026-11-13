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
    redirect("/admin/perguntas");
  }
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Artigos</h1>
        <p className="mt-4 leading-7 text-black/65">Crie e salve rascunhos pelo painel. Os artigos do acervo anterior continuam disponíveis para consulta privada. Salvar um rascunho não publica o texto nem envia notificações.</p>
        <AdminArticleDrafts acervo={campaigns.map((item) => ({
          slug: item.slug,
          titulo: item.title,
          resumo: item.statement,
          conteudo: [
            ...(item.comparison ? [
              ...(item.comparison.eyebrow ? [`### ${item.comparison.eyebrow}`] : []),
              `## ${item.comparison.title}`,
              `### ${item.comparison.left.label}`,
              ...item.comparison.left.lines,
              item.comparison.connector,
              `### ${item.comparison.right.label}`,
              ...item.comparison.right.lines,
              ...(item.comparison.right.emphasis ? [item.comparison.right.emphasis] : []),
              ...(item.comparison.summary ? [item.comparison.summary] : []),
            ] : []),
            ...item.sections.map((section) => [
            section.eyebrow ? `### ${section.eyebrow}` : "",
            `## ${section.title}`,
            ...section.paragraphs,
          ].filter(Boolean).join("\n\n")),
          ].join("\n\n"),
          fontes: item.sections.flatMap((section) => section.references || []).map((ref) => `${ref.label} — ${ref.url}`).join("\n"),
        }))} />
        <h2 className="mt-12 text-2xl font-bold">Acervo anterior</h2>
        <div className="mt-8 space-y-3">
          {campaigns.map((item) => (
            <article key={item.slug} className="rounded-lg border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-black/60">{item.statement}</p>
              <p className="mt-3 text-xs text-black/50">Arquivo: {item.slug} · {item.sections.length} seções · Item do acervo anterior</p>
              <div className="mt-4 flex flex-wrap gap-2"><Link href={`/admin/artigos/${item.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-black px-5 py-2 font-semibold text-white">Visualizar artigo</Link><a href={`/admin/artigos?importar=${encodeURIComponent(item.slug)}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/20 px-5 py-2 font-semibold">Preparar cópia no editor</a></div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
