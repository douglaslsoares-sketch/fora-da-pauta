"use client";

import Image from "next/image";
import {
  useState,
} from "react";

import { track } from "@vercel/analytics";

const MENSAGEM = `Conheça o Fora da Pauta.

Um espaço público de fala, escuta, informação e participação.

A conversa começa nas pessoas.

https://www.foradapauta.org`;

async function copiar(
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

export function PreLaunchShareCard() {
  const [copiado, setCopiado] =
    useState(false);

  const [erro, setErro] =
    useState(false);

  async function copiarMensagem() {
    setErro(false);

    const sucesso =
      await copiar(
        MENSAGEM,
      );

    if (!sucesso) {
      setErro(true);
      return;
    }

    try {
      track(
        "prelaunch_share_copy",
      );
    } catch {
      // Não impede o compartilhamento.
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
      className="border border-black/15 bg-white/40 p-6 sm:p-7"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">
        Compartilhe o Fora da Pauta
      </p>

      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
        Uma mensagem. Qualquer lugar.
      </h3>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
        Esta é a mensagem que será copiada.
      </p>

      <div className="mt-6 overflow-hidden border border-black/15 bg-[#eeeee9]">
        <div className="flex items-start gap-4 border-b border-black/10 p-4 sm:p-5">
          <Image
            src="/favicon-foradapauta.png"
            alt="Fora da Pauta"
            width={96}
            height={96}
            className="h-20 w-20 shrink-0 object-cover sm:h-24 sm:w-24"
          />

          <div className="min-w-0 pt-1">
            <p className="font-semibold text-black">
              Fora da Pauta
            </p>

            <p className="mt-2 break-all text-xs text-black/40">
              www.foradapauta.org
            </p>
          </div>
        </div>

        <div className="whitespace-pre-line p-4 text-sm leading-7 text-black/65 sm:p-5">
          {MENSAGEM}
        </div>
      </div>

      <button
        type="button"
        onClick={copiarMensagem}
        className="mt-6 inline-flex min-h-11 items-center justify-center bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
      >
        {copiado
          ? "Mensagem copiada ✓"
          : "Copiar mensagem"}
      </button>

      {erro ? (
        <p
          className="mt-3 text-sm text-black/50"
          aria-live="polite"
        >
          Não foi possível copiar automaticamente neste navegador.
        </p>
      ) : null}
    </div>
  );
}