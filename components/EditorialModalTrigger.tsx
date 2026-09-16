"use client";

type EditorialModalTriggerProps = {
  className?: string;
};

export function EditorialModalTrigger({
  className = "",
}: EditorialModalTriggerProps) {
  function abrirLinhaEditorial() {
    window.dispatchEvent(
      new CustomEvent("fdp:editorial-open"),
    );
  }

  return (
    <button
      type="button"
      onClick={abrirLinhaEditorial}
      className={className}
    >
      Linha Editorial
    </button>
  );
}