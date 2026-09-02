"use client";

import Image from "next/image";
import Link from "next/link";

import type { Campaign } from "@/data/campanhas";
import { ExpandableCard } from "@/components/ExpandableCard";
import { CampaignComparison } from "@/components/CampaignComparison";
import { ShareCard } from "@/components/ShareCard";
import { TelegramUpdatesCard } from "@/components/TelegramUpdatesCard";
import { CandidatesCard } from "@/components/CandidatesCard";
import { StoreCard } from "@/components/StoreCard";
import { EconomicIndicators } from "@/components/EconomicIndicators";

type CampaignPageProps = {
  campaign: Campaign;
};

export function CampaignPage({ campaign }: CampaignPageProps) {
  const ehEdicao01 =
    campaign.slug === "fim-escala-6x1";

  async function copiarLinkDaCampanha() {
    const url =
      "https://www.foradapauta.org/campanhas/fim-escala-6x1";

    await navigator.clipboard.writeText(url);
  }

  return (
    <main
      className="min-h-screen bg-[#eeeee9] text-[#151515]"
      data-share-statement={campaign.statement}
    >
      {/* CABEÃ‡ALHO EDITORIAL */}
      <section className="bg-black text-white">
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-8 lg:px-10">
          <header className="flex items-start justify-between gap-6">
            <Link
              href="/"
              aria-label="Voltar para a página inicial do Fora da Pauta"
              className="block"
            >
              <Image
                src="/marca/fora-da-pauta-branca.png"
                alt="Fora da Pauta"
                width={240}
                height={76}
                priority
                className="h-auto w-[150px] sm:w-[175px]"
              />
            </Link>

            <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45 sm:text-[11px]">
              {ehEdicao01 ? "Edição 01" : "Edição"}
            </p>
          </header>

          <div className="mt-16 border-t border-white/15 pt-5 sm:mt-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Tema desta edição
            </p>

            <h1 className="mt-5 max-w-4xl text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              {campaign.title}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl sm:leading-9">
              {campaign.statement}
            </p>
          </div>
        </div>
      </section>

      {/* CAPA DA EDIÃ‡ÃƒO 01 */}
      {ehEdicao01 ? (
        <section className="px-5 pt-8 sm:px-8 sm:pt-12 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="overflow-hidden bg-black">
              <Image
                src="/edicoes/edicao-01-6x1-nova-identidade.png"
                alt="Edição 01 — Fim da escala 6x1"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 1152px"
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* CONTEÃšDO */}
      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-10 border-t border-black/15 pt-5 sm:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              Entenda a edição
            </p>

            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
              Vá além da frase.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/55">
              Veja o que está sendo proposto, os argumentos do debate,
              as evidências disponíveis e em que ponto está a discussão.
            </p>
          </div>

          <div
            className="space-y-4"
            aria-label="Conteúdo da edição"
          >
            {campaign.comparison ? (
              <CampaignComparison comparison={campaign.comparison} />
            ) : null}

            {campaign.sections.map((section) => (
              <ExpandableCard
                key={section.title}
                {...section}
              />
            ))}

            {campaign.pautaId ? (
              <CandidatesCard
                href={`/campanhas/${campaign.slug}/candidatos`}
              />
            ) : null}

            {campaign.slug === "compare-os-dados" ? (
              <EconomicIndicators />
            ) : null}

            <TelegramUpdatesCard />

            <ShareCard statement={campaign.statement} />

      {ehEdicao01 ? (
        <section className="mt-8 border-t border-black/10 pt-8">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Compartilhe
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-4xl">
                Leve esta mensagem para as suas redes
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
                Escolha o formato mais adequado, baixe a imagem e publique junto
                com o link desta campanha.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titulo: "Instagram e Facebook",
                  descricao: "Post quadrado para feed.",
                  imagem:
                    "/edicoes/redes-sociais/edicao-01/edicao-01-6x1-feed-instagram-facebook.png",
                },
                {
                  titulo: "Status do WhatsApp",
                  descricao: "Formato vertical para Status.",
                  imagem:
                    "/edicoes/redes-sociais/edicao-01/edicao-01-6x1-status-whatsapp.png",
                },
                {
                  titulo: "Stories",
                  descricao: "Formato vertical para Stories.",
                  imagem:
                    "/edicoes/redes-sociais/edicao-01/edicao-01-story-6x1-informativo.png",
                },
                {
                  titulo: "Formato horizontal",
                  descricao: "Para publicações e compartilhamentos horizontais.",
                  imagem:
                    "/edicoes/redes-sociais/edicao-01/edicao-01-horizontal-6x1-informativo.png",
                },
              ].map((peca) => (
                <article
                  key={peca.imagem}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                >
                  <div className="flex min-h-[180px] items-center justify-center bg-black p-3">
                    <img
                      src={peca.imagem}
                      alt={peca.titulo}
                      className="max-h-[260px] w-auto max-w-full object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-black">
                      {peca.titulo}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-black/55">
                      {peca.descricao}
                    </p>

                    <div className="mt-4 flex flex-col gap-2">
                      <a
                        href={peca.imagem}
                        download
                        className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
                      >
                        Baixar imagem
                      </a>

                      <button
                        type="button"
                        onClick={copiarLinkDaCampanha}
                        className="inline-flex items-center justify-center rounded-full border border-black/15 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-black/5"
                      >
                        Copiar link
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

            <StoreCard storeUrl="https://montink.com/fora-da-pauta" />
          </div>
        </div>
      </section>


      {/* VOLTAR PARA TODAS AS EDIÇÕES */}
      <section className="border-t border-black/10 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold"
          >
            <span aria-hidden="true">←</span>
            Ver todas as edições
          </Link>
        </div>
      </section>

      {/* RODAPÃ‰ */}
      <footer className="bg-black px-5 py-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-8">
          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={240}
            height={76}
            className="h-auto w-[135px] sm:w-[155px]"
          />

          <p className="text-right text-[10px] uppercase tracking-[0.2em] text-white/35">
            Uma edição por vez.
            <br />
            Um tema por edição.
          </p>
        </div>
      </footer>

</main>
  );
}

