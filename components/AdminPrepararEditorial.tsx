"use client";
import { useState } from "react";
export default function AdminPrepararEditorial() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function prepare() {
    if (!window.confirm("Preparar as tabelas de artigos e histórico? Esta ação não publica artigos nem envia notificações.")) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/configuracoes/preparar-editorial", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "PREPARAR ESTRUTURA" })
      });
      const data = await response.json() as { ok?: boolean; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Não foi possível preparar a estrutura.");
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro inesperado."); }
    finally { setBusy(false); }
  }
  return <section className="mt-7 rounded-xl border border-amber-300 bg-white p-5">
    <h2 className="text-lg font-semibold">Preparar estrutura editorial</h2>
    <p className="mt-2 text-sm leading-6 text-black/65">Cria apenas as tabelas necessárias para guardar artigos e seu histórico, caso ainda não existam. Não cria nem publica artigos.</p>
    <button type="button" disabled={busy} onClick={prepare} className="mt-4 min-h-12 w-full rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Preparando…" : "Preparar estrutura"}</button>
    {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
  </section>;
}
