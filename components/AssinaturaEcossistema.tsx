import Link from "next/link";

/** Assinatura das iniciativas: usa um único arquivo da logomarca oficial aprovada. */
export function AssinaturaEcossistema() {
  return (
    <footer aria-label="Identificação da iniciativa" className="flex flex-col items-center justify-center gap-2 bg-[#061827] px-5 pb-10 pt-7 text-center">
      <span className="text-[12px] font-medium tracking-[0.025em] text-[#b8c5d2]">Uma iniciativa</span>
      <Link href="/" aria-label="Fora da Pauta — ecossistema" className="inline-flex w-[190px] max-w-full items-center justify-center rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd32a]">
        <img src="/marca/fora-da-pauta-marca-oficial-ecossistema.svg" width={3600} height={789} alt="Fora da Pauta" className="block h-auto w-full" />
      </Link>
    </footer>
  );
}
