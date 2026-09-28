import type { ReactNode } from "react";
import {
  buscarDossiePorCandidaturaId,
} from "@/data/eleicoes/dossies";

import type {
  EixoDossie,
  NaturezaRegistro,
  TipoManifestacaoPublica,
} from "@/data/eleicoes/dossies/modelo";

type CandidateDossierProps = {
  candidaturaId: string;
  conteudoQuemE: ReactNode;
  conteudoCaminhoPolitica: ReactNode;
  conteudoExercicioCargo: ReactNode;
  conteudoPatrimonio: ReactNode;
  conteudoFontes: ReactNode;
  conteudoLinhaDoTempoAutomatico: ReactNode;
};

const eixos: Array<{
  id: EixoDossie;
  numero: string;
  titulo: string;
  descricao: string;
}> = [
  {
    id: "quem-e",
    numero: "1",
    titulo: "Quem é",
    descricao:
      "Origem, nascimento, situação atual e candidatura.",
  },
  {
    id: "formacao-trabalho",
    numero: "2",
    titulo: "Formação e trabalho",
    descricao:
      "Estudos, profissões, empregos e atividades profissionais.",
  },
  {
    id: "caminho-politica",
    numero: "3",
    titulo: "Caminho na política",
    descricao:
      "Partidos, candidaturas, eleições, mandatos e funções.",
  },
  {
    id: "o-que-prometeu",
    numero: "4",
    titulo: "O que prometeu",
    descricao:
      "Propostas e compromissos assumidos em campanha, com eleição e fonte.",
  },
  {
    id: "exercicio-cargo",
    numero: "5",
    titulo: "O que fez no exercício do cargo",
    descricao:
      "Projetos, votações, decisões, atos e atuação durante os mandatos.",
  },
  {
    id: "patrimonio-atividades-economicas",
    numero: "6",
    titulo: "Patrimônio e atividades econômicas",
    descricao:
      "Bens declarados, evolução patrimonial e atividades econômicas documentadas.",
  },
  {
    id: "suspeitas-investigacoes-acusacoes",
    numero: "7",
    titulo: "Suspeitas, investigações e acusações",
    descricao:
      "Registros documentados, com respostas e desfechos quando houver.",
  },
  {
    id: "o-que-diz-e-defende",
    numero: "8",
    titulo: "O que diz e o que defende",
    descricao:
      "Declarações e posicionamentos públicos por tema, feitos em ambientes institucionais ou públicos, com data, contexto, fonte e verificação documental das afirmações factuais quando possível.",
  },
  {
    id: "linha-do-tempo",
    numero: "9",
    titulo: "Linha do tempo",
    descricao:
      "Acompanhe, em ordem cronológica, os principais registros documentados da trajetória pública, candidaturas e exercício de mandato.",
  },
];
const rotulosNatureza:
  Record<NaturezaRegistro, string> = {
    documentado: "Documentado",
    publicado: "Publicado",
    alegacao: "Alegação",
    "em-investigacao": "Em investigação",
    decisao: "Decisão",
    contestada: "Contestada",
    atualizada: "Atualizada",
  };

const rotulosTipoManifestacao:
  Record<TipoManifestacaoPublica, string> = {
    plenario: "Plenário",
    comissao: "Comissão",
    "cpi-cpmi": "CPI / CPMI",
    "audiencia-publica": "Audiência pública",
    "pronunciamento-oficial": "Pronunciamento oficial",
    entrevista: "Entrevista",
    coletiva: "Coletiva de imprensa",
    "rede-social": "Rede social",
    outro: "Outro registro público",
  };

const ORDEM_MACROTEMAS_TSE_PRESIDENCIA_2026: string[] = [
  "Economia, Trabalho e Responsabilidade Fiscal",
  "Saúde Pública e Assistência",
  "Segurança Pública",
  "Educação",
  "Política Externa e Inserção Global",
  "Direitos Humanos, Equidade e Inclusão Social",
  "Questão Agrária e Meio Ambiente",
  "Governança, Transparência e Reformas de Estado",
];
function formatarDataAtualizacao(
  valor: string,
) {
  const partes =
    valor.split("-").map(Number);

  if (partes.length !== 3) {
    return valor;
  }

  const [ano, mes, dia] = partes;

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(
      ano,
      mes - 1,
      dia,
      12,
      0,
      0,
    ),
  );
}

function hrefDoEixo(
  eixo: EixoDossie,
) {
  switch (eixo) {
    case "quem-e":
      return "#quem-e";

    case "formacao-trabalho":
      return "#formacao-trabalho";

    case "caminho-politica":
      return "#caminho-politica";

    case "o-que-prometeu":
      return "#o-que-prometeu";

    case "exercicio-cargo":
      return "#exercicio-cargo";

    case "patrimonio-atividades-economicas":
      return "#patrimonio";

    case "suspeitas-investigacoes-acusacoes":
      return "#suspeitas-investigacoes-acusacoes";

    case "o-que-diz-e-defende":
      return "#o-que-diz-e-defende";

    case "linha-do-tempo":
      return "#linha-do-tempo";

    case "fontes-atualizacoes":
      return "#sobre-os-dados";

    default:
      return "#linha-do-tempo";
  }
}
export function CandidateDossier({
  candidaturaId,
  conteudoQuemE,
  conteudoCaminhoPolitica,
  conteudoExercicioCargo,
  conteudoPatrimonio,
  conteudoFontes,
  conteudoLinhaDoTempoAutomatico,
}: CandidateDossierProps) {

  const dossie =
    buscarDossiePorCandidaturaId(
      candidaturaId,
    );

  const conteudoLocalPorEixo:
    Partial<Record<EixoDossie, ReactNode>> = {
      "quem-e": conteudoQuemE,
      "caminho-politica":
        conteudoCaminhoPolitica,
      "exercicio-cargo":
        conteudoExercicioCargo,
      "patrimonio-atividades-economicas":
        conteudoPatrimonio,
      "fontes-atualizacoes":
        conteudoFontes,
      "linha-do-tempo":
        conteudoLinhaDoTempoAutomatico,
    };

  if (!dossie) {
    return (
      <section
        aria-label="Conteúdo da ficha do candidato"
        className="border-t border-black/15 py-8 sm:py-10"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          O que você encontra nesta ficha
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55 sm:text-base sm:leading-7">
          Os mesmos itens são utilizados para todos os candidatos.
          Abra um item para consultar as informações disponíveis.
        </p>

        <div className="mt-6 border-y border-black/10">
          {eixos.map((eixo) => (
            <details
              key={eixo.id}
              className="group/eixo border-b border-black/10 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 py-5 sm:py-6 [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {eixo.numero}
                </span>

                <span className="min-w-0 flex-1 text-lg font-semibold tracking-[-0.02em]">
                  {eixo.titulo}
                </span>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl font-light leading-none text-black/35 transition-transform group-open/eixo:rotate-45"
                >
                  +
                </span>
              </summary>

              <div className="pb-6 pl-12 pr-4 sm:pb-7">
                <p className="max-w-2xl text-sm leading-6 text-black/55">
                  {eixo.descricao}
                </p>

                {conteudoLocalPorEixo[eixo.id] ? (
                  <>
                    {conteudoLocalPorEixo[eixo.id]}
                  </>
                ) : (
                  <div className="mt-5 border-l-2 border-[#FFC400] pl-4">
                    <p className="font-semibold">
                      Informações em levantamento
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                      Ainda não há registros verificados incorporados
                      a esta ficha para este item.
                    </p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
        <div
          id="sobre-os-dados"
          className="mt-10 border-t border-black/10 pt-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Fontes e atualizações
          </p>

          {conteudoFontes}
        </div>
      </section>
    );
  }
  const eventos =
    [...dossie.eventos].sort(
      (a, b) =>
        a.data.inicio.localeCompare(
          b.data.inicio,
        ),
    );

  const conteudoLinhaDoTempo = (
<div
        id="linha-do-tempo"
        className="mt-5 scroll-mt-8"
      >

        <h2 className="text-2xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-3xl">
          Do início até hoje
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">
          A cronologia reúne fatos,
          publicações, questionamentos,
          respostas e desdobramentos.
          Cada informação mantém sua
          natureza e sua fonte.
        </p>

        <div className="mt-8 border-l border-black/20 pl-6 sm:pl-8">
          {eventos.map((evento) => (
            <article
              id={`evento-${evento.id}`}
              key={evento.id}
              className="relative pb-12 last:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full bg-[#FFC400] sm:-left-[37px]"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                {evento.data.rotulo}
              </p>

              <h3 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.035em]">
                {evento.titulo}
              </h3>

              <p className="mt-3 max-w-3xl text-base leading-7 text-black/65">
                {evento.resumo}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {evento.natureza.map(
                  (natureza) => (
                    <span
                      key={natureza}
                      className="border border-black/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/50"
                    >
                      {
                        rotulosNatureza[
                          natureza
                        ]
                      }
                    </span>
                  ),
                )}
              </div>

              <details className="group mt-5 border-t border-black/10 pt-4">
                <summary className="cursor-pointer list-none font-semibold underline decoration-black/30 underline-offset-4">
                  Ver contexto e fontes
                </summary>

                <div className="mt-6 max-w-3xl space-y-7">

                  {evento.fatoDocumentado &&
                    evento.fatoDocumentado.length >
                      0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                          O que está documentado
                        </h4>

                        <div className="mt-3 space-y-3">
                          {evento.fatoDocumentado.map(
                            (
                              item,
                              index,
                            ) => (
                              <p
                                key={index}
                                className="text-sm leading-6 text-black/65"
                              >
                                {item}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {(evento.tema ||
                    evento.tipoManifestacao ||
                    evento.contextoManifestacao) && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                        Contexto da manifestação
                      </h4>

                      <div className="mt-3 space-y-3">
                        {evento.tema && (
                          <p className="text-sm leading-6 text-black/65">
                            <span className="font-semibold">
                              Tema:
                            </span>{" "}
                            {evento.tema}
                          </p>
                        )}

                        {evento.tipoManifestacao && (
                          <p className="text-sm leading-6 text-black/65">
                            <span className="font-semibold">
                              Origem:
                            </span>{" "}
                            {
                              rotulosTipoManifestacao[
                                evento.tipoManifestacao
                              ]
                            }
                          </p>
                        )}

                        {evento.contextoManifestacao && (
                          <p className="text-sm leading-6 text-black/65">
                            {evento.contextoManifestacao}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {evento.verificacaoDocumental && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                        Verificação documental
                      </h4>

                      {evento.verificacaoDocumental
                        .afirmacoesVerificaveis &&
                        evento.verificacaoDocumental
                          .afirmacoesVerificaveis
                          .length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                              O que pode ser verificado
                            </p>

                            <div className="mt-2 space-y-2">
                              {evento.verificacaoDocumental.afirmacoesVerificaveis.map(
                                (item, index) => (
                                  <p
                                    key={index}
                                    className="text-sm leading-6 text-black/65"
                                  >
                                    {item}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      <div className="mt-4 border-l-4 border-[#FFC400] pl-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                          O que encontramos ao verificar
                        </p>

                        <p className="mt-2 text-sm leading-6 text-black/70">
                          {
                            evento.verificacaoDocumental
                              .sintese
                          }
                        </p>
                      </div>

                      {evento.verificacaoDocumental
                        .evidenciasQueSustentam &&
                        evento.verificacaoDocumental
                          .evidenciasQueSustentam
                          .length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                              Evidências que sustentam aspectos da afirmação
                            </p>

                            <div className="mt-2 space-y-2">
                              {evento.verificacaoDocumental.evidenciasQueSustentam.map(
                                (item, index) => (
                                  <p
                                    key={index}
                                    className="text-sm leading-6 text-black/65"
                                  >
                                    {item}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {evento.verificacaoDocumental
                        .evidenciasQueLimitamOuContrariam &&
                        evento.verificacaoDocumental
                          .evidenciasQueLimitamOuContrariam
                          .length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                              Evidências que limitam ou apresentam informação diferente
                            </p>

                            <div className="mt-2 space-y-2">
                              {evento.verificacaoDocumental.evidenciasQueLimitamOuContrariam.map(
                                (item, index) => (
                                  <p
                                    key={index}
                                    className="text-sm leading-6 text-black/65"
                                  >
                                    {item}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {evento.verificacaoDocumental
                        .naoFoiPossivelConfirmar &&
                        evento.verificacaoDocumental
                          .naoFoiPossivelConfirmar
                          .length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                              O que não foi possível confirmar
                            </p>

                            <div className="mt-2 space-y-2">
                              {evento.verificacaoDocumental.naoFoiPossivelConfirmar.map(
                                (item, index) => (
                                  <p
                                    key={index}
                                    className="text-sm leading-6 text-black/65"
                                  >
                                    {item}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {evento.verificacaoDocumental
                        .fontes.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                            Fontes da verificação
                          </p>

                          <div className="mt-2 divide-y divide-black/10 border-y border-black/10">
                            {evento.verificacaoDocumental.fontes.map(
                              (fonte) => (
                                <a
                                  key={fonte.id}
                                  href={fonte.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                                >
                                  <span className="font-semibold">
                                    {
                                      fonte
                                        .veiculoOuInstituicao
                                    }
                                  </span>
                                  {" — "}
                                  {fonte.titulo} ↗
                                </a>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-black/35">
                        Verificação documental atualizada em{" "}
                        {formatarDataAtualizacao(
                          evento.verificacaoDocumental
                            .verificadoEm,
                        )}
                        .
                      </p>
                    </div>
                  )}

                  {evento
                    .oQueFoiPublicadoOuQuestionado &&
                    evento
                      .oQueFoiPublicadoOuQuestionado
                      .length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                          O que foi publicado ou questionado
                        </h4>

                        <div className="mt-3 space-y-4">
                          {evento.oQueFoiPublicadoOuQuestionado.map(
                            (
                              item,
                              index,
                            ) => (
                              <div
                                key={index}
                                className="border-l-2 border-black/15 pl-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
                                  {
                                    item.atribuicao
                                  }
                                </p>

                                <p className="mt-1 text-sm leading-6 text-black/65">
                                  {item.texto}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {evento.respostas &&
                    evento.respostas.length >
                      0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                          Respostas e contrapontos
                        </h4>

                        <div className="mt-3 space-y-4">
                          {evento.respostas.map(
                            (
                              item,
                              index,
                            ) => (
                              <div
                                key={index}
                                className="border-l-2 border-black/15 pl-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
                                  {
                                    item.atribuicao
                                  }
                                </p>

                                <p className="mt-1 text-sm leading-6 text-black/65">
                                  {item.texto}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {evento.desdobramentos &&
                    evento.desdobramentos
                      .length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                          O que aconteceu depois
                        </h4>

                        <div className="mt-3 space-y-3">
                          {evento.desdobramentos.map(
                            (
                              item,
                              index,
                            ) => (
                              <p
                                key={index}
                                className="text-sm leading-6 text-black/65"
                              >
                                {item}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                      Fontes
                    </h4>

                    <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                      {evento.fontes.map(
                        (fonte) => (
                          <a
                            key={fonte.id}
                            href={fonte.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                          >
                            <span className="font-semibold">
                              {
                                fonte
                                  .veiculoOuInstituicao
                              }
                            </span>
                            {" — "}
                            {fonte.titulo} ↗
                          </a>
                        ),
                      )}
                    </div>

                    <p className="mt-3 text-xs text-black/35">
                      Verificado em{" "}
                      {formatarDataAtualizacao(
                        evento.ultimaVerificacao,
                      )}
                      .
                    </p>
                  </div>

                </div>
              </details>
            </article>
          ))}
        </div>
      </div>
  );
  return (
    <section
      id="dossie"
      className="border-t border-black/15 py-10 sm:py-12"
    >
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Dossiê documental
        </p>

        <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
          Conheça a trajetória
        </h2>

        {dossie.emPoucasLinhas && (
          <div className="mt-6 border-l-4 border-[#FFC400] pl-5">
            <p className="text-lg leading-8 text-black/70">
              {dossie.emPoucasLinhas}
            </p>
          </div>
        )}

        <p className="mt-5 text-sm leading-6 text-black/45">
          Atualizado em{" "}
          {formatarDataAtualizacao(
            dossie.atualizadoEm,
          )}
          . Novos fatos e desdobramentos
          podem ser incorporados sem apagar
          o histórico anterior.
        </p>
      </div>

      {/* NOVE ITENS — ACORDEÃO */}

      <div className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          O que você encontra nesta ficha
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55">
          Abra um item para consultar os registros relacionados.
          A cronologia completa está disponível no item 9.
        </p>

        <div className="mt-6 border-y border-black/10">
          {eixos.map((eixo) => {
            const registros =
              eventos.filter((evento) =>
                evento.eixos.includes(eixo.id),
              );

            return (
              <details
                key={eixo.id}
                className="group/eixo border-b border-black/10 last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 sm:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    {eixo.numero}
                  </span>

                  <span className="min-w-0 flex-1 text-lg font-semibold tracking-[-0.02em]">
                    {eixo.titulo}
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-2xl font-light leading-none text-black/35 transition-transform group-open/eixo:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <div className="pb-6 pl-12 pr-4 sm:pb-7">
                  <p className="max-w-2xl text-sm leading-6 text-black/55">
                    {eixo.descricao}
                  </p>

                  {eixo.id === "linha-do-tempo" ? (
                    <>{conteudoLinhaDoTempo}</>
                  ) : eixo.id === "quem-e" ||
                  eixo.id ===
                    "patrimonio-atividades-economicas" ||
                  eixo.id === "fontes-atualizacoes" ? (
                    <>
                      {conteudoLocalPorEixo[eixo.id]}
                    </>
                  ) : eixo.id === "o-que-prometeu" ? (
                    dossie.promessas &&
                    dossie.promessas.length > 0 ? (
                      <div className="mt-5">
                        <div className="border-l-4 border-[#FFC400] pl-4">
                          <p className="max-w-2xl text-xs leading-5 text-black/50">
                            Este item reúne compromissos de campanha
                            localizados em fontes identificáveis. O levantamento
                            está em andamento e os registros incorporados ainda
                            não representam necessariamente a totalidade das
                            propostas da campanha.
                          </p>

                          <p className="mt-2 max-w-2xl text-xs leading-5 text-black/40">
                            Nas candidaturas à Presidência, a organização
                            temática abaixo segue os macrotemas e assuntos
                            publicados pelo Tribunal Superior Eleitoral.
                          </p>
                        </div>

                        <div className="mt-6 border-y border-black/10">
                          {Array.from(
                            new Set(
                              (dossie.promessas ?? []).map(
                                (promessa) =>
                                  promessa.classificacao
                                    .macrotema,
                              ),
                            ),
                          )
                            .sort((a, b) => {
                              const indiceA =
                                ORDEM_MACROTEMAS_TSE_PRESIDENCIA_2026.indexOf(
                                  a,
                                );

                              const indiceB =
                                ORDEM_MACROTEMAS_TSE_PRESIDENCIA_2026.indexOf(
                                  b,
                                );

                              if (
                                indiceA >= 0 &&
                                indiceB >= 0
                              ) {
                                return indiceA - indiceB;
                              }

                              if (indiceA >= 0) {
                                return -1;
                              }

                              if (indiceB >= 0) {
                                return 1;
                              }

                              return a.localeCompare(
                                b,
                                "pt-BR",
                              );
                            })
                            .map((macrotema) => {
                              const promessasDoMacrotema =
                                (
                                  dossie.promessas ??
                                  []
                                ).filter(
                                  (promessa) =>
                                    promessa
                                      .classificacao
                                      .macrotema ===
                                    macrotema,
                                );

                              const origemClassificacao =
                                promessasDoMacrotema[0]
                                  ?.classificacao
                                  .origem;

                              return (
                                <details
                                  key={macrotema}
                                  className="group/macrotema border-b border-black/10 last:border-b-0"
                                >
                                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                                    <div className="min-w-0">
                                      <p className="font-semibold leading-6">
                                        {macrotema}
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-black/40">
                                        {
                                          promessasDoMacrotema.length
                                        }{" "}
                                        {promessasDoMacrotema.length ===
                                        1
                                          ? "compromisso documentado"
                                          : "compromissos documentados"}
                                      </p>
                                    </div>

                                    <span
                                      aria-hidden="true"
                                      className="shrink-0 text-2xl font-light leading-none text-black/30 transition-transform group-open/macrotema:rotate-45"
                                    >
                                      +
                                    </span>
                                  </summary>

                                  <div className="pb-6 pl-4 sm:pl-5">
                                    {origemClassificacao && (
                                      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
                                        Classificação temática ·{" "}
                                        {
                                          origemClassificacao
                                        }
                                      </p>
                                    )}

                                    <div className="divide-y divide-black/10 border-y border-black/10">
                                      {promessasDoMacrotema.map(
                                        (promessa) => (
                                          <details
                                            key={
                                              promessa.id
                                            }
                                            className="group/promessa"
                                          >
                                            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                                              <div className="min-w-0">
                                                <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1">
                                                  {promessa
                                                    .classificacao
                                                    .assunto && (
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                                                      Assunto ·{" "}
                                                      {
                                                        promessa
                                                          .classificacao
                                                          .assunto
                                                      }
                                                    </p>
                                                  )}

                                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                                                    {
                                                      promessa.eleicao
                                                    }
                                                  </p>
                                                </div>

                                                <p className="font-semibold leading-6">
                                                  {
                                                    promessa.titulo
                                                  }
                                                </p>

                                                <p className="mt-1 text-xs text-black/40">
                                                  {
                                                    promessa.cargo
                                                  }
                                                </p>
                                              </div>

                                              <span
                                                aria-hidden="true"
                                                className="shrink-0 text-2xl font-light leading-none text-black/30 transition-transform group-open/promessa:rotate-45"
                                              >
                                                +
                                              </span>
                                            </summary>

                                            <div className="pb-7">
                                              <div className="border-l-4 border-[#FFC400] pl-5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                  Compromisso
                                                  documentado
                                                </p>

                                                <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
                                                  {
                                                    promessa.compromisso
                                                  }
                                                </p>
                                              </div>

                                              {promessa.contexto && (
                                                <div className="mt-7 border-t border-black/10 pt-6">
                                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                                    Contexto
                                                  </p>

                                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-black/65">
                                                    {
                                                      promessa.contexto
                                                    }
                                                  </p>
                                                </div>
                                              )}

                                              {promessa.oQueAFontePermiteAfirmar &&
                                                promessa
                                                  .oQueAFontePermiteAfirmar
                                                  .length >
                                                  0 && (
                                                  <div className="mt-7 border-t border-black/10 pt-6">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                                      O que a fonte
                                                      permite afirmar
                                                    </p>

                                                    <ul className="mt-3 list-disc space-y-3 pl-5">
                                                      {promessa.oQueAFontePermiteAfirmar.map(
                                                        (
                                                          item,
                                                          index,
                                                        ) => (
                                                          <li
                                                            key={
                                                              index
                                                            }
                                                            className="pl-1 text-sm leading-6 text-black/65"
                                                          >
                                                            {
                                                              item
                                                            }
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                              {promessa.criteriosDeAcompanhamento &&
                                                promessa
                                                  .criteriosDeAcompanhamento
                                                  .length >
                                                  0 && (
                                                  <div className="mt-7 border-t border-black/10 pt-6">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                                      Critérios para
                                                      acompanhar
                                                    </p>

                                                    <p className="mt-2 max-w-3xl text-xs leading-5 text-black/45">
                                                      Estes critérios
                                                      organizam o
                                                      acompanhamento
                                                      documental e não
                                                      constituem, por
                                                      si só, avaliação
                                                      de cumprimento.
                                                    </p>

                                                    <ul className="mt-3 list-disc space-y-3 pl-5">
                                                      {promessa.criteriosDeAcompanhamento.map(
                                                        (
                                                          item,
                                                          index,
                                                        ) => (
                                                          <li
                                                            key={
                                                              index
                                                            }
                                                            className="pl-1 text-sm leading-6 text-black/65"
                                                          >
                                                            {
                                                              item
                                                            }
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                )}

                                              <div className="mt-7 border-t border-black/10 pt-6">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                                  Origem
                                                </p>

                                                <p className="mt-3 text-sm leading-6 text-black/65">
                                                  {
                                                    promessa.origem
                                                  }
                                                </p>

                                                {promessa.referencia && (
                                                  <p className="mt-1 text-xs leading-5 text-black/40">
                                                    {
                                                      promessa.referencia
                                                    }
                                                  </p>
                                                )}
                                              </div>

                                              <div className="mt-7 border-t border-black/10 pt-6">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                                  Fontes
                                                </p>

                                                <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                                                  {promessa.fontes.map(
                                                    (
                                                      fonte,
                                                    ) => (
                                                      <a
                                                        key={
                                                          fonte.id
                                                        }
                                                        href={
                                                          fonte.url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                                                      >
                                                        <span className="font-semibold">
                                                          {
                                                            fonte.veiculoOuInstituicao
                                                          }
                                                        </span>
                                                        {
                                                          " — "
                                                        }
                                                        {
                                                          fonte.titulo
                                                        }{" "}
                                                        ↗
                                                      </a>
                                                    ),
                                                  )}
                                                </div>

                                                <p className="mt-3 text-xs text-black/35">
                                                  Verificado em{" "}
                                                  {formatarDataAtualizacao(
                                                    promessa.ultimaVerificacao,
                                                  )}
                                                  .
                                                </p>
                                              </div>
                                            </div>
                                          </details>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </details>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 border-l-2 border-[#FFC400] pl-4">
                        <p className="font-semibold">
                          Informações em levantamento
                        </p>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                          Ainda não há compromissos de campanha
                          documentados incorporados a esta ficha.
                        </p>
                      </div>
                    )
                  ) : registros.length > 0 ? (
                    eixo.id ===
                    "suspeitas-investigacoes-acusacoes" ? (
                      <div className="mt-5">
                        <div className="border-l-4 border-[#FFC400] pl-4">
                          <p className="max-w-2xl text-xs leading-5 text-black/50">
                            A inclusão de um registro neste item descreve
                            o estágio documental disponível e não implica,
                            por si só, conclusão de responsabilidade.
                          </p>
                        </div>

                        <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                          {registros.map((evento) => (
                            <details
                              key={evento.id}
                              className="group/caso"
                            >
                              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                                    {evento.data.rotulo}
                                  </p>

                                  <p className="mt-1 font-semibold leading-6">
                                    {evento.titulo}
                                  </p>

                                  {evento.natureza.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {evento.natureza.map(
                                        (natureza) => (
                                          <span
                                            key={natureza}
                                            className="border border-black/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-black/40"
                                          >
                                            {
                                              rotulosNatureza[
                                                natureza
                                              ]
                                            }
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </div>

                                <span
                                  aria-hidden="true"
                                  className="shrink-0 text-2xl font-light leading-none text-black/30 transition-transform group-open/caso:rotate-45"
                                >
                                  +
                                </span>
                              </summary>

                              <div className="pb-7">
                                <p className="max-w-3xl text-sm leading-6 text-black/65">
                                  {evento.resumo}
                                </p>

                                {evento.fatoDocumentado &&
                                  evento.fatoDocumentado
                                    .length > 0 && (
                                    <div className="mt-7 border-t border-black/10 pt-6">
                                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                        Fatos documentados
                                      </p>

                                      <ul className="mt-3 list-disc space-y-3 pl-5">
                                        {evento.fatoDocumentado.map(
                                          (
                                            item,
                                            index,
                                          ) => (
                                            <li
                                              key={index}
                                              className="pl-1 text-sm leading-6 text-black/65"
                                            >
                                              {item}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                {evento.oQueFoiPublicadoOuQuestionado &&
                                  evento
                                    .oQueFoiPublicadoOuQuestionado
                                    .length > 0 && (
                                    <div className="mt-7 border-t border-black/10 pt-6">
                                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                        O que foi publicado, alegado ou questionado
                                      </p>

                                      <div className="mt-3 space-y-4">
                                        {evento.oQueFoiPublicadoOuQuestionado.map(
                                          (
                                            item,
                                            index,
                                          ) => (
                                            <div
                                              key={index}
                                              className="border-l-2 border-black/15 pl-4"
                                            >
                                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
                                                {
                                                  item.atribuicao
                                                }
                                              </p>

                                              <p className="mt-1 text-sm leading-6 text-black/65">
                                                {item.texto}
                                              </p>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {evento.respostas &&
                                  evento.respostas.length >
                                    0 && (
                                    <div className="mt-7 border-t border-black/10 pt-6">
                                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                        Respostas
                                      </p>

                                      <div className="mt-3 space-y-4">
                                        {evento.respostas.map(
                                          (
                                            item,
                                            index,
                                          ) => (
                                            <div
                                              key={index}
                                              className="border-l-2 border-black/15 pl-4"
                                            >
                                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
                                                {
                                                  item.atribuicao
                                                }
                                              </p>

                                              <p className="mt-1 text-sm leading-6 text-black/65">
                                                {item.texto}
                                              </p>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {evento.desdobramentos &&
                                  evento.desdobramentos
                                    .length > 0 && (
                                    <div className="mt-7 border-t border-black/10 pt-6">
                                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                        Desdobramentos
                                      </p>

                                      <ul className="mt-3 list-disc space-y-3 pl-5">
                                        {evento.desdobramentos.map(
                                          (
                                            item,
                                            index,
                                          ) => (
                                            <li
                                              key={index}
                                              className="pl-1 text-sm leading-6 text-black/65"
                                            >
                                              {item}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                {evento.fontes.length > 0 && (
                                  <div className="mt-7 border-t border-black/10 pt-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                      Fontes
                                    </p>

                                    <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                                      {evento.fontes.map(
                                        (fonte) => (
                                          <a
                                            key={fonte.id}
                                            href={fonte.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                                          >
                                            <span className="font-semibold">
                                              {
                                                fonte.veiculoOuInstituicao
                                              }
                                            </span>
                                            {" — "}
                                            {fonte.titulo} ↗
                                          </a>
                                        ),
                                      )}
                                    </div>

                                    <p className="mt-3 text-xs text-black/35">
                                      Verificado em{" "}
                                      {formatarDataAtualizacao(
                                        evento.ultimaVerificacao,
                                      )}
                                      .
                                    </p>
                                  </div>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    ) : eixo.id === "o-que-diz-e-defende" ? (
                      <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                        {registros.map((evento) => (
                          <details
                            key={evento.id}
                            className="group/manifestacao"
                          >
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                              <div className="min-w-0">
                                {(evento.tema ||
                                  evento.tipoManifestacao) && (
                                  <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1">
                                    {evento.tema && (
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                                        Tema · {evento.tema}
                                      </p>
                                    )}

                                    {evento.tipoManifestacao && (
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                                        {
                                          rotulosTipoManifestacao[
                                            evento.tipoManifestacao
                                          ]
                                        }
                                      </p>
                                    )}
                                  </div>
                                )}

                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                                  {evento.data.rotulo}
                                </p>

                                <p className="mt-1 font-semibold leading-6">
                                  {evento.titulo}
                                </p>
                              </div>

                              <span
                                aria-hidden="true"
                                className="shrink-0 text-2xl font-light leading-none text-black/30 transition-transform group-open/manifestacao:rotate-45"
                              >
                                +
                              </span>
                            </summary>

                            <div className="pb-7">
                              <p className="max-w-3xl text-sm leading-6 text-black/65">
                                {evento.resumo}
                              </p>

                              {evento.oQueFoiPublicadoOuQuestionado &&
                                evento
                                  .oQueFoiPublicadoOuQuestionado
                                  .length > 0 && (
                                  <div className="mt-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                      O que disse
                                    </p>

                                    <div className="mt-3 space-y-4">
                                      {evento.oQueFoiPublicadoOuQuestionado.map(
                                        (
                                          item,
                                          index,
                                        ) => (
                                          <div
                                            key={index}
                                            className="border-l-2 border-black/15 pl-4"
                                          >
                                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/40">
                                              {
                                                item.atribuicao
                                              }
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-black/65">
                                              {item.texto}
                                            </p>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {evento.contextoManifestacao && (
                                <div className="mt-7 border-t border-black/10 pt-6">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                    Contexto da manifestação
                                  </p>

                                  <p className="mt-3 max-w-3xl text-sm leading-6 text-black/65">
                                    {evento.contextoManifestacao}
                                  </p>
                                </div>
                              )}

                              {evento.verificacaoDocumental && (
                                <div className="mt-7 border-t border-black/10 pt-6">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                                    Verificação documental
                                  </p>

                                  {evento.verificacaoDocumental
                                    .afirmacoesVerificaveis &&
                                    evento.verificacaoDocumental
                                      .afirmacoesVerificaveis
                                      .length > 0 && (
                                      <div className="mt-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                          O que pode ser verificado
                                        </p>

                                        <ul className="mt-3 list-disc space-y-3 pl-5">
                                          {evento.verificacaoDocumental.afirmacoesVerificaveis.map(
                                            (
                                              item,
                                              index,
                                            ) => (
                                              <li
                                                key={index}
                                                className="pl-1 text-sm leading-6 text-black/65"
                                              >
                                                {item}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  <div className="mt-6 border-l-4 border-[#FFC400] pl-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                      O que encontramos ao verificar
                                    </p>

                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
                                      {
                                        evento
                                          .verificacaoDocumental
                                          .sintese
                                      }
                                    </p>
                                  </div>

                                  {evento.verificacaoDocumental
                                    .evidenciasQueSustentam &&
                                    evento.verificacaoDocumental
                                      .evidenciasQueSustentam
                                      .length > 0 && (
                                      <div className="mt-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                          Evidências que sustentam aspectos da afirmação
                                        </p>

                                        <ul className="mt-3 list-disc space-y-3 pl-5">
                                          {evento.verificacaoDocumental.evidenciasQueSustentam.map(
                                            (
                                              item,
                                              index,
                                            ) => (
                                              <li
                                                key={index}
                                                className="pl-1 text-sm leading-6 text-black/65"
                                              >
                                                {item}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {evento.verificacaoDocumental
                                    .evidenciasQueLimitamOuContrariam &&
                                    evento.verificacaoDocumental
                                      .evidenciasQueLimitamOuContrariam
                                      .length > 0 && (
                                      <div className="mt-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                          Evidências que limitam ou apresentam informação diferente
                                        </p>

                                        <ul className="mt-3 list-disc space-y-3 pl-5">
                                          {evento.verificacaoDocumental.evidenciasQueLimitamOuContrariam.map(
                                            (
                                              item,
                                              index,
                                            ) => (
                                              <li
                                                key={index}
                                                className="pl-1 text-sm leading-6 text-black/65"
                                              >
                                                {item}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {evento.verificacaoDocumental
                                    .naoFoiPossivelConfirmar &&
                                    evento.verificacaoDocumental
                                      .naoFoiPossivelConfirmar
                                      .length > 0 && (
                                      <div className="mt-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                          O que não foi possível confirmar
                                        </p>

                                        <ul className="mt-3 list-disc space-y-3 pl-5">
                                          {evento.verificacaoDocumental.naoFoiPossivelConfirmar.map(
                                            (
                                              item,
                                              index,
                                            ) => (
                                              <li
                                                key={index}
                                                className="pl-1 text-sm leading-6 text-black/65"
                                              >
                                                {item}
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                  {evento.verificacaoDocumental
                                    .fontes.length > 0 && (
                                    <div className="mt-7">
                                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                        Fontes da verificação
                                      </p>

                                      <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                                        {evento.verificacaoDocumental.fontes.map(
                                          (fonte) => (
                                            <a
                                              key={
                                                fonte.id
                                              }
                                              href={
                                                fonte.url
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                              className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                                            >
                                              <span className="font-semibold">
                                                {
                                                  fonte
                                                    .veiculoOuInstituicao
                                                }
                                              </span>
                                              {" — "}
                                              {
                                                fonte.titulo
                                              }{" "}
                                              ↗
                                            </a>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <p className="mt-4 text-xs text-black/35">
                                    Verificação documental
                                    atualizada em{" "}
                                    {formatarDataAtualizacao(
                                      evento
                                        .verificacaoDocumental
                                        .verificadoEm,
                                    )}
                                    .
                                  </p>
                                </div>
                              )}

                              {evento.fontes.length > 0 && (
                                <div className="mt-7 border-t border-black/10 pt-6">
                                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                    Fontes da manifestação
                                  </p>

                                  <div className="mt-3 divide-y divide-black/10 border-y border-black/10">
                                    {evento.fontes.map(
                                      (fonte) => (
                                        <a
                                          key={fonte.id}
                                          href={fonte.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block py-3 text-sm leading-6 underline decoration-black/25 underline-offset-4 hover:decoration-black"
                                        >
                                          <span className="font-semibold">
                                            {
                                              fonte
                                                .veiculoOuInstituicao
                                            }
                                          </span>
                                          {" — "}
                                          {fonte.titulo} ↗
                                        </a>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
                        {registros.map((evento) => (
                          <a
                            key={evento.id}
                            href={`#evento-${evento.id}`}
                            className="group/event flex items-start justify-between gap-6 py-4"
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                                {evento.data.rotulo}
                              </p>

                              <p className="mt-1 font-semibold leading-6">
                                {evento.titulo}
                              </p>
                            </div>

                            <span
                              aria-hidden="true"
                              className="shrink-0 text-lg text-black/30 transition-transform group-hover/event:translate-y-1 group-hover/event:text-black"
                            >
                              ↓
                            </span>
                          </a>
                        ))}
                      </div>
                    )                  ) : conteudoLocalPorEixo[
                      eixo.id
                    ] ? (
                    <>
                      {conteudoLocalPorEixo[eixo.id]}
                    </>
                  ) : (
                    <div className="mt-5 border-l-2 border-[#FFC400] pl-4">
                      <p className="font-semibold">
                        Informações em levantamento
                      </p>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                        Ainda não há registros verificados incorporados
                        a esta ficha para este item.
                      </p>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>
      <div
        id="sobre-os-dados"
        className="mt-10 border-t border-black/10 pt-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Fontes e atualizações
        </p>

        {conteudoFontes}
      </div>
    </section>
  );
}
