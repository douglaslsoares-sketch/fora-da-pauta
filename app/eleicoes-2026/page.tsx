import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ControleBuscaEleicoes } from "@/components/ControleBuscaEleicoes";
import {
  candidaturas,
  obterSituacaoReeleicao,
} from "@/data/eleicoes";

export const metadata: Metadata = {
  title: "Eleições 2026 | Fora da Pauta",
  description:
    "Consulte as candidaturas das Eleições 2026 por cargo, estado, nome e partido.",
};

type SearchParams = Promise<{
  cargo?: string;
  uf?: string;
  q?: string;
}>;

const cargos = [
  ["presidente", "Presidente"],
  ["governador", "Governador"],
  ["senador", "Senador"],
  ["deputado-federal", "Deputado Federal"],
  ["deputado-estadual", "Deputado Estadual"],
  ["deputado-distrital", "Deputado Distrital"],
] as const;

const ufs = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
  "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function Eleicoes2026Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const cargoParam =
    params.cargo ?? "";

  const ufParam =
    params.uf ?? "";

  const qParam =
    params.q?.trim() ?? "";

  const haFiltroPorCargoOuEstado =
    Boolean(cargoParam || ufParam);

  const q =
    haFiltroPorCargoOuEstado
      ? ""
      : qParam;

  const busca =
    normalizar(q);

  // Existem dois caminhos de pesquisa:
  // 1. cargo / estado;
  // 2. nome / partido.
  //
  // Os dois modos sao excludentes.
  const cargo =
    busca
      ? ""
      : cargoParam;

  const uf =
    busca
      ? ""
      : ufParam;

  const houvePesquisa =
    Boolean(cargo || uf || busca);

  const filtradas = candidaturas.filter((candidatura) => {
    if (cargo && candidatura.cargo !== cargo) {
      return false;
    }

    if (uf && candidatura.uf !== uf) {
      return false;
    }

    if (busca) {
      const texto = normalizar(
        [
          candidatura.nomeUrna,
          candidatura.nomeCompleto,
          candidatura.siglaPartido,
          candidatura.partido,
        ].join(" ")
      );

      if (!texto.includes(busca)) {
        return false;
      }
    }

    return true;
  });

  const exibidas = filtradas.slice(0, 250);

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-12">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em]">
            Fora da Pauta
          </p>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
            Eleições 2026
          </p>

          <h1 className="max-w-4xl text-[clamp(3rem,9vw,6rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
            Encontre seu candidato
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">
            Consulte as candidaturas presentes na base oficial do TSE.
            Use os filtros para pesquisar por cargo, estado, candidato ou partido.
          </p>
        </header>

        <ControleBuscaEleicoes />

        <form
          data-eleicoes-form
          method="get"
          className="mb-10 grid gap-3 rounded-[28px] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:grid-cols-4"
        >
          <select
            name="cargo"
            defaultValue={busca ? "" : cargo}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Selecione o cargo</option>
            {cargos.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            name="uf"
            defaultValue={busca ? "" : uf}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Selecione o estado</option>
            {ufs.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-sm text-black/40">ou</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <input
            type="search"
            name="q"
            defaultValue={haFiltroPorCargoOuEstado ? "" : q}
            placeholder="Nome ou partido do candidato"
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          />

          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Pesquisar
          </button>
        </form>

        <div data-eleicoes-resultados>
          {houvePesquisa ? (
          <>        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em]">
              {filtradas.length.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-black/45">
              candidatos encontrados
            </p>
          </div>

          {filtradas.length > 250 ? (
            <p className="max-w-xs text-right text-xs leading-5 text-black/40">
              Mostrando os primeiros 250. Use a busca para encontrar quem você procura.
            </p>
          ) : null}
        </div>

        <section className="space-y-3">
          {exibidas.map((candidatura) => {
            const situacaoReeleicao =
              obterSituacaoReeleicao(candidatura);

            const foto =
              `/candidatos/2026/${candidatura.id}.jpg`;

            return (
              <Link
                key={candidatura.id}
                href={`/eleicoes-2026/candidatos/${candidatura.id}`}
                className="block rounded-[24px] border border-black/8 bg-white px-5 py-5 transition hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f5f5f1]">
                    {foto ? (
                      <Image
                        src={foto}
                        alt={`Foto oficial de ${candidatura.nomeUrna}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-black/25">
                        {candidatura.nomeUrna
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-semibold leading-7 tracking-[-0.025em]">
                      {candidatura.nomeUrna}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-black/45">
                      {candidatura.nomeCompleto}
                    </p>

                    <p className="mt-3 text-sm font-semibold">
                      {candidatura.siglaPartido}
                      {" · "}
                      nº {candidatura.numero}
                    </p>

                    <p className="mt-1 text-sm text-black/60">
                      {cargos.find(
                        ([value]) =>
                          value === candidatura.cargo,
                      )?.[1]}
                      {" · "}
                      {candidatura.uf === "BR"
                        ? "Brasil"
                        : candidatura.uf}
                    </p>

                    {situacaoReeleicao === "reeleicao" ? (
                      <span className="mt-3 inline-flex rounded-full bg-[#f1f1ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
                        REELEIÇÃO
                      </span>
                    ) : null}

                    <p className="mt-3 text-sm font-semibold">
                      Ver ficha →
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

          </>
        ) : null}
        </div>

        <footer className="mt-14 border-t border-black/10 pt-6 text-xs leading-5 text-black/40">
          <p>
            Fonte: Tribunal Superior Eleitoral (TSE) — Dados Abertos.
          </p>

          <p className="mt-1">
            Informações atualizadas periodicamente.
          </p>
        </footer>
      </div>
    </main>
  );
}
