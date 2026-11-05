import Link from "next/link";
import { notFound } from "next/navigation";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";
import { FecharPaginaLink } from "@/components/FecharPaginaLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Histórico de atuação — Fora da Pauta", robots: { index: false, follow: false } };

function exibirData(valor: string) {
  const data = valor.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(data) ? data.split("-").reverse().join("/") : valor;
}

export default async function Historico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{8,20}$/.test(id)) notFound();
  const pessoa = candidaturas.find(item => item.id === id);
  if (!pessoa) notFound();
  const dados = buscarAtuacaoPolitica(id);
  const eventos = [
    ...(dados?.votacoes ?? []).map(item => ({
      id: `v-${item.votacaoId}`, ordem: item.dataHora || item.data, data: item.data,
      tipo: "Votação", descricao: item.descricao,
      detalhe: `Voto registrado: ${item.voto}`, fonte: item.fonte,
    })),
    ...(dados?.proposicoes ?? []).map(item => ({
      id: `p-${item.proposicaoId}`, ordem: item.data, data: item.data,
      tipo: "Proposição", descricao: item.ementa,
      detalhe: `${item.identificacao} · ${item.papel}`, fonte: item.fonte,
    })),
  ].sort((a,b) => b.ordem.localeCompare(a.ordem));
  return <main className="min-h-screen bg-white px-5 py-8 text-black">
    <section className="mx-auto max-w-[760px]">
      <div className="flex justify-end"><FecharPaginaLink /></div>
      <h1 className="mt-5 text-3xl font-bold">Histórico de atuação</h1>
      <h2 className="mt-4 text-xl font-semibold">{pessoa.nomeUrna}</h2>
      <p className="mt-2 text-sm text-black/65">{formatarCargo(pessoa.cargo, pessoa.genero)} · {pessoa.uf} · {pessoa.siglaPartido}</p>
      <p className="mt-5 leading-7 text-black/75">Votações e proposições documentadas, da mais recente para a mais antiga. Nem todas as atividades podem estar nesta base.</p>
      {dados ? <p className="mt-4 rounded-xl bg-black/5 p-4 text-sm">
        {dados.totalVotacoes} votações · {dados.totalProposicoes} proposições. Atualizado em {exibirData(dados.atualizadoEm)}.
      </p> : null}
      {eventos.length ? <ol className="mt-7 space-y-3">{eventos.map(item => <li key={item.id} className="rounded-xl border border-black/15 p-5">
        <p className="text-xs font-bold text-black/60">{item.tipo} · {exibirData(item.data)}</p>
        <h3 className="mt-2 font-semibold">{item.descricao}</h3>
        <p className="mt-2 text-sm leading-6 text-black/75">{item.detalhe}</p>
        <a className="mt-3 inline-flex min-h-11 items-center font-semibold underline" href={item.fonte.url} target="_blank" rel="noopener noreferrer">Conferir fonte ↗</a>
      </li>)}</ol> : <p className="mt-7 rounded-xl border border-black/15 p-5">Ainda não há registros de atuação disponíveis nesta base para esta pessoa. Isso não significa ausência de atividade.</p>}
      <Link href={`/conheca-seu-candidato/${id}`} className="mt-7 flex min-h-12 items-center justify-center rounded-xl border border-black/20 p-3 font-semibold">Ver ficha política →</Link>
    </section>
  </main>;
}
