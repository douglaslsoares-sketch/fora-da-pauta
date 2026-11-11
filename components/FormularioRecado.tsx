"use client";

import { useEffect, useRef, useState } from "react";

type Resultado = { isFinal: boolean; 0: { transcript: string } };
type Reconhecimento = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { results: ArrayLike<Resultado> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void; stop(): void; abort(): void;
};
type JanelaVoz = Window & { SpeechRecognition?: new () => Reconhecimento; webkitSpeechRecognition?: new () => Reconhecimento };

export function FormularioRecado({ candidaturaId }: { candidaturaId: string }) {
  const [mensagem, setMensagem] = useState("");
  const [gravando, setGravando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus] = useState("");
  const [suporte, setSuporte] = useState(false);
  const reconhecimento = useRef<Reconhecimento | null>(null);
  const base = useRef("");
  useEffect(() => {
    const janela = window as JanelaVoz;
    setSuporte(Boolean(janela.SpeechRecognition || janela.webkitSpeechRecognition));
    return () => { reconhecimento.current?.abort(); reconhecimento.current = null; };
  }, []);

  function alternarGravacao() {
    if (reconhecimento.current) {
      reconhecimento.current.stop();
      setGravando(false);
      return;
    }
    const janela = window as JanelaVoz;
    const Criador = janela.SpeechRecognition || janela.webkitSpeechRecognition;
    if (!Criador) { setStatus("Seu navegador não permite ditar o recado. Escreva no campo acima."); return; }
    const rec = new Criador();
    base.current = mensagem.trim();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (evento) => {
      let transcricao = "";
      for (let i = 0; i < evento.results.length; i++) {
        if (evento.results[i].isFinal) transcricao += " " + evento.results[i][0].transcript;
      }
      setMensagem([base.current, transcricao.trim()].filter(Boolean).join(" ").slice(0, 2000));
    };
    rec.onerror = () => setStatus("Não foi possível usar o microfone. Você pode escrever o recado.");
    rec.onend = () => { reconhecimento.current = null; setGravando(false); };
    try { reconhecimento.current = rec; rec.start(); setGravando(true); setStatus("Microfone ligado. Fale seu recado e toque em Parar."); }
    catch { reconhecimento.current = null; setStatus("Não foi possível iniciar o microfone."); }
  }

  async function mandar() {
    if (enviando || gravando || mensagem.trim().length < 15) {
      setStatus("Escreva ou dite um recado de pelo menos 15 caracteres.");
      return;
    }
    setEnviando(true);
    setStatus("");
    try {
      const resposta = await fetch("/api/interacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidaturaId, categoria: "pergunta", mensagem: mensagem.trim(),
          consentiu: true, origemCaminho: `/conheca-seu-candidato/${candidaturaId}`,
        }),
      });
      const dados = await resposta.json() as { recebido?: boolean; erro?: string; protocolo?: string };
      if (!resposta.ok || !dados.recebido) throw new Error(dados.erro || "Não foi possível registrar o recado.");
      setStatus("Recado recebido pelo Fora da Pauta para análise. Ainda não foi encaminhado ao político.");
      setMensagem("");
    } catch (erro) {
      setStatus(erro instanceof Error ? erro.message : "Não foi possível registrar o recado.");
    } finally { setEnviando(false); }
  }

  return (
    <div className="mt-5">
      <label htmlFor="recado-politico" className="sr-only">Escreva seu recado</label>
      <textarea id="recado-politico" value={mensagem} onChange={e => setMensagem(e.target.value)}
        maxLength={2000} rows={6} placeholder="Escreva seu recado aqui..."
        className="w-full rounded-xl border border-black/25 p-4 text-base text-black" />
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={alternarGravacao} disabled={!suporte || enviando}
          aria-pressed={gravando}
          className={`min-h-12 flex-1 rounded-lg px-3 py-3 font-semibold text-white disabled:opacity-50 ${gravando ? "bg-red-700" : "bg-zinc-800"}`}>
          {gravando ? "■ Parar" : "🎙 Gravar recado"}
        </button>
        <button type="button" onClick={() => void mandar()} disabled={enviando || gravando}
          className="min-h-12 flex-1 rounded-lg bg-[#FFD700] px-3 py-3 font-bold text-black disabled:opacity-50">
          {enviando ? "Mandando..." : "Mandar"}
        </button>
      </div>
      {status ? <p role="status" className="mt-3 text-sm text-black/70">{status}</p> : null}
    </div>
  );
}
