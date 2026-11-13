"use client";

import { useEffect, useState } from "react";

export default function AdminTelegramLinkStatus() {
  const [status, setStatus] = useState<"loading" | "linked" | "unlinked" | "error">("loading");
  const [edicoes, setEdicoes] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/notificacoes/vinculo", { credentials: "same-origin", cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Falha na verificação");
        return response.json() as Promise<{ vinculado: boolean; novasEdicoes: boolean }>;
      })
      .then(data => {
        if (!active) return;
        setStatus(data.vinculado ? "linked" : "unlinked");
        setEdicoes(data.novasEdicoes);
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);
  return (
    <section className="mt-7 rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-bold">Vínculo deste navegador com o Telegram</h2>
      {status === "loading" && <p className="mt-2 text-sm">Verificando…</p>}
      {status === "linked" && <p className="mt-2 text-sm">Navegador vinculado a uma conta Telegram. Avisos de novas edições: {edicoes ? "ativos" : "não ativos"}.</p>}
      {status === "unlinked" && <p className="mt-2 text-sm">Este navegador não está vinculado ao Telegram. O envio individual continuará indisponível até a vinculação e a confirmação do destinatário.</p>}
      {status === "error" && <p className="mt-2 text-sm">Não foi possível verificar o vínculo. Nenhum envio foi realizado.</p>}
      <p className="mt-3 text-xs leading-5 text-black/50">Esta consulta não revela identificadores pessoais nem envia mensagens.</p>
    </section>
  );
}
