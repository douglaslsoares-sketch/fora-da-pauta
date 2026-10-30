import Image from "next/image";
import Link from "next/link";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

function InstitutionalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex min-h-[58px] items-center">
          <Link
            href="/"
            aria-label="Fora da Pauta — página inicial"
            className="shrink-0"
          >
            <Image
              src="/marca/fora-da-pauta-horizontal.svg"
              alt="Fora da Pauta"
              width={930}
              height={150}
              priority
              className="h-auto w-[188px] object-contain sm:w-[260px]"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <SiteHeaderRouter>
      <InstitutionalHeader />
    </SiteHeaderRouter>
  );
}
