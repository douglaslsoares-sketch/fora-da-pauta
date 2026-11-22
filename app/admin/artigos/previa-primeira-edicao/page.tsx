import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { primeiraEdicao } from "@/data/editorial/primeira-edicao";
import { CriarRascunhoPrimeiraEdicao } from "@/components/CriarRascunhoPrimeiraEdicao";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prévia — Por que pagamos tantos juros? | Fora da Pauta",
  robots: { index: false, follow: false },
};

const pergunta = /^(Por que|Quem |Poderia |E, principalmente|E será que|Mas será que|Se é pra|Quando ouvimos)/i;

export default async function PreviaPrimeiraEdicao() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin");

  return <main className="min-h-screen bg-[#141c2b] px-5 py-8 text-white sm:py-14">
    <article className="mx-auto max-w-3xl rounded-xl border border-[#344760] bg-[#24334b] px-5 py-8 sm:px-10 sm:py-12">
      <div className="rounded-lg border border-[#d4a73b] bg-[#352c19] p-3 text-center text-sm font-bold text-[#f4c542]">
        PRÉVIA PRIVADA — EDIÇÃO Nº 1 — NÃO PUBLICADA
      </div>
      <CabecalhoInterno titulo="Publicações" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-300">Edição nº 1 · {primeiraEdicao.dataReferencia} · leitura aproximada: 2 minutos</p>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{primeiraEdicao.titulo}</h1>
      <section className="mt-7 rounded-xl border border-[#3a5272] bg-[#192940] p-5">
        <h2 className="text-base font-bold text-[#f4c542]">Ouvir este artigo</h2>
        <p className="mt-1 text-sm leading-6 text-slate-300">A narração definitiva com a voz Marim será disponibilizada depois de gerada, ouvida e aprovada pelo painel. Nenhum áudio é apresentado como pronto nesta prévia.</p>
      </section>
      <div className="mt-9 space-y-5 leading-8">
        {primeiraEdicao.conteudo.split(/\n\s*\n/).filter(Boolean).map((p, i) =>
          <p key={i} className={pergunta.test(p) && p.endsWith("?") ? "font-semibold text-[#f4c542]" : "whitespace-pre-line"}>{p}</p>
        )}
      </div>
      <section className="mt-10 border-t border-[#3a5272] pt-7">
        <h2 className="text-xl font-bold text-[#f4c542]">Fonte e esclarecimento</h2>
        <p className="mt-2 text-sm text-slate-300">As informações abaixo não fazem parte da narração.</p>
        <p className="mt-4 text-sm leading-7 text-white">Banco Central do Brasil — Estatísticas Fiscais, setembro de 2026.</p>
        <p className="mt-4 text-sm leading-7 text-slate-300">{primeiraEdicao.notaTecnica}</p>
        <a href={primeiraEdicao.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block break-all font-semibold text-[#f4c542] underline underline-offset-4">Consultar os dados oficiais do Banco Central</a>
      </section>
      <CriarRascunhoPrimeiraEdicao />
      <div className="mt-10 flex justify-center">
        <Link href="/admin/artigos" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-bold text-white">× Fechar prévia</Link>
      </div>
    </article>
  </main>;
}
