"use client";

import Link from "next/link";
import { useState } from "react";

type EditionEndActionsProps = {
  title: string;
  statement: string;
  slug: string;
};

async function copiarTexto(
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
      // Usa o fallback abaixo.
    }
  }

  const textarea =
    document.createElement(
      "textarea",
    );

  textarea.value = texto;

  textarea.setAttribute(
    "readonly",
    "",
  );

  textarea.style.position =
    "fixed";

  textarea.style.left =
    "-9999px";

  document.body.appendChild(
    textarea,
  );

  textarea.select();

  let sucesso = false;

  try {
    sucesso =
      document.execCommand(
        "copy",
      );
  } finally {
    document.body.removeChild(
      textarea,
    );
  }

  return sucesso;
}

export function EditionEndActions({
  title,
  statement,
  slug,
}: EditionEndActionsProps) {
  const [copiado, setCopiado] =
    useState(false);

  const [erro, setErro] =
    useState(false);

  const url =
    `https://www.foradapauta.org/campanhas/${slug}`;

  const mensagem =
    `Fora da Pauta — ${title}\n\n${statement}\n\n${url}`;

  async function copiarMensagem() {
    setErro(false);

    const sucesso =
      await copiarTexto(
        mensagem,
      );

    if (!sucesso) {
      setErro(true);
      return;
    }

    setCopiado(true);

    window.setTimeout(
      () => setCopiado(false),
      2000,
    );
  }

  return (
    <div
      data-editorial-ignore
      className="mt-10 space-y-4 sm:mt-12"
    >
      <section className="border border-black/15 bg-white/40 p-6 sm:p-8">
        <h3 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Compartilhe esta edição
        </h3>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
          Se este conteúdo puder ser útil para outra pessoa,
          copie a mensagem abaixo e envie onde preferir.
        </p>

        <div className="mt-6 border border-black/15 bg-[#eeeee9] p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-black/65">
            {mensagem}
          </p>
        </div>

        <button
          type="button"
          onClick={copiarMensagem}
          className="mt-5 inline-flex min-h-11 items-center justify-center bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          {copiado
            ? "Mensagem copiada ✓"
            : "Copiar esta mensagem"}
        </button>

        {erro ? (
          <p
            className="mt-3 text-sm text-black/50"
            aria-live="polite"
          >
            Não foi possível copiar automaticamente neste navegador.
          </p>
        ) : null}
      </section>

      <section className="bg-black p-6 text-white sm:p-8">
        <h3 className="max-w-2xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Chegou ao Fora da Pauta por esta edição?
        </h3>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Conheça o projeto, veja como o Fora da Pauta trabalha
          e encontre outras publicações.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center bg-[#FFC400] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
        >
          Conheça o Fora da Pauta
        </Link>
      </section>
    </div>
  );
}