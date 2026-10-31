"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SituacaoTelegram = { ativo?: boolean };

export function ConviteTelegramArtigo() {
  // Nao pressupoe que o leitor seja visitante: aguarda a sessao confirmada.
  const [mostrarConvite, setMostrarConvite] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarInscricao() {
      try {
        const resposta = await fetch("/api/telegram/sessao", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!resposta.ok) throw new Error("Sessao indisponivel");
        const situacao = (await resposta.json()) as SituacaoTelegram;
        if (ativo) setMostrarConvite(situacao.ativo === false);
      } catch {
        // Quando a sessao nao pode ser verificada, evita convite indevido.
        if (ativo) setMostrarConvite(false);
      }
    }

    const aoFocar = () => { void verificarInscricao(); };
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void verificarInscricao();
    };
    void verificarInscricao();
    window.addEventListener("focus", aoFocar);
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", aoFocar);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  if (!mostrarConvite) return null;

  return (
    <section aria-labelledby="acompanhar-artigo-telegram" className="mt-12 rounded-2xl border border-black/15 bg-[#f6f6f3] px-5 py-7 text-black sm:p-8">
      <h2 id="acompanhar-artigo-telegram" className="text-2xl font-bold tracking-tight">
        Quer receber os próximos artigos?
      </h2>
      <p className="mt-3 text-base leading-7 text-black/70">
        Acompanhe o Fora da Pauta pelo Telegram e receba um aviso quando uma nova edição for publicada.
      </p>
      <Link
        href="/votou-fique-de-olho"
        className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#FFD700] px-5 py-3 text-center text-base font-bold text-black hover:bg-[#ebc700]"
      >
        Quero acompanhar pelo Telegram
      </Link>
    </section>
  );
}
