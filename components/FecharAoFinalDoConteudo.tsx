"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

export function FecharAoFinalDoConteudo() {
  const pathname = usePathname();
  const router = useRouter();
  const [destino, setDestino] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) { setDestino(null); return; }
    const conteudo = (main.lastElementChild instanceof HTMLElement ? main.lastElementChild : main) as HTMLElement;
    const jaTemFechar = Array.from(conteudo.querySelectorAll("button,a")).some(el => /^(✕\s*)?fechar$/i.test((el.textContent || "").trim()));
    setDestino(jaTemFechar ? null : conteudo);
  }, [pathname]);
  if (!destino || pathname === "/" || pathname === "/minhas-escolhas" || pathname === "/ha-mais-para-entender" || pathname.startsWith("/admin/") || pathname.startsWith("/api/")) return null;
  return createPortal(<div className="mt-8 flex justify-center pb-5"><button type="button" onClick={() => router.push(pathname.startsWith("/campanhas/") ? "/edicoes" : "/ha-mais-para-entender")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white"><span aria-hidden="true">✕</span> Fechar</button></div>, destino);
}
