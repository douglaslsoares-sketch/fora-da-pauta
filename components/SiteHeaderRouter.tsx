"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteHeaderRouterProps = {
  children: ReactNode;
};

export function SiteHeaderRouter({
  children,
}: SiteHeaderRouterProps) {
  const pathname = usePathname();

  const isCandidateRoute =
    pathname === "/conheca-seu-candidato" ||
    pathname.startsWith("/conheca-seu-candidato/") ||
    pathname.startsWith("/pessoas/") ||
    /^\/eleicoes-2026\/candidatos\/[^/]+$/.test(pathname);

  if (!isCandidateRoute) {
    return <>{children}</>;
  }

  return (
    <header className="border-b border-black/10 bg-white text-black">
      <div className="mx-auto flex min-h-[58px] w-full max-w-[760px] items-center justify-between gap-5 px-6 py-1">
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
            className="h-auto w-[188px] object-contain sm:w-[250px]"
          />
        </Link>
        <p className="text-right text-[15px] font-semibold leading-tight tracking-[-0.02em]">
          há mais para entender.
        </p>
      </div>
    </header>
  );
}
