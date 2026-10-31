"use client";

import { useState } from "react";

const URL_ARTIGO = "https://www.foradapauta.org/teste-telegram";
const TEXTO = [
  "Conheça esta demonstração do Fora da Pauta.",
  "",
  "Uma edição de teste para conferir a leitura, a inscrição no Telegram e o compartilhamento.",
  "",
  "Leia ou ouça: " + URL_ARTIGO,
].join("\n");

export function CompartilharArtigoTeste() {
  const [status, setStatus] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function compartilhar() {
    if (enviando) return;
    setEnviando(true);
    setStatus("");

    try {
      if (typeof navigator.share === "function") {
        let arquivo: File | undefined;

        try {
          const resposta = await fetch("/edicoes/edicao-01-6x1-nova-identidade.png");
          if (resposta.ok) {
            const imagem = await resposta.blob();
            arquivo = new File([imagem], "fora-da-pauta-edicao-teste.png", {
              type: imagem.type || "image/png",
            });
          }
        } catch {
          // Se a capa não estiver disponível, compartilha texto e link.
        }

        if (arquivo && navigator.canShare?.({ files: [arquivo] })) {
          await navigator.share({ files: [arquivo], text: TEXTO, title: "Fora da Pauta" });
        } else {
          await navigator.share({ title: "Fora da Pauta", text: TEXTO, url: URL_ARTIGO });
        }

        setStatus("Compartilhamento preparado no aparelho.");
        return;
      }

      await navigator.clipboard.writeText(TEXTO);
      setStatus("Mensagem e link copiados. Cole no aplicativo que preferir.");
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") return;
      setStatus("Não foi possível abrir o compartilhamento. Copie este link: " + URL_ARTIGO);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={compartilhar}
        disabled={enviando}
        className="flex min-h-12 w-full items-center justify-center border border-black/20 bg-white px-5 py-3 text-center font-semibold text-black hover:bg-neutral-100 disabled:opacity-60"
      >
        {enviando ? "Preparando compartilhamento..." : "Compartilhar este artigo"}
      </button>
      {status ? <p role="status" className="mt-3 text-sm text-neutral-600">{status}</p> : null}
    </div>
  );
}
