import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inscrições | Administração | Fora da Pauta", robots: { index: false, follow: false } };

export default async function AdminInscricoesPage() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  let totals: { inscritos: number; novasEdicoes: number; acompanhamentos: number } | null = null;
  try {
    const [inscritos, edicoes, acompanhamentos] = await Promise.all([
      sql<{ total: string }[]>`
        SELECT COUNT(DISTINCT telegram_chat_id)::text AS total
        FROM public.telegram_preferencias
        WHERE status = 'ativo' AND cancelled_at IS NULL
      `,
      sql<{ total: string }[]>`
        SELECT COUNT(DISTINCT telegram_chat_id)::text AS total
        FROM public.telegram_preferencias
        WHERE tipo = 'novas_edicoes' AND status = 'ativo' AND cancelled_at IS NULL
      `,
      sql<{ total: string }[]>`
        SELECT COUNT(*)::text AS total
        FROM public.telegram_acompanhamentos
        WHERE status = 'ativo' AND cancelled_at IS NULL
      `,
    ]);
    totals = {
      inscritos: Number(inscritos[0]?.total ?? 0),
      novasEdicoes: Number(edicoes[0]?.total ?? 0),
      acompanhamentos: Number(acompanhamentos[0]?.total ?? 0),
    };
  } catch {
    // Falhas no banco não devem ser confundidas com zero inscritos.
  }
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Inscrições</h1>
        <p className="mt-4 leading-7 text-black/65">Indicadores obtidos diretamente do banco de dados. Os números incluem contas de teste que ainda estejam ativas; não representam necessariamente pessoas distintas.</p>
        {totals ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Contas com preferências ativas", value: totals.inscritos },
              { label: "Contas inscritas em novas edições", value: totals.novasEdicoes },
              { label: "Acompanhamentos ativos", value: totals.acompanhamentos },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-black/10 bg-white p-6">
                <p className="text-3xl font-bold tabular-nums">{item.value.toLocaleString("pt-BR")}</p>
                <p className="mt-3 text-sm leading-6 text-black/60">{item.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-black/15 bg-white p-5">Não foi possível consultar os indicadores agora. Tente novamente mais tarde.</p>
        )}
        <p className="mt-7 text-sm leading-6 text-black/55">Esta página não exibe nomes, números de telefone ou identificadores do Telegram. Não altera inscrições nem envia mensagens.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
