import Link from "next/link";
import type { PessoaPoliticaInternacional } from "@/data/pessoas/modelo-pessoa-politica";

const nomesPaises: Record<string, string> = { US: "Estados Unidos", IL: "Israel" };
function pais(codigo: string) { return nomesPaises[codigo] ?? codigo; }
function data(iso?: string) {
  if (!iso) return "data não informada";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function FichaInternacional({ pessoa }: { pessoa: PessoaPoliticaInternacional }) {
  return <main className="min-h-screen bg-white px-5 py-10 text-black">
    <article className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold">Ficha política</h1>
        <h2 className="mt-6 text-2xl font-semibold">{pessoa.nomePublico}</h2>
        <p className="mt-2">País: {pessoa.paises.map(pais).join(", ")}</p>
        <p className="mt-2 text-sm">Última consulta da fonte de identificação: {data(pessoa.fonteIdentidade.consultadoEm)}.</p>
        <a href={pessoa.fonteIdentidade.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block underline">Conferir fonte de identificação</a>
      </header>
      {pessoa.vinculos.length > 0 ? <section aria-labelledby="vinculos">
        <h3 id="vinculos" className="mt-8 text-xl font-semibold">Cargos, partidos e instituições</h3>
        {pessoa.vinculos.length ? <ul className="mt-3 space-y-4">{[...pessoa.vinculos].sort((a,b) => (b.inicio ?? '').localeCompare(a.inicio ?? '')).map((v,i) => <li key={i} className="border-b border-black/10 pb-3">
          <p className="font-medium">{v.descricao} — {pais(v.pais)}</p>
          <p className="text-sm">Início: {data(v.inicio)}. {v.fim ? `Fim: ${data(v.fim)}.` : ""}</p>
          <a href={v.fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Conferir fonte</a>
        </li>)}</ul> : null}
      </section> : null}
      {pessoa.acontecimentos.length > 0 ? <section aria-labelledby="acontecimentos">
        <h3 id="acontecimentos" className="mt-8 text-xl font-semibold">Acontecimentos documentados</h3>
        {pessoa.acontecimentos.length ? <ol className="mt-3 space-y-4">{[...pessoa.acontecimentos].sort((a,b) => b.data.localeCompare(a.data)).map((e,i) => <li key={`${e.data}-${i}`} className="border-b border-black/10 pb-3">
          <p className="text-sm font-medium">{data(e.data)}{e.categoria ? ` · ${({decisao:"Decisão",declaracao:"Declaração","ato-oficial":"Ato oficial",eleicao:"Eleição",investigacao:"Investigação",processo:"Processo",outro:"Outro"} as Record<string,string>)[e.categoria]}` : ""}</p>
          <p className="mt-1 font-semibold">{e.titulo}</p>
          {e.natureza === "alegacao" ? <p className="text-sm font-medium">Alegação; não equivale a fato comprovado.</p> : null}
          {e.natureza === "declaracao-atribuida" ? <p className="text-sm">Declaração atribuída à pessoa indicada.</p> : null}
          {e.descricao ? <p className="mt-1 text-sm">{e.descricao}</p> : null}
          <a href={e.fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Conferir fonte</a>
        </li>)}</ol> : null}
      </section> : null}
      <footer className="mt-10 border-t border-black/15 pt-6">
        <Link href="/ficha-politica" className="inline-flex min-h-11 items-center rounded-lg border border-black/20 px-5 font-medium">← Voltar à busca</Link>
      </footer>
    </article>
  </main>;
}
