"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Campaign } from "@/data/campanhas";

function comNegrito(paragrafo: string) {
  return paragrafo.split(/(\*\*.*?\*\*)/g).map((trecho, indice) =>
    trecho.startsWith("**") && trecho.endsWith("**")
      ? <strong key={indice} className="font-semibold text-black">{trecho.slice(2, -2)}</strong>
      : trecho
  );
}

export function ArtigoSimples({ campaign }: { campaign: Campaign }) {
  const [inscricao, setInscricao] = useState<"verificando" | "inscrito" | "visitante">("verificando");

  useEffect(() => {
    let ativo = true;
    async function conferirInscricao() {
      try {
        const resposta = await fetch("/api/telegram/sessao", { cache: "no-store", credentials: "same-origin" });
        if (!resposta.ok) throw new Error("Consulta indisponível");
        const dados = await resposta.json() as { ativo?: boolean };
        if (ativo) setInscricao(dados.ativo === true ? "inscrito" : "visitante");
      } catch {
        if (ativo) setInscricao("visitante");
      }
    }
    void conferirInscricao();
    window.addEventListener("focus", conferirInscricao);
    return () => { ativo = false; window.removeEventListener("focus", conferirInscricao); };
  }, []);

  const url = `https://www.foradapauta.org/campanhas/${campaign.slug}`;
  const mensagem = `Fora da Pauta — ${campaign.title}\n\n${campaign.statement}\n\n${url}`;
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
          <section id="conversa-final-artigo" aria-labelledby="conversa-final-titulo" className="space-y-4 border-t border-black/15 pt-8">
            <h2 id="conversa-final-titulo" className="text-2xl font-bold">E aí, o que achou?</h2>
            <p className="text-[17px] leading-8 text-black/80">Gostou do que acabou de ouvir?</p>
            <p className="text-[17px] leading-8 text-black/80">Se quiser, pode mandar esse artigo para alguém pelo WhatsApp.</p>
            {inscricao === "visitante" ? (
              <>
                <p className="text-[17px] leading-8 text-black/80">E tem mais uma coisa: se é a primeira vez que você chega aqui, queremos mostrar um pouco mais do Fora da Pauta para você.</p>
                <p className="text-[17px] leading-8 text-black/80">É bem simples. É só tocar no botão Quero conhecer aqui embaixo que a gente mostra o caminho.</p>
              </>
            ) : null}
          </section>
        </article>

        <nav aria-label="O que fazer depois do artigo" className="mt-7 grid gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-14 w-full items-center justify-center rounded-lg bg-[#238B51] px-5 py-3 text-center font-bold text-white">
            Enviar pelo WhatsApp
          </a>
          {inscricao === "visitante" ? (
            <Link href="/?conhecer=1" className="flex min-h-14 w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-center font-bold text-white hover:bg-black/85">
              Quero conhecer
            </Link>
          ) : inscricao === "inscrito" ? (
            <Link href="/#opcoes" className="flex min-h-14 w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-center font-bold text-white hover:bg-black/85">
              Ir para o início
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
