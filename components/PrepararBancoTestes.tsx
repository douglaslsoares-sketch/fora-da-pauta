"use client";

import { useState } from "react";

export default function PrepararBancoTestes() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function prepare() {
    if (!window.confirm("Criar as tabelas vazias somente no banco de testes? Nenhum dado real será copiado, nenhum artigo será publicado e nenhuma mensagem será enviada.")) return;
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const response = await fetch("/api/admin/configuracoes/preparar-testes", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "PREPARAR SOMENTE BANCO DE TESTES" }),
      });
      const data = await response.json() as { ok?: boolean; erro?: string; tabelas?: number };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Não foi possível preparar o banco de testes.");
      setSuccess(true);
      setMessage(`Estrutura de testes criada com sucesso: ${data.tabelas ?? 14} tabelas. Recarregue a página para conferir o diagnóstico.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="mt-7 rounded-xl border border-amber-400 bg-white p-5">
    <h2 className="text-lg font-semibold">Preparar banco de testes</h2>
    <p className="mt-2 text-sm leading-6 text-black/65">Inicializa as tabelas vazias de artigos, perguntas, Telegram, acompanhamentos e interações, exclusivamente nesta prévia isolada. Não importa dados reais nem envia avisos.</p>
    <button type="button" disabled={busy || success} onClick={prepare}
      className="mt-4 min-h-12 w-full rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">
      {busy ? "Preparando estrutura…" : success ? "Estrutura preparada" : "Preparar banco de testes"}
    </button>
    {message && <p role="status" className="mt-3 text-sm font-medium">{message}</p>}
  </section>;
}
