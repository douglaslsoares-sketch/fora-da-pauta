"use client";

import { useEffect, useState } from "react";

export default function NotificationDraft() {
  const [title, setTitle] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [published, setPublished] = useState<{id:string;titulo:string}[]>([]);
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => { fetch("/api/admin/artigos", { credentials: "same-origin", cache: "no-store" }).then(r => r.ok ? r.json() : { artigos: [] }).then(data => setPublished((data.artigos || []).filter((a: {status:string}) => a.status === "publicado"))).catch(() => setPublished([])); }, []);
  const [audience, setAudience] = useState<"individual" | "all">("individual");
  const safeUrl = (() => {
    try {
      const url = new URL(articleUrl);
      return (url.protocol === "https:" && (url.hostname === "foradapauta.org" || url.hostname === "www.foradapauta.org")) ? url.href : "";
    } catch { return ""; }
  })();
  async function sendIndividual() {
    if (!confirmed || audience !== "individual" || !safeUrl || !title.trim() || !message.trim()) return;
    setSending(true);
    setResult("");
    try {
      const response = await fetch("/api/admin/notificacoes/teste-individual", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, articleUrl: safeUrl, confirmation: "ENVIAR SOMENTE PARA MIM" }),
      });
      const data = await response.json() as { ok?: boolean; error?: string; message?: string };
      setResult(response.ok && data.ok ? (data.message || "Enviado.") : (data.error || "Falha no envio."));
      if (response.ok && data.ok) setConfirmed(false);
    } catch {
      setResult("Não foi possível concluir o teste.");
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="mt-8 rounded-xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-bold">Preparar aviso</h2>
      <p className="mt-2 text-sm leading-6 text-black/60">Preencha e confira a mensagem. Confira a prévia. O teste individual exige confirmação e só pode ser enviado para a conta Telegram vinculada a este navegador.</p>
      <label className="mt-5 block text-sm font-semibold">Destinatários
        <select value={audience} onChange={(e) => { setAudience(e.target.value as "individual" | "all"); setConfirmed(false); setResult(""); }} className="mt-2 block w-full rounded-lg border border-black/20 bg-white p-3">
          <option value="individual">Somente minha conta — teste</option>
          <option value="all">Inscritos — envio geral</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold">Título
        <input value={title} onChange={(e) => { setTitle(e.target.value); setConfirmed(false); }} maxLength={140} className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="Título do artigo" />
      </label>
      <label className="mt-4 block text-sm font-semibold">Mensagem
        <textarea value={message} onChange={(e) => { setMessage(e.target.value); setConfirmed(false); }} maxLength={1000} rows={4} className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="Texto do aviso" />
      </label>
      <label className="mt-4 block text-sm font-semibold">Escolher artigo publicado
        <select value={selectedId} onChange={e => { const a = published.find(item => item.id === e.target.value); setSelectedId(a?.id || ""); if (a) { setArticleUrl(`https://foradapauta.org/edicoes/${a.id}`); setTitle(a.titulo); setConfirmed(false); } else { setArticleUrl(""); setConfirmed(false); } }} className="mt-2 block w-full rounded-lg border border-black/20 bg-white p-3">
          <option value="">Selecione um artigo</option>
          {published.map(a => <option key={a.id} value={a.id}>{a.titulo}</option>)}
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold">Link do artigo no site
        <input value={articleUrl} readOnly className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="https://foradapauta.org/..." />
      </label>
      {published.length === 0 && <p className="mt-2 text-sm text-black/60">Não há artigos publicados disponíveis para selecionar.</p>}
      {articleUrl && !safeUrl && <p className="mt-2 text-sm text-red-700">Informe um link HTTPS do domínio foradapauta.org.</p>}
      <div className="mt-6 rounded-lg border border-black/15 bg-[#eeeee9] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Prévia — {audience === "individual" ? "teste individual" : "inscritos"}</p>
        <p className="mt-3 whitespace-pre-wrap text-lg font-bold">{title || "Título do aviso"}</p>
        <p className="mt-2 whitespace-pre-wrap leading-7">{message || "O texto da mensagem aparecerá aqui."}</p>
        {safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block break-all text-blue-700 underline">Abrir artigo</a>}
      </div>
      {audience === "individual" ? (
        <div className="mt-5 border-t border-black/10 pt-5">
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
            Confirmo que estou usando meu navegador vinculado ao Telegram e quero enviar esta mensagem de teste somente para essa conta.
          </label>
          <button type="button" disabled={!confirmed || !safeUrl || !title.trim() || !message.trim() || sending} onClick={sendIndividual} className="mt-4 min-h-12 rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {sending ? "Enviando…" : "Enviar somente para mim"}
          </button>
          <p className="mt-2 text-xs leading-5 text-black/55">O envio só funciona para um artigo já publicado e para a inscrição vinculada a este navegador.</p>
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold text-black/55">Envio geral desativado. Nenhuma mensagem será enviada aos inscritos.</p>
      )}
      {result && <p role="status" className="mt-4 text-sm font-semibold">{result}</p>}
    </section>
  );
}
