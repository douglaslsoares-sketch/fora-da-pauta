import pib from "@/data/economia/gerado/pib.json";
import ipca from "@/data/economia/gerado/ipca.json";
import desemprego from "@/data/economia/gerado/desemprego.json";
import renda from "@/data/economia/gerado/renda.json";
import pobreza from "@/data/economia/gerado/pobreza.json";
import extremaPobreza from "@/data/economia/gerado/extrema-pobreza.json";
import investimento from "@/data/economia/gerado/investimento.json";
import divida from "@/data/economia/gerado/divida.json";
import resultadoPrimario from "@/data/economia/gerado/resultado-primario.json";
import juros from "@/data/economia/gerado/juros.json";
import cargaTributaria from "@/data/economia/gerado/carga-tributaria.json";
import despesaPrimaria from "@/data/economia/gerado/despesa-primaria.json";
import analfabetismo from "@/data/economia/gerado/analfabetismo.json";
import mortalidadeInfantil from "@/data/economia/gerado/mortalidade-infantil.json";

function pct(valor: number | null | undefined, casas = 1) {
  if (valor === null || valor === undefined) return "—";

  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

function brl(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "—";

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatarPeriodo(periodo: string) {
  const data = periodo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!data) return periodo;

  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const mes = Number(data[2]);
  const ano = data[3];

  return `${meses[mes - 1]} de ${ano}`;
}

function YearSeries({
  anos,
  mostrarSinalPositivo = false,
  formato = "percentual",
}: {
  anos: Array<{
    ano: number;
    governo: string;
    valor: number | null;
    contexto?: string;
    tipo?: string;
    ultimoDado?: {
      periodo: string;
      valor?: number;
      valorMesmoTrimestreAnoAnterior?: number;
      valorTrimestreAnterior?: number;
    };
  }>;
  mostrarSinalPositivo?: boolean;
  formato?: "percentual" | "moeda";
}) {
  const grupos = [
    {
      id: "bolsonaro",
      nome: "Bolsonaro",
      periodo: "2019–2022",
      itens: anos.filter(
        (item) =>
          item.governo === "bolsonaro" &&
          (item.valor !== null || item.ultimoDado)
      ),
    },
    {
      id: "lula",
      nome: "Lula",
      periodo: "2023–2026",
      itens: anos.filter(
        (item) =>
          item.governo === "lula" &&
          (item.valor !== null || item.ultimoDado)
      ),
    },
  ];

  return (
    <div className="mt-7 space-y-4">
      {grupos.map((grupo) => (
        <div key={grupo.id} className="rounded-2xl bg-[#f4f4ef] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{grupo.nome}</p>

            <p className="text-xs text-black/40">{grupo.periodo}</p>
          </div>

          <div
            className="mt-5 grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${grupo.itens.length}, minmax(0, 1fr))`,
            }}
          >
            {grupo.itens.map((item) => {
              const parcial =
                item.valor === null && item.ultimoDado != null;

              const valorParcial =
                item.ultimoDado?.valor ??
                item.ultimoDado?.valorMesmoTrimestreAnoAnterior;

              const valorExibido = parcial
                ? valorParcial
                : item.valor;

              return (
                <div key={item.ano}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                      {item.ano}
                    </p>

                    {parcial ? (
                      <span className="rounded-full border border-black/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-black/45">
                        parcial
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {valorExibido != null
                      ? `${mostrarSinalPositivo && valorExibido > 0 ? "+" : ""}${formato === "moeda" ? brl(valorExibido) : pct(valorExibido)}`
                      : "—"}
                  </p>

                  {parcial && item.ultimoDado ? (
                    <p className="mt-2 max-w-[145px] text-[11px] leading-4 text-black/45">
                      até {formatarPeriodo(item.ultimoDado.periodo)}
                    </p>
                  ) : item.contexto ? (
                    <p className="mt-2 text-[11px] leading-4 text-black/40">
                      {item.contexto}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
export function EconomicIndicators() {

  return (
    <section className="mt-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/40">
          Comparação
        </p>

        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Os dados
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
          As séries anuais mostram a evolução dos indicadores ao longo
          de cada governo. Dados de 2026 aparecem separadamente porque
          o ano ainda está em andamento.
        </p>
      </div>

      <div className="space-y-5">
        {/* PIB */}
        <article className="rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Economia
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Crescimento real do PIB
              </h3>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <YearSeries anos={pib.anos} mostrarSinalPositivo />

          <div className="mt-6 rounded-2xl border border-black/8 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Comparação de mesma duração
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Crescimento acumulado nos primeiros três anos completos
              de cada governo.
            </p>

            <div className="mt-5 grid gap-5" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>
                <p className="mt-1 text-4xl font-semibold tracking-[-0.04em]">
                  +{pct(pib.comparacaoMesmaDuracao.bolsonaro.valor)}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>
                <p className="mt-1 text-4xl font-semibold tracking-[-0.04em]">
                  +{pct(pib.comparacaoMesmaDuracao.lula.valor)}
                </p>
              </div>
            </div>
          </div>

          <details className="mt-3 rounded-2xl bg-[#f4f4ef] px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Ver acumulado de todo o período disponível
            </summary>

            <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-black/40">
                  Bolsonaro · 2019–2022 · 4 anos
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  +{pct(pib.acumulados.bolsonaro.valor)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-black/40">
                  Lula · 2023–2025 · 3 anos
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  +{pct(pib.acumulados.lula.valor)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-black/45">
              Os períodos acima têm durações diferentes. Por isso, eles
              aparecem apenas como informação complementar.
            </p>
          </details>
        </article>

        {/* IPCA */}
        <article className="rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Preços
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Inflação — IPCA
              </h3>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <YearSeries anos={ipca.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    ipca.comparacaoMesmaDuracao.bolsonaro
                      .inflacaoAcumulada,
                    2
                  )}
                </p>
                <p className="text-xs text-black/40">
                  inflação acumulada
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    ipca.comparacaoMesmaDuracao.lula
                      .inflacaoAcumulada,
                    2
                  )}
                </p>
                <p className="text-xs text-black/40">
                  inflação acumulada
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* DESEMPREGO */}
        <article className="rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Trabalho
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Taxa de desocupação
              </h3>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <YearSeries anos={desemprego.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    desemprego.comparacaoMesmaDuracao.bolsonaro
                      .mediaAnual,
                    2
                  )}
                </p>
                <p className="text-xs text-black/40">
                  média da taxa anual
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    desemprego.comparacaoMesmaDuracao.lula.mediaAnual,
                    2
                  )}
                </p>
                <p className="text-xs text-black/40">
                  média da taxa anual
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* RENDA REAL */}
        <article className="rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Renda
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Renda real do trabalho
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Rendimento médio mensal real efetivamente recebido
                em todos os trabalhos. Os valores já descontam o
                efeito da inflação.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <YearSeries anos={renda.anos} formato="moeda" />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Média do rendimento real nos primeiros três anos
              completos de cada governo.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {brl(
                    renda.comparacaoMesmaDuracao.bolsonaro
                      .mediaDoPeriodo
                  )}
                </p>

                <p className="text-xs text-black/40">
                  média do período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {brl(
                    renda.comparacaoMesmaDuracao.lula
                      .mediaDoPeriodo
                  )}
                </p>

                <p className="text-xs text-black/40">
                  média do período
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-black/8 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                Variação real no período
              </p>

              <p className="mt-2 text-sm leading-6 text-black/50">
                Mudança entre o primeiro e o terceiro ano completo
                de cada período.
              </p>

              <div
                className="mt-4 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <div>
                  <p className="text-sm text-black/45">
                    Bolsonaro · 2019–2021
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {pct(
                      renda.comparacaoMesmaDuracao.bolsonaro
                        .variacaoNoPeriodo
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-black/45">
                    Lula · 2023–2025
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    +{pct(
                      renda.comparacaoMesmaDuracao.lula
                        .variacaoNoPeriodo
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* POBREZA */}
        <article className="rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Condição social
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                População abaixo da linha de pobreza
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Proporção da população com rendimento domiciliar
                per capita abaixo da linha de pobreza de US$ 6,85 PPC
                por dia, utilizada pelo IBGE com base nos parâmetros
                do Banco Mundial.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {pobreza.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>

                      {"contexto" in item && item.contexto ? (
                        <p className="mt-2 text-[11px] leading-4 text-black/40">
                          {item.contexto}
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2024</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {pobreza.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Último dado disponível
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A série anual publicada pelo IBGE utilizada neste painel
              chega até <strong>{pobreza.ultimoAnoDisponivel}</strong>.
              Por isso, não apresentamos 2025 ou 2026 nem fazemos uma
              comparação de mesma duração entre os governos.
            </p>
          </div>
        </article>
      </div>


        {/* EXTREMA POBREZA */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Condição social
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                População em extrema pobreza
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Proporção da população com rendimento domiciliar
                per capita abaixo da linha de extrema pobreza de
                US$ 2,15 PPC por dia, utilizada pelo IBGE com base
                nos parâmetros do Banco Mundial.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {extremaPobreza.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>

                      {"contexto" in item && item.contexto ? (
                        <p className="mt-2 text-[11px] leading-4 text-black/40">
                          {item.contexto}
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2024</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {extremaPobreza.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Último dado disponível
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A série anual utilizada neste painel chega até
              <strong> {extremaPobreza.ultimoAnoDisponivel}</strong>.
              Por isso, não apresentamos 2025 ou 2026 nem fazemos
              uma comparação de mesma duração entre os governos.
            </p>
          </div>
        </article>

        {/* INVESTIMENTO */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Investimento
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Taxa de investimento
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Formação Bruta de Capital Fixo como proporção do PIB.
                O indicador ajuda a mostrar quanto da economia é
                direcionado à ampliação da capacidade produtiva.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {investimento.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>

                      {"contexto" in item && item.contexto ? (
                        <p className="mt-2 text-[11px] leading-4 text-black/40">
                          {item.contexto}
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2025</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                }}
              >
                {investimento.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Média da taxa de investimento nos primeiros três anos
              completos de cada governo.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    investimento.comparacaoMesmaDuracao.bolsonaro.media
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    investimento.comparacaoMesmaDuracao.lula.media
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Dados disponíveis até 2025
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A série anual utilizada neste painel chega até
              <strong> {investimento.ultimoAnoDisponivel}</strong>.
            </p>
          </div>
        </article>

        {/* DIVIDA */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Contas públicas
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Dívida Bruta do Governo Geral
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Dívida Bruta do Governo Geral como proporção do PIB.
                Para anos fechados, mostramos a posição de dezembro.
                Em 2026, mostramos o último mês oficial disponível.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: Banco Central
            </span>
          </div>

          <YearSeries anos={divida.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Variação da dívida em pontos percentuais do PIB entre
              o primeiro e o terceiro ano completo de cada governo.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  +{divida.comparacaoMesmaDuracao.bolsonaro.variacaoPontosPercentuais
  .toFixed(2)
  .replace(".", ",")} p.p.
                </p>


              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  +{divida.comparacaoMesmaDuracao.lula.variacaoPontosPercentuais
  .toFixed(2)
  .replace(".", ",")} p.p.
                </p>


              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Dívida maior ou menor, isoladamente, não determina se um
              governo teve desempenho melhor ou pior. O indicador deve
              ser analisado junto com juros, resultado fiscal, crescimento
              econômico e composição da dívida.
            </p>
          </div>
        </article>

        {/* RESULTADO PRIMARIO */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Contas públicas
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Resultado primário do setor público
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Saldo primário do setor público consolidado, acumulado
                em 12 meses, como proporção do PIB. Neste painel,
                valores positivos representam superávit e valores
                negativos representam déficit.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: Banco Central
            </span>
          </div>

          <YearSeries
            anos={resultadoPrimario.anos}
            mostrarSinalPositivo
          />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Média do saldo primário nos primeiros três anos completos
              de cada governo. Valores negativos indicam saldo primário deficitário.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    resultadoPrimario.comparacaoMesmaDuracao
                      .bolsonaro.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  saldo primário médio
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    resultadoPrimario.comparacaoMesmaDuracao
                      .lula.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  saldo primário médio
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              O resultado primário mede receitas menos despesas antes
              dos juros da dívida. Superávit e déficit devem ser lidos
              junto com ciclo econômico, despesas extraordinárias,
              crescimento, juros e dívida pública.
            </p>
          </div>
        </article>

        {/* JUROS NOMINAIS */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Contas públicas
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Juros nominais do setor público
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Juros nominais do setor público consolidado, acumulados
                em 12 meses, como proporção do PIB. Para anos fechados,
                mostramos dezembro. Em 2026, mostramos o último mês
                oficial disponível.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: Banco Central
            </span>
          </div>

          <YearSeries anos={juros.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Média dos juros nominais acumulados em 12 meses nos
              primeiros três anos completos de cada governo.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    juros.comparacaoMesmaDuracao.bolsonaro.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média do período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    juros.comparacaoMesmaDuracao.lula.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média do período
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              O gasto com juros depende do nível da dívida, das taxas
              de juros, da inflação e da composição dos títulos públicos.
              Por isso, este indicador deve ser analisado junto com
              dívida pública, resultado primário e política monetária.
            </p>
          </div>
        </article>

        {/* CARGA TRIBUTARIA */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Tributação
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Carga tributária
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Total da receita tributária como proporção do PIB,
                conforme a série histórica consolidada publicada
                pela Receita Federal.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: Receita Federal
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {cargaTributaria.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor, 2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2024</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {cargaTributaria.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor, 2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Períodos disponíveis
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A publicação utilizada chega até
              <strong> {cargaTributaria.ultimoAnoDisponivel}</strong>.
              Por isso, ainda não há três anos completos do governo Lula
              nesta mesma série para uma comparação de mesma duração.
            </p>


          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Carga tributária mede a arrecadação em relação ao tamanho
              da economia. Um valor maior ou menor, isoladamente, não
              informa quem suporta os tributos nem como os recursos são
              distribuídos ou utilizados.
            </p>
          </div>
        </article>

        {/* DESPESA PRIMARIA */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Contas públicas
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Despesa primária do Governo Central
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Despesa primária total do Governo Central, apurada
                pelo critério de valor pago, como proporção do PIB.
                A série é publicada pelo Tesouro Nacional.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: Tesouro Nacional
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {despesaPrimaria.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor, 2)}
                      </p>

                      {item.ano === 2020 ? (
                        <p className="mt-2 text-[11px] leading-4 text-black/40">
                          Pandemia de COVID-19
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2025</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                }}
              >
                {despesaPrimaria.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor, 2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Primeiros três anos completos
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Média da despesa primária como proporção do PIB nos
              primeiros três anos completos de cada governo.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2021
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    despesaPrimaria.comparacaoMesmaDuracao
                      .bolsonaro.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média do período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    despesaPrimaria.comparacaoMesmaDuracao
                      .lula.media,
                    2
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média do período
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Despesa primária maior ou menor não indica, isoladamente,
              melhor ou pior gestão. O indicador deve ser lido junto com
              composição do gasto, políticas públicas, arrecadação,
              resultado fiscal e contexto econômico. O valor de 2020 foi
              fortemente afetado pelas despesas extraordinárias da pandemia.
            </p>
          </div>
        </article>

        {/* ANALFABETISMO */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Educação
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Taxa de analfabetismo
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Taxa de analfabetismo das pessoas de 15 anos ou mais no Brasil, segundo a PNAD Contínua Educação do IBGE.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                    2019
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {pct(
                      analfabetismo.anos.find(
                        (item) => item.ano === 2019
                      )?.valor
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                    2020
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black/25">
                    —
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-black/40">
                    sem dado
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                    2021
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black/25">
                    —
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-black/40">
                    sem dado
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                    2022
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {pct(
                      analfabetismo.anos.find(
                        (item) => item.ano === 2022
                      )?.valor
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2025</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                }}
              >
                {analfabetismo.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {pct(item.valor)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Evolução entre dados disponíveis
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Mudança entre o primeiro e o último dado disponível de
              cada período. A série não possui observações para 2020
              e 2021.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {analfabetismo.evolucaoDadosDisponiveis
                    .bolsonaro.variacaoPontosPercentuais
                    .toFixed(1)
                    .replace(".", ",")} p.p.
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2025
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {analfabetismo.evolucaoDadosDisponiveis
                    .lula.variacaoPontosPercentuais
                    .toFixed(1)
                    .replace(".", ",")} p.p.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Como interpretar
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A taxa de analfabetismo muda lentamente e reflete fatores
              acumulados ao longo de muitos anos. Por isso, não deve ser
              atribuída isoladamente a um único governo. A ausência de
              dados em 2020 e 2021 também impede uma comparação anual
              completa entre os períodos.
            </p>
          </div>
        </article>

        {/* MORTALIDADE INFANTIL */}
        <article className="mt-5 rounded-[30px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                Saúde
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Mortalidade infantil
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                Probabilidade de morte entre o nascimento e a idade
                exata de 1 ano, por mil, segundo as Tábuas Completas
                de Mortalidade do IBGE.
              </p>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Bolsonaro</p>
                <p className="text-xs text-black/40">2019–2022</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                }}
              >
                {mortalidadeInfantil.anos
                  .filter((item) => item.governo === "bolsonaro")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {item.valor
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>

                      <p className="mt-1 text-[11px] text-black/40">
                        por mil
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f4f4ef] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">Lula</p>
                <p className="text-xs text-black/40">2023–2024</p>
              </div>

              <div
                className="mt-5 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {mortalidadeInfantil.anos
                  .filter((item) => item.governo === "lula")
                  .map((item) => (
                    <div key={item.ano}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                        {item.ano}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {item.valor
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>

                      <p className="mt-1 text-[11px] text-black/40">
                        por mil
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Evolução entre dados disponíveis
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Mudança entre o primeiro e o último ano disponível
              de cada período. Os períodos têm durações diferentes
              e não devem ser tratados como uma comparação equivalente.
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  +{mortalidadeInfantil.evolucaoDadosDisponiveis
                    .bolsonaro.variacaoPorMil
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  por mil
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2024
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {mortalidadeInfantil.evolucaoDadosDisponiveis
                    .lula.variacaoPorMil
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  por mil
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Dados disponíveis até 2024
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              A série utilizada neste painel chega até
              <strong> {mortalidadeInfantil.ultimoAnoDisponivel}</strong>.
              A mortalidade infantil pode ser influenciada por fatores
              demográficos, sociais, econômicos e pelas condições de saúde.
              Por isso, o indicador deve ser analisado em conjunto com outros
              dados e considerando o período disponível.
            </p>
          </div>
        </article>
      <div className="mt-6 rounded-[28px] border border-black/10 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
          Importante
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
          O que esses números não dizem
        </h3>

        <p className="mt-4 max-w-2xl leading-7 text-black/60">
          Um resultado observado durante determinado governo não prova,
          por si só, que tenha sido causado exclusivamente por ele.
          Economia também é afetada por decisões anteriores, Congresso,
          Banco Central, cenário internacional, crises e outros fatores.
        </p>
      </div>
    </section>
  );
}
