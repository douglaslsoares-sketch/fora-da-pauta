import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarHistoricoPolitico } from "@/data/eleicoes/historico-politico";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { buscarDossiePorCandidaturaId } from "@/data/eleicoes/dossies";

export const metadata: Metadata = {
  title: "Histórico documentado de um político",
  description: "Consulta cronológica dos registros documentados de políticos, com datas, fontes e contexto.",
};

export const dynamic = "force-dynamic";

type Registro = {
  chave: string;
  data: string;
  rotulo: string;
  categoria: string;
  titulo: string;
  resumo: string;
  fontes: { titulo: string; url: string }[];
  detalhes?: { titulo: string; texto: string }[];
};

function dataParaOrdenacao(texto: string) {
  const datas = texto.match(/\d{4}(?:-\d{2}(?:-\d{2})?)?/g) ?? [];
  return datas.map(item => item.padEnd(10, "-00")).sort().at(-1) ?? "0000-00-00";
}

function dataPortugues(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function rotuloData(data: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(data) ? dataPortugues(data) : data;
}

export default async function HistoricoDeUmPolitico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{8,20}$/.test(id)) notFound();

  const politico = candidaturas.find(candidato => candidato.id === id);
  if (!politico) notFound();

  const historico = buscarHistoricoPolitico(id);
  const atuacao = buscarAtuacaoPolitica(id);
  const dossie = buscarDossiePorCandidaturaId(id);
  const registros: Registro[] = [];

  for (const [indice, item] of (historico?.trajetoria ?? []).entries()) {
    registros.push({
      chave: `trajetoria-${indice}`,
      data: dataParaOrdenacao(item.periodo ?? ""),
      rotulo: item.periodo ?? "Data não informada",
      categoria: "Trajetória",
      titulo: item.titulo,
      resumo: item.descricao ?? "",
      fontes: [item.fonte],
    });
  }

  for (const evento of dossie?.eventos ?? []) {
    const detalhes: Registro["detalhes"] = [];
    for (const fato of evento.fatoDocumentado ?? []) {
      detalhes.push({ titulo: "Fato documentado", texto: fato });
    }
    for (const registro of evento.oQueFoiPublicadoOuQuestionado ?? []) {
      detalhes.push({ titulo: registro.atribuicao, texto: registro.texto });
    }
    for (const resposta of evento.respostas ?? []) {
      detalhes.push({ titulo: `Resposta — ${resposta.atribuicao}`, texto: resposta.texto });
    }
    for (const desdobramento of evento.desdobramentos ?? []) {
      detalhes.push({ titulo: "Desdobramento", texto: desdobramento });
    }
    registros.push({
      chave: `evento-${evento.id}`,
      data: evento.data.inicio,
      rotulo: evento.data.rotulo || rotuloData(evento.data.inicio),
      categoria: evento.natureza.join(" · ") || "Registro público",
      titulo: evento.titulo,
      resumo: evento.resumo,
      fontes: evento.fontes.map(fonte => ({ titulo: fonte.titulo, url: fonte.url })),
      detalhes,
    });
  }

  for (const [indice, votacao] of (atuacao?.votacoes ?? []).entries()) {
    registros.push({
      chave: `votacao-${votacao.votacaoId}-${indice}`,
      data: votacao.data,
      rotulo: rotuloData(votacao.data),
      categoria: "Votação documentada",
      titulo: `Voto registrado: ${votacao.voto}`,
      resumo: votacao.descricao,
      fontes: [votacao.fonte],
    });
  }

  for (const [indice, proposicao] of (atuacao?.proposicoes ?? []).entries()) {
    registros.push({
      chave: `proposicao-${proposicao.proposicaoId}-${indice}`,
      data: proposicao.data,
      rotulo: rotuloData(proposicao.data),
      categoria: "Proposição documentada",
      titulo: proposicao.identificacao,
      resumo: `${proposicao.ementa} · Papel registrado: ${proposicao.papel}.`,
      fontes: [proposicao.fonte],
    });
  }

  registros.sort((a, b) => b.data.localeCompare(a.data) || a.chave.localeCompare(b.chave));

  return (
    <PaginaPoliticos titulo="Histórico de um político">
      <div className="flex items-center gap-4 rounded-2xl border border-[#30455d] bg-[#152d45] p-4">
        <CandidatePhoto id={politico.id} name={politico.nomeUrna} />
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold leading-tight text-white">{politico.nomeUrna}</h2>
          <p className="mt-1 text-sm text-slate-300">{politico.cargo.replaceAll("-", " ")} · {politico.siglaPartido} · {politico.uf}</p>
        </div>
      </div>

      <Link href="/politicos/historico" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#ffd333] underline underline-offset-4">← Pesquisar outro político</Link>

      <div className="mt-5 rounded-xl border border-[#30455d] p-4 text-sm leading-6 text-slate-300">
        Os registros abaixo são apresentados em ordem decrescente de data e mantêm as respectivas fontes. Alegações, respostas e decisões não são equivalentes: cada informação deve ser interpretada conforme sua natureza. Este histórico não pretende ser completo.
      </div>

      <section aria-labelledby="cronologia-titulo" className="mt-8">
        <h2 id="cronologia-titulo" className="text-2xl font-extrabold text-white">Trajetória e acontecimentos</h2>
        <p className="mt-2 text-sm text-slate-300">{registros.length} {registros.length === 1 ? "registro encontrado" : "registros encontrados"} na base consultada.</p>
        {registros.length === 0 ? (
          <p className="mt-5 rounded-xl bg-[#152d45] p-5 leading-7 text-slate-200">Ainda não há registros históricos suficientes para apresentar uma cronologia deste político.</p>
        ) : (
          <ol className="mt-7 space-y-4 border-l-2 border-[#d7b43a] pl-5">
            {registros.map(registro => (
              <li key={registro.chave} className="relative rounded-xl border border-[#30455d] bg-[#152d45] p-5">
                <span aria-hidden="true" className="absolute -left-[29px] top-5 h-3 w-3 rounded-full bg-[#ffd333]" />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-bold text-[#ffd333]">{registro.rotulo}</span>
                  <span className="text-xs font-medium text-slate-400">{registro.categoria}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-6 text-white">{registro.titulo}</h3>
                {registro.resumo && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{registro.resumo}</p>}
                {(registro.detalhes?.length ?? 0) > 0 && (
                  <details className="mt-4 rounded-lg border border-[#354d62] px-3 py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-[#ffd333]">Ver contexto, respostas e desdobramentos</summary>
                    <div className="mt-3 space-y-3">
                      {registro.detalhes?.map((item, indice) => (
                        <div key={indice}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.titulo}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.texto}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                <div className="mt-4 flex flex-col items-start gap-2">
                  {registro.fontes.filter(fonte => /^https?:\/\//.test(fonte.url)).map((fonte, indice) => (
                    <a key={`${fonte.url}-${indice}`} href={fonte.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#ffd333] underline underline-offset-4">
                      Consultar fonte: {fonte.titulo}
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </PaginaPoliticos>
  );
}
