"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = { aberta: boolean; onFechar: () => void; contexto: "secao" | "politico" };

export function InscricaoNecessariaModal({ aberta, onFechar, contexto }: Props) {
  const fecharRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!aberta) return;
    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const transbordamentoAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => fecharRef.current?.focus());
    const teclado = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFechar();
      if (event.key !== "Tab") return;
      const dialogo = fecharRef.current?.closest('[role="dialog"]');
      if (!dialogo) return;
      const controles = Array.from(dialogo.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
      const primeiro = controles[0], ultimo = controles[controles.length - 1];
      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo?.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro?.focus();
      }
    };
    document.addEventListener("keydown", teclado);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", teclado);
      document.body.style.overflow = transbordamentoAnterior;
      focoAnterior?.focus();
    };
  }, [aberta, onFechar]);
  if (!aberta) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) onFechar(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="aviso-inscricao-titulo"
        aria-describedby="aviso-inscricao-descricao"
        className="relative w-full max-w-[420px] rounded-2xl bg-white px-6 pb-6 pt-12 text-center text-black shadow-2xl">
        <button ref={fecharRef} type="button" onClick={onFechar} aria-label="Fechar aviso"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-black/10 focus-visible:outline-2">×</button>
        <h2 id="aviso-inscricao-titulo" className="text-xl font-bold">Inscrição necessária</h2>
        <p id="aviso-inscricao-descricao" className="mt-4 text-base leading-7">
          {contexto === "politico"
            ? "Para acompanhar este político, você precisa estar inscrito no Fora da Pauta pelo Telegram."
            : "Para acessar esta seção, você precisa estar inscrito no Fora da Pauta pelo Telegram."}
        </p>
        <p className="mt-3 text-base leading-7">
          Volte à home e toque em <strong>Quero acompanhar também</strong> para realizar sua inscrição.
        </p>
        <Link href="/" className="mt-6 inline-flex min-h-12 items-center justify-center px-5 font-semibold text-blue-800 underline underline-offset-4">
          Ir para home
        </Link>
      </div>
    </div>
  );
}
