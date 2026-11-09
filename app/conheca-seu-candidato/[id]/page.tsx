import Link from "next/link";
import { FecharFichaLink } from "@/components/FecharFichaLink";
import { ApresentacaoPublica } from "@/components/ApresentacaoPublica";
import { CandidateFollowCard } from "@/components/CandidateFollowCard";
import { InteracaoPessoaPublica } from "@/components/InteracaoPessoaPublica";

import { CabecalhoFichaPublica } from "@/components/CabecalhoFichaPublica";
import { eleitos2026 } from "@/data/eleicoes/eleitos";
import { notFound } from "next/navigation";

import { buscarPatrimonio2026PorCandidaturaId } from "@/data/eleicoes/bens";
import { buscarEvolucaoPatrimonial } from "@/data/eleicoes/evolucao-patrimonial";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarHistoricoPolitico } from "@/data/eleicoes/historico-politico";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { buscarDossiePorCandidaturaId } from "@/data/eleicoes/dossies";
import { obterMandatoAtualConhecido } from "@/data/eleicoes/reeleicao";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

function formatarReais(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarPercentual(
  valor: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(valor);
}

function formatarData(valor: string) {
  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function valorOrdenacaoPeriodo(
  periodo?: string,
) {
  if (!periodo) {
    return 0;
  }

  const anos =
    periodo.match(/\d{4}/g);

  if (!anos || anos.length === 0) {
    return 0;
  }

  return Math.max(
    ...anos.map(Number),
  );
}

function formatarPeriodoTrajetoria(
  periodo?: string,
) {
  if (!periodo) {
    return "";
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      periodo,
    )
  ) {
    return periodo.slice(0, 4);
  }

  return periodo.replace(
    /\s*[-–—]\s*/g,
    "–",
  );
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidatePage({
  params,
}: PageProps) {
  const { id } = await params;

  const candidate =
    candidaturas.find(
      (item) => item.id === id,
    );

  if (!candidate) {
    notFound();
  }

  const cargo =
    formatarCargo(candidate.cargo, candidate.genero);

  const patrimonio =
    buscarPatrimonio2026PorCandidaturaId(
      candidate.id,
    );

  const evolucaoPatrimonial =
    buscarEvolucaoPatrimonial(
      candidate.id,
    );

  const historico =
    buscarHistoricoPolitico(
      candidate.id,
    );


  const atuacaoPolitica =
    buscarAtuacaoPolitica(
      candidate.id,
    );
  const dossiePublico = buscarDossiePorCandidaturaId(candidate.id);
  const eleitoConfirmado = eleitos2026.find((pessoa) => pessoa.id === candidate.id) ?? null;
const trajetoriaOrdenada =
    [...(historico?.trajetoria ?? [])]
      .sort(
        (a, b) =>
          valorOrdenacaoPeriodo(
            b.periodo,
          ) -
          valorOrdenacaoPeriodo(
            a.periodo,
          ),
      );

  const mapaTrajetoria = new Map<
    string,
    {
      titulo: string;
      descricao?: string;
      fonte: {
        titulo: string;
        url: string;
      };
      periodos: string[];
    }
  >();

  for (const item of trajetoriaOrdenada) {
    const chave = [
      item.titulo,
      item.descricao ?? "",
      item.fonte.url,
    ].join("|||");

    const existente =
      mapaTrajetoria.get(chave);

    if (existente) {
      if (item.periodo) {
        existente.periodos.push(
          item.periodo,
        );
      }

      continue;
    }

    mapaTrajetoria.set(
      chave,
      {
        titulo: item.titulo,
        descricao:
          item.descricao,
        fonte: item.fonte,
        periodos:
          item.periodo
            ? [item.periodo]
            : [],
      },
    );
  }

  const trajetoriaAgrupada =
    Array.from(
      mapaTrajetoria.values(),
    );
  const mandatoAtualConhecido =
    obterMandatoAtualConhecido(
      candidate.id,
    );

  const situacaoTse =
    candidate.situacaoTse?.trim();

  // Só atribuímos a condição de eleito quando ela consta de fonte identificada.
  const eleitoEm2026 =
    /^(?:re)?eleit[oa]\b/i.test(
      candidate.resultadoEleitoral?.situacaoTse?.trim() ?? "",
    ) ||
    Boolean(
      dossiePublico?.eventos.some(
        (evento) =>
          evento.data.inicio.startsWith(`${candidate.eleicao}-`) &&
          /^(?:re)?eleit[oa]\b/i.test(evento.titulo) &&
          evento.natureza.includes("documentado") &&
          evento.fontes.length > 0,
      ),
    );

  const mostrarSituacaoTse =
    Boolean(
      situacaoTse &&
      !situacaoTse.startsWith("#"),
    );

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <div id="quem-e" className="scroll-mt-8">
        <CabecalhoFichaPublica
          candidato={candidate}
          dossie={dossiePublico}
          eleito={eleitoConfirmado}
          mandatoAtual={mandatoAtualConhecido}
        />
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[760px]">

          <ApresentacaoPublica
            candidato={candidate}
            dossie={dossiePublico}
            atuacao={atuacaoPolitica}
          />

          <CandidateFollowCard
            candidaturaId={candidate.id}
          />
          {process.env.FDP_INTERACOES_HABILITADAS === "1" ? (
            <InteracaoPessoaPublica candidaturaId={candidate.id} />
          ) : null}

          {trajetoriaAgrupada.length > 0 ? (
            <section className="border-t border-black/15 py-8" aria-labelledby="trajetoria-documentada">
              <h2 id="trajetoria-documentada" className="text-2xl font-semibold">Trajetória política documentada</h2>
              <div className="mt-5 space-y-6">
                {trajetoriaAgrupada.map((item, index) => (
                  <article key={item.titulo + index} className="border-l-2 border-[#FFC400] pl-4">
                    <h3 className="font-semibold">{item.titulo}</h3>
                    {item.periodos.length > 0 ? <p className="mt-1 text-sm">{item.periodos.map(formatarPeriodoTrajetoria).join(" · ")}</p> : null}
                    {item.descricao ? <p className="mt-2 leading-7">{item.descricao}</p> : null}
                    <a href={item.fonte.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold underline">{item.fonte.titulo} ↗</a>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {atuacaoPolitica && (atuacaoPolitica.votacoesRecentes.length > 0 || atuacaoPolitica.proposicoesRecentes.length > 0) ? (
            <section className="border-t border-black/15 py-8" aria-labelledby="atuacao-documentada">
              <h2 id="atuacao-documentada" className="text-2xl font-semibold">Atuação política documentada</h2>
              {atuacaoPolitica.votacoesRecentes.length > 0 ? (
                <div className="mt-5"><h3 className="text-lg font-semibold">Votações recentes</h3>
                  {atuacaoPolitica.votacoesRecentes.map(item => (
                    <article key={item.votacaoId} className="border-b border-black/10 py-4">
                      <p className="font-medium">{item.descricao}</p><p className="mt-1 text-sm">Voto registrado: {item.voto}</p>
                      <a className="text-sm underline" href={item.fonte.url} target="_blank" rel="noopener noreferrer">Conferir fonte ↗</a>
                    </article>
                  ))}
                </div>
              ) : null}
              {atuacaoPolitica.proposicoesRecentes.length > 0 ? (
                <div className="mt-5"><h3 className="text-lg font-semibold">Proposições recentes</h3>
                  {atuacaoPolitica.proposicoesRecentes.map(item => (
                    <article key={item.proposicaoId} className="border-b border-black/10 py-4">
                      <p className="font-medium">{item.identificacao}</p>
                      <a className="text-sm underline" href={item.fonte.url} target="_blank" rel="noopener noreferrer">Conferir fonte ↗</a>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}


<section className="border-t border-black/15 py-8 sm:py-10">
            <FecharFichaLink />
          </section>

        </div>
      </div>
    </main>
  );
}