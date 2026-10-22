import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acompanhamento — Fique de Olho",
  description: "Acompanhe representantes eleitos, a Presidência da República e o Supremo Tribunal Federal.",
  robots: { index: false, follow: true },
};

const areas = [
  {
    identificador: "01",
    titulo: "Representantes eleitos",
    tipo: "Eleitos pelo voto",
    descricao: "Escolha deputados e outros representantes para acompanhar. A busca e suas escolhas existentes continuam funcionando como antes.",
    href: "/votou-fique-de-olho#escolher-representantes",
    acao: "Ir à busca de representantes",
  },
  {
    identificador: "02",
    titulo: "Agenda do presidente",
    tipo: "Poder Executivo",
    descricao: "Consulte os compromissos oficiais e saiba como vamos distinguir agenda prevista, atividades realizadas e decisões.",
    href: "/votou-fique-de-olho/acompanhamento/presidencia",
    acao: "Abrir a agenda do presidente",
  },
  {
    identificador: "03",
    titulo: "Supremo Tribunal Federal",
    tipo: "Poder Judiciário",
    descricao: "Consulte pautas de julgamento, composição do tribunal e fontes oficiais para entender o trabalho dos ministros.",
    href: "/votou-fique-de-olho/acompanhamento/stf",
    acao: "Abrir o acompanhamento do STF",
  },
] as const;

export default function AcompanhamentoPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-4xl px-5 pb-11 pt-8 sm:px-8">
          <Link href="/votou-fique-de-olho" className="text-sm font-semibold text-[#FFC400]">
            ← Voltar ao Fique de Olho
          </Link>
          <p className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-[#FFC400]">
            Fique de Olho · Acompanhamento
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            O que você quer acompanhar?
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">
            Três espaços para compreender a atuação de quem foi eleito e também
            de autoridades que exercem funções públicas sem eleição direta.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-9 sm:px-8">
        <section aria-label="Áreas de acompanhamento" className="grid gap-4">
          {areas.map((area) => (
            <article key={area.identificador} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/50">
                  {area.tipo}
                </p>
                <span className="text-xs font-bold text-black/35">
                  {area.identificador}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">{area.titulo}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">
                {area.descricao}
              </p>
              <Link
                href={area.href}
                className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#FFC400] px-5 py-3 text-sm font-bold text-black hover:bg-[#e9b300]"
              >
                {area.acao} →
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-9 rounded-xl border-l-4 border-[#FFC400] bg-white p-5" aria-labelledby="notificacoes-atuais">
          <h2 id="notificacoes-atuais" className="font-bold">E as notificações?</h2>
          <p className="mt-2 text-sm leading-6 text-black/70">
            O Telegram do Fora da Pauta continua sendo um só. Acompanhamentos
            já existentes não foram alterados. Nesta etapa, Presidência e STF
            oferecem acesso às fontes oficiais; a seleção individual e os
            avisos automáticos dessas duas áreas ainda não estão ativados.
          </p>
        </section>

        <nav aria-label="Continuar navegando" className="mt-9 flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/votou-fique-de-olho" className="underline underline-offset-4">
            ← Fique de Olho
          </Link>
          <Link
            href="/conheca-seu-candidato/100002535230/votacoes/2236186-60"
            className="underline underline-offset-4"
          >
            Rever a matéria de exemplo
          </Link>
        </nav>
      </div>
    </main>
  );
}
