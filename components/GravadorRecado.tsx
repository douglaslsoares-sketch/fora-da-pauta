"use client";
import { useEffect, useRef, useState } from "react";

export function GravadorRecado({ nome, email }: { nome: string; email: string }) {
  const gravador = useRef<MediaRecorder | null>(null);
  const fluxo = useRef<MediaStream | null>(null);
  const partes = useRef<Blob[]>([]);
  const [gravando, setGravando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [aviso, setAviso] = useState("");
  const [compartilhando, setCompartilhando] = useState(false);
  useEffect(() => () => { gravador.current?.state === "recording" && gravador.current.stop(); fluxo.current?.getTracks().forEach(t => t.stop()); }, []);
  useEffect(() => { if (!arquivo) { setUrl(""); return; } const u = URL.createObjectURL(arquivo); setUrl(u); return () => URL.revokeObjectURL(u); }, [arquivo]);
  async function iniciar() {
    setAviso("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setAviso("Este navegador não permite gravar áudio. Tente abrir no Chrome."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      fluxo.current = stream;
      const formato = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(t => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, formato ? { mimeType: formato } : undefined);
      partes.current = [];
      rec.ondataavailable = e => { if (e.data.size) partes.current.push(e.data); };
      rec.onstop = () => {
        const tipo = rec.mimeType || "audio/webm";
        const ext = tipo.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(partes.current, { type: tipo });
        if (blob.size) setArquivo(new File([blob], "recado-politico." + ext, { type: tipo }));
        stream.getTracks().forEach(t => t.stop());
        fluxo.current = null;
        setGravando(false);
      };
      rec.onerror = () => { setAviso("Não foi possível concluir a gravação."); stream.getTracks().forEach(t => t.stop()); setGravando(false); };
      gravador.current = rec;
      rec.start();
      setArquivo(null);
      setGravando(true);
    } catch { setAviso("Para gravar, permita o uso do microfone no navegador."); }
  }
  function parar() { if (gravador.current?.state === "recording") gravador.current.stop(); }
  async function mandar() {
    if (!arquivo || compartilhando) return;
    setCompartilhando(true); setAviso("");
    try {
      const dados = { files: [arquivo], title: "Recado para " + nome, text: "Recado para " + nome + ". Contato institucional: " + email };
      if (!navigator.share || !navigator.canShare?.({ files: [arquivo] })) {
        setAviso("O celular não permite mandar o áudio diretamente daqui. Baixe a gravação e anexe-a a uma mensagem para " + email + ". O recado ainda não foi mandado.");
        return;
      }
      await navigator.share(dados);
      setAviso("O compartilhamento foi aberto. Confirme o envio no aplicativo escolhido; o Fique de Olho não consegue verificar a entrega.");
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setAviso("Não foi possível compartilhar o áudio. Você pode baixá-lo e mandar pelo canal oficial."); }
    finally { setCompartilhando(false); }
  }
  return <section className="mt-8 rounded-xl border border-black/15 p-5">
    <h3 className="text-xl font-bold">Mandar um recado</h3>
    <p className="mt-2">O que você gostaria de dizer a {nome}? Grave sua voz e ouça antes de mandar.</p>
    <p className="mt-3 text-sm text-black/70">Destino institucional verificado: <strong className="break-all">{email}</strong></p>
    <button type="button" onClick={gravando ? parar : () => void iniciar()} className={"mt-5 flex min-h-14 w-full items-center justify-center rounded-lg px-4 font-bold text-white " + (gravando ? "bg-[#c62828]" : "bg-black")}>{gravando ? "■ Parar gravação" : "🎙 Gravar recado"}</button>
    {gravando ? <p role="status" className="mt-3 text-center">Gravando... Toque em parar quando terminar.</p> : null}
    {url ? <div className="mt-5"><p className="mb-2 font-semibold">Ouça seu recado:</p><audio controls src={url} className="w-full" /><button type="button" onClick={() => { setArquivo(null); setAviso(""); }} className="mt-3 w-full py-2 underline">Gravar novamente</button></div> : null}
    <button type="button" disabled={!arquivo || gravando || compartilhando} onClick={() => void mandar()} className="mt-5 min-h-14 w-full rounded-lg bg-[#ffd700] px-4 font-extrabold text-black disabled:opacity-40">Mandar</button>
    {arquivo && url ? <a href={url} download={arquivo.name} className="mt-3 block text-center text-sm underline">Baixar áudio para mandar por outro aplicativo</a> : null}
    {aviso ? <p role="status" className="mt-4 rounded-lg bg-[#fff6d5] p-3 text-sm">{aviso}</p> : null}
    <p className="mt-3 text-sm text-black/60">O botão Mandar abre o compartilhamento do celular. Escolha um aplicativo e confirme o envio. O áudio não é enviado automaticamente pelo site.</p>
  </section>;
}
