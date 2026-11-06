import { notFound, redirect } from "next/navigation";
import { consultarPessoaInternacionalConfirmada } from "@/data/pessoas/consultar-pessoa-internacional";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarCandidaturaConfirmadaDaPessoa } from "@/lib/eleicoes/identidade-politica";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ficha política | Fora da Pauta",
  robots: { index: false, follow: false },
};

/**
 * Endereço permanente da pessoa. Nesta primeira etapa, usa a ficha
 * eleitoral existente apenas quando há UMA candidatura disponível
 * associada documentalmente a uma identidade CONFIRMADA.
 *
 * Identidades ambíguas, em revisão ou sem candidatura consultável
 * não são associadas por semelhança de nome.
 */
export default async function FichaDaPessoa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^politico-[a-z0-9-]{8,80}$/.test(id)) notFound();

  const candidaturasDisponiveis = new Set(candidaturas.map(c => c.id));
  const candidaturaId = buscarCandidaturaConfirmadaDaPessoa(
    id,
    candidaturasDisponiveis,
  );

  if (!candidaturaId) {
    const pessoa = consultarPessoaInternacionalConfirmada(id);
    if (!pessoa) notFound();
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-black">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Ficha política</h1>
          <h2 className="mt-6 text-2xl font-semibold">{pessoa.nomePublico}</h2>
          <p className="mt-2">Países: {pessoa.paises.join(", ")}</p>
          <p className="mt-3">Informações verificadas conforme as datas das fontes.</p>
          <a className="mt-3 inline-block underline" href={pessoa.fonteIdentidade.url}>Fonte de identificação</a>
          <h3 className="mt-7 text-xl font-semibold">Vínculos políticos documentados</h3>
          <ul>{pessoa.vinculos.map((v, i) => <li key={i}>{v.descricao} · {v.pais} · <a className="underline" href={v.fonte.url}>Fonte</a></li>)}</ul>
          <h3 className="mt-7 text-xl font-semibold">Acontecimentos documentados</h3>
          <ul>{pessoa.acontecimentos.map((e, i) => <li key={i}>{e.data} · {e.titulo} · <a className="underline" href={e.fonte.url}>Fonte</a></li>)}</ul>
        </article>
      </main>
    );
  }
  redirect(`/conheca-seu-candidato/${candidaturaId}`);
}
