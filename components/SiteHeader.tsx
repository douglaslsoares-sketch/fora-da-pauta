import Link from "next/link";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

/** Cabeçalho comum às páginas internas: identidade tipográfica Fora da Pauta. */
function InstitutionalHeader() {
  return (
    <header className="relative z-40 border-0 bg-[#050505] text-white shadow-none">
      <div className="mx-auto flex w-full items-center justify-center px-4 pb-5 pt-3 md:pb-[23px] md:pt-5">
        <Link href="/central" aria-label="Voltar ao menu do Fora da Pauta" className="block">
          <span className="block text-center text-[clamp(25px,6vw,42px)] font-extrabold tracking-[0.015em]">FORA DA PAUTA</span>
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return <SiteHeaderRouter><InstitutionalHeader /></SiteHeaderRouter>;
}
