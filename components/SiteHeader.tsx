import Image from "next/image";
import Link from "next/link";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

/** Cabeçalho comum às páginas internas: somente o olho da marca EU VIGIO. */
function InstitutionalHeader() {
  return (
    <header className="relative z-40 border-0 bg-[#050505] text-white shadow-none">
      <div className="mx-auto flex w-full items-center justify-center px-4 pb-2 pt-6 md:pt-[35px]">
        <Link href="/central" aria-label="Voltar à Central do EU VIGIO" className="block">
          <span className="relative block w-[min(78vw,360px)] overflow-hidden md:w-[400px]" style={{ aspectRatio: "660 / 215" }}>
            <Image
              src="/marca/eu-vigio-original.svg"
              alt="Olho realista com íris dourada do EU VIGIO"
              width={660}
              height={440}
              unoptimized
              priority
              className="absolute left-0 top-0 block h-auto w-full max-w-none"
            />
          </span>
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return <SiteHeaderRouter><InstitutionalHeader /></SiteHeaderRouter>;
}
