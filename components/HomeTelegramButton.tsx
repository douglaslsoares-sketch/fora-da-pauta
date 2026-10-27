"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  className: string;
  textClassName: string;
  arrowClassName: string;
};

/**
 * A inscrição só é reconhecida após consulta à sessão vinculada ao Telegram.
 * Sem sessão confirmada (ou com erro), mantém o convite existente.
 * O destino é o mesmo fluxo, que já recupera as escolhas de quem está inscrito.
 */
export function HomeTelegramButton({ className, textClassName, arrowClassName }: Props) {
  const [inscrito, setInscrito] = useState(false);

  useEffect(() => {
    let ativo = true;
    const controller = new AbortController();

    async function atualizarSituacao() {
      try {
        const resposta = await fetch("/api/telegram/sessao", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!resposta.ok) return;
        const dados = (await resposta.json()) as { ativo?: boolean };
        if (ativo) setInscrito(dados.ativo === true);
      } catch {
        // Não presume inscrição quando não foi possível confirmar a sessão.
      }
    }

    void atualizarSituacao();
    window.addEventListener("focus", atualizarSituacao);
    return () => {
      ativo = false;
      controller.abort();
      window.removeEventListener("focus", atualizarSituacao);
    };
  }, []);

  return (
    <Link href="/votou-fique-de-olho" className={className}>
      <span className={textClassName}>
        {inscrito ? "Fique de olho" : "Receba novidades pelo Telegram"}
      </span>
      <span className={arrowClassName} aria-hidden="true">→</span>
    </Link>
  );
}
