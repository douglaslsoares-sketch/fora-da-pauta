"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Guarda somente o último percurso interno desta aba, sem destinos externos. */
export function RegistrarOrigemNavegacao() {
  const pathname = usePathname();
  const anterior = useRef<string | null>(null);
  useEffect(() => {
    try {
      const anteriorNaAba = anterior.current;
      if (anteriorNaAba && anteriorNaAba !== pathname) {
        sessionStorage.setItem("fdp-navegacao-origem", anteriorNaAba);
        sessionStorage.setItem("fdp-navegacao-atual", pathname);
      } else if (!anteriorNaAba) {
        // Uma entrada direta não deve herdar a origem de outra visita.
        sessionStorage.removeItem("fdp-navegacao-origem");
        sessionStorage.setItem("fdp-navegacao-atual", pathname);
      }
    } catch { /* Navegação funciona mesmo sem armazenamento. */ }
    anterior.current = pathname;
  }, [pathname]);
  return null;
}
