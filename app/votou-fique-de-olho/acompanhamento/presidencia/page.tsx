import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda do presidente — Fique de Olho",
  description: "Agenda presidencial, compromissos, decisões e fontes oficiais.",
  robots: { index: false, follow: true },
};

const blocos = [
  {
    titulo: "Agenda prevista",
    descricao: "O que consta na agenda oficial para os próximos compromissos. Um compromisso anunciado ainda não significa que foi realizado.",
  },
  {
    titulo: "O que aconteceu",
    descricao: "Depois do compromisso, verificar se ele ocorreu e o que foi divulgado ou documentado sobre o encontro.",
  },
  {
    titulo: "Decisões e consequências",
    descricao: "Distinguir declarações, medidas anunciadas, decisões efetivas e questões que ainda dependem de providências.",
  },
] as const;

export default function PresidenciaPage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-5 pb-11 pt-8 sm:px-8">
          <Link href="/votou-fique-de-olho/acompanhamento" className="text-sm font-bold text-[#FFC400]">
            ← As três áreas de acompanhamento
          </Link>
          <p className="mt-9 text-xs font-bold uppercase tracking-[0.19em] text-[#FFC400]">
            Fique de Olho · Poder Executivo
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Agenda do presidente
          </h1>
          <p className="mt-4 text-base leading-7 text-white/75">
            O que está previsto, o que foi realizado e quais decisões foram tomadas.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-9 sm:px-8">
        <section aria-labelledby="fonte-oficial-presidencia" className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/55">Fonte institucional</p>
          <h2 id="fonte-oficial-presidencia" className="mt-3 text-2xl font-bold">Consulte a agenda oficial</h2>
          <p className="mt-3 text-sm leading-6 text-black/70">
            Os horários e compromissos são atualizados pela Presidência da República.
            A fonte original é a referência para saber o que está oficialmente previsto.
          </p>
          <a
            href="https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/agenda-do-presidente-da-republica-lula/agenda-do-presidente-da-republica"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-[#FFC400] px-5 py-3 text-sm font-bold text-black hover:bg-[#e9b300]"
          >
            Abrir a agenda no Planalto ↗
          </a>
        </section>

        <section aria-labelledby="acompanhar-presidencia" className="mt-9">
          <h2 id="acompanhar-presidencia" className="text-2xl font-bold">Como vamos acompanhar</h2>
          <div className="mt-5 grid gap-4">
            {blocos.map((bloco, indice) => (
              <article key={bloco.titulo} className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs font-bold text-black/40">0{indice + 1}</p>
                <h3 className="mt-2 text-lg font-bold">{bloco.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-black/70">{bloco.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-8 border-l-4 border-[#FFC400] bg-white p-5 text-sm leading-6 text-black/70">
          Esta área já permite consultar a fonte. O Fora da Pauta ainda não importa
          automaticamente a agenda, não publica um histórico próprio de compromissos
          realizados nem envia alertas específicos sobre a Presidência.
        </p>
        <nav aria-label="Continuar acompanhando" className="mt-9 flex flex-wrap gap-5 text-sm font-bold">
          <Link href="/votou-fique-de-olho/acompanhamento" className="underline underline-offset-4">
            ← Outras áreas
          </Link>
          <Link href="/votou-fique-de-olho/acompanhamento/stf" className="underline underline-offset-4">
            Próxima: Supremo Tribunal Federal →
          </Link>
        </nav>
      </div>
    </main>
  );
}
