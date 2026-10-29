"use client";

import { useEffect, useRef, useState } from "react";

type Leitura = { rootSelector: string; title: string };
type Situacao = "inativa" | "lendo" | "pausada" | "concluida" | "indisponivel" | "erro";

/**
 * Somente a prévia editorial utiliza este leitor.
 * Não envia texto ao servidor nem substitui a narração neural da publicação.
 */
export function PreviewAudioReader() {
  const [situacao, setSituacao] = useState<Situacao>("inativa");
  const [atual, setAtual] = useState(0);
  const [total, setTotal] = useState(0);
  const sequencia = useRef(0);
  const [velocidade, setVelocidade] = useState(1.75);
  const velocidadeRef = useRef(1.75);
  const [reiniciarAviso, setReiniciarAviso] = useState(false);
  const [vozEmUso, setVozEmUso] = useState("");

  useEffect(() => {
    function iniciar(evento: Event) {
      const detail = (evento as CustomEvent<Leitura>).detail;
      if (!detail?.rootSelector) return;
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        setSituacao("indisponivel");
        return;
      }

      const raiz = document.querySelector(detail.rootSelector);
      if (!raiz) {
        setSituacao("erro");
        return;
      }

      const paragrafos = Array.from(raiz.querySelectorAll<HTMLElement>("h2, p"))
        .filter(elemento => !elemento.closest("[data-editorial-ignore]"))
        .map(elemento => (elemento.innerText || elemento.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean);

      const partes = [detail.title, ...paragrafos];
      // Prioriza vozes naturais em português brasileiro quando disponíveis.
      const vozesPtBr = window.speechSynthesis.getVoices()
        .filter(voz => voz.lang.toLowerCase().replace("_", "-").startsWith("pt-br"));
      const vozPreferida = vozesPtBr.find(voz => /online|natural|neural|enhanced|google/i.test(voz.name))
        ?? vozesPtBr.find(voz => voz.default)
        ?? vozesPtBr[0];
      setVozEmUso(vozPreferida?.name ?? "Padrão do navegador");
      const id = ++sequencia.current;
      window.speechSynthesis.cancel();
      setAtual(0);
      setTotal(partes.length);
      setSituacao("lendo");
      setReiniciarAviso(false);

      function falar(indice: number) {
        if (sequencia.current !== id) return;
        if (indice >= partes.length) {
          setAtual(partes.length);
          setSituacao("concluida");
          return;
        }
        setAtual(indice + 1);
        const fala = new SpeechSynthesisUtterance(partes[indice]);
        fala.lang = "pt-BR";
        if (vozPreferida) fala.voice = vozPreferida;
        fala.rate = velocidadeRef.current;
        fala.onend = () => falar(indice + 1);
        fala.onerror = () => {
          if (sequencia.current === id) setSituacao("erro");
        };
        window.speechSynthesis.speak(fala);
      }

      falar(0);
    }

    window.addEventListener("fdp:preview-audio-start", iniciar);
    return () => {
      window.removeEventListener("fdp:preview-audio-start", iniciar);
      sequencia.current++;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function alterarVelocidade(nova: number) {
    velocidadeRef.current = nova;
    setVelocidade(nova);
    // A Web Speech API não altera a velocidade de uma fala já iniciada.
    // O novo ritmo entra no próximo parágrafo, sem interromper a leitura.
    setReiniciarAviso(true);
  }

  function alternarPausa() {
    if (!("speechSynthesis" in window)) return;
    if (situacao === "pausada") {
      window.speechSynthesis.resume();
      setSituacao("lendo");
    } else {
      window.speechSynthesis.pause();
      setSituacao("pausada");
    }
  }

  function parar() {
    sequencia.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSituacao("inativa");
    setAtual(0);
    setTotal(0);
  }

  if (situacao === "inativa") return null;

  return (
    <aside role="status" aria-live="polite" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl border border-black/20 bg-white p-4 text-black shadow-xl sm:inset-x-6">
      <p className="text-sm font-semibold">Áudio de demonstração — voz do seu navegador</p>
      {situacao === "lendo" || situacao === "pausada" ? (
        <>
          <p className="mt-1 text-xs text-black/65">{situacao === "pausada" ? "Leitura pausada" : "Lendo"} · trecho {atual} de {total}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="velocidade-previa" className="text-sm font-medium">Velocidade</label>
            <select id="velocidade-previa" value={velocidade} onChange={evento => alterarVelocidade(Number(evento.target.value))} className="min-h-11 rounded-lg border border-black/30 bg-white px-3 py-2 text-sm">
              <option value={1}>Normal (1×)</option>
              <option value={1.25}>1,25×</option>
              <option value={1.5}>Rápida (1,5×)</option>
              <option value={1.6}>Conversada rápida (1,6×)</option>
              <option value={1.75}>Conversada rápida (1,75×) — padrão</option>
              <option value={2}>Muito rápida (2×)</option>
            </select>
          </div>
          {reiniciarAviso ? <p className="mt-1 text-xs text-black/60">A nova velocidade será aplicada a partir do próximo parágrafo.</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={alternarPausa} className="min-h-11 rounded-lg bg-black px-4 py-2 font-semibold text-white">
              {situacao === "pausada" ? "Continuar" : "Pausar"}
            </button>
            <button type="button" onClick={parar} className="min-h-11 rounded-lg border border-black/30 px-4 py-2 font-semibold">Parar</button>
          </div>
        </>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-black/70">{situacao === "concluida" ? "Leitura concluída." : situacao === "indisponivel" ? "Este navegador não oferece leitura por voz." : "Não foi possível iniciar a leitura. Tente novamente."}</p>
          <button type="button" onClick={parar} className="mt-2 min-h-11 rounded-lg border border-black/30 px-4 py-2 font-semibold">Fechar</button>
        </div>
      )}
      <p className="mt-3 text-xs text-black/55">Voz: {vozEmUso || "do navegador"}. A naturalidade depende do navegador. O áudio definitivo usará a narração neural do Fora da Pauta.</p>
    </aside>
  );
}
