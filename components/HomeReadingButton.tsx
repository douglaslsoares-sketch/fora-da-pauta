"use client";

import { useEffect, useState } from "react";

export function HomeReadingButton() {
  const [minutos, setMinutos] =
    useState<number | null>(null);

  useEffect(() => {
    const root =
      document.getElementById(
        "home-reading",
      );

    if (!root) {
      return;
    }

    const elementos =
      Array.from(
        root.querySelectorAll<HTMLElement>(
          "h1,h2,h3,h4,p,li,blockquote,dt,dd",
        ),
      ).filter(
        (elemento) =>
          !elemento.closest(
            "[data-editorial-ignore]",
          ),
      );

    const palavras =
      elementos
        .map(
          (elemento) =>
            elemento.innerText,
        )
        .join(" ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    setMinutos(
      Math.max(
        1,
        Math.ceil(
          palavras / 150,
        ),
      ),
    );
  }, []);

  function iniciarLeitura() {
    window.dispatchEvent(
      new CustomEvent(
        "fdp:audio-start",
        {
          detail: {
            rootSelector:
              "#home-reading",
            title:
              "Conheça o Fora da Pauta",
          },
        },
      ),
    );
  }

  return (
    <div
      data-editorial-ignore
      className="flex flex-wrap items-center gap-x-5 gap-y-3"
    >
      <button
        type="button"
        onClick={iniciarLeitura}
        className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#FFC400] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
      >
        <span aria-hidden="true">
          ▶
        </span>

        Ouvir a leitura
      </button>

      <p className="text-sm text-white/65">
        {minutos
          ? `Tempo estimado de leitura: ${minutos} min`
          : "Calculando tempo de leitura…"}
      </p>
    </div>
  );
}