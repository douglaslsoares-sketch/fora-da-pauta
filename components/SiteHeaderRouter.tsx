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
    pathname.startsWith("/pessoas/");

  if (!isCandidateRoute) {
    return <>{children}</>;
  }

  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex min-h-[80px] w-full max-w-[760px] items-center justify-between gap-5 px-6 py-2">
        <Link
          href="/"
          aria-label="Fora da Pauta — página inicial"
          className="shrink-0"
        >
          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={72}
            height={72}
            priority
            className="h-14 w-14 object-contain"
          />
        </Link>
        <p className="text-right text-[15px] font-semibold leading-tight tracking-[-0.02em]">
          há mais para entender.
        </p>
      </div>
    </header>
  );
}
