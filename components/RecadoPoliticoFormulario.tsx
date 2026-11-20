"use client";

import { useEffect, useRef, useState } from "react";

export function RecadoPoliticoFormulario({ destinatario = "politico" }: { destinatario?: "politico" | "projeto" | "comunidade" }) {
  const [texto, setTexto] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [transcrevendo, setTranscrevendo] = useState(false);
  const [audioGravado, setAudioGravado] = useState<Blob | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [protocolo, setProtocolo] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach(track => track.stop());
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  function limparAudio() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setAudioGravado(null);
  }

  async function transcreverAudio(blob: Blob) {
    setTranscrevendo(true);
    setErro("");
    try {
      if (blob.size > 3 * 1024 * 1024) throw Error("O áudio ficou grande demais. Grave uma mensagem mais curta.");
      const tipo = blob.type.split(";")[0] || "audio/webm";
      const extensao = tipo.includes("mp4") ? "mp4" : tipo.includes("ogg") ? "ogg" : "webm";
      const dados = new FormData();
      dados.append("audio", blob, "recado." + extensao);
      const resposta = await fetch("/api/audio/transcrever", { method: "POST", body: dados });
      const resultado = await resposta.json() as { text?: string; error?: string };
      if (!resposta.ok || !resultado.text?.trim()) throw Error(resultado.error || "Não foi possível transcrever. Tente novamente.");
      const textoTranscrito = resultado.text.trim();
      if (textoTranscrito.length > 2000) throw Error("A transcrição excedeu 2.000 caracteres. Grave um recado mais curto.");
      if (texto.length + textoTranscrito.length + (texto.trim() ? 1 : 0) > 2000) throw Error("O recado ultrapassaria 2.000 caracteres. Reduza o texto antes de transcrever.");
      setTexto(anterior => anterior.trim() ? anterior.trim() + "\n" + textoTranscrito : textoTranscrito);
      setAudioUrl(atual => { if (atual) URL.revokeObjectURL(atual); return null; });
      audioUrlRef.current = null;
      setAudioGravado(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível transcrever. Você pode tentar novamente ou escrever o recado.");
    } finally {
      setTranscrevendo(false);
    }
  }

  async function iniciarGravacao() {
    setErro("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErro("Este navegador não permite gravar áudio.");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      limparAudio();
      chunks.current = [];
      const gravador = new MediaRecorder(media);
      recorder.current = gravador;
      gravador.ondataavailable = event => { if (event.data.size) chunks.current.push(event.data); };
      gravador.onstop = () => {
        const blob = new Blob(chunks.current, { type: gravador.mimeType || "audio/webm" });
        if (blob.size) {
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;
          setAudioUrl(url);
          setAudioGravado(blob);
          void transcreverAudio(blob);
        }
        media.getTracks().forEach(track => track.stop());
        stream.current = null;
        setGravando(false);
      };
      gravador.start();
      setGravando(true);
    } catch {
      setErro("Não foi possível acessar o microfone. Confira a permissão do navegador.");
    }
  }

  async function mandar() {
    if (destinatario === "politico" || !texto.trim() || enviando || audioUrl || gravando || transcrevendo) return;
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/recados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinatario, texto: texto.trim() }) });
      const dados = await resposta.json() as { protocolo?: string; erro?: string };
      if (!resposta.ok || !dados.protocolo) throw Error(dados.erro || "Não foi possível registrar o recado.");
      setProtocolo(dados.protocolo);
      setTexto("");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha no envio."); }
    finally { setEnviando(false); }
  }

  function pararGravacao() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  return <div className="mt-7 rounded-xl border border-[#344760] bg-[#24334b] p-5">
    <label htmlFor="texto-recado" className="block font-semibold">Seu recado</label>
    <textarea id="texto-recado" value={texto} onChange={e => setTexto(e.target.value)}
      maxLength={2000} rows={4} placeholder="Escreva aqui sua mensagem..."
      className="mt-3 min-h-[112px] w-full resize-y rounded-lg border border-slate-500 bg-white p-3 text-base text-black" />
    <p className="mt-1 text-right text-xs text-slate-300">{texto.length}/2000</p>
    <div className="mt-4">
      <p className="mb-2 font-semibold">Ou grave um áudio</p>
      {gravando
        ? <button type="button" onClick={pararGravacao} className="rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black">Parar gravação</button>
        : <button type="button" onClick={() => void iniciarGravacao()} disabled={transcrevendo} className="rounded-lg bg-[#075cf0] px-4 py-3 font-bold text-white hover:bg-[#0050d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 disabled:opacity-60">Gravar áudio</button>}
      {transcrevendo && <p role="status" className="mt-3 text-sm text-yellow-200">Transcrevendo o áudio...</p>}
      {audioUrl && <div className="mt-3 space-y-2">
        <audio controls src={audioUrl} className="w-full" aria-label="Ouvir gravação" />
        <div className="flex flex-wrap gap-4"><button type="button" disabled={transcrevendo || !audioGravado} onClick={() => { if (audioGravado) void transcreverAudio(audioGravado); }} className="text-sm font-bold text-yellow-200 underline">Tentar transcrição novamente</button><button type="button" disabled={transcrevendo} onClick={limparAudio} className="text-sm underline">Descartar áudio e gravar novamente</button></div>
      </div>}
      {erro && <p role="alert" className="mt-2 text-sm text-red-200">{erro}</p>}
    </div>
    <button type="button" onClick={() => void mandar()} disabled={destinatario === "politico" || !texto.trim() || !!audioUrl || gravando || enviando || transcrevendo} className="mt-6 w-full rounded-lg bg-[#075cf0] px-5 py-3 font-bold text-white hover:bg-[#0050d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-70">{enviando ? "Enviando..." : "Mandar"}</button>
    {protocolo && <p role="status" className="mt-3 rounded-lg bg-green-950 p-3 text-sm text-green-100">Recado recebido para análise. Protocolo: <strong className="break-all">{protocolo}</strong>. Isso não significa que tenha sido publicado ou encaminhado.</p>}
    {audioUrl && destinatario !== "politico" && <p className="mt-2 text-xs text-yellow-200">Confira o texto transcrito antes de enviar. Se a transcrição falhar, tente novamente ou escreva sua mensagem.</p>}
    <p className="mt-3 text-sm leading-relaxed text-slate-200">{destinatario === "politico" ? "Envio indisponível até verificarmos o mandato e o contato oficial." : destinatario === "comunidade" ? "Recados escritos são recebidos para moderação, sem publicação automática." : "Recados escritos são registrados para análise do Fora da Pauta."} {destinatario === "politico" ? "Nenhum recado foi enviado." : "O áudio é transcrito em texto para revisão antes do envio; a gravação não é enviada."}</p>
  </div>;
}
