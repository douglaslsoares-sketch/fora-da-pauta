"use client";

import {
  useEffect,
  useState,
} from "react";

import { track } from "@vercel/analytics";

const STORAGE_KEY =
  "foradapauta:prelaunch:leitura:v1";

type ProgressState = {
  sectionId?: string;
  audioIndex?: number;
  audioTotal?: number;
  audioCompleted?: boolean;
  textCompleted?: boolean;
};

type AudioProgressDetail = {
  rootSelector?: string;
  index?: number;
  total?: number;
};

function lerProgresso(): ProgressState {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(raw) as ProgressState;

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function gravarProgresso(
  alteracao: Partial<ProgressState>,
) {
  try {
    const atual =
      lerProgresso();

    const novo = {
      ...atual,
      ...alteracao,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(novo),
    );

    return novo;
  } catch {
    return {
      ...alteracao,
    };
  }
}

function registrar(
  nome: string,
  propriedades?: Record<
    string,
    string | number | boolean
  >,
) {
  try {
    track(
      nome,
      propriedades,
    );
  } catch {
    // A página continua funcionando mesmo
    // se a métrica não puder ser enviada.
  }
}

export function PreLaunchExperience() {
  const [minutos, setMinutos] =
    useState<number | null>(null);

  const [progresso, setProgresso] =
    useState<ProgressState>({});

  useEffect(() => {
    const root =
      document.getElementById(
        "prelaunch-reading",
      );

    if (!root) {
      return;
    }

    const inicial =
      lerProgresso();

    setProgresso(inicial);

    const elementos =
      Array.from(
        root.querySelectorAll<HTMLElement>(
          "h1,h2,h3,p,li,blockquote",
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

    const vistos =
      new Set<string>();

    const secoes =
      Array.from(
        root.querySelectorAll<HTMLElement>(
          "[data-prelaunch-step]",
        ),
      );

    const observer =
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (
              !entry.isIntersecting ||
              entry.intersectionRatio < 0.35
            ) {
              continue;
            }

            const elemento =
              entry.target as HTMLElement;

            const etapa =
              elemento.dataset.prelaunchStep;

            if (!etapa) {
              continue;
            }

            const novo =
              gravarProgresso({
                sectionId:
                  elemento.id || etapa,
              });

            setProgresso(
              (anterior) => ({
                ...anterior,
                ...novo,
              }),
            );

            if (!vistos.has(etapa)) {
              vistos.add(etapa);

              registrar(
                "prelaunch_section_reached",
                {
                  section: etapa,
                },
              );
            }

            if (
              etapa === "fechamento"
            ) {
              const final =
                gravarProgresso({
                  textCompleted: true,
                });

              setProgresso(
                (anterior) => ({
                  ...anterior,
                  ...final,
                }),
              );

              registrar(
                "prelaunch_text_completed",
              );
            }
          }
        },
        {
          threshold: [0.35],
        },
      );

    for (const secao of secoes) {
      observer.observe(secao);
    }

    function aoProgressoAudio(
      evento: Event,
    ) {
      const custom =
        evento as CustomEvent<AudioProgressDetail>;

      if (
        custom.detail?.rootSelector !==
        "#prelaunch-reading"
      ) {
        return;
      }

      const index =
        typeof custom.detail.index ===
        "number"
          ? custom.detail.index
          : 0;

      const total =
        typeof custom.detail.total ===
        "number"
          ? custom.detail.total
          : 0;

      const novo =
        gravarProgresso({
          audioIndex: index,
          audioTotal: total,
          audioCompleted: false,
        });

      setProgresso(
        (anterior) => ({
          ...anterior,
          ...novo,
        }),
      );
    }

    function aoConcluirAudio(
      evento: Event,
    ) {
      const custom =
        evento as CustomEvent<AudioProgressDetail>;

      if (
        custom.detail?.rootSelector !==
        "#prelaunch-reading"
      ) {
        return;
      }

      const novo =
        gravarProgresso({
          audioIndex: 0,
          audioCompleted: true,
        });

      setProgresso(
        (anterior) => ({
          ...anterior,
          ...novo,
        }),
      );

      registrar(
        "prelaunch_audio_completed",
      );
    }

    function aoClique(
      evento: MouseEvent,
    ) {
      const alvo =
        evento.target as HTMLElement | null;

      const acao =
        alvo?.closest<HTMLElement>(
          "[data-prelaunch-action]",
        );

      const nome =
        acao?.dataset.prelaunchAction;

      if (!nome) {
        return;
      }

      registrar(
        "prelaunch_action",
        {
          action: nome,
        },
      );
    }

    window.addEventListener(
      "fdp:audio-progress",
      aoProgressoAudio,
    );

    window.addEventListener(
      "fdp:audio-complete",
      aoConcluirAudio,
    );

    document.addEventListener(
      "click",
      aoClique,
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "fdp:audio-progress",
        aoProgressoAudio,
      );

      window.removeEventListener(
        "fdp:audio-complete",
        aoConcluirAudio,
      );

      document.removeEventListener(
        "click",
        aoClique,
      );
    };
  }, []);

  function iniciarAudio() {
    const retomar =
      !progresso.audioCompleted &&
      typeof progresso.audioIndex ===
        "number" &&
      progresso.audioIndex > 0;

    registrar(
      "prelaunch_audio_start",
      {
        resumed: retomar,
      },
    );

    window.dispatchEvent(
      new CustomEvent(
        "fdp:audio-start",
        {
          detail: {
            rootSelector:
              "#prelaunch-reading",
            title:
              "Fora da Pauta — pré-lançamento",
            startIndex:
              retomar
                ? progresso.audioIndex
                : 0,
          },
        },
      ),
    );
  }

  function continuarTexto() {
    if (!progresso.sectionId) {
      return;
    }

    const elemento =
      document.getElementById(
        progresso.sectionId,
      );

    if (!elemento) {
      return;
    }

    registrar(
      "prelaunch_text_resume",
      {
        section:
          progresso.sectionId,
      },
    );

    elemento.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const podeRetomarTexto =
    Boolean(
      progresso.sectionId,
    ) &&
    !progresso.textCompleted &&
    progresso.sectionId !==
      "abertura";

  const podeRetomarAudio =
    !progresso.audioCompleted &&
    typeof progresso.audioIndex ===
      "number" &&
    progresso.audioIndex > 0;

  return (
    <div
      data-editorial-ignore
      className="mt-5 sm:mt-7"
    >
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={iniciarAudio}
          className="inline-flex min-h-11 shrink-0 items-center gap-2.5 bg-[#FFC400] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#e9b300] sm:min-h-12 sm:gap-3 sm:px-5 sm:py-3"
        >
          <span aria-hidden="true">
            ▶
          </span>

          {podeRetomarAudio
            ? "Continuar áudio"
            : progresso.audioCompleted
              ? "Ouvir novamente"
              : "Ouvir a leitura"}
        </button>

        <p className="shrink-0 text-[11px] leading-4 text-white/50 sm:text-sm">
          {minutos
            ? `Tempo estimado: ${minutos} min`
            : "Calculando tempo de leitura…"}
        </p>
      </div>

      {podeRetomarTexto ? (
        <button
          type="button"
          onClick={continuarTexto}
          className="mt-4 text-sm font-semibold text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white"
        >
          Continuar de onde parei
        </button>
      ) : null}
    </div>
  );
}