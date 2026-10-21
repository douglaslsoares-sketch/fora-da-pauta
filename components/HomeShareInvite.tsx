"use client";

import { useState } from "react";

const HOME_PUBLICA = "https://www.foradapauta.org/";
const TEXTO = [
  "Conheça o Fora da Pauta.",
  "",
  "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
  "",
  "Acesse: " + HOME_PUBLICA,
].join("\n");

export function HomeShareInvite() {
  const [aviso, setAviso] = useState("");

  async function compartilhar() {
    setAviso("");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Fora da Pauta",
          text: "Conheça o Fora da Pauta. Há mais para entender.",
          url: HOME_PUBLICA,
        });
        return;
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(TEXTO);
      setAviso("Convite copiado. Agora você pode colá-lo onde quiser.");
    } catch {
      setAviso("Não foi possível copiar. Utilize o botão do WhatsApp.");
    }
  }

  return (
    <div>
      <h2 id="convite-titulo">Convide alguém a conhecer</h2>
      <p className="mt-3 max-w-2xl text-white/75">
        Convide alguém a conhecer o que está por trás das notícias.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(TEXTO)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center border border-[#FFC400] bg-[#FFC400] px-5 py-3 font-semibold text-black hover:bg-[#e9b300]"
        >
          Enviar pelo WhatsApp
        </a>
        <button
          type="button"
          onClick={() => void compartilhar()}
          className="min-h-12 border border-white/50 px-5 py-3 font-semibold text-white hover:border-[#FFC400]"
        >
          Compartilhar de outra forma
        </button>
      </div>
      {aviso ? <p role="status" className="mt-4 text-sm text-white/80">{aviso}</p> : null}
    </div>
  );
}
