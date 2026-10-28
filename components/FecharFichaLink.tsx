"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Retorna para a página de origem quando a ficha foi aberta pelo site.
 * Se o acesso foi direto (ex.: Telegram), o link abre Fique de Olho.
 */
export function FecharFichaLink() {
  const router = useRouter();

  function fechar(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const indiceHistorico = window.history.state?.idx;
    let origemNoSite = false;

    try {
      origemNoSite = Boolean(document.referrer) &&
        new URL(document.referrer).origin === window.location.origin;
    } catch {
      // A página também pode ter sido acessada diretamente.
    }

    if ((typeof indiceHistorico === "number" && indiceHistorico > 0) ||
        (origemNoSite && window.history.length > 1)) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href="/votou-fique-de-olho"
      onClick={fechar}
      className="font-semibold underline underline-offset-4"
    >
      ← Fechar ficha
    </Link>
  );
}
