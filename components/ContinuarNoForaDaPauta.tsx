import Link from "next/link";

import { InscricaoTelegramHome } from "@/components/InscricaoTelegramHome";
import { getPublishedEditions } from "@/data/edicoes-publicadas";

type Props = {
  edicaoAtual?: string;
};

/**
 * Bloco de descoberta para quem chega por um link encaminhado.
 * Nada aqui exige autenticação para ler e nenhuma identificação do remetente
 * é colocada nos endereços públicos.
 */
export function ContinuarNoForaDaPauta({ edicaoAtual }: Props) {
  const outrasEdicoes = getPublishedEditions()
    .filter((edicao) => edicao.slug !== edicaoAtual)
    .slice(0, 2);

  return (
    <section
      data-editorial-ignore
      aria-labelledby="continuar-entendendo-titulo"
      className="border-t border-black/15 py-10 sm:py-12"
    >
      <h2
        id="continuar-entendendo-titulo"
        className="text-2xl font-semibold tracking-[-0.035em] text-[#111111] sm:text-3xl"
      >
        Continue entendendo como o jogo é jogado
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-black/65 sm:text-base">
        Conheça outros assuntos explicados pelo Fora da Pauta, com documentos e fontes para conferir.
      </p>

      {outrasEdicoes.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {outrasEdicoes.map((edicao) => (
            <Link
              key={edicao.slug}
              href={`/campanhas/${edicao.slug}`}
              className="block border border-black/15 bg-white p-5 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <h3 className="text-lg font-semibold leading-6">{edicao.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{edicao.statement}</p>
              <span className="mt-4 inline-block text-sm font-semibold">
                Ler edição <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <Link
        href="/edicoes"
        className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-[#b88a00] decoration-2 underline-offset-4"
      >
        Ver todas as edições publicadas <span aria-hidden="true">→</span>
      </Link>

      <div className="mt-9 bg-[#111111] p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC400]">
          Do povo para o povo
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">
          Quer continuar acompanhando?
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
          Receba novas edições e acompanhe a atuação de pessoas públicas pelo mesmo Telegram, gratuitamente.
        </p>
        <div className="mt-5">
          <InscricaoTelegramHome className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#FFC400] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#e9b300] disabled:opacity-60" />
        </div>
        <p className="mt-4 text-xs leading-6 text-white/60">
          Você pode continuar lendo sem inscrição. Se já acompanha pelo Telegram, seus registros e escolhas são preservados.
        </p>
      </div>
    </section>
  );
}
