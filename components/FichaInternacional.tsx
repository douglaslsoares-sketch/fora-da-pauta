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
        <p className="mt-3 text-sm">Ficha em construção. Os registros abaixo não representam toda a trajetória política desta pessoa.</p>
        <p className="mt-2 text-sm">Última consulta da fonte de identificação: {data(pessoa.fonteIdentidade.consultadoEm)}.</p>
        <a href={pessoa.fonteIdentidade.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block underline">Conferir fonte de identificação</a>
      </header>
      <section aria-labelledby="vinculos">
        <h3 id="vinculos" className="mt-8 text-xl font-semibold">Cargos, partidos e instituições</h3>
        {pessoa.vinculos.length ? <ul className="mt-3 space-y-4">{pessoa.vinculos.map((v,i) => <li key={i} className="border-b border-black/10 pb-3">
          <p className="font-medium">{v.descricao} — {pais(v.pais)}</p>
          <p className="text-sm">Início: {data(v.inicio)}. {v.fim ? `Fim: ${data(v.fim)}.` : "Fim: não registrado nesta base; confirmar situação atual na fonte."}</p>
          <a href={v.fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Conferir fonte</a>
        </li>)}</ul> : <p className="mt-2">Nenhum vínculo documentado nesta base.</p>}
      </section>
      <section aria-labelledby="acontecimentos">
        <h3 id="acontecimentos" className="mt-8 text-xl font-semibold">Acontecimentos documentados</h3>
        {pessoa.acontecimentos.length ? <ul className="mt-3 space-y-4">{pessoa.acontecimentos.map((e,i) => <li key={i}>{data(e.data)} · {e.titulo} · <a href={e.fonte.url} target="_blank" rel="noopener noreferrer" className="underline">Conferir fonte</a></li>)}</ul> : <p className="mt-2">Ainda não há acontecimentos documentados nesta base. Isso não significa ausência de atuação.</p>}
      </section>
      <footer className="mt-10 border-t border-black/15 pt-6">
        <Link href="/ficha-politica" className="inline-flex min-h-11 items-center rounded-lg border border-black/20 px-5 font-medium">← Voltar à busca</Link>
      </footer>
    </article>
  </main>;
}
