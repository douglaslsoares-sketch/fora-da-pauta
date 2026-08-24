import type { Metadata } from "next";
import { candidaturas } from "@/data/eleicoes";

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

  const cargo = params.cargo ?? "";
  const uf = params.uf ?? "";
  const q = params.q?.trim() ?? "";
  const busca = normalizar(q);

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
            Candidaturas
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">
            Consulte as candidaturas presentes na base oficial do TSE.
            Use os filtros para pesquisar por cargo, estado, candidato ou partido.
          </p>
        </header>

        <form
          method="get"
          className="mb-10 grid gap-3 rounded-[28px] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:grid-cols-4"
        >
          <select
            name="cargo"
            defaultValue={cargo}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todos os cargos</option>
            {cargos.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            name="uf"
            defaultValue={uf}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todos os estados</option>
            {ufs.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nome ou partido"
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          />

          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Pesquisar
          </button>
        </form>

        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em]">
              {filtradas.length.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-black/45">
              candidaturas encontradas
            </p>
          </div>

          {filtradas.length > 250 ? (
            <p className="max-w-xs text-right text-xs leading-5 text-black/40">
              Exibindo as primeiras 250. Refine os filtros para reduzir a lista.
            </p>
          ) : null}
        </div>

        <section className="space-y-3">
          {exibidas.map((candidatura) => (
            <article
              key={candidatura.id}
              className="rounded-[24px] border border-black/8 bg-white px-5 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xl font-semibold tracking-[-0.025em]">
                    {candidatura.nomeUrna}
                  </p>

                  <p className="mt-1 text-sm text-black/45">
                    {candidatura.nomeCompleto}
                  </p>

                  <p className="mt-4 text-sm font-medium">
                    {candidatura.siglaPartido}
                    {" · "}
                    nº {candidatura.numero}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                    {candidatura.uf}
                  </p>

                  <p className="mt-2 text-sm">
                    {cargos.find(([value]) => value === candidatura.cargo)?.[1]}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-14 border-t border-black/10 pt-6 text-xs leading-5 text-black/40">
          Fonte: Tribunal Superior Eleitoral — Dados Abertos.
          A base será atualizada periodicamente e a situação oficial das
          candidaturas será preservada conforme publicada pelo TSE.
        </footer>
      </div>
    </main>
  );
}
