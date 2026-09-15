import Image from "next/image";
import Link from "next/link";

const links = [
  {
    href: "/#principios",
    label: "Princípios",
  },
  {
    href: "/#participacao",
    label: "Participação",
  },
  {
    href: "/espinha-dorsal",
    label: "Espinha Dorsal",
  },
  {
    href: "/participacao-e-sustentabilidade#prestacao-de-contas",
    label: "Prestação de Contas",
  },
];

export function SiteHeader() {
  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="ForaDaPauta.org — página inicial"
          className="shrink-0"
        >
          <Image
            src="/marca/foradapauta-org-mobile-v3.png"
            alt="ForaDaPauta.org"
            width={215}
            height={40}
            priority
            className="block h-[40px] w-[215px] object-contain object-left sm:hidden"
          />

          <Image
            src="/marca/foradapauta-org-desktop-v3.png"
            alt="ForaDaPauta.org"
            width={280}
            height={40}
            priority
            className="hidden h-[40px] w-[280px] object-contain object-left sm:block"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 lg:flex"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] font-semibold text-white/65 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none border border-white/20 px-3 py-2 text-xs font-semibold text-white/80">
            Menu
          </summary>

          <nav
            aria-label="Navegação móvel"
            className="absolute right-0 z-50 mt-2 w-[260px] border border-white/15 bg-black p-4 shadow-xl"
          >
            <div className="flex flex-col">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-white/10 py-3 text-sm font-semibold text-white/75 last:border-b-0 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}