"use client";

import { useState } from "react";

const MENSAGEM = "Conheça o Fora da Pauta: como o jogo é jogado. Há mais para entender.";
const HOME_PUBLICA = "https://www.foradapauta.org/";

export function HomeShareInvite() {
  const [aviso, setAviso] = useState("");

  function mensagem() {
    return `${MENSAGEM} ${HOME_PUBLICA}`;
  }

  function compartilharWhatsapp() {
    const url = new URL("https://api.whatsapp.com/send");
    url.searchParams.set("text", mensagem());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  async function compartilhar() {
    setAviso("");
    const texto = mensagem();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Fora da Pauta",
          text: MENSAGEM,
          url: HOME_PUBLICA,
        });
        return;
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(texto);
      setAviso("Link copiado para compartilhar.");
    } catch {
      setAviso("Não foi possível copiar. Use o botão do WhatsApp.");
    }
  }

  return (
    <div>
      <h2 id="convite-titulo">Convide alguém a conhecer</h2>
      <p className="mt-3 text-white/75">
        Compartilhe o Fora da Pauta com quem também quer entender como o jogo é jogado.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={compartilharWhatsapp}
          className="min-h-12 border border-[#FFC400] bg-[#FFC400] px-5 py-3 font-semibold text-black hover:bg-[#e9b300]"
        >
          Enviar pelo WhatsApp
        </button>
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
