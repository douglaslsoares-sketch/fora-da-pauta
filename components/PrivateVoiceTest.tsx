"use client";
import { useEffect, useRef, useState } from "react";

export default function PrivateVoiceTest({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const urlRef = useRef("");
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  async function generate() {
    if (loading) return;
    setLoading(true);
    setMessage("");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setUrl("");
    try {
      const response = await fetch("/api/admin/artigos/audio-teste", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: articleId })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { erro?: string };
        throw new Error(data.erro || "Não foi possível gerar o áudio.");
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      urlRef.current = objectUrl;
      setUrl(objectUrl);
      setMessage("Áudio de teste gerado apenas nesta sessão. Ele não foi salvo nem publicado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao gerar teste.");
    } finally { setLoading(false); }
  }
  return <section className="mt-8 rounded-xl border border-[#d5dce4] bg-[#f3f6f9] p-5">
    <h2 className="text-base font-bold text-[#183352]">Teste privado da voz Marim</h2>
    <p className="mt-2 text-sm leading-6 text-black/70">Gere e ouça uma amostra do texto salvo. Limite de 3.000 caracteres e três testes por hora. A geração utiliza o serviço de voz e pode ter custo. Nenhum áudio será publicado.</p>
    <button type="button" disabled={loading} onClick={generate} className="mt-4 min-h-11 rounded-lg bg-[#183352] px-5 py-2 font-semibold text-white disabled:opacity-50">{loading ? "Preparando áudio…" : "Gerar áudio de teste"}</button>
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
    {url && <audio controls src={url} className="mt-4 w-full" aria-label="Ouvir teste de voz Marim" />}
  </section>;
}
