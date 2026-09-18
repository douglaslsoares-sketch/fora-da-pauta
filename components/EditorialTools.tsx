"use client";

type EditorialToolsProps = {
  rootSelector?: string;
  title?: string;
  variant?: "light" | "dark";
  showEditorial?: boolean;
  compact?: boolean;
};

function iniciarLeitura(rootSelector: string, title?: string) {
  window.dispatchEvent(
    new CustomEvent("fdp:audio-start", {
      detail: {
        rootSelector,
        title,
      },
    }),
  );
}

function abrirLinhaEditorial() {
  window.dispatchEvent(
    new CustomEvent("fdp:editorial-open"),
  );
}

export function EditorialTools({
  rootSelector = "main",
  title,
  variant = "light",
  showEditorial = true,
  compact = false,
}: EditorialToolsProps) {
  const escuro = variant === "dark";

  const base =
    "inline-flex items-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] focus-visible:ring-offset-2";

  const cor = escuro
    ? "text-white/70 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div
      data-editorial-ignore
      data-editorial-tools
      className={`flex flex-wrap items-center ${
        compact ? "gap-x-4 gap-y-2" : "gap-x-5 gap-y-3"
      }`}
    >
      <button
        type="button"
        onClick={() =>
          iniciarLeitura(rootSelector, title)
        }
        className={`${base} ${cor} ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        <span
          aria-hidden="true"
          className="text-[#FFC400]"
        >
          ▶
        </span>
        Ouvir texto
      </button>

      {showEditorial ? (
        <>
          <span
            aria-hidden="true"
            className={
              escuro
                ? "text-white/20"
                : "text-black/20"
            }
          >
            ·
          </span>

          <button
            type="button"
            onClick={abrirLinhaEditorial}
            className={`${base} ${cor} ${
              compact ? "text-xs" : "text-sm"
            } underline decoration-current/25 underline-offset-4`}
          >
            Como funciona
          </button>
        </>
      ) : null}
    </div>
  );
}
