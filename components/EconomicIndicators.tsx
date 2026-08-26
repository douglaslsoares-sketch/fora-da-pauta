import type { ReactNode } from "react";
import pib from "@/data/economia/gerado/pib.json";
import ipca from "@/data/economia/gerado/ipca.json";
import ipcaSetores from "@/data/economia/gerado/ipca-setores.json";
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

function EmPortuguesSimples({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-[#f4f4ef] px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/35">
        Em português simples
      </p>

      <p className="mt-2 text-sm leading-6 text-black/60">
        {children}
      </p>
    </div>
  );
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
                <div
                  key={item.ano}
                  className="min-h-[108px]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">
                    {item.ano}
                  </p>

                  <p className="mt-2 text-2xl font-semibold leading-none tracking-[-0.04em]">
                    {valorExibido != null
                      ? `${mostrarSinalPositivo && valorExibido > 0 ? "+" : ""}${formato === "moeda" ? brl(valorExibido) : pct(valorExibido)}`
                      : "—"}
                  </p>

                  <div className="mt-2 min-h-[32px]">
                    {parcial && item.ultimoDado ? (
                      <p className="max-w-[145px] text-[11px] leading-4 text-black/45">
                        até {formatarPeriodo(item.ultimoDado.periodo)}
                      </p>
                    ) : item.contexto ? (
                      <p className="text-[11px] leading-4 text-black/40">
                        {item.contexto}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

type ItemComparavel = {
  ano: number;
  valor: number | null;
  ultimoDado?: {
    valor?: number;
  } | null;
};

function valorDoPeriodo(
  anos: ItemComparavel[],
  ano: number,
) {
  const item = anos.find(
    (registro) => registro.ano === ano,
  );

  return (
    item?.valor ??
    item?.ultimoDado?.valor ??
    null
  );
}

function mediaDoPeriodoDisponivel(
  anos: ItemComparavel[],
  anosDesejados: number[],
) {
  const valores = anosDesejados.map(
    (ano) => valorDoPeriodo(anos, ano),
  );

  if (
    valores.some(
      (valor) => valor === null,
    )
  ) {
    return null;
  }

  return (
    (valores as number[]).reduce(
      (total, valor) => total + valor,
      0,
    ) / valores.length
  );
}

function variacaoEmPontosPercentuais(
  anos: ItemComparavel[],
  anoInicial: number,
  anoFinal: number,
) {
  const inicio =
    valorDoPeriodo(anos, anoInicial);

  const fim =
    valorDoPeriodo(anos, anoFinal);

  if (
    inicio === null ||
    fim === null
  ) {
    return null;
  }

  return fim - inicio;
}

function pp(
  valor: number | null,
  casas = 2,
) {
  if (valor === null) {
    return "—";
  }

  const sinal =
    valor > 0 ? "+" : "";

  return `${sinal}${valor
    .toFixed(casas)
    .replace(".", ",")} p.p.`;
}


function pctDisponivel(
  valor: number | null,
  casas = 2,
) {
  if (valor === null) {
    return "?";
  }

  return `${valor
    .toFixed(casas)
    .replace(".", ",")}%`;
}



function acumularPercentuais(
  valores: number[],
) {
  return (
    valores.reduce(
      (fator, valor) =>
        fator * (1 + valor / 100),
      1,
    ) - 1
  ) * 100;
}


export function EconomicIndicators() {
  const pib2026 = pib.anos.find(
    (item) => item.ano === 2026,
  );

  const ipca2026 = ipca.anos.find(
    (item) => item.ano === 2026,
  );



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

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Crescimento acumulado no período
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
                  +{pct(
                    pib.acumulados.bolsonaro.valor,
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  acumulado nos quatro anos
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2026
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  +{pct(
                    pib.acumulados.lula.valor,
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  acumulado dos anos fechados até 2025
                </p>

                {pib2026?.ultimoDado ? (
                  <p className="mt-1 text-xs leading-4 text-black/40">
                    1º trimestre de 2026: +
                    {pct(
                      pib2026.ultimoDado
                        .valorMesmoTrimestreAnoAnterior,
                      1,
                    )}{" "}
                    sobre o 1º trimestre de 2025
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              O crescimento acumulado mostra quanto a economia aumentou
              ou diminuiu ao longo dos anos fechados. Em 2026 ainda não
              existe resultado anual. Por isso, o dado do 1º trimestre
              aparece separadamente e não é somado ao acumulado de
              2023 a 2025.
            </p>
          </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Inflação acumulada no período
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
                  {pct(
                    ipca.resumos.bolsonaro
                      .inflacaoAcumulada,
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  acumulado no período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2026
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    acumularPercentuais([
                      ipca.resumos.lula
                        .inflacaoAcumulada,
                      ipca2026?.ultimoDado?.valor ?? 0,
                    ]),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  acumulado até julho de 2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Inflação acumulada mostra quanto os preços subiram
              ao longo de todo o período. Não é uma média das
              taxas anuais. No período de Lula, o cálculo inclui
              2023, 2024, 2025 e a inflação acumulada de janeiro
              a julho de 2026.
            </p>
          </div>

<div className="mt-6 rounded-2xl border border-black/8 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Inflação por grupos do IPCA
            </p>

            <p className="mt-2 text-sm leading-6 text-black/55">
              Variação acumulada nos primeiros três anos completos
              de cada governo. O peso mostra a participação atual de
              cada grupo no IPCA.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-black/8">
              <div
                className="grid items-end border-b border-black/8 bg-[#f6f6f1] px-4 py-3"
                style={{
                  gridTemplateColumns:
                    "minmax(0, 1.55fr) minmax(72px, 0.65fr) repeat(2, minmax(92px, 0.9fr))",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/40">
                  Grupo
                </p>

                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/40">
                    Quanto representa
                  </p>
                  <p className="mt-1 text-[10px] text-black/35">
                    no cálculo da inflação
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold">
              {"Acumulado de todo o per\u00edodo dispon\u00edvel"}
            </p>
                  <p className="mt-1 text-[10px] text-black/40">
                    2019–2021
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold">
                    Lula
                  </p>
                  <p className="mt-1 text-[10px] text-black/40">
                    2023–2025
                  </p>
                </div>
              </div>

              {ipcaSetores.grupos.map((grupo, index) => (
                <div
                  key={grupo.codigo}
                  className={`grid items-center px-4 py-3 ${
                    index < ipcaSetores.grupos.length - 1
                      ? "border-b border-black/8"
                      : ""
                  }`}
                  style={{
                    gridTemplateColumns:
                      "minmax(0, 1.55fr) minmax(72px, 0.65fr) repeat(2, minmax(92px, 0.9fr))",
                  }}
                >
                  <p className="pr-4 text-sm font-medium leading-5">
                    {grupo.nome}
                  </p>

                  <p className="text-center text-sm font-semibold text-black/55">
                    {pct(grupo.pesoAtual, 2)}
                  </p>

                  <p className="text-center text-lg font-semibold">
                    {pct(
                      grupo.comparacaoMesmaDuracao.bolsonaro.valor,
                      2
                    )}
                  </p>

                  <p className="text-center text-lg font-semibold">
                    {pct(
                      grupo.comparacaoMesmaDuracao.lula.valor,
                      2
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-xs leading-5 text-black/45">
              <p>
                <strong>
                  {"Quanto representa no c\u00e1lculo da infla\u00e7\u00e3o:"}
                </strong>{" "}
                {"nem todos os tipos de gasto t\u00eam a mesma import\u00e2ncia no c\u00e1lculo da infla\u00e7\u00e3o. Quanto maior esse percentual, maior pode ser a influ\u00eancia das mudan\u00e7as de pre\u00e7o daquele grupo sobre a infla\u00e7\u00e3o geral."}
              </p>

              <p>
                <strong>
                  {"Como ler Bolsonaro e Lula:"}
                </strong>{" "}
                {"esses percentuais mostram quanto aumentaram, no per\u00edodo indicado, os pre\u00e7os dos produtos e servi\u00e7os que fazem parte de cada grupo. Por exemplo, 12% em Alimenta\u00e7\u00e3o e bebidas significa que os pre\u00e7os desse grupo, considerados em conjunto, subiram 12% no per\u00edodo. Isso n\u00e3o significa que Alimenta\u00e7\u00e3o tenha sido respons\u00e1vel por 12% da infla\u00e7\u00e3o total."}
              </p>

              <p>
                <strong>
                  {"Na pr\u00e1tica:"}
                </strong>{" "}
                {"cada pessoa sente a infla\u00e7\u00e3o de um jeito. Quanto mais voc\u00ea gasta com um determinado grupo, mais a alta dos pre\u00e7os desse grupo pesa no seu bolso."}
              </p>

              <p>
                {"\u201cAlimenta\u00e7\u00e3o e bebidas\u201d \u00e9 o grupo oficial amplo do IPCA. Outros recortes chamados genericamente de \u201cinfla\u00e7\u00e3o dos alimentos\u201d podem apresentar resultados diferentes."}
              </p>
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
                Taxa de desemprego
              </h3>
            </div>

            <span className="rounded-full bg-[#efefe9] px-4 py-2 text-xs font-semibold">
              Fonte: IBGE
            </span>
          </div>

          <YearSeries anos={desemprego.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              {"M\u00e9dia de desemprego no per\u00edodo"}
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  {"Bolsonaro \u00b7 2019\u20132022"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    desemprego.comparacaoPeriodoDisponivel
                      .bolsonaro.media,
                    2
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia no per\u00edodo"}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  {"Lula \u00b7 2023\u20132026"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    desemprego.comparacaoPeriodoDisponivel
                      .lula.media,
                    2
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia at\u00e9 o 2\u00ba trimestre de 2026"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              A taxa de desemprego mostra a parcela das pessoas que procuram
              trabalho e não conseguem uma ocupação. Quanto menor o percentual,
              menor é essa parcela. O valor de Lula considera os dados disponíveis
              até o 2º trimestre de 2026.
            </p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              {"M\u00e9dia da renda real no per\u00edodo"}
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  {"Bolsonaro \u00b7 2019\u20132022"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {brl(
                    renda.comparacaoPeriodoDisponivel
                      .bolsonaro.mediaDoPeriodo
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia no per\u00edodo"}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  {"Lula \u00b7 2023\u20132026"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {brl(
                    renda.comparacaoPeriodoDisponivel
                      .lula.mediaDoPeriodo
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia at\u00e9 o 2\u00ba trimestre de 2026"}
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-black/8 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                Variação real no período
              </p>

              <p className="mt-2 text-sm leading-6 text-black/50">
                Mudança entre o início do período e o dado mais recente disponível.
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

                  <p className="mt-1 text-2xl font-semibold">
                    {pct(
                      renda.comparacaoPeriodoDisponivel
                        .bolsonaro.variacaoNoPeriodo
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-black/45">
                    Lula · 2023–2026
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    +{pct(
                      renda.comparacaoPeriodoDisponivel
                        .lula.variacaoNoPeriodo
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              A renda real já desconta a inflação. Assim, ela ajuda a mostrar
              quanto o trabalhador consegue comprar com o que recebe. Na variação
              do período, valor negativo indica perda real de renda e valor positivo
              indica ganho real. O dado de Lula vai até o 2º trimestre de 2026.
            </p>
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
              Evolução no período com dados
            </p>

            <div
              className="mt-4 grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      pobreza.anos,
                      2019,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      pobreza.anos,
                      2022,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      pobreza.anos,
                      2019,
                      2022,
                    ),
                    1,
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–{pobreza.ultimoAnoDisponivel}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      pobreza.anos,
                      2023,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      pobreza.anos,
                      pobreza.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      pobreza.anos,
                      2023,
                      pobreza.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  dados disponíveis até {pobreza.ultimoAnoDisponivel}
                </p>
              </div>
            </div>

            <p className="mt-5 border-t border-black/8 pt-4 text-xs leading-5 text-black/45">
              Os períodos acima têm durações diferentes.
              Por isso, a variação deve ser lida como a evolução
              observada dentro de cada período disponível, e não
              como uma comparação de mandatos completos.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Quanto menor o percentual, menor a parcela da população
              abaixo da linha de pobreza. A taxa caiu de 32,6% para
              31,6% entre 2019 e 2022 e de 27,3% para 23,1% entre
              2023 e 2024. Ainda não há neste painel dados oficiais
              de 2025 e 2026 para completar o segundo período.
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
              Evolução no período com dados
            </p>

            <div
              className="mt-4 grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      extremaPobreza.anos,
                      2019,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      extremaPobreza.anos,
                      2022,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      extremaPobreza.anos,
                      2019,
                      2022,
                    ),
                    1,
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–{extremaPobreza.ultimoAnoDisponivel}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      extremaPobreza.anos,
                      2023,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      extremaPobreza.anos,
                      extremaPobreza.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      extremaPobreza.anos,
                      2023,
                      extremaPobreza.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  dados disponíveis até {extremaPobreza.ultimoAnoDisponivel}
                </p>
              </div>
            </div>

            <p className="mt-5 border-t border-black/8 pt-4 text-xs leading-5 text-black/45">
              Os períodos acima têm durações diferentes.
              Por isso, a variação deve ser lida como a evolução
              observada dentro de cada período disponível, e não
              como uma comparação de mandatos completos.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Quanto menor o percentual, menor a parcela da população
              em extrema pobreza. A taxa caiu de 7,4% para 5,9% entre
              2019 e 2022 e de 4,4% para 3,5% entre 2023 e 2024.
              Ainda não há neste painel dados oficiais de 2025 e 2026
              para completar o segundo período.
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

          <EmPortuguesSimples>
            Mede quanto da economia é destinado a investimentos como
            máquinas, equipamentos e construções que ajudam a manter
            ou ampliar a capacidade de produção do país.
          </EmPortuguesSimples>

          <YearSeries anos={investimento.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              {"M\u00e9dia da taxa de investimento no per\u00edodo"}
            </p>

            <div
              className="mt-4 grid gap-4"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  {"Bolsonaro \u00b7 2019\u20132022"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    investimento.comparacaoPeriodoDisponivel
                      .bolsonaro.media
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia no per\u00edodo"}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  {"Lula \u00b7 2023\u20132026"}
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pct(
                    investimento.comparacaoPeriodoDisponivel
                      .lula.media
                  )}
                </p>

                <p className="text-xs text-black/40">
                  {"m\u00e9dia at\u00e9 o 1\u00ba trimestre de 2026"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              A taxa de investimento mostra quanto da economia é destinado a
              ampliar a capacidade de produção do país, como máquinas, equipamentos
              e construções. Neste comparativo, as médias dos dois períodos estão
              muito próximas. O dado de Lula vai até o 1º trimestre de 2026.
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

          <EmPortuguesSimples>
            Compara o tamanho da dívida pública com o tamanho da economia.
            Por exemplo, uma dívida de 80% do PIB significa que a dívida
            equivale a cerca de 80% do valor produzido pela economia em um ano.
          </EmPortuguesSimples>

          <YearSeries anos={divida.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Variação da dívida no período
            </p>

            <p className="mt-2 text-sm leading-6 text-black/50">
              Mudança da dívida bruta em relação ao PIB entre o início
              e o dado final disponível de cada período.
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
                  {pp(
                    variacaoEmPontosPercentuais(
                      divida.anos,
                      2019,
                      2022,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  2019 até dezembro de 2022
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2026
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      divida.anos,
                      2023,
                      2026,
                    ),
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  até 01/06/2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Aqui vemos quanto a dívida aumentou ou diminuiu em relação
              ao tamanho da economia durante cada período. Número positivo
              significa aumento e número negativo significa redução.
              A dívida também deve ser analisada junto com crescimento,
              juros e resultado das contas públicas.
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

          <EmPortuguesSimples>
            É o saldo entre receitas e despesas do setor público antes
            dos juros da dívida. Número positivo indica superávit;
            número negativo indica déficit.
          </EmPortuguesSimples>

          <YearSeries
            anos={resultadoPrimario.anos}
            mostrarSinalPositivo
          />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Média do resultado primário no período
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
                  {pctDisponivel(
                    mediaDoPeriodoDisponivel(
                      resultadoPrimario.anos,
                      [2019, 2020, 2021, 2022],
                    ),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média no período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2026
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pctDisponivel(
                    mediaDoPeriodoDisponivel(
                      resultadoPrimario.anos,
                      [2023, 2024, 2025, 2026],
                    ),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média até 01/06/2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              O resultado primário é a diferença entre o que o setor
              público arrecada e o que gasta antes dos juros da dívida.
              Valor positivo indica superávit e valor negativo indica
              déficit. O cálculo de Lula considera o dado disponível
              até junho de 2026.
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

          <EmPortuguesSimples>
            Mostra quanto o setor público gasta com juros da dívida
            em relação ao tamanho da economia.
          </EmPortuguesSimples>

          <YearSeries anos={juros.anos} />

          <div className="mt-6 rounded-2xl border border-black/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Média dos juros no período
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
                  {pctDisponivel(
                    mediaDoPeriodoDisponivel(
                      juros.anos,
                      [2019, 2020, 2021, 2022],
                    ),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média no período
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–2026
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {pctDisponivel(
                    mediaDoPeriodoDisponivel(
                      juros.anos,
                      [2023, 2024, 2025, 2026],
                    ),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs text-black/40">
                  média até 01/06/2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Este indicador mostra quanto o setor público gasta com
              juros em relação ao tamanho da economia. Quanto maior o
              percentual, maior é o peso dos juros nas contas públicas.
              O cálculo de Lula considera o dado disponível até junho
              de 2026.
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

          <EmPortuguesSimples>
            Mostra quanto o governo arrecada em tributos em comparação
            com o tamanho da economia brasileira.
          </EmPortuguesSimples>

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
              Evolução no período com dados
            </p>

            <div
              className="mt-4 grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      cargaTributaria.anos,
                      2019,
                    ),
                    2,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      cargaTributaria.anos,
                      2022,
                    ),
                    2,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      cargaTributaria.anos,
                      2019,
                      2022,
                    ),
                    2,
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–{cargaTributaria.ultimoAnoDisponivel}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      cargaTributaria.anos,
                      2023,
                    ),
                    2,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      cargaTributaria.anos,
                      cargaTributaria.ultimoAnoDisponivel,
                    ),
                    2,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      cargaTributaria.anos,
                      2023,
                      cargaTributaria.ultimoAnoDisponivel,
                    ),
                    2,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  dados disponíveis até{" "}
                  {cargaTributaria.ultimoAnoDisponivel}
                </p>
              </div>
            </div>

            <p className="mt-5 border-t border-black/8 pt-4 text-xs leading-5 text-black/45">
              Os períodos acima têm durações diferentes.
              Por isso, os valores mostram a evolução observada
              dentro de cada período disponível, e não uma
              comparação de dois mandatos completos.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              A carga tributária mostra quanto a arrecadação de
              tributos representa em relação ao tamanho da economia.
              Isso não significa que cada pessoa paga esse mesmo
              percentual da renda. O indicador, sozinho, também não
              mostra quem paga mais impostos nem como o dinheiro
              arrecadado é utilizado.
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

          <EmPortuguesSimples>
            Mostra quanto o Governo Central gasta, sem contar os juros
            da dívida, em relação ao tamanho da economia.
          </EmPortuguesSimples>

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
              Média da despesa primária · mesma duração
            </p>

            <p className="mt-2 text-xs leading-5 text-black/45">
              Primeiros três anos completos de cada governo.
            </p>

            <div
              className="mt-4 grid gap-5"
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
                    2,
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
                    2,
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
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Despesa primária é o gasto do Governo Central sem
              contar os juros da dívida. Um percentual maior significa
              que esse gasto representou uma parcela maior do PIB,
              mas isso sozinho não diz se a gestão foi melhor ou pior.
              Também importa saber em que o dinheiro foi gasto.
              Em 2020, as despesas extraordinárias da pandemia tiveram
              forte efeito sobre o indicador.
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
              Evolução no período com dados
            </p>

            <div
              className="mt-4 grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      analfabetismo.anos,
                      2019,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      analfabetismo.anos,
                      2022,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      analfabetismo.anos,
                      2019,
                      2022,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  sem observações anuais em 2020 e 2021
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–{analfabetismo.ultimoAnoDisponivel}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {pct(
                    valorDoPeriodo(
                      analfabetismo.anos,
                      2023,
                    ),
                    1,
                  )}{" "}
                  →{" "}
                  {pct(
                    valorDoPeriodo(
                      analfabetismo.anos,
                      analfabetismo.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {pp(
                    variacaoEmPontosPercentuais(
                      analfabetismo.anos,
                      2023,
                      analfabetismo.ultimoAnoDisponivel,
                    ),
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  dados disponíveis até {analfabetismo.ultimoAnoDisponivel}
                </p>
              </div>
            </div>

            <p className="mt-5 border-t border-black/8 pt-4 text-xs leading-5 text-black/45">
              A série não possui observações para 2020 e 2021,
              e o segundo período ainda não inclui 2026. Por isso,
              a comparação mostra a evolução entre o primeiro
              e o último dado disponível de cada período, e não
              duas séries anuais completas.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Quanto menor a taxa, menor a parcela das pessoas de
              15 anos ou mais que não sabem ler e escrever.
              Esse indicador costuma mudar lentamente e reflete
              condições educacionais acumuladas ao longo de muitos
              anos, por isso não deve ser atribuído isoladamente
              a um único governo.
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
              Evolução no período com dados
            </p>

            <div
              className="mt-4 grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div>
                <p className="text-sm text-black/45">
                  Bolsonaro · 2019–2022
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {mortalidadeInfantil.anos
                    .find((item) => item.ano === 2019)
                    ?.valor.toFixed(2)
                    .replace(".", ",")}{" "}
                  →{" "}
                  {mortalidadeInfantil.anos
                    .find((item) => item.ano === 2022)
                    ?.valor.toFixed(2)
                    .replace(".", ",")}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {mortalidadeInfantil.evolucaoDadosDisponiveis
                    .bolsonaro.variacaoPorMil > 0
                    ? "+"
                    : ""}
                  {mortalidadeInfantil.evolucaoDadosDisponiveis
                    .bolsonaro.variacaoPorMil
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  por mil
                </p>
              </div>

              <div>
                <p className="text-sm text-black/45">
                  Lula · 2023–{mortalidadeInfantil.ultimoAnoDisponivel}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {mortalidadeInfantil.anos
                    .find((item) => item.ano === 2023)
                    ?.valor.toFixed(2)
                    .replace(".", ",")}{" "}
                  →{" "}
                  {mortalidadeInfantil.anos
                    .find(
                      (item) =>
                        item.ano ===
                        mortalidadeInfantil.ultimoAnoDisponivel,
                    )
                    ?.valor.toFixed(2)
                    .replace(".", ",")}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {mortalidadeInfantil.evolucaoDadosDisponiveis
                    .lula.variacaoPorMil > 0
                    ? "+"
                    : ""}
                  {mortalidadeInfantil.evolucaoDadosDisponiveis
                    .lula.variacaoPorMil
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  por mil
                </p>

                <p className="mt-1 text-xs leading-4 text-black/40">
                  dados disponíveis até{" "}
                  {mortalidadeInfantil.ultimoAnoDisponivel}
                </p>
              </div>
            </div>

            <p className="mt-5 border-t border-black/8 pt-4 text-xs leading-5 text-black/45">
              Os períodos acima têm durações diferentes.
              Por isso, a variação mostra a evolução observada
              dentro de cada período disponível e não deve ser
              tratada como uma comparação de dois mandatos completos.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-[#f4f4ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
              Na prática
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Quanto menor o indicador, menor a probabilidade de uma
              criança morrer antes de completar 1 ano de idade.
              A mortalidade infantil é influenciada por condições
              de saúde, saneamento, renda, alimentação e outros
              fatores sociais. Os dados do segundo período ainda chegam
              somente até {mortalidadeInfantil.ultimoAnoDisponivel}.
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
