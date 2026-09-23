"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex min-h-[78px] w-full max-w-7xl items-center px-5 sm:px-8 lg:px-10">
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
      </div>
    </header>
  );
}