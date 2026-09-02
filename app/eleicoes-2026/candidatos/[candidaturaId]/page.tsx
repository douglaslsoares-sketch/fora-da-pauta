import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  buscarHistoricoPolitico,
  candidaturas,
  obterSituacaoReeleicao,
} from "@/data/eleicoes";

import { obterCargoAtualConhecido } from "@/data/eleicoes/reeleicao";

import {
  buscarPatrimonio2022PorCandidaturaId,
  buscarPatrimonio2026PorCandidaturaId,
} from "@/data/eleicoes/bens";

type PageProps = {
  params: Promise<{
    candidaturaId: string;
  }>;
};

const nomesDosCargos: Record<string, string> = {
  presidente: "Presidente",
  governador: "Governador",
  senador: "Senador",
  "deputado-federal": "Deputado Federal",
  "deputado-estadual": "Deputado Estadual",
  "deputado-distrital": "Deputado Distrital",
};

function formatarPeriodoPolitico(
  periodo?: string,
) {
  if (!periodo) {
    return null;
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(periodo)
  ) {
    const [ano, mes, dia] =
      periodo
        .split("-")
        .map(Number);

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      },
    ).format(
      new Date(
        Date.UTC(
          ano,
          mes - 1,
          dia,
        ),
      ),
    );
  }

  return periodo;
}

export default async function FichaDoCandidatoPage({
  params,
}: PageProps) {
  const { candidaturaId } = await params;

  const candidatura =
    candidaturas.find(
      (item) => item.id === candidaturaId,
    );

  if (!candidatura) {
    notFound();
  }

  const historicoPolitico =
    buscarHistoricoPolitico(
      candidatura.id,
    );

  const situacaoReeleicao =
    obterSituacaoReeleicao(candidatura);

  const cargoAtualConhecido =
    obterCargoAtualConhecido(candidatura.id);

  const foto =
    `/candidatos/2026/${candidatura.id}.jpg`;


  const patrimonio2026 =
    buscarPatrimonio2026PorCandidaturaId(
      candidatura.id,
    );

  const candidaturaHistorica2022 =
    candidatura.id === "160002547656"
      ? "160001614512"
      : null;

  const patrimonio2022 =
    candidaturaHistorica2022
      ? buscarPatrimonio2022PorCandidaturaId(
          candidaturaHistorica2022,
        )
      : null;

  const variacaoNominal =
    patrimonio2022 && patrimonio2026
      ? patrimonio2026.totalDeclarado -
        patrimonio2022.totalDeclarado
      : null;

  const variacaoPercentual =
    patrimonio2022 &&
    patrimonio2026 &&
    patrimonio2022.totalDeclarado !== 0
      ? ((patrimonio2026.totalDeclarado /
          patrimonio2022.totalDeclarado) -
          1) *
        100
      : null;

  /*
   * Criterio de correcao monetaria:
   * IPCA acumulado de setembro de 2022 a julho de 2026.
   *
   * Composicao:
   * - setembro a dezembro de 2022;
   * - ano de 2023;
   * - ano de 2024;
   * - ano de 2025;
   * - janeiro a julho de 2026.
   *
   * Fonte: IBGE - IPCA.
   * Valor acumulado aproximado: 19,9%.
   *
   * A comparacao e aproximada porque as declaracoes
   * patrimoniais eleitorais nao representam necessariamente
   * fotografias feitas no mesmo dia do calendario.
   */
  const inflacaoAcumulada = 19.9;

  const periodoInflacao =
    "setembro de 2022 a julho de 2026";

  const variacaoRealAproximada =
    variacaoPercentual !== null
      ? (((1 + variacaoPercentual / 100) /
          (1 + inflacaoAcumulada / 100)) -
          1) *
        100
      : null;

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/eleicoes-2026"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45"
        >
          ← Eleições 2026
        </Link>

        <header className="mb-10 mt-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
            Ficha do candidato
          </p>

          <div className="flex items-start gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] bg-white sm:h-32 sm:w-32">
              {foto ? (
                <Image
                  src={foto}
                  alt={`Foto oficial de ${candidatura.nomeUrna}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-black/20">
                  {candidatura.nomeUrna
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[2.4rem] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                {candidatura.nomeUrna}
              </h1>

              <p className="mt-4 text-base leading-7 text-black/60 sm:text-lg">
                {candidatura.siglaPartido}
                {" · "}
                {nomesDosCargos[candidatura.cargo] ??
                  candidatura.cargo}
                {" · "}
                {candidatura.uf === "BR"
                  ? "Brasil"
                  : candidatura.uf}
              </p>

              {situacaoReeleicao === "reeleicao" ? (
                <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">
                  REELEIÇÃO
                </span>
              ) : situacaoReeleicao === "nao-concorre-a-reeleicao" ? (
                <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]">
                  CONCORRE A OUTRO CARGO
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-[28px] bg-white p-6 sm:p-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Informações da candidatura
          </p>

          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-black/35">
                Nome na urna
              </dt>
              <dd className="mt-1 font-semibold">
                {candidatura.nomeUrna}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-black/35">
                Partido
              </dt>
              <dd className="mt-1 font-semibold">
                {candidatura.siglaPartido}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-black/35">
                Candidatura em 2026
              </dt>
              <dd className="mt-1 font-semibold">
                {nomesDosCargos[
                  candidatura.cargo
                ] ?? candidatura.cargo}
              </dd>
            </div>

            {cargoAtualConhecido ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-black/35">
                  Cargo atual
                </dt>
                <dd className="mt-1 font-semibold">
                  {nomesDosCargos[cargoAtualConhecido] ??
                    cargoAtualConhecido}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-black/35">
                {candidatura.uf === "BR"
                  ? "Abrangência"
                  : "Estado"}
              </dt>
              <dd className="mt-1 font-semibold">
                {candidatura.uf === "BR"
                  ? "Brasil"
                  : candidatura.uf}
              </dd>
            </div>
          </dl>

          <a
            href={candidatura.fonteOficial}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-block text-sm font-medium underline decoration-black/20 underline-offset-4 hover:decoration-black"
          >
            Consultar fonte oficial do TSE
          </a>
        </section>

        {historicoPolitico &&
        historicoPolitico.trajetoria.length > 0 ? (
          <section className="mb-6 rounded-[28px] bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
              Atuação política
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Histórico de atuação
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Registros públicos da atuação política, apresentados do mais recente para o mais antigo.
            </p>

            <div className="mt-6 space-y-3">
              {[...historicoPolitico.trajetoria]
                .sort((a, b) =>
                  (b.periodo ?? "").localeCompare(a.periodo ?? "")
                )
                .map((item, index) => {
                  const periodo =
                    formatarPeriodoPolitico(
                      item.periodo,
                    );

                  const descricaoEhGenerica =
                    item.descricao
                      ?.toLowerCase()
                      .startsWith(
                        "exercicio parlamentar na camara",
                      );

                  return (
                    <div
                      key={`${item.titulo}-${item.periodo ?? "sem-periodo"}-${index}`}
                      className="rounded-2xl bg-[#f5f5f1] p-4"
                    >
                      <p className="font-semibold">
                        {item.titulo}
                      </p>

                      {periodo ? (
                        <p className="mt-1 text-sm text-black/45">
                          {periodo}
                        </p>
                      ) : null}

                      {item.descricao &&
                      !descricaoEhGenerica ? (
                        <p className="mt-3 text-sm leading-6 text-black/60">
                          {item.descricao}
                        </p>
                      ) : null}

                      <a
                        href={item.fonte.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs font-medium text-black/45 underline decoration-black/20 underline-offset-4"
                      >
                        Fonte: Câmara dos Deputados
                      </a>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[28px] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
              Evolução patrimonial
            </p>

            {patrimonio2022 && patrimonio2026 ? (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f5f5f1] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
                      2022
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {patrimonio2022.totalDeclarado.toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        },
                      )}
                    </p>

                    <p className="mt-2 text-sm text-black/45">
                      {patrimonio2022.quantidadeDeBens}{" "}
                      {patrimonio2022.quantidadeDeBens === 1
                        ? "bem declarado"
                        : "bens declarados"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f5f5f1] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
                      2026
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {patrimonio2026.totalDeclarado.toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        },
                      )}
                    </p>

                    <p className="mt-2 text-sm text-black/45">
                      {patrimonio2026.quantidadeDeBens}{" "}
                      {patrimonio2026.quantidadeDeBens === 1
                        ? "bem declarado"
                        : "bens declarados"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-black/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
                    Aumento do patrimônio declarado
                  </p>

                  {variacaoNominal !== null &&
                  variacaoPercentual !== null ? (
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                      {variacaoNominal >= 0 ? "+" : ""}
                      {variacaoNominal.toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        },
                      )}{" "}
                      <span className="text-base text-black/55">
                        (
                        {variacaoPercentual >= 0 ? "+" : ""}
                        {variacaoPercentual.toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          },
                        )}
                        %)
                      </span>
                    </p>
                  ) : null}

                  {variacaoRealAproximada !== null ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/35">
                        Descontada a inflação
                      </p>

                      <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        aproximadamente{" "}
                        {variacaoRealAproximada >= 0
                          ? "+"
                          : ""}
                        {variacaoRealAproximada.toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          },
                        )}
                        %
                      </p>
                    </div>
                  ) : null}

                  <p className="mt-4 text-xs leading-5 text-black/35">
                    Cálculo considerando aproximadamente
                    19,9% de inflação pelo IPCA entre{" "}
                    {periodoInflacao}.
                  </p>
                </div>

                <details className="mt-6 border-t border-black/8 pt-5">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Ver bens declarados em 2022
                  </summary>

                  <div className="mt-5 space-y-3">
                    {patrimonio2022.bens.map(
                      (bem, index) => (
                        <div
                          key={`2022-${bem.tipoCodigo}-${index}`}
                          className="rounded-2xl bg-[#f5f5f1] p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                            {bem.tipo}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-black/65">
                            {bem.descricao}
                          </p>

                          <p className="mt-3 font-semibold">
                            {bem.valor.toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </details>

                <details className="mt-4 border-t border-black/8 pt-5">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Ver bens declarados em 2026
                  </summary>

                  <div className="mt-5 space-y-3">
                    {patrimonio2026.bens.map(
                      (bem, index) => (
                        <div
                          key={`2026-${bem.tipoCodigo}-${index}`}
                          className="rounded-2xl bg-[#f5f5f1] p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                            {bem.tipo}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-black/65">
                            {bem.descricao}
                          </p>

                          <p className="mt-3 font-semibold">
                            {bem.valor.toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </details>

                <p className="mt-5 text-xs leading-5 text-black/35">
                  Valores informados pelo próprio candidato
                  à Justiça Eleitoral. A variação
                  patrimonial, isoladamente, não indica
                  irregularidade.
                </p>
              </>
            ) : patrimonio2026 ? (
              <>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                  {patrimonio2026.totalDeclarado.toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    },
                  )}
                </p>

                <p className="mt-2 text-sm text-black/45">
                  Patrimônio declarado em 2026.
                </p>

                <p className="mt-4 text-xs leading-5 text-black/35">
                  Ainda não há comparação histórica
                  vinculada para esta candidatura.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-black/50">
                Não localizamos bens declarados para esta
                candidatura na base oficial utilizada.
              </p>
            )}
          </article>

          <article className="rounded-[28px] border border-dashed border-black/15 bg-white/45 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
              Em preparação
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Financiamento
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Receitas de campanha e outras
              informações públicas relevantes.
            </p>
          </article>
        </section>

        <p className="mt-8 text-xs leading-5 text-black/35">
          O Fora da Pauta apresenta informações e
          fontes verificáveis. Os dados não constituem
          recomendação de voto nem avaliação moral do
          candidato.
        </p>
      </div>
    </main>
  );
}