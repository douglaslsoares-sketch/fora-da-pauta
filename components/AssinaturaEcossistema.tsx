import Link from "next/link";

/** Assinatura das iniciativas: usa um único arquivo da logomarca oficial aprovada. */
export function AssinaturaEcossistema() {
  return (
    <footer aria-label="Identificação da iniciativa" className="flex flex-col items-center justify-center gap-2 bg-[#061827] px-5 pb-10 pt-7 text-center">
      <Link href="/" aria-label="Fora da Pauta — ecossistema" className="inline-flex w-[190px] max-w-full items-center justify-center rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd32a]">
        <img src="/marca/foradapauta-oficial.png" width={1536} height={1024} alt="ForaDaPauta.org" className="block h-auto w-full" />
      </Link>
    </footer>
  );
}
