"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * A ficha aberta em outra aba deve devolver o visitante à pesquisa,
 * que permanece intacta na aba anterior. A query `aba=separada`
 * é usada somente nos links "Ver ficha" que abrem em outra aba.
 *
 * No acesso direto (ex.: Telegram), mantém a navegação normal do site.
 */
export function FecharFichaLink() {
  const router = useRouter();
  const [fechamentoBloqueado, setFechamentoBloqueado] = useState(false);

  function fechar(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get("origem") === "minhas") {
      event.preventDefault();
      router.push("/votou-fique-de-olho?minhas=1");
      return;
    }

    const abertaEmAbaSeparada = new URLSearchParams(window.location.search).get("aba") === "separada";
    if (abertaEmAbaSeparada) {
      event.preventDefault();
      setFechamentoBloqueado(false);
      // Alguns navegadores só deixam fechar abas abertas por um clique em link.
      // Se houver bloqueio, não navegue na aba atual: oriente o fechamento manual,
      // preservando o resultado da busca na aba anterior.
      window.close();
      window.setTimeout(() => {
        if (!window.closed) setFechamentoBloqueado(true);
      }, 300);
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
    <div className="space-y-3">
      <Link
        href="/votou-fique-de-olho"
        onClick={fechar}
        className="font-semibold underline underline-offset-4"
      >
        ← Fechar ficha
      </Link>
      {fechamentoBloqueado ? (
        <p role="status" className="max-w-xl text-sm leading-6 text-black/70">
          Seu navegador não permitiu fechar esta aba automaticamente.
          Feche esta aba pelo X na parte superior do Chrome para voltar à pesquisa,
          que permanece aberta na aba anterior.
        </p>
      ) : null}
    </div>
  );
}
