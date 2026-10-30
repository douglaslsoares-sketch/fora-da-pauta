"use client";

import { useEffect, useRef, useState } from "react";

const HOME_PUBLICA = "https://www.foradapauta.org/";
const IMAGEM_COMPARTILHAMENTO = "/opengraph-image.jpg";
const TEXTO = [
  "Conheça o Fora da Pauta.",
  "",
  "Um espaço para entender melhor as decisões que afetam a nossa vida e o que está por trás das notícias.",
  "",
  "Acesse: " + HOME_PUBLICA,
].join("\n");

type SuporteImagem = "verificando" | "disponivel" | "indisponivel";

export function HomeShareInvite() {
  const imagemPronta = useRef<File | null>(null);
  const [suporteImagem, setSuporteImagem] = useState<SuporteImagem>("verificando");
  const [aviso, setAviso] = useState("");
  const [copiando, setCopiando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function prepararImagem() {
      try {
        // Pré-carregar antes do clique evita perder o gesto necessário
        // para abrir a janela de compartilhamento do aparelho.
        const resposta = await fetch(IMAGEM_COMPARTILHAMENTO, {
          cache: "force-cache",
        });
        if (!resposta.ok) throw new Error("Imagem indisponível");

        const conteudo = await resposta.blob();
        if (conteudo.type !== "image/jpeg") {
          throw new Error("Arquivo inesperado");
        }

        const arquivo = new File([conteudo], "fora-da-pauta.jpg", {
          type: "image/jpeg",
        });
        if (!ativo) return;

        imagemPronta.current = arquivo;
        const podeCompartilhar =
          typeof navigator.share === "function" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [arquivo] });

        setSuporteImagem(podeCompartilhar ? "disponivel" : "indisponivel");
      } catch {
        if (ativo) setSuporteImagem("indisponivel");
      }
    }

    void prepararImagem();
    return () => {
      ativo = false;
    };
  }, []);

  async function compartilharImagem() {
    const arquivo = imagemPronta.current;

    if (!arquivo || !navigator.share || !navigator.canShare?.({ files: [arquivo] })) {
      setAviso("Este navegador não permite compartilhar a imagem diretamente. Baixe a imagem e envie-a pelo WhatsApp.");
      return;
    }

    try {
      // Não há operações assíncronas antes de share(): exige clique direto.
      await navigator.share({
        files: [arquivo],
        text: TEXTO,
        title: "Fora da Pauta",
      });
      setAviso("Confira na conversa se a imagem e o texto foram incluídos.");
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") {
        setAviso("");
        return;
      }
      setAviso("Não foi possível abrir o compartilhamento de imagem. Use a opção de baixar a arte.");
    }
  }

  async function copiarTexto() {
    setCopiando(true);
    try {
      await navigator.clipboard.writeText(TEXTO);
      setAviso("Mensagem copiada. Cole-a na legenda da imagem no WhatsApp.");
    } catch {
      setAviso("O navegador não permitiu copiar a mensagem automaticamente.");
    } finally {
      setCopiando(false);
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

        {suporteImagem === "disponivel" ? (
          <button
            type="button"
            onClick={() => void compartilharImagem()}
            className="inline-flex min-h-12 items-center justify-center border border-white/65 bg-transparent px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            Compartilhar imagem (escolher WhatsApp)
          </button>
        ) : (
          <a
            href={IMAGEM_COMPARTILHAMENTO}
            download="fora-da-pauta.jpg"
            className="inline-flex min-h-12 items-center justify-center border border-white/65 bg-transparent px-5 py-3 font-semibold text-white hover:bg-white/10"
          >
            {suporteImagem === "verificando" ? "Baixar imagem" : "Baixar imagem para WhatsApp"}
          </a>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-white/70">
        {suporteImagem === "disponivel"
          ? "Para compartilhar a arte como imagem, escolha WhatsApp na janela do aparelho e confira a mensagem antes de enviar."
          : "O envio direto de imagens não está disponível neste navegador. Baixe a arte, anexe-a no WhatsApp e use a mensagem original."}
      </p>

      {suporteImagem === "indisponivel" ? (
        <button
          type="button"
          disabled={copiando}
          onClick={() => void copiarTexto()}
          className="mt-3 text-sm font-semibold text-[#FFD700] underline underline-offset-4 disabled:opacity-60"
        >
          Copiar mensagem para acompanhar a imagem
        </button>
      ) : null}

      {aviso ? (
        <p role="status" className="mt-3 text-sm leading-6 text-[#FFD700]">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}
