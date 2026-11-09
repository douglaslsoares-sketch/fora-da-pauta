import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

function InstitutionalHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex min-h-[60px] items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Fora da Pauta — página inicial"
            className="shrink-0"
          >
            <Image
              src="/marca/fora-da-pauta-horizontal-branco.svg"
              alt="Fora da Pauta"
              width={930}
              height={150}
              priority
              className="h-auto w-[188px] object-contain sm:w-[260px]"
            />
          </Link>
          {pathname !== "/ha-mais-para-entender" && !pathname.startsWith("/admin/") && <Link href="/ha-mais-para-entender" aria-label="Fechar página e voltar ao menu" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-[#c62828] px-3 font-bold text-white"><span aria-hidden="true">✕</span> Fechar</Link>}
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
