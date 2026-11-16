import Link from "next/link";
import { LogoForaDaPauta } from "@/components/LogoForaDaPauta";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

/** Cabeçalho comum às páginas internas: nova assinatura Fora da Pauta. */
function InstitutionalHeader() {
  return (
    <header className="relative z-40 border-0 bg-[#141C2B] text-white shadow-none">
      <div className="mx-auto flex w-full items-center justify-center px-4 pb-4 pt-3 md:pb-5 md:pt-4">
        <Link href="/central" aria-label="Voltar ao menu do Fora da Pauta" className="inline-flex w-[min(100%,360px)] max-w-full items-center">
          <LogoForaDaPauta className="block h-auto w-full" />
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return <SiteHeaderRouter><InstitutionalHeader /></SiteHeaderRouter>;
}
