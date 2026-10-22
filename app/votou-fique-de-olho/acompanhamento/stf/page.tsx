import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supremo Tribunal Federal — Fique de Olho",
  description: "Acompanhe as pautas, decisões e julgamentos do Supremo Tribunal Federal.",
  robots: { index: false, follow: true },
};

const assuntos = [
  {
    titulo: "Julgamentos",
    texto: "O que está em discussão, a situação do julgamento e o resultado quando houver decisão colegiada.",
  },
  {
    titulo: "Decisões individuais",
    texto: "Atos de um ministro que podem ser provisórios ou sujeitos a revisão, com explicação da fase processual.",
  },
  {
    titulo: "Atuação pública",
    texto: "Entrevistas, pronunciamentos, agendas institucionais e outros registros verificáveis.",
  },
  {
    titulo: "Questões e esclarecimentos",
    texto: "Alegações, críticas e respostas apresentadas separadamente dos fatos comprovados.",
  },
] as const;

export default function STFPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-5 pb-11 pt-8 sm:px-8">
          <Link href="/votou-fique-de-olho/acompanhamento" className="text-sm font-bold text-[#FFC400]">
            ← As três áreas de acompanhamento
          </Link>
          <p className="mt-9 text-xs font-bold uppercase tracking-[0.19em] text-[#FFC400]">
            Fique de Olho · Poder Judiciário
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Supremo Tribunal Federal
          </h1>
          <p className="mt-4 text-base leading-7 text-white/75">
            Acompanhe julgamentos e decisões que podem afetar a vida da população.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-9 sm:px-8">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm" aria-labelledby="agenda-stf">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/55">Fonte institucional</p>
          <h2 id="agenda-stf" className="mt-3 text-2xl font-bold">Consulte as pautas de julgamento</h2>
          <p className="mt-3 text-sm leading-6 text-black/70">
            O calendário do STF informa as sessões e os processos pautados. Uma pauta
            é uma previsão: não significa que o julgamento terminou ou que já existe
            decisão definitiva.
          </p>
          <a
            href="https://portal.stf.jus.br/pauta/pesquisarCalendario.asp?aba=processo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[#FFC400] px-5 py-3 text-sm font-bold text-black hover:bg-[#e9b300]"
          >
            Abrir o calendário de julgamentos ↗
          </a>
          <a
            href="https://portal.stf.jus.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-fit text-sm font-semibold underline underline-offset-4"
          >
            Consultar o portal do STF ↗
          </a>
        </section>

        <section aria-labelledby="o-que-observar-stf" className="mt-9">
          <h2 id="o-que-observar-stf" className="text-2xl font-bold">O que observar</h2>
          <div className="mt-5 grid gap-4">
            {assuntos.map((assunto, indice) => (
              <article key={assunto.titulo} className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold text-black/40">0{indice + 1}</p>
                <h3 className="mt-2 text-lg font-bold">{assunto.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-black/70">{assunto.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-8 border-l-4 border-[#FFC400] bg-white p-5 text-sm leading-6 text-black/70">
          Os ministros do STF não são representantes eleitos. Esta área reúne
          consultas oficiais sobre a atuação do tribunal. Ainda não há
          acompanhamento individual de ministros nem alertas automáticos
          do STF pelo Telegram do Fora da Pauta.
        </p>

        <nav aria-label="Continuar acompanhando" className="mt-9 flex flex-wrap gap-5 text-sm font-bold">
          <Link href="/votou-fique-de-olho/acompanhamento" className="underline underline-offset-4">
            ← Outras áreas
          </Link>
          <Link href="/votou-fique-de-olho/acompanhamento/presidencia" className="underline underline-offset-4">
            Agenda do presidente →
          </Link>
        </nav>
      </div>
    </main>
  );
}
