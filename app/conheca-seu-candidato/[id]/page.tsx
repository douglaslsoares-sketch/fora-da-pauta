import Link from "next/link";

import { CandidatePhoto } from "@/components/CandidatePhoto";
import { notFound } from "next/navigation";

import { buscarPatrimonio2026PorCandidaturaId } from "@/data/eleicoes/bens";
import { buscarEvolucaoPatrimonial } from "@/data/eleicoes/evolucao-patrimonial";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarHistoricoPolitico } from "@/data/eleicoes/historico-politico";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import {
  obterCargoAtualConhecido,
  obterSituacaoReeleicao,
} from "@/data/eleicoes/reeleicao";
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
    formatarCargo(candidate.cargo);

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

  const situacaoReeleicao =
    obterSituacaoReeleicao(
      candidate,
    );

  const cargoAtualConhecido =
    obterCargoAtualConhecido(
      candidate.id,
    );

  const situacaoTse =
    candidate.situacaoTse?.trim();

  const mostrarSituacaoTse =
    Boolean(
      situacaoTse &&
      !situacaoTse.startsWith("#"),
    );

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto w-full max-w-5xl px-5 pb-9 pt-5 sm:px-8 sm:pb-11 sm:pt-6">

          <div className="flex justify-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Eleições 2026
            </p>
          </div>

          <div className="mt-6 border-t border-white/15 pt-6">
            <div className="flex items-start justify-between gap-5 sm:gap-8">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Ficha do candidato
                </p>

                <h1 className="mt-4 break-words text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                  {candidate.nomeUrna}
                </h1>

                <p className="mt-5 text-base leading-7 text-white/65 sm:text-lg">
                  {cargo} · {candidate.siglaPartido} · {candidate.uf}
                </p>
              </div>

              <CandidatePhoto
                id={candidate.id}
                name={candidate.nomeUrna}
                variant="profile"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl">

          <section className="pb-8 sm:pb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              Identificação eleitoral
            </p>

            <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
              <div className="flex justify-between gap-6 py-3">
                <span className="text-sm text-black/45">
                  Nome completo
                </span>

                <span className="max-w-[65%] text-right font-semibold">
                  {candidate.nomeCompleto}
                </span>
              </div>

              <div className="flex justify-between gap-6 py-3">
                <span className="text-sm text-black/45">
                  Cargo
                </span>

                <span className="text-right font-semibold">
                  {cargo}
                </span>
              </div>

              <div className="flex justify-between gap-6 py-3">
                <span className="text-sm text-black/45">
                  Partido
                </span>

                <span className="text-right font-semibold">
                  {candidate.siglaPartido}
                </span>
              </div>

              <div className="flex justify-between gap-6 py-3">
                <span className="text-sm text-black/45">
                  Número
                </span>

                <span className="text-right font-semibold">
                  {candidate.numero}
                </span>
              </div>

              <div className="flex justify-between gap-6 py-3">
                <span className="text-sm text-black/45">
                  UF
                </span>

                <span className="text-right font-semibold">
                  {candidate.uf}
                </span>
              </div>

              {mostrarSituacaoTse && (
                <div className="flex justify-between gap-6 py-3">
                  <span className="text-sm text-black/45">
                    Situação no TSE
                  </span>

                  <span className="max-w-[65%] text-right font-semibold">
                    {situacaoTse}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-5 text-sm leading-6 text-black/45">
              Dados eleitorais verificados em{" "}
              {formatarData(
                candidate.ultimaVerificacao,
              )}.
            </p>

            <a
              href={candidate.fonteOficial}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Fonte oficial do TSE ↗
            </a>
          </section>

          {cargoAtualConhecido && (
            <section className="border-t border-black/15 py-8 sm:py-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Mandato atual
              </p>

              <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
                {formatarCargo(
                  cargoAtualConhecido,
                )}
              </h2>

              {situacaoReeleicao ===
                "reeleicao" && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
                  A candidatura de 2026 é para o mesmo cargo atualmente exercido.
                </p>
              )}

              {situacaoReeleicao ===
                "nao-concorre-a-reeleicao" && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
                  Em 2026, a candidatura é para um cargo diferente daquele atualmente exercido.
                </p>
              )}
            </section>
          )}

          <section className="border-t border-black/15 py-8 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              Patrimônio declarado
            </p>

            {patrimonio ? (
              <>
                {evolucaoPatrimonial ? (
                  <>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="border border-black/10 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                          Declarado em 2022
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                          {formatarReais(
                            evolucaoPatrimonial.valor2022,
                          )}
                        </p>

                        <p className="mt-2 text-sm text-black/45">
                          {evolucaoPatrimonial.quantidadeBens2022} bens declarados
                        </p>
                      </div>

                      <div className="border border-black/10 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                          Declarado em 2026
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                          {formatarReais(
                            evolucaoPatrimonial.valor2026,
                          )}
                        </p>

                        <p className="mt-2 text-sm text-black/45">
                          {evolucaoPatrimonial.quantidadeBens2026} bens declarados
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-y border-black/10 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="text-sm text-black/50">
                          Variação nominal entre 2022 e 2026
                        </span>

                        <span className="font-semibold">
                          {evolucaoPatrimonial.diferencaNominal >=
                          0
                            ? "+"
                            : ""}
                          {formatarReais(
                            evolucaoPatrimonial.diferencaNominal,
                          )}
                          {evolucaoPatrimonial.variacaoPercentual !==
                            null && (
                            <>
                              {" · "}
                              {evolucaoPatrimonial.variacaoPercentual >=
                              0
                                ? "+"
                                : ""}
                              {formatarPercentual(
                                evolucaoPatrimonial.variacaoPercentual,
                              )}
                              %
                            </>
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-black/40">
                        Comparação nominal dos valores declarados ao TSE, sem correção pela inflação.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="border border-black/10 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                        Total declarado em 2026
                      </p>

                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                        {formatarReais(
                          patrimonio.totalDeclarado,
                        )}
                      </p>
                    </div>

                    <div className="border border-black/10 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                        Bens declarados
                      </p>

                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                        {patrimonio.quantidadeDeBens}
                      </p>
                    </div>
                  </div>
                )}

                {patrimonio.bens.length > 0 && (
                  <>
                    <div className="mt-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
                        Bens declarados em 2026
                      </p>
                    </div>

                    <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
                    {patrimonio.bens.map(
                      (bem, index) => (
                        <div
                          key={`${bem.tipoCodigo}-${index}`}
                          className="py-5"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <p className="font-semibold">
                                {bem.tipo}
                              </p>

                              <p className="mt-1 max-w-xl text-sm leading-6 text-black/55">
                                {bem.descricao}
                              </p>
                            </div>

                            <p className="shrink-0 text-right font-semibold">
                              {formatarReais(
                                bem.valor,
                              )}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                    </div>
                  </>
                )}

                <p className="mt-5 text-sm leading-6 text-black/45">
                  {evolucaoPatrimonial
                    ? "Fonte: Tribunal Superior Eleitoral — bens declarados por candidatos em 2022 e 2026."
                    : `Fonte: ${patrimonio.fonte}.`}
                </p>
              </>
            ) : (
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
                Não há informação patrimonial carregada nesta base para esta candidatura.
              </p>
            )}
          </section>

          {trajetoriaAgrupada.length > 0 && (
            <section className="border-t border-black/15 py-8 sm:py-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Trajetória política documentada
              </p>

              <div className="mt-6 border-l border-black/20 pl-6">
                {trajetoriaAgrupada.map(
                  (item, index) => (
                    <article
                      key={`${item.titulo}-${item.periodos.join("-") || index}`}
                      className="relative pb-9 last:pb-0"
                    >

                      {item.periodos.length > 0 && (
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                          {item.periodos.length === 1
                            ? formatarPeriodoTrajetoria(
                                item.periodos[0],
                              )
                            : `Registros na Câmara: ${item.periodos
                                .map(
                                  formatarPeriodoTrajetoria,
                                )
                                .join(" · ")}`}
                        </p>
                      )}

                      <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
                        {item.titulo}
                      </h2>

                      {item.descricao && (
                        <p className="mt-2 max-w-2xl text-base leading-7 text-black/60">
                          {item.descricao}
                        </p>
                      )}

                      <a
                        href={item.fonte.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
                      >
                        {item.fonte.titulo} ↗
                      </a>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          {atuacaoPolitica && (
            <section className="border-t border-black/15 py-8 sm:py-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Atuação política documentada
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="border border-black/10 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                    Votações nominais
                  </p>

                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {atuacaoPolitica.totalVotacoes}
                  </p>

                  <p className="mt-2 text-sm text-black/45">
                    registros documentados
                  </p>
                </div>

                <div className="border border-black/10 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                    Proposições
                  </p>

                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {atuacaoPolitica.totalProposicoes}
                  </p>

                  <p className="mt-2 text-sm text-black/45">
                    com vínculo oficial de autoria
                  </p>
                </div>
              </div>

              {atuacaoPolitica.votacoesRecentes.length > 0 && (
                <div className="mt-9">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                        Votações nominais recentes
                      </h2>

                      <p className="mt-2 text-sm text-black/45">
                        Cinco registros mais recentes.
                      </p>
                    </div>

                    <Link
                      href={`/conheca-seu-candidato/${candidate.id}/votacoes`}
                      className="text-sm font-semibold underline underline-offset-4"
                    >
                      Ver todas as {atuacaoPolitica.totalVotacoes} votações →
                    </Link>
                  </div>

                  <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
                    {atuacaoPolitica.votacoesRecentes.map(
                      (item) => (
                        <article
                          key={item.votacaoId}
                          className="py-5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                              {formatarData(item.data)}
                            </p>

                            <p className="text-sm font-semibold">
                              Voto registrado: {item.voto}
                            </p>
                          </div>

                          <p className="mt-3 text-base leading-7 text-black/65">
                            {item.descricao}
                          </p>

                          <a
                            href={item.fonte.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
                          >
                            Câmara dos Deputados ↗
                          </a>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              )}

              {atuacaoPolitica.proposicoesRecentes.length > 0 && (
                <div className="mt-10">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                        Proposições recentes
                      </h2>

                      <p className="mt-2 text-sm text-black/45">
                        Cinco registros mais recentes.
                      </p>
                    </div>

                    <Link
                      href={`/conheca-seu-candidato/${candidate.id}/proposicoes`}
                      className="text-sm font-semibold underline underline-offset-4"
                    >
                      Ver todas as {atuacaoPolitica.totalProposicoes} proposições →
                    </Link>
                  </div>

                  <div className="mt-4 divide-y divide-black/10 border-y border-black/10">
                    {atuacaoPolitica.proposicoesRecentes.map(
                      (item) => (
                        <article
                          key={item.proposicaoId}
                          className="py-5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <p className="font-semibold">
                              {item.identificacao}
                            </p>

                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                              {formatarData(
                                item.data.slice(0, 10),
                              )}
                            </p>
                          </div>

                          <p className="mt-1 text-sm text-black/45">
                            {item.descricaoTipo}
                          </p>

                          <p className="mt-3 text-base leading-7 text-black/65">
                            {item.ementa}
                          </p>

                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                            {item.papel}
                          </p>

                          <a
                            href={item.fonte.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4"
                          >
                            Câmara dos Deputados ↗
                          </a>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              )}

              <p className="mt-6 text-xs leading-5 text-black/40">
                A ficha apresenta um resumo. Todos os registros disponíveis podem ser consultados nas páginas completas de votações e proposições.
              </p>
            </section>
          )}
          <section className="border-t border-black/15 py-8 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              Sobre os dados
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
              Esta ficha reúne informações acompanhadas de fonte identificável. Novos documentos podem ser incorporados à medida que forem verificados.
            </p>

            <p className="mt-4 text-sm leading-6 text-black/45">
              Identificador da candidatura no TSE: {candidate.id}
            </p>
          </section>

          <section className="border-t border-black/15 py-8 sm:py-10">
            <Link
              href="/conheca-seu-candidato"
              className="font-semibold underline underline-offset-4"
            >
              ← Consultar outro candidato
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}