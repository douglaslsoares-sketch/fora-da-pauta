import type { PessoaPoliticaInternacional } from "@/data/pessoas/modelo-pessoa-politica";
export function FichaInternacional({ pessoa }: { pessoa: PessoaPoliticaInternacional }) {
  return <main className="min-h-screen bg-white px-5 py-10 text-black">
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Ficha política</h1>
      <h2 className="mt-6 text-2xl font-semibold">{pessoa.nomePublico}</h2>
      <p className="mt-2">Países: {pessoa.paises.join(", ")}</p>
      <p className="mt-3 text-sm">Informações disponíveis nesta base, com fontes documentais. A ausência de registros não significa ausência de atuação.</p>
      <a href={pessoa.fonteIdentidade.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block underline">Fonte de identificação</a>
      <h3 className="mt-8 text-xl font-semibold">Cargos, partidos e instituições</h3>
      {pessoa.vinculos.length ? <ul className="mt-3 space-y-4">{pessoa.vinculos.map((v,i) => <li key={i}>{v.descricao} ({v.pais}) · {v.inicio ?? "início não informado"} — {v.fim ?? "sem data final registrada"} · <a href={v.fonte.url} target="_blank" rel="noopener noreferrer" className="underline">Conferir fonte</a></li>)}</ul> : <p className="mt-2">Nenhum vínculo documentado nesta base.</p>}
      <h3 className="mt-8 text-xl font-semibold">Acontecimentos</h3>
      {pessoa.acontecimentos.length ? <ul className="mt-3 space-y-4">{pessoa.acontecimentos.map((e,i) => <li key={i}>{e.data} · {e.titulo} · <a href={e.fonte.url} target="_blank" rel="noopener noreferrer" className="underline">Conferir fonte</a></li>)}</ul> : <p className="mt-2">Ainda não há acontecimentos documentados nesta base.</p>}
    </article>
  </main>;
}
