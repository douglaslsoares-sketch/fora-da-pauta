"use client";

import { useEffect } from "react";

export function InterceptarRetornoMenu() {
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const link = alvo.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || link.target === "_blank") return;
      const destino = new URL(link.href);
      if (destino.origin !== window.location.origin || destino.pathname !== "/central") return;
      evento.preventDefault();
      window.sessionStorage.setItem("fdp.retornoMenuAnimado", "1");
      window.location.assign("/#menu");
    }
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);
  return null;
}
