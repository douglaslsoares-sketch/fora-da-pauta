import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Políticos acompanhados | Administração | Fora da Pauta", robots: { index: false, follow: false } };

type CountRow = { candidatura_id: string; total: string };

export default async function AdminPoliticosPage() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  let rows: CountRow[] | null = null;
  try {
    rows = await sql<CountRow[]>`
      SELECT candidatura_id, COUNT(DISTINCT telegram_chat_id)::text AS total
      FROM public.telegram_acompanhamentos
      WHERE status = 'ativo' AND cancelled_at IS NULL
      GROUP BY candidatura_id
      ORDER BY COUNT(DISTINCT telegram_chat_id) DESC, candidatura_id
      LIMIT 100
    `;
  } catch {
    // Indisponibilidade do banco não equivale à ausência de acompanhamentos.
  }
  const names = new Map(candidaturas.map(item => [item.id, item]));
  return (
    <main className="min-h-[calc(100svh-58px)] bg-[#eeeee9] px-5 py-12 text-[#151515]">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Área administrativa</p>
        <h1 className="mt-3 text-3xl font-bold">Políticos acompanhados</h1>
        <p className="mt-4 leading-7 text-black/65">Quantidade de contas que acompanham cada político, calculada a partir dos registros ativos. Os nomes vêm da base eleitoral do projeto.</p>
        {rows === null ? (
          <p className="mt-8 rounded-lg bg-white p-5">Não foi possível consultar os acompanhamentos agora.</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-lg bg-white p-5">Nenhum acompanhamento ativo encontrado.</p>
        ) : (
          <div className="mt-8 space-y-3">
            {rows.map(row => {
              const pessoa = names.get(row.candidatura_id);
              return (
                <div key={row.candidatura_id} className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-white p-5">
                  <div>
                    <p className="font-semibold">{pessoa?.nomeUrna || "Registro sem nome na base atual"}</p>
                    {pessoa && <p className="mt-1 text-sm text-black/55">{pessoa.siglaPartido} · {pessoa.uf}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">{Number(row.total).toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-black/50">contas</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-7 text-sm leading-6 text-black/55">Esta consulta não mostra dados dos leitores, não modifica suas escolhas e não envia notificações.</p>
        <div className="mt-8 flex justify-center"><Link href="/admin" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}
