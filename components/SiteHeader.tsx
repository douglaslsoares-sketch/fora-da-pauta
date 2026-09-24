import Image from "next/image";
import Link from "next/link";
import { PreLaunchHeaderLink } from "@/components/PreLaunchHeaderLink";
import { SiteHeaderRouter } from "@/components/SiteHeaderRouter";

const linksInstitucionais = [
  {
    href: "/linha-editorial",
    label: "O que faz, como se sustenta e como presta contas",
  },
];

function InstitutionalHeader() {
  return (
    <header className="bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex min-h-[78px] items-center justify-between gap-5">
          <Link
            href="/"
            aria-label="Fora da Pauta — página inicial"
            className="shrink-0"
          >
            <Image
              src="/marca/fora-da-pauta-branca.png"
              alt="Fora da Pauta"
              width={180}
              height={130}
              priority
              className="h-auto w-[62px] sm:w-[70px]"
            />
          </Link>

          <nav
            aria-label="Navegação institucional"
            className="hidden items-center gap-7 md:flex"
          >
            {linksInstitucionais.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="max-w-[390px] text-right text-[12px] font-semibold leading-5 tracking-[0.01em] text-white/70 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none border border-white/20 px-3 py-2 text-xs font-semibold text-white/80">
              Menu
            </summary>

            <nav
              aria-label="Navegação institucional móvel"
              className="absolute right-0 z-50 mt-2 w-[280px] border border-white/15 bg-black p-4 shadow-xl"
            >
              <div className="flex flex-col">
                {linksInstitucionais.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-white/10 py-3 text-sm font-semibold leading-6 text-white/75 last:border-b-0 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </details>
        </div>

        <PreLaunchHeaderLink />
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