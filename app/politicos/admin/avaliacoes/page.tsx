import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { LoginAdministracaoPoliticos } from "@/components/politicos/LoginAdministracaoPoliticos";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { garantirTabelaAvaliacoesPoliticos } from "@/lib/politicos/avaliacoes";
import { sql } from "@/lib/interesses/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Avaliações recebidas | Administração | Políticos",
  robots: { index: false, follow: false },
};

type Avaliacao = {
  id: string;
  nota: number;
  comentario: string | null;
  data: string;
};
type Estatistica = {
  nota: number;
  quantidade: string;
};

export default async function AvaliacoesAdministracao() {
  const sessao = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(sessao)) return <LoginAdministracaoPoliticos />;

  let avaliacoes: Avaliacao[] = [];
  let totais: Estatistica[] = [];
  let falha = false;
  try {
    await garantirTabelaAvaliacoesPoliticos();
    [avaliacoes, totais] = await Promise.all([
      sql<Avaliacao[]>`
        SELECT id::text AS id, nota, comentario,
          to_char(criado_em AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data
        FROM public.politicos_avaliacoes
        ORDER BY criado_em DESC LIMIT 100
      `,
      sql<Estatistica[]>`
        SELECT nota, count(*)::text AS quantidade
        FROM public.politicos_avaliacoes
        GROUP BY nota ORDER BY nota DESC
      `,
    ]);
  } catch (e) {
    console.error("Falha ao consultar avaliações do Políticos:", e);
    falha = true;
  }

  const quantidade = totais.reduce((soma, registro) => soma + Number(registro.quantidade), 0);
  const media = quantidade
    ? totais.reduce((soma, registro) => soma + Number(registro.nota) * Number(registro.quantidade), 0) / quantidade
    : null;

  return (
    <PaginaPoliticos titulo="Avaliações do aplicativo">
      <Link href="/politicos/admin" className="mb-5 inline-block text-sm font-semibold text-[#ffd333] underline underline-offset-4">← Voltar à administração</Link>
      {falha ? (
        <p role="alert" className="rounded-xl border border-red-500/50 p-5 text-white">
          Não foi possível consultar as avaliações. Consulte os registros do servidor.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#38556f] bg-[#162d44] p-5">
              <p className="text-3xl font-extrabold text-[#ffd333]">{quantidade.toLocaleString("pt-BR")}</p>
              <p className="mt-2 text-sm text-slate-200">Avaliações recebidas</p>
            </div>
            <div className="rounded-xl border border-[#38556f] bg-[#162d44] p-5">
              <p className="text-3xl font-extrabold text-[#ffd333]">{media === null ? "—" : media.toFixed(1).replace(".", ",") + " / 5"}</p>
              <p className="mt-2 text-sm text-slate-200">Média das notas</p>
            </div>
          </div>
          <section className="mt-5 rounded-xl border border-[#38556f] bg-[#162d44] p-5">
            <h2 className="text-lg font-bold">Distribuição das notas</h2>
            <div className="mt-4 space-y-3">
              {[5, 4, 3, 2, 1].map(nota => {
                const quantidadeNota = Number(totais.find(registro => Number(registro.nota) === nota)?.quantidade ?? 0);
                return <div key={nota} className="flex items-center gap-3">
                  <span className="w-7 text-sm font-bold text-[#ffd333]">{nota}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#394e64]">
                    <div className="h-full bg-[#ffd333]" style={{ width: `${quantidade ? (100 * quantidadeNota / quantidade) : 0}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm text-slate-200">{quantidadeNota}</span>
                </div>;
              })}
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-bold">Avaliações mais recentes</h2>
            <p className="mt-1 text-sm text-slate-300">Últimas 100 avaliações, com comentários quando enviados. Os dados não são publicados no aplicativo.</p>
            {avaliacoes.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#162d44] p-5 text-slate-200">Nenhuma avaliação recebida até agora.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {avaliacoes.map(avaliacao => (
                  <li key={avaliacao.id} className="rounded-xl border border-[#38556f] bg-[#162d44] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#ffd333]">{avaliacao.nota} / 5</span>
                      <time className="text-xs text-slate-300">{avaliacao.data} (Brasília)</time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-100">
                      {avaliacao.comentario?.trim() || "Sem comentário."}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </PaginaPoliticos>
  );
}
