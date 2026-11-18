"use client";

import { useEffect, useRef, useState } from "react";

export function RecadoPoliticoFormulario({ destinatario = "politico" }: { destinatario?: "politico" | "projeto" | "comunidade" }) {
  const [texto, setTexto] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState("");
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

  function pararGravacao() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  return <div className="mt-7 rounded-xl border border-[#344760] bg-[#24334b] p-5">
    <label htmlFor="texto-recado" className="block font-semibold">Seu recado</label>
    <textarea id="texto-recado" value={texto} onChange={e => setTexto(e.target.value)}
      maxLength={2000} rows={5} placeholder="Escreva aqui sua mensagem..."
      className="mt-3 w-full rounded-lg border border-slate-500 bg-white p-3 text-base text-black" />
    <p className="mt-1 text-right text-xs text-slate-300">{texto.length}/2000</p>
    <div className="mt-4">
      <p className="mb-2 font-semibold">Ou grave um áudio</p>
      {gravando
        ? <button type="button" onClick={pararGravacao} className="rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black">Parar gravação</button>
        : <button type="button" onClick={() => void iniciarGravacao()} className="rounded-lg bg-slate-100 px-4 py-3 font-bold text-black">Gravar áudio</button>}
      {audioUrl && <div className="mt-3 space-y-2">
        <audio controls src={audioUrl} className="w-full" aria-label="Ouvir gravação" />
        <button type="button" onClick={limparAudio} className="text-sm underline">Descartar áudio e gravar novamente</button>
      </div>}
      {erro && <p role="alert" className="mt-2 text-sm text-red-200">{erro}</p>}
    </div>
    <button type="button" disabled className="mt-6 w-full rounded-lg bg-slate-500 px-5 py-3 font-bold text-white opacity-70">Mandar</button>
    <p className="mt-3 text-sm text-slate-200">{destinatario === "politico" ? "Envio ainda indisponível: precisamos confirmar o mandato em exercício e o contato oficial." : destinatario === "comunidade" ? "Publicação ainda indisponível: será necessária moderação antes de compartilhar com a comunidade." : "Envio ainda indisponível: estamos preparando o recebimento seguro pelo Fora da Pauta."} O texto e o áudio permanecem somente nesta tela e não foram enviados.</p>
  </div>;
}
