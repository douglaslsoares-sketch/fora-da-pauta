"use client";

import { useEffect, useRef, useState } from "react";

const HOME_PUBLICA = "https://www.foradapauta.org/";
const ARTE_PUBLICA = "/opengraph-image.jpg";
const TEXTO = [
  "Conheça o Fora da Pauta.",
  "",
  "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
  "",
  "Acesse: " + HOME_PUBLICA,
].join("\n");

const LINK_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(TEXTO)}`;

export function HomeShareInvite() {
  const arquivoRef = useRef<File | null>(null);
  const [podeEnviarImagem, setPodeEnviarImagem] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function prepararImagem() {
      try {
        const resposta = await fetch(ARTE_PUBLICA);
        if (!resposta.ok) return;

        const dados = await resposta.blob();
        if (!ativo || dados.type !== "image/jpeg") return;

        const arquivo = new File([dados], "fora-da-pauta.jpg", {
          type: "image/jpeg",
        });

        if (
          typeof navigator.share !== "function" ||
          typeof navigator.canShare !== "function" ||
          !navigator.canShare({ files: [arquivo] })
        ) return;

        arquivoRef.current = arquivo;
        setPodeEnviarImagem(true);
      } catch {
        // O compartilhamento por link permanece disponível.
      }
    }

    void prepararImagem();
    return () => {
      ativo = false;
    };
  }, []);

  function abrirCompartilhamento(evento: React.MouseEvent<HTMLAnchorElement>) {
    const arquivo = arquivoRef.current;

    if (!arquivo || typeof navigator.share !== "function") {
      // O link de WhatsApp do elemento funciona normalmente.
      return;
    }

    evento.preventDefault();
    setErro("");

    // A chamada deve acontecer diretamente no clique do usuário.
    // O dispositivo permite escolher o WhatsApp; o site não escolhe o app nem o destinatário.
    void navigator.share({
      title: "Fora da Pauta",
      files: [arquivo],
      text: TEXTO,
    }).catch((falha: unknown) => {
      if (falha instanceof DOMException && falha.name === "AbortError") {
        return;
      }
      // Sem imagem, ainda oferece o compartilhamento de texto e link, que é
      // a única modalidade suportada pelo botão wa.me.
      setErro("Seu aparelho não aceitou o envio da imagem. Abrimos o compartilhamento pelo link.");
      window.location.assign(LINK_WHATSAPP);
    });
  }

  return (
    <div>
      <h2 id="convite-titulo">Convide alguém a conhecer</h2>
      <p className="mt-3 max-w-2xl text-white/75">
        Convide alguém a conhecer o que está por trás das notícias.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={LINK_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          onClick={abrirCompartilhamento}
          className="inline-flex min-h-12 items-center justify-center border border-[#FFC400] bg-[#FFC400] px-5 py-3 font-semibold text-black hover:bg-[#e9b300]"
        >
          Enviar pelo WhatsApp
        </a>
      </div>
      {podeEnviarImagem ? (
        <p className="mt-3 text-xs leading-5 text-white/65">
          A arte, a mensagem e o link estão preparados. Escolha WhatsApp e o destinatário na janela do aparelho.
        </p>
      ) : null}
      {erro ? (
        <p role="status" className="mt-3 text-sm text-[#FFD700]">{erro}</p>
      ) : null}
    </div>
  );
}
