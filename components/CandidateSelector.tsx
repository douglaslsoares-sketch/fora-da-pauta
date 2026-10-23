"use client";

import Link from "next/link";

import { CandidatePhoto } from "@/components/CandidatePhoto";

import {
  useEffect,
  useState,
} from "react";

type CandidateResult = {
  id: string;
  nomeUrna: string;
  nomeCompleto: string;
  numero: number;
  cargo: string;
  cargoLabel: string;
  uf: string;
  siglaPartido: string;
  situacaoEleitoral?: string;
  pessoaPoliticaId?: string | null;
};

type SearchResponse = {
  resultados: CandidateResult[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

const cargos = [
  {
    value: "",
    label: "Cargo",
  },
  {
    value: "presidente",
    label: "Presidente",
  },
  {
    value: "governador",
    label: "Governador",
  },
  {
    value: "senador",
    label: "Senador",
  },
  {
    value: "deputado-federal",
    label: "Deputado federal",
  },
  {
    value: "deputado-estadual",
    label: "Deputado estadual",
  },
  {
    value: "deputado-distrital",
    label: "Deputado distrital",
  },
];

const ufs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function CandidateBrowseSelector() {
  const [nome, setNome] =
    useState("");

  const [partido, setPartido] =
    useState("");

  const [numero, setNumero] =
    useState("");

  const [cargo, setCargo] =
    useState("");

  const [uf, setUf] =
    useState("");

  const [
    resultados,
    setResultados,
  ] = useState<CandidateResult[]>([]);

  const [total, setTotal] =
    useState(0);

  const [pagina, setPagina] =
    useState(1);

  const [totalPaginas, setTotalPaginas] =
    useState(1);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const podeBuscar =
    nome.trim().length >= 2 ||
    partido.trim().length >= 2 ||
    numero.replace(/\D/g, "").length > 0 ||
    Boolean(cargo) ||
    Boolean(uf);

  useEffect(() => {
    if (!podeBuscar) {
      setResultados([]);
      setTotal(0);
      setPagina(1);
      setTotalPaginas(1);
      setErro("");
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          setCarregando(true);
          setErro("");

          try {
            const params =
              new URLSearchParams();

            if (nome.trim()) {
              params.set(
                "nome",
                nome.trim(),
              );
            }

            if (partido.trim()) {
              params.set(
                "partido",
                partido.trim(),
              );
            }

            if (numero.trim()) {
              params.set(
                "numero",
                numero.trim(),
              );
            }
            if (cargo) {
              params.set(
                "cargo",
                cargo,
              );
            }

            if (uf) {
              params.set(
                "uf",
                uf,
              );
            }

            params.set(
              "pagina",
              String(pagina),
            );

            const response =
              await fetch(
                `/api/candidatos/buscar?${params.toString()}`,
                {
                  signal:
                    controller.signal,
                },
              );

            if (!response.ok) {
              throw new Error(
                "Não foi possível realizar a busca.",
              );
            }

            const data =
              (await response.json()) as SearchResponse;

            setResultados(
              data.resultados,
            );

            setTotal(
              data.total,
            );

            setPagina(
              data.pagina,
            );

            setTotalPaginas(
              Math.max(
                1,
                data.totalPaginas,
              ),
            );
          } catch (error) {
            if (
              error instanceof DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            setErro(
              "Não foi possível realizar a busca.",
            );
          } finally {
            setCarregando(false);
          }
        },
        250,
      );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    nome,
    partido,
    numero,
    cargo,
    uf,
    pagina,
    podeBuscar,
  ]);

  function limpar() {
    setNome("");
    setPartido("");
    setNumero("");
    setCargo("");
    setUf("");
    setPagina(1);
    setTotalPaginas(1);
    setResultados([]);
    setTotal(0);
    setErro("");
  }

  return (
    <div className="mt-0 sm:mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label
            htmlFor="busca-nome"
            className="sr-only sm:not-sr-only sm:mb-2 sm:block sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.16em] sm:text-black/45"
          >
            Nome
          </label>

          <input
            id="busca-nome"
            type="search"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              setPagina(1);
            }}
            placeholder="Nome do candidato"
            autoComplete="off"
            className="min-h-12 w-full border border-black/20 bg-white px-3 text-sm outline-none transition placeholder:text-black/50 focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="busca-partido"
            className="sr-only sm:not-sr-only sm:mb-2 sm:block sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.16em] sm:text-black/45"
          >
            Partido
          </label>

          <input
            id="busca-partido"
            type="search"
            value={partido}
            onChange={(event) => {
              setPartido(event.target.value);
              setPagina(1);
            }}
            placeholder="Partido"
            autoComplete="off"
            className="min-h-12 w-full border border-black/20 bg-white px-3 text-sm outline-none transition placeholder:text-black/50 focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="busca-numero"
            className="sr-only sm:not-sr-only sm:mb-2 sm:block sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.16em] sm:text-black/45"
          >
            {"N\u00famero"}
          </label>

          <input
            id="busca-numero"
            type="search"
            inputMode="numeric"
            value={numero}
            onChange={(event) => {
              setNumero(event.target.value);
              setPagina(1);
            }}
            placeholder="Número"
            autoComplete="off"
            className="min-h-12 w-full border border-black/20 bg-white px-3 text-sm outline-none transition placeholder:text-black/50 focus:border-black"
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4">
        <div>
          <label
            htmlFor="filtro-cargo"
            className="sr-only sm:not-sr-only sm:mb-2 sm:block sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.16em] sm:text-black/45"
          >
            Cargo
          </label>

          <select
            id="filtro-cargo"
            value={cargo}
            onChange={(event) => {
              setCargo(
                event.target.value,
              );
              setPagina(1);
            }}
            className="
              min-h-12
              w-full
              border
              border-black/20
              bg-white
              px-3
              text-sm
              outline-none
              focus:border-black
            "
          >
            {cargos.map(
              (item) => (
                <option
                  key={
                    item.value ||
                    "todos"
                  }
                  value={
                    item.value
                  }
                >
                  {item.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="filtro-uf"
            className="sr-only sm:not-sr-only sm:mb-2 sm:block sm:text-xs sm:font-semibold sm:uppercase sm:tracking-[0.16em] sm:text-black/45"
          >
            Estado
          </label>

          <select
            id="filtro-uf"
            value={uf}
            onChange={(event) => {
              setUf(
                event.target.value,
              );
              setPagina(1);
            }}
            className="
              min-h-12
              w-full
              border
              border-black/20
              bg-white
              px-3
              text-sm
              outline-none
              focus:border-black
            "
          >
            <option value="">
              Estado
            </option>

            {ufs.map(
              (sigla) => (
                <option
                  key={sigla}
                  value={sigla}
                >
                  {sigla}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {(nome ||
        partido ||
        numero ||
        cargo ||
        uf) && (
        <button
          type="button"
          onClick={limpar}
          className="mt-4 text-sm font-semibold underline underline-offset-4"
        >
          Limpar busca
        </button>
      )}

      <div
        className="mt-8"
        aria-live="polite"
      >
        {!podeBuscar && (
          <p className="hidden text-sm leading-6 text-black/50 sm:block">
            {"Informe nome, partido ou n\u00famero, ou escolha um cargo ou estado."}
          </p>
        )}

        {carregando && (
          <p className="text-sm text-black/50">
            Buscando...
          </p>
        )}

        {erro && (
          <p className="border-l-4 border-[#FFC400] pl-4 text-sm">
            {erro}
          </p>
        )}

        {!carregando &&
          !erro &&
          podeBuscar &&
          total === 0 && (
            <p className="border-l-4 border-[#FFC400] pl-4 text-sm leading-6">
              Nenhum candidato foi
              encontrado com esses
              critérios.
            </p>
          )}

        {!carregando &&
          total > 0 && (
            <>
              <div className="flex items-end justify-between gap-4 border-b border-black/15 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                  Candidatos encontrados
                </p>

                <p className="text-xs text-black/40">
                  {total === 0
                    ? "0"
                    : `${(pagina - 1) * 40 + 1}-${Math.min(
                        pagina * 40,
                        total,
                      )} de ${total}`}
                </p>
              </div>

              <div className="divide-y divide-black/10">
                {resultados.map(
                  (candidate) => (
                    <Link
                      key={
                        candidate.id
                      }
                      href={`/conheca-seu-candidato/${candidate.id}`}
                      className="
                        group
                        block
                        py-5
                        transition
                        hover:bg-black/[0.025]
                        focus:outline-none
                      "
                    >
                      <div className="flex items-start gap-4">
                        <CandidatePhoto
                          id={candidate.id}
                          name={candidate.nomeUrna}
                        />

                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                            {
                              candidate.nomeUrna
                            }
                          </h2>

                          {candidate.nomeCompleto !==
                            candidate.nomeUrna && (
                            <p className="mt-1 truncate text-sm text-black/45">
                              {
                                candidate.nomeCompleto
                              }
                            </p>
                          )}

                          <p className="mt-3 text-sm leading-6 text-black/60">
                            {
                              candidate.cargoLabel
                            }
                            {" · "}
                            {
                              candidate.siglaPartido
                            }
                            {" · "}
                            {
                              candidate.uf
                            }
                            {" · "}
                            Nº{" "}
                            {
                              candidate.numero
                            }
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="
                            mt-1
                            shrink-0
                            text-xl
                            transition-transform
                            group-hover:translate-x-1
                          "
                        >
                          →
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>

              {totalPaginas > 1 && (
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
                  <button
                    type="button"
                    disabled={
                      carregando ||
                      pagina <= 1
                    }
                    onClick={() =>
                      setPagina((atual) =>
                        Math.max(
                          1,
                          atual - 1,
                        ),
                      )
                    }
                    className="text-sm font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {"\u2190"} Anterior
                  </button>

                  <p className="text-xs text-black/45">
                    {"P\u00e1gina"} {pagina} de{" "}
                    {totalPaginas}
                  </p>

                  <button
                    type="button"
                    disabled={
                      carregando ||
                      pagina >= totalPaginas
                    }
                    onClick={() =>
                      setPagina((atual) =>
                        Math.min(
                          totalPaginas,
                          atual + 1,
                        ),
                      )
                    }
                    className="text-sm font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {"Pr\u00f3xima"} {"\u2192"}
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}

type CandidateSelectorProps =
  | { mode?: "browse" }
  | {
      mode: "follow";
      selectedIds: readonly string[];
      onSelect: (candidate: CandidateResult) => void;
    };

// Sem props, renderiza exatamente a experiÃªncia original de consulta.
export function CandidateSelector(props: CandidateSelectorProps = {}) {
  if (props.mode === "follow") return <CandidateFollowSelector {...props} />;
  return <CandidateBrowseSelector />;
}

function CandidateFollowSelector({
  selectedIds,
  onSelect,
}: Extract<CandidateSelectorProps, { mode: "follow" }>) {
  const [query, setQuery] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const [pagina, setPagina] = useState(1);
  const [resultados, setResultados] = useState<CandidateResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [tela, setTela] = useState<"busca" | "resultados">("busca");

  const podeBuscar = query.trim().length >= 2;

  useEffect(() => {
    if (!buscaAtiva) return;

    const controller = new AbortController();

    const carregar = async () => {
      setCarregando(true);
      setErro("");

      try {
        const params = new URLSearchParams({
          q: buscaAtiva,
          pagina: String(pagina),
          escopo: "acompanhamento",
        });

        const response = await fetch(
          `/api/candidatos/buscar?${params}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Busca indisponível");
        }

        const data = (await response.json()) as SearchResponse & {
          totalPaginas: number;
        };

        if (
          !Array.isArray(data.resultados) ||
          !Number.isFinite(data.total) ||
          !Number.isFinite(data.totalPaginas)
        ) {
          throw new Error("Resposta inválida");
        }

        if (controller.signal.aborted) return;

        setResultados((atuais) => {
          if (pagina === 1) return data.resultados;

          const ids = new Set(
            atuais.map((item) => item.id),
          );

          return [
            ...atuais,
            ...data.resultados.filter(
              (item) => !ids.has(item.id),
            ),
          ];
        });

        setTotal(data.total);
        setTotalPaginas(data.totalPaginas);
      } catch {
        if (!controller.signal.aborted) {
          setErro(
            "Não foi possível realizar a busca. Tente novamente.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    };

    carregar();

    return () => controller.abort();
  }, [buscaAtiva, pagina, tentativa]);

  function executarBusca(
    event?: React.FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();

    if (!podeBuscar) return;

    setResultados([]);
    setTotal(0);
    setTotalPaginas(0);
    setPagina(1);
    setErro("");
    setBuscaAtiva(query.trim());
    setTela("resultados");
  }

  function novaBusca() {
    setQuery("");
    setBuscaAtiva("");
    setResultados([]);
    setTotal(0);
    setTotalPaginas(0);
    setPagina(1);
    setErro("");
    setTela("busca");

    window.requestAnimationFrame(() => {
      document
        .getElementById("busca-acompanhamento")
        ?.focus();
    });
  }

  if (tela === "busca") {
    return (
      <form
        onSubmit={executarBusca}
        className="mt-5"
      >
        <label
          htmlFor="busca-acompanhamento"
          className="sr-only"
        >
          Nome ou número
        </label>

        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-black/60"
          >
            ⌕
          </span>

          <input
            id="busca-acompanhamento"
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Digite o nome ou o número"
            autoComplete="off"
            className="min-h-14 w-full rounded-2xl border border-black/20 bg-white py-3 pl-12 pr-4 text-base outline-none placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-[#FFC400]"
          />
        </div>

        <button
          type="submit"
          disabled={!podeBuscar}
          className="mt-3 min-h-14 w-full rounded-2xl bg-[#FFC400] px-5 text-lg font-bold text-black transition hover:bg-[#e9b300] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Buscar
        </button>
      </form>
    );
  }

  return (
    <div className="mt-1" data-follow-results="true">
      <h2 className="w-full min-w-0 break-words text-2xl font-bold leading-tight tracking-normal sm:text-3xl">
        Resultado da busca
      </h2>

      <p className="mt-2 text-base leading-6 text-black/70">
        {carregando
          ? `Buscando resultados para “${buscaAtiva}”...`
          : `Encontramos ${total} ${
              total === 1 ? "resultado" : "resultados"
            } para “${buscaAtiva}”`}
      </p>

      {erro ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-[#FFC400] p-4"
        >
          <p className="text-sm">{erro}</p>
          <button
            type="button"
            onClick={() =>
              setTentativa((atual) => atual + 1)
            }
            className="mt-3 font-semibold underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!carregando && !erro && total === 0 ? (
        <p className="mt-6 rounded-2xl bg-black/[0.05] p-4 text-sm leading-6">
          Nenhuma pessoa encontrada. Tente outra parte do nome ou o número completo.
        </p>
      ) : null}

      <div
        className="mt-5 space-y-3"
        aria-label="Resultados da busca"
        aria-busy={carregando}
      >
        {resultados.map((candidate) => {
          const selecionado =
            selectedIds.includes(candidate.id);

          return (
            <div
              key={candidate.id}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
            >
              <CandidatePhoto
                id={candidate.id}
                name={candidate.nomeUrna}
              />

              <div className="min-w-0 flex-1">
                <p className="break-normal text-[15px] font-semibold leading-[1.2] [overflow-wrap:normal] [word-break:normal]">
                  {candidate.nomeUrna}
                </p>

                {candidate.situacaoEleitoral ? (
                  <p className="mt-1 text-xs font-semibold text-black/70">{candidate.situacaoEleitoral}</p>
                ) : null}
                <p className="mt-1 text-sm leading-5 text-black/60">
                  {candidate.cargoLabel}
                  <br />
                  {candidate.uf}
                  <br />
                  {candidate.siglaPartido} · Nº{" "}
                  {candidate.numero}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <Link href={candidate.pessoaPoliticaId ? `/pessoas/${candidate.pessoaPoliticaId}` : `/conheca-seu-candidato/${candidate.id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-black/20 px-2.5 py-3 text-center text-xs font-bold">Ver ficha</Link>
              <button
                type="button"
                onClick={() => onSelect(candidate)}
                disabled={selecionado}
                className={`shrink-0 rounded-xl px-2.5 py-3 text-xs font-bold ${
                  selecionado
                    ? "bg-black/5 text-black/40"
                    : "bg-[#FFC400] text-black hover:bg-[#e9b300]"
                }`}
              >
                {selecionado
                  ? "Selecionado"
                  : "Acompanhar"}
              </button>
              </div>
            </div>
          );
        })}
      </div>

      {pagina < totalPaginas && !erro ? (
        <button
          type="button"
          disabled={carregando}
          onClick={() =>
            setPagina((atual) => atual + 1)
          }
          className="mt-4 min-h-12 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 font-semibold disabled:opacity-50"
        >
          {carregando
            ? "Carregando..."
            : "Mostrar mais resultados"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={novaBusca}
        className="mt-5 min-h-13 w-full rounded-2xl bg-black/[0.07] px-5 py-3 font-semibold"
      >
        ‹ &nbsp; Nova busca
      </button>
    </div>
  );
}
