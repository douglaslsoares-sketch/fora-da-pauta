"use client";

import Link from "next/link";
import type { Campaign } from "@/data/campanhas";

function comNegrito(paragrafo: string) {
  return paragrafo.split(/(\*\*.*?\*\*)/g).map((trecho, indice) =>
    trecho.startsWith("**") && trecho.endsWith("**")
      ? <strong key={indice} className="font-semibold text-black">{trecho.slice(2, -2)}</strong>
      : trecho
  );
}

export function ArtigoSimples({ campaign }: { campaign: Campaign }) {
  const url = `https://www.foradapauta.org/campanhas/${campaign.slug}`;
  const mensagem = `Fora da Pauta — ${campaign.title}\n\n${campaign.statement}\n\n${url}`;
  const arteUrl = campaign.shareImage ?? "/opengraph-image.jpg";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  function ouvir() {
    const root = document.getElementById("texto-editorial-edicao");
    if (!root) return;
    window.dispatchEvent(new CustomEvent("fdp:audio-start", {
      detail: { rootSelector: "#texto-editorial-edicao", title: campaign.title },
    }));
  }


  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-12 text-black sm:px-8">
      <div className="mx-auto max-w-[740px]">
        <h1 className="text-[clamp(2rem,6vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.045em]">
          {campaign.title}
        </h1>
        <button type="button" onClick={ouvir} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-lg bg-[#FFD700] px-6 py-3 font-bold text-black">
          <span aria-hidden="true">▶</span> Ouvir este artigo
        </button>
        <article id="texto-editorial-edicao" aria-label="Texto do artigo" className="mt-10 space-y-9">
          {campaign.sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph, index) =>
                <p key={index} className="text-[17px] leading-8 text-black/80">{comNegrito(paragraph)}</p>
              )}
              {section.references?.length ? (
                <div className="space-y-2 border-l-2 border-black/15 pl-4">
                  <p className="text-sm font-semibold text-black/65">Fontes</p>
                  {section.references.map((ref) =>
                    <a key={ref.url} href={ref.url} rel="noopener noreferrer" target="_blank" className="block text-sm leading-6 text-black/70 underline underline-offset-4">
                      {ref.label} ↗
                    </a>
                  )}
                </div>
              ) : null}
            </section>
          ))}
        </article>

        <section aria-labelledby="compartilhar-artigo" className="mt-12 border-t border-black/15 pt-8">
          <h2 id="compartilhar-artigo" className="text-2xl font-bold tracking-tight">
            Compartilhe este artigo
          </h2>
          <p className="mt-2 text-base leading-7 text-black/65">
            Envie esta mensagem a alguém que também queira entender como o jogo é jogado.
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-black/15 bg-white">
            <img
              src={arteUrl}
              alt="Arte de compartilhamento do Fora da Pauta — Há mais para entender."
              width={1200}
              height={630}
              loading="lazy"
              className="block h-auto w-full"
            />
            <div className="p-5 sm:p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-black/80">
                {mensagem}
              </p>
            </div>
          </div>
          <nav aria-label="Ações do artigo" className="mt-5 grid gap-3 sm:grid-cols-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex min-h-14 w-full items-center justify-center rounded-lg bg-[#FFD700] px-5 py-3 text-center font-bold text-black">
              Compartilhar pelo WhatsApp
            </a>
            <Link href="/#opcoes" className="flex min-h-14 items-center justify-center rounded-lg border border-black/20 bg-white px-5 py-3 text-center font-bold text-black">
              Voltar às opções
            </Link>
          </nav>
          <p className="mt-3 text-sm leading-6 text-black/60">
            O botão abre o WhatsApp com a mensagem e o link do artigo. Para enviar a imagem em tamanho grande, baixe-a e anexe como foto na conversa.
          </p>
          <a href={arteUrl} download={`fora-da-pauta-${campaign.slug}.jpg`}
            className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-black underline underline-offset-4">
            Baixar imagem para enviar pelo WhatsApp
          </a>
        </section>
      </div>
    </main>
  );
}
