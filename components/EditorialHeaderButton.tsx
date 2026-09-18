"use client";

export function EditorialHeaderButton() {
  function abrirLinhaEditorial() {
    window.dispatchEvent(
      new CustomEvent("fdp:editorial-open"),
    );
  }

  return (
    <button
      type="button"
      onClick={abrirLinhaEditorial}
      aria-label="Abrir como funciona o Fora da Pauta"
      className="inline-flex items-center gap-3 text-xs font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm"
    >
      <span>Como funciona</span>

      <span
        className="h-2 w-2 shrink-0 rounded-full bg-[#FFC400]"
        aria-hidden="true"
      />
    </button>
  );
}
