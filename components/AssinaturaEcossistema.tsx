import Link from "next/link";

/**
 * Assinatura institucional das iniciativas do ecossistema.
 * A marca-mãe usa somente tipografia e o traço amarelo,
 * sem reaproveitar o símbolo do aplicativo Políticos.
 */
export function AssinaturaEcossistema() {
  return (
    <footer aria-label="Identificação da iniciativa" className="flex flex-col items-center justify-center gap-2 bg-[#061827] px-5 pb-10 pt-7 text-center">
      <span className="text-[12px] font-medium tracking-[0.025em] text-[#b8c5d2]">Uma iniciativa</span>
      <Link href="/" aria-label="Fora da Pauta — ecossistema" className="group inline-flex w-[190px] max-w-full flex-col items-center justify-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd32a]">
        <span className="whitespace-nowrap text-[25px] font-extrabold italic leading-none tracking-[-0.052em] [font-family:Arial,Helvetica,sans-serif]">
          <span className="text-white">Fora da </span><span className="text-[#ffd32a]">Pauta</span>
        </span>
        <svg viewBox="0 0 190 15" width="190" height="15" className="mt-1 h-auto w-full" aria-hidden="true">
          <path d="M6 12Q95 -8 184 12" stroke="#ffd32a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      </Link>
    </footer>
  );
}
