"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PreLaunchHeaderLink() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="border-t border-white/15 py-2.5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.04em] text-white/60 transition hover:text-white"
      >
        <span className="text-[#FFC400]">
          Pré-lançamento
        </span>

        <span aria-hidden="true">—</span>

        <span>
          Conheça o Fora da Pauta
        </span>

        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}