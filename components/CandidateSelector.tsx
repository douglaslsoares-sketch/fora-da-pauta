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
};

type SearchResponse = {
  resultados: CandidateResult[];
  total: number;
};

const cargos = [
  {
    value: "",
    label: "Todos os cargos",
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

export function CandidateSelector() {
  const [query, setQuery] =
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

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const podeBuscar =
    query.trim().length >= 2 ||
    Boolean(cargo) ||
    Boolean(uf);

  useEffect(() => {
    if (!podeBuscar) {
      setResultados([]);
      setTotal(0);
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

            if (query.trim()) {
              params.set(
                "q",
                query.trim(),
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
    query,
    cargo,
    uf,
    podeBuscar,
  ]);

  function limpar() {
    setQuery("");
    setCargo("");
    setUf("");
    setResultados([]);
    setTotal(0);
    setErro("");
  }

  return (
    <div className="mt-8">
      <label
        htmlFor="busca-candidato"
        className="block text-sm font-semibold"
      >
        Nome do candidato
      </label>

      <input
        id="busca-candidato"
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(
            event.target.value,
          )
        }
        placeholder="Digite o nome, partido ou número"
        autoComplete="off"
        className="
          mt-2
          min-h-14
          w-full
          border
          border-black/20
          bg-white
          px-4
          text-base
          outline-none
          transition
          placeholder:text-black/35
          focus:border-black
        "
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="filtro-cargo"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/45"
          >
            Cargo
          </label>

          <select
            id="filtro-cargo"
            value={cargo}
            onChange={(event) =>
              setCargo(
                event.target.value,
              )
            }
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
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/45"
          >
            Estado
          </label>

          <select
            id="filtro-uf"
            value={uf}
            onChange={(event) =>
              setUf(
                event.target.value,
              )
            }
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
              Todos os estados
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

      {(query ||
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
          <p className="text-sm leading-6 text-black/50">
            Digite pelo menos duas
            letras do nome ou escolha
            um cargo ou estado.
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
                  {total > 40
                    ? `40 de ${total}`
                    : total}
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

              {total > 40 && (
                <p className="mt-5 text-sm leading-6 text-black/45">
                  Há mais resultados.
                  Refine o nome, cargo
                  ou estado para reduzir
                  a lista.
                </p>
              )}
            </>
          )}
      </div>
    </div>
  );
}