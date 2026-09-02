import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { campaigns, getCampaign } from "@/data/campanhas";
import { candidaturas, obterSituacaoReeleicao, posicionamentos } from "@/data/eleicoes";
import ultimaAtualizacao from "@/data/eleicoes/ultima-atualizacao.json";

type FiltrosCandidatos = {
  uf?: string;
  cargo?: string;
  posicao?: string;
  partido?: string;
  reeleicao?: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<FiltrosCandidatos>;
};

const nomesDosCargos: Record<string, string> = {
  presidente: "Presidente",
  governador: "Governador",
  senador: "Senador",
  "deputado-federal": "Deputado Federal",
  "deputado-estadual": "Deputado Estadual",
  "deputado-distrital": "Deputado Distrital",
};

const nomesDasPosicoes: Record<string, string> = {
  favoravel: "Favorável",
  contrario: "Contrário",
  parcial: "Posição parcial",
  "sem-posicao-publica": "Sem posição pública localizada",
};

function hrefComFiltroDeReeleicao(
  slug: string,
  filtros: FiltrosCandidatos,
  reeleicao?: string
) {
  const params = new URLSearchParams();

  if (filtros.uf) {
    params.set("uf", filtros.uf);
  }

  if (filtros.cargo) {
    params.set("cargo", filtros.cargo);
  }

  if (filtros.posicao) {
    params.set("posicao", filtros.posicao);
  }

  if (filtros.partido) {
    params.set("partido", filtros.partido);
  }

  if (reeleicao) {
    params.set("reeleicao", reeleicao);
  }

  const query = params.toString();

  return `/campanhas/${slug}/candidatos${query ? `?${query}` : ""}`;
}
export function generateStaticParams() {
  return campaigns.map((campaign) => ({
    slug: campaign.slug,
  }));
}

export default async function CandidatosDaPautaPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const filtros = await searchParams;

  const campaign = getCampaign(slug);

  if (!campaign || !campaign.pautaId) {
    notFound();
  }

  const registros = posicionamentos
    .filter((item) => item.pautaId === campaign.pautaId)
    .map((posicionamento) => {
      const candidatura = candidaturas.find(
        (item) => item.id === posicionamento.candidaturaId
      );

      return candidatura
        ? { candidatura, posicionamento }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const ufs = Array.from(
    new Set(registros.map((item) => item.candidatura.uf))
  ).sort();

  const cargos = Array.from(
    new Set(registros.map((item) => item.candidatura.cargo))
  ).sort();

  const partidos = Array.from(
    new Set(registros.map((item) => item.candidatura.siglaPartido))
  ).sort();

  const filtrados = registros.filter(({ candidatura, posicionamento }) => {
    if (filtros.uf && candidatura.uf !== filtros.uf) {
      return false;
    }

    if (filtros.cargo && candidatura.cargo !== filtros.cargo) {
      return false;
    }

    if (
      filtros.posicao &&
      posicionamento.posicao !== filtros.posicao
    ) {
      return false;
    }

    if (
      filtros.partido &&
      candidatura.siglaPartido !== filtros.partido
    ) {
      return false;
    }

    if (
      filtros.reeleicao &&
      obterSituacaoReeleicao(candidatura) !== filtros.reeleicao
    ) {
      return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href={`/campanhas/${campaign.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45"
        >
          ← Voltar para a campanha
        </Link>

        <header className="mb-10 mt-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
            Eleições 2026
          </p>

          <h1 className="text-[clamp(2.8rem,8vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
            Quem se posicionou
            <br />
            sobre esta pauta?
          </h1>

          <div className="mt-7 max-w-2xl space-y-3 text-lg leading-8 text-black/60">
            <p>
              Aqui você pode ver quais candidatos já se posicionaram
              publicamente sobre o fim da escala 6x1.
            </p>

            <p>
              A classificação é feita pelo que cada candidato declarou
              ou fez publicamente — não pelo partido.
            </p>
          </div>
        </header>

        <form
          method="get"
          className="candidate-filters mb-10 gap-3 rounded-[28px] bg-white p-5"
        >
          <select
            name="uf"
            defaultValue={filtros.uf ?? ""}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todos os estados</option>
            {ufs.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>

          <select
            name="cargo"
            defaultValue={filtros.cargo ?? ""}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todos os cargos</option>
            {cargos.map((cargo) => (
              <option key={cargo} value={cargo}>
                {nomesDosCargos[cargo] ?? cargo}
              </option>
            ))}
          </select>

          <select
            name="posicao"
            defaultValue={filtros.posicao ?? ""}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todas as posições</option>
            <option value="favoravel">Favorável</option>
            <option value="contrario">Contrário</option>
            <option value="parcial">Posição parcial</option>
          </select>

          <select
            name="partido"
            defaultValue={filtros.partido ?? ""}
            className="rounded-2xl border border-black/10 bg-[#f5f5f1] px-4 py-3"
          >
            <option value="">Todos os partidos</option>
            {partidos.map((partido) => (
              <option key={partido} value={partido}>
                {partido}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="candidate-filters-button rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Filtrar
          </button>
        </form>

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Situação nesta eleição
          </p>

          <div className="flex flex-wrap gap-2">
            <Link
              href={hrefComFiltroDeReeleicao(
                campaign.slug,
                filtros
              )}
              scroll={false}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                !filtros.reeleicao
                  ? "bg-black text-white"
                  : "bg-white text-black/60 hover:text-black"
              }`}
            >
              Todos
            </Link>

            <Link
              href={hrefComFiltroDeReeleicao(
                campaign.slug,
                filtros,
                "reeleicao"
              )}
              scroll={false}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filtros.reeleicao === "reeleicao"
                  ? "bg-black text-white"
                  : "bg-white text-black/60 hover:text-black"
              }`}
            >
              Reeleição
            </Link>

            <Link
              href={hrefComFiltroDeReeleicao(
                campaign.slug,
                filtros,
                "nao-concorre-a-reeleicao"
              )}
              scroll={false}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filtros.reeleicao === "nao-concorre-a-reeleicao"
                  ? "bg-black text-white"
                  : "bg-white text-black/60 hover:text-black"
              }`}
            >
              Não concorre à reeleição
            </Link>
          </div>

          <p className="mt-3 text-xs leading-5 text-black/40">
            Reeleição significa que a pessoa ocupa atualmente o mesmo cargo
            que está disputando em 2026.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-black/45">
            {filtrados.length} candidato
            {filtrados.length === 1 ? "" : "s"} com posição documentada
          </p>

          <p className="text-xs text-black/35">
            Dados atualizados em{" "}
            {new Date(
              `${ultimaAtualizacao.atualizadoEm}-03:00`
            ).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <section className="space-y-4">
          {filtrados.map(({ candidatura, posicionamento }) => (
            <article
              key={posicionamento.id}
              className="rounded-[28px] border border-black/8 bg-white p-6 sm:p-8"
            >
              <div className="flex flex-wrap justify-between gap-5">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f1f1ed] sm:h-20 sm:w-20">
                    <Image
                      src={`/candidatos/2026/${candidatura.id}.jpg`}
                      alt={`Foto oficial de ${candidatura.nomeUrna}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tracking-[-0.03em]">
                      {candidatura.nomeUrna}
                    </p>

                  <p className="mt-2 text-sm text-black/45">
                    {candidatura.siglaPartido} · {candidatura.uf} ·{" "}
                    {nomesDosCargos[candidatura.cargo]}
                  </p>


                  {obterSituacaoReeleicao(candidatura) === "reeleicao" ? (
                    <span className="mt-3 inline-flex rounded-full border border-black/10 bg-[#f2f2ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-black/65">
                      Reeleição
                    </span>
                  ) : obterSituacaoReeleicao(candidatura) ===
                    "nao-concorre-a-reeleicao" ? (
                    <span className="mt-3 inline-flex rounded-full border border-black/10 bg-[#f2f2ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-black/65">
                      Concorre a outro cargo
                    </span>
                  ) : null}
                  </div>
                </div>

                <span className="h-fit rounded-full bg-[#efefe9] px-4 py-2 text-sm font-semibold">
                  {nomesDasPosicoes[posicionamento.posicao]}
                </span>
              </div>

              <p className="mt-6 leading-7 text-black/65">
                {posicionamento.resumo}
              </p>

              {posicionamento.evidencias?.length ? (
                <div className="mt-6 border-t border-black/8 pt-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                    Como sabemos?
                  </p>

                  <div className="space-y-3">
                    {posicionamento.evidencias.map((evidencia, index) => (
                      <div
                        key={`${evidencia.titulo}-${index}`}
                        className="rounded-2xl bg-[#f5f5f1] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                          <span>
                            {evidencia.tipo === "voto-nominal"
                              ? "Voto nominal"
                              : evidencia.tipo === "declaracao-publica"
                                ? "Declaração pública"
                                : evidencia.tipo === "entrevista"
                                  ? "Entrevista"
                                  : evidencia.tipo === "emenda"
                                    ? "Emenda"
                                    : evidencia.tipo === "programa-eleitoral"
                                      ? "Programa eleitoral"
                                      : evidencia.tipo === "documento-oficial"
                                        ? "Documento oficial"
                                        : "Outra evidência"}
                          </span>

                          {evidencia.resultadoVoto &&
                          evidencia.resultadoVoto !== "nao-se-aplica" ? (
                            <>
                              <span>·</span>
                              <span>
                                {evidencia.resultadoVoto === "sim"
                                  ? "Sim"
                                  : evidencia.resultadoVoto === "nao"
                                    ? "Não"
                                    : evidencia.resultadoVoto === "abstencao"
                                      ? "Abstenção"
                                      : evidencia.resultadoVoto === "ausente"
                                        ? "Ausente"
                                        : "Não votou"}
                              </span>
                            </>
                          ) : null}

                          {evidencia.proposicao ? (
                            <>
                              <span>·</span>
                              <span>{evidencia.proposicao}</span>
                            </>
                          ) : null}

                          {evidencia.data ? (
                            <>
                              <span>·</span>
                              <span>
                                {new Date(
                                  `${evidencia.data}T12:00:00`
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </>
                          ) : null}
                        </div>

                        <p className="mt-2 font-semibold">
                          {evidencia.titulo}
                        </p>

                        {evidencia.descricao ? (
                          <p className="mt-2 text-sm leading-6 text-black/60">
                            {evidencia.descricao}
                          </p>
                        ) : null}

                        <a
                          href={evidencia.fonte.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-sm font-medium underline decoration-black/20 underline-offset-4 hover:decoration-black"
                        >
                          Ver fonte — {evidencia.fonte.veiculoOuInstituicao}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!posicionamento.evidencias?.length ? (
                <div className="mt-6 border-t border-black/8 pt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                    Evidências
                  </p>

                  <div className="space-y-3">
                    {posicionamento.fontes.map((fonte) => (
                      <a
                        key={fonte.url}
                        href={fonte.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-medium underline decoration-black/20 underline-offset-4 hover:decoration-black"
                      >
                        {fonte.titulo} — {fonte.veiculoOuInstituicao}
                      </a>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-black/35">
                    Verificado em {posicionamento.atualizadoEm}
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-xs text-black/35">
                  Verificado em {posicionamento.atualizadoEm}
                </p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
