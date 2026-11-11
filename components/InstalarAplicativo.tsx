"use client";

import { useEffect, useState } from "react";

type EventoInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstalarAplicativo({ tema = "escuro", oculto = false }: { tema?: "escuro" | "claro"; oculto?: boolean }) {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [instrucoes, setInstrucoes] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const jaInstalado = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setInstalado(jaInstalado);
    const disponivel = (event: Event) => {
      event.preventDefault();
      setEvento(event as EventoInstalacao);
    };
    const instaladoAgora = () => { setInstalado(true); setEvento(null); setInstrucoes(false); };
    window.addEventListener("beforeinstallprompt", disponivel);
    window.addEventListener("appinstalled", instaladoAgora);
    return () => {
      window.removeEventListener("beforeinstallprompt", disponivel);
      window.removeEventListener("appinstalled", instaladoAgora);
    };
  }, []);

  async function instalar() {
    if (!evento) { setInstrucoes((anterior) => !anterior); return; }
    await evento.prompt();
    const escolha = await evento.userChoice;
    setEvento(null);
    if (escolha.outcome !== "accepted") setInstrucoes(true);
  }

  if (instalado || oculto) return null;
  return (
    <div className="mt-7 w-full">
      <button type="button" onClick={() => void instalar()}
        className={`flex min-h-14 w-full items-center justify-center rounded-lg border px-5 py-3 text-center font-semibold ${tema === "claro" ? "border-black/25 bg-white text-black" : "border-white/35 text-white"}`}>
        Instalar o EU VIGIO <span aria-hidden="true" className="ml-2">→</span>
      </button>
      {instrucoes ? (
        <p className={`mt-3 text-sm leading-6 ${tema === "claro" ? "text-black/70" : "text-white/80"}`} role="status">
          Para colocar o EU VIGIO na tela inicial, abra o menu do navegador e escolha
          “Instalar aplicativo” ou “Adicionar à tela inicial”.
          No iPhone, use Compartilhar e depois “Adicionar à Tela de Início”.
        </p>
      ) : null}
    </div>
  );
}
