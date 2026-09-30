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

export function CandidateSelector() {
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