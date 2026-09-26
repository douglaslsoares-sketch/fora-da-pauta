import type { ReactNode } from "react";
import {
  buscarDossiePorCandidaturaId,
} from "@/data/eleicoes/dossies";

import type {
  EixoDossie,
  NaturezaRegistro,
} from "@/data/eleicoes/dossies/modelo";

type CandidateDossierProps = {
  candidaturaId: string;
  conteudoQuemE: ReactNode;
  conteudoPatrimonio: ReactNode;
  conteudoFontes: ReactNode;
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
      "Declarações, entrevistas, discursos e posições públicas.",
  },
  {
    id: "fontes-atualizacoes",
    numero: "9",
    titulo: "Fontes e atualizações",
    descricao:
      "Documentos, links, verificações, correções e novos desdobramentos.",
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

    case "fontes-atualizacoes":
      return "#sobre-os-dados";

    default:
      return "#linha-do-tempo";
  }
}
export function CandidateDossier({
  candidaturaId,
  conteudoQuemE,
  conteudoPatrimonio,
  conteudoFontes,
}: CandidateDossierProps) {

  const dossie =
    buscarDossiePorCandidaturaId(
      candidaturaId,
    );

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

                {eixo.id === "quem-e" ? (
                  <>{conteudoQuemE}</>
                ) : eixo.id === "patrimonio-atividades-economicas" ? (
                  <>{conteudoPatrimonio}</>
                ) : eixo.id === "fontes-atualizacoes" ? (
                  <>{conteudoFontes}</>
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
          A cronologia completa permanece disponível mais abaixo.
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

                  {eixo.id === "quem-e" ? (
                    <>{conteudoQuemE}</>
                  ) : eixo.id === "patrimonio-atividades-economicas" ? (
                    <>{conteudoPatrimonio}</>
                  ) : eixo.id === "fontes-atualizacoes" ? (
                    <>{conteudoFontes}</>
                  ) : registros.length > 0 ? (
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
      {/* LINHA DO TEMPO */}

      <div
        id="linha-do-tempo"
        className="mt-14 scroll-mt-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Linha do tempo
        </p>

        <h2 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
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
    </section>
  );
}
