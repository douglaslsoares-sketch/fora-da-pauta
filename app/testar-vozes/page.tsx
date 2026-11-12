"use client";

import { useEffect, useRef, useState } from "react";

const VOZES = [
  { id: "marin", titulo: "Feminina — Marin" },
  { id: "nova", titulo: "Feminina — Nova" },
  { id: "onyx", titulo: "Masculina — Onyx" },
  { id: "echo", titulo: "Masculina — Echo" },
] as const;

const TEXTO = "Você já parou para pensar em quem decide quais notícias chegam até você? Todos os dias, acontecimentos importantes afetam a nossa vida. Mas nem sempre conhecemos os interesses que estão por trás dessas decisões.";

export default function TestarVozes() {
  const [tocando, setTocando] = useState<string | null>(null);
  const [preparando, setPreparando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const cacheRef = useRef(new Map<string, Blob>());
  const sequenciaRef = useRef(0);

  useEffect(() => () => {
    sequenciaRef.current++;
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  async function ouvir(voz: string) {
    const sequencia = ++sequenciaRef.current;
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setTocando(null);
    setErro("");
    setPreparando(voz);
    try {
      let blob = cacheRef.current.get(voz);
      if (!blob) {
        const resposta = await fetch("/api/audio/ler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: TEXTO, estrutura: ["paragrafo"], continua: false, voz }),
        });
        if (!resposta.ok) throw new Error("Não foi possível preparar esta voz.");
        blob = await resposta.blob();
        cacheRef.current.set(voz, blob);
      }
      if (sequencia !== sequenciaRef.current) return;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (sequencia === sequenciaRef.current) setTocando(null);
      };
      setPreparando(null);
      await audio.play();
      setTocando(voz);
    } catch {
      if (sequencia === sequenciaRef.current) setErro("Não foi possível reproduzir o áudio. Tente novamente.");
    } finally {
      if (sequencia === sequenciaRef.current) setPreparando(null);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Experimente as vozes</h1>
      <p>Fora da Pauta — teste de narração natural</p>
      <p>Ouça o mesmo texto com quatro vozes diferentes. Nenhuma delas altera a voz oficial do site.</p>
      <blockquote style={{ borderLeft: "4px solid #e6b800", margin: "24px 0", padding: "8px 16px", lineHeight: 1.6 }}>{TEXTO}</blockquote>
      <div style={{ display: "grid", gap: 12 }}>
        {VOZES.map(({ id, titulo }) => (
          <button key={id} type="button" onClick={() => void ouvir(id)}
            style={{ background: tocando === id ? "#f3c62f" : "#111", color: tocando === id ? "#111" : "#fff", border: "1px solid #888", padding: "17px 14px", fontSize: 17, borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
            {preparando === id ? "Preparando o áudio…" : tocando === id ? "▶ Ouvindo — " + titulo : "▶ Ouvir — " + titulo}
          </button>
        ))}
      </div>
      {erro && <p role="alert" style={{ color: "#b91c1c" }}>{erro}</p>}
      <p style={{ marginTop: 24, fontSize: 14 }}>A voz escolhida será avaliada depois em uma leitura completa, para verificar a uniformidade do começo ao fim.</p>
    </main>
  );
}
