"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PreLaunchHeaderLink() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="border-t border-black/10 py-2.5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.04em] text-black/65 transition hover:text-black"
      >
        <span className="text-[#946b00]">
          Página inicial
        </span>
        <span aria-hidden="true">—</span>
        <span>Veja todas as publicações</span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
