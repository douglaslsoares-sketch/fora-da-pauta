"use client";
import { useEffect, useState } from "react";

export default function ArticleAudioApproval({ articleId }: { articleId: string }) {
  const [exists, setExists] = useState(false);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    fetch(`/api/admin/artigos/audio-completo?id=${encodeURIComponent(articleId)}`, { cache: "no-store" })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.erro || "Falha ao consultar áudio."); return d; })
      .then(d => { if (active) { setExists(d.existe); setApproved(d.aprovado); } })
      .catch(e => { if (active) setMessage(e.message); });
    return () => { active = false; };
  }, [articleId]);
  async function action(acao: "gerar" | "aprovar") {
    if (busy) return;
    if (acao === "gerar" && exists && !window.confirm("Substituir a narração anterior? A aprovação será cancelada.")) return;
    if (acao === "aprovar" && !window.confirm("Você ouviu o áudio completo e aprova esta gravação?")) return;
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/artigos/audio-completo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: articleId, acao }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || "Não foi possível concluir.");
      setExists(true); setApproved(acao === "aprovar"); setRevision(v => v + 1);
      setMessage(acao === "aprovar" ? "Áudio aprovado. O artigo continua privado." : "Narração salva para revisão. Ouça antes de aprovar.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Erro inesperado."); }
    finally { setBusy(false); }
  }
  return <section className="mt-5 rounded-xl border border-[#d5dce4] bg-white p-5">
    <h4 className="font-bold text-[#183352]">Áudio definitivo — revisão e aprovação</h4>
    <p className="mt-2 text-sm leading-6 text-black/65">Gera um MP3 único com a voz Marim para textos de até 4.000 caracteres. A gravação é privada até a aprovação e a publicação do artigo. A geração pode ter custo.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" disabled={busy} onClick={() => action("gerar")} className="min-h-11 rounded-lg bg-[#183352] px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Processando…" : exists ? "Gerar novamente" : "Gerar áudio definitivo"}</button>
      {exists && !approved && <button type="button" disabled={busy} onClick={() => action("aprovar")} className="min-h-11 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Aprovar áudio</button>}
    </div>
    {exists && <div className="mt-4"><p className="mb-2 text-sm font-semibold">{approved ? "Áudio aprovado" : "Áudio aguardando aprovação"}</p><audio key={revision} controls preload="none" src={`/api/artigos/audio/${articleId}?v=${revision}`} className="w-full" /></div>}
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </section>;
}
