"use client";

import { useState } from "react";

type ShareCardProps = {
  statement: string;
};

export function ShareCard({ statement }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    const message = `${statement}

Entenda a proposta e conheça os argumentos:
${window.location.href}`;

    await navigator.clipboard.writeText(message);

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <details className="group overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] open:shadow-[0_24px_80px_rgba(0,0,0,0.09)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-7 marker:content-none sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Espalhe a mensagem
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Compartilhar
          </h2>
        </div>

        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-[#f2f2ef] text-2xl font-light transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-black/8 px-6 pb-8 pt-6 sm:px-8 sm:pb-9">
        <p className="text-[17px] leading-8 text-black/65 sm:text-lg">
          {statement}
        </p>

        <p className="mt-3 text-sm leading-6 text-black/45">
          O link desta página será incluído automaticamente na mensagem.
        </p>

        <button
          type="button"
          onClick={copyMessage}
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          {copied ? "Mensagem copiada ✓" : "Copiar mensagem"}
        </button>
      </div>
    </details>
  );
}
