import Link from "next/link";
import { TracosMarca } from "@/components/TracosMarca";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

/** Cabeçalho comum às páginas internas: nova assinatura Fora da Pauta. */
function InstitutionalHeader() {
  return (
    <header className="relative z-40 border-0 bg-[#050505] text-white shadow-none">
      <div className="mx-auto flex w-full items-center justify-center px-4 pb-4 pt-3 md:pb-5 md:pt-4">
        <Link href="/central" aria-label="Voltar ao menu do Fora da Pauta" className="inline-flex max-w-full flex-col items-start">
          <span className="block text-left text-[clamp(25px,6vw,42px)] font-extrabold leading-tight tracking-[0.015em]">FORA DA PAUTA</span>
          <TracosMarca className="mt-2 block h-auto w-[70%]" />
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return <SiteHeaderRouter><InstitutionalHeader /></SiteHeaderRouter>;
}
