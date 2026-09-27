"use client";

import { useState } from "react";

type ShareCandidatePageButtonProps = {
  tipo:
    | "consulta"
    | "ficha"
    | "pagina";
};

function obterTituloDaPagina() {
  const titulo =
    document.querySelector("h1")?.textContent
      ?.replace(/\s+/g, " ")
      .trim();

  return titulo || "";
}

async function copiarComFallback(
  texto: string,
) {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(
        texto,
      );

      return true;
    } catch {
      // Tenta o método alternativo abaixo.
    }
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = texto;
  textarea.setAttribute(
    "readonly",
    "",
  );

  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  let sucesso = false;

  try {
    sucesso =
      document.execCommand("copy");
  } finally {
    document.body.removeChild(
      textarea,
    );
  }

  return sucesso;
}

export function ShareCandidatePageButton({
  tipo,
}: ShareCandidatePageButtonProps) {
  const [estado, setEstado] =
    useState<
      "normal" | "copiado" | "erro"
    >("normal");

  const label =
    tipo === "ficha"
      ? "Compartilhar esta ficha"
      : tipo === "consulta"
        ? "Compartilhar consulta"
        : "Compartilhar página";

  async function compartilhar() {
    const url =
      window.location.href;

    const tituloPagina =
      obterTituloDaPagina();

    const titulo =
      tipo === "ficha" &&
      tituloPagina
        ? `Ficha de ${tituloPagina} — Fora da Pauta`
        : tipo === "consulta"
          ? "Conheça seu candidato — Fora da Pauta"
          : `${tituloPagina || "Fora da Pauta"} — Fora da Pauta`;

    const texto =
      tipo === "ficha"
        ? tituloPagina
          ? `Consulte a ficha de ${tituloPagina} no Fora da Pauta.`
          : "Consulte esta ficha de candidato no Fora da Pauta."
        : tipo === "consulta"
          ? "Consulte a ficha do candidato que você procura no Fora da Pauta."
          : "Veja esta página no Fora da Pauta.";

    setEstado("normal");

    if (
      typeof navigator.share ===
      "function"
    ) {
      try {
        await navigator.share({
          title: titulo,
          text: texto,
          url,
        });

        return;
      } catch (erro) {
        if (
          erro instanceof DOMException &&
          erro.name === "AbortError"
        ) {
          return;
        }

        // Se o compartilhamento nativo falhar,
        // tenta copiar abaixo.
      }
    }

    const conteudo =
      `${texto}\n${url}`;

    const copiado =
      await copiarComFallback(
        conteudo,
      );

    if (!copiado) {
      setEstado("erro");
      return;
    }

    setEstado("copiado");

    window.setTimeout(
      () => setEstado("normal"),
      2500,
    );
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      data-editorial-ignore
      aria-label={label}
      className="fixed bottom-3 left-3 z-[80] inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-black px-3 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] focus-visible:ring-offset-2 sm:bottom-6 sm:left-6 sm:h-auto sm:rounded-none sm:px-4 sm:py-3 sm:text-sm"
    >
      {estado === "copiado"
        ? "Link copiado ✓"
        : estado === "erro"
          ? "Não foi possível copiar"
          : label}
    </button>
  );
}