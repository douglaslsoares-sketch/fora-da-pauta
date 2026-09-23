import Link from "next/link";
import { notFound } from "next/navigation";

import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

function formatarData(valor: string) {
  const [ano, mes, dia] =
    valor.slice(0, 10).split("-");

  if (!ano || !mes || !dia) {
    return valor;
  }

  return `${dia}/${mes}/${ano}`;
}

export default async function VotacoesDoCandidatoPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const candidato =
    candidaturas.find(
      (item) =>
        item.id === id,
    );

  if (!candidato) {
    notFound();
  }

  const atuacao =
    buscarAtuacaoPolitica(
      candidato.id,
    );

  if (
    !atuacao ||
    atuacao.votacoes.length === 0
  ) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto w-full max-w-4xl px-5 pb-8 pt-6 sm:px-8 sm:pb-12 sm:pt-8">
          <Link
            href={`/conheca-seu-candidato/${candidato.id}`}
            className="text-sm font-semibold text-[#FFC400]"
          >
            ← Voltar à ficha
          </Link>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
            Atuação política documentada
          </p>

          <h1 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
            Votações nominais
          </h1>

          <p className="mt-4 text-lg text-white/65">
            {candidato.nomeUrna}
          </p>

          <p className="mt-1 text-sm text-white/45">
            {formatarCargo(candidato.cargo)}
            {" · "}
            {candidato.siglaPartido}
            {" · "}
            {candidato.uf}
          </p>

          <p className="mt-6 text-sm text-white/50">
            {atuacao.totalVotacoes} registros disponíveis
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <p className="max-w-2xl text-sm leading-6 text-black/50">
          Votações nominais identificadas na base da Câmara dos
          Deputados, apresentadas da mais recente para a mais antiga.
        </p>

        <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
          {atuacao.votacoes.map(
            (item) => (
              <article
                key={item.votacaoId}
                className="py-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                    {formatarData(
                      item.data,
                    )}
                  </p>

                  <p className="text-sm font-semibold">
                    Voto registrado:{" "}
                    {item.voto}
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

        <div className="mt-10 border-t border-black/10 pt-6">
          <Link
            href={`/conheca-seu-candidato/${candidato.id}`}
            className="font-semibold underline underline-offset-4"
          >
            ← Voltar à ficha do candidato
          </Link>
        </div>
      </div>
    </main>
  );
}