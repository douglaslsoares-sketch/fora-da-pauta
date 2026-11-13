"use client";

import { useState } from "react";

export default function NotificationDraft() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [audience, setAudience] = useState<"individual" | "all">("individual");
  const safeUrl = (() => {
    try {
      const url = new URL(articleUrl);
      return (url.protocol === "https:" && (url.hostname === "foradapauta.org" || url.hostname === "www.foradapauta.org")) ? url.href : "";
    } catch { return ""; }
  })();
  return (
    <section className="mt-8 rounded-xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-bold">Preparar aviso</h2>
      <p className="mt-2 text-sm leading-6 text-black/60">Preencha e confira a mensagem. Esta ferramenta apenas mostra uma prévia: não salva nem envia mensagens.</p>
      <label className="mt-5 block text-sm font-semibold">Destinatários
        <select value={audience} onChange={(e) => setAudience(e.target.value as "individual" | "all")} className="mt-2 block w-full rounded-lg border border-black/20 bg-white p-3">
          <option value="individual">Somente minha conta — teste</option>
          <option value="all">Inscritos — envio geral</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-semibold">Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="Título do artigo" />
      </label>
      <label className="mt-4 block text-sm font-semibold">Mensagem
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={4} className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="Texto do aviso" />
      </label>
      <label className="mt-4 block text-sm font-semibold">Link do artigo no site
        <input value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} className="mt-2 block w-full rounded-lg border border-black/20 p-3" placeholder="https://foradapauta.org/..." />
      </label>
      {articleUrl && !safeUrl && <p className="mt-2 text-sm text-red-700">Informe um link HTTPS do domínio foradapauta.org.</p>}
      <div className="mt-6 rounded-lg border border-black/15 bg-[#eeeee9] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/50">Prévia — {audience === "individual" ? "teste individual" : "inscritos"}</p>
        <p className="mt-3 whitespace-pre-wrap text-lg font-bold">{title || "Título do aviso"}</p>
        <p className="mt-2 whitespace-pre-wrap leading-7">{message || "O texto da mensagem aparecerá aqui."}</p>
        {safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block break-all text-blue-700 underline">Abrir artigo</a>}
      </div>
      <p className="mt-4 text-sm font-semibold text-black/55">Envio desativado. Nenhuma mensagem será enviada.</p>
    </section>
  );
}
