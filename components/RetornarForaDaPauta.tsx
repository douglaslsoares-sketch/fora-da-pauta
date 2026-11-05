"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Fecha a página interna e volta à home, que identifica a inscrição pelo Telegram. */
export function RetornarForaDaPauta() {
  const [acessoExterno, setAcessoExterno] = useState(false);

  useEffect(() => {
    // Quem chega diretamente a uma edição compartilhada recebe um convite
    // para conhecer o projeto, em vez de um simples "Fechar".
    if (!window.location.pathname.startsWith("/campanhas/")) return;
    let veioDoSite = false;
    try {
      veioDoSite = Boolean(document.referrer) &&
        new URL(document.referrer).origin === window.location.origin;
    } catch {
      veioDoSite = false;
    }
    const navegacaoInterna = typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0;
    setAcessoExterno(!veioDoSite && !navegacaoInterna);
  }, []);

  return (
    <Link
      href="/"
      aria-label={acessoExterno ? "Acesse o Fora da Pauta" : "Fechar e ir para a página inicial"}
      className="mx-auto mt-7 flex min-h-14 w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      {acessoExterno ? "Acesse o Fora da Pauta" : "Fechar"}
    </Link>
  );
}
