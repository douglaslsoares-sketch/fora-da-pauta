"use client";

import { useEffect } from "react";

export function RetornoMenu() {
  useEffect(() => {
    const chave = "fdp.retornoMenuAnimado";
    if (window.location.hash !== "#menu") return;
    const animar = window.sessionStorage.getItem(chave) === "1";
    window.sessionStorage.removeItem(chave);
    if (!animar) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzir) return;
    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    const id = window.setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
