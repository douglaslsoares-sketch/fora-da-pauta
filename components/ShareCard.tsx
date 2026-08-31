"use client";

import { useState } from "react";
import { criarMensagemDeCompartilhamento } from "./shareMessage";

type ShareCardProps = {
  statement: string;
};

export function ShareCard({
  statement,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [erro, setErro] = useState(false);

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
        // Tenta o metodo alternativo abaixo.
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

  async function copyMessage() {
    const message =
      criarMensagemDeCompartilhamento(
        statement,
        window.location.href,
      );

    setErro(false);

    const sucesso =
      await copiarComFallback(message);

    if (!sucesso) {
      setCopied(false);
      setErro(true);
      return;
    }

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      2000,
    );
  }

  return (
    <details className="group border-t border-black/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 marker:content-none sm:py-9">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Espalhe a edição
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            Compartilhar
          </h2>
        </div>

        <span
          aria-hidden="true"
          className="text-3xl font-light leading-none transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="pb-10">
        <p className="max-w-2xl text-[17px] leading-8 text-black/60 sm:text-lg">
          {statement}
        </p>

        <p className="mt-3 text-sm leading-6 text-black/40">
          O link desta edição será incluído automaticamente.
        </p>

        <button
          type="button"
          onClick={copyMessage}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          {copied
            ? "Mensagem copiada ✓"
            : "Copiar mensagem"}
        </button>

        {erro ? (
          <p
            className="mt-3 text-sm leading-6 text-black/50"
            aria-live="polite"
          >
            Não foi possível copiar automaticamente neste navegador.
          </p>
        ) : null}
      </div>
    </details>
  );
}