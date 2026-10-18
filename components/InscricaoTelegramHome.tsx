"use client";

import { useEffect, useState } from "react";

type Status = "carregando" | "inscrito" | "nao-inscrito" | "abrindo" | "erro";

export function InscricaoTelegramHome({ className }: { className: string }) {
  const [status, setStatus] = useState<Status>("carregando");

  useEffect(() => {
    let ativo = true;
    const verificar = async () => {
      try {
        const r = await fetch("/api/telegram/sessao", { cache: "no-store" });
        if (!ativo) return;
        const dados = await r.json() as { geralAtivo?: boolean; ativo?: boolean };
        setStatus(dados.geralAtivo === true ? "inscrito" : "nao-inscrito");
      } catch {
        if (ativo) setStatus("nao-inscrito");
      }
    };
    void verificar();
    const aoFocar = () => { void verificar(); };
    window.addEventListener("focus", aoFocar);
    return () => { ativo = false; window.removeEventListener("focus", aoFocar); };
  }, []);

  async function abrirTelegram() {
    if (status === "abrindo" || status === "inscrito") return;
    setStatus("abrindo");
    try {
      const r = await fetch("/api/telegram/sessao", { method: "POST" });
      if (!r.ok) throw Error("Falha na solicitação");
      const dados = await r.json() as { url?: string };
      const url = new URL(dados.url ?? "");
      if (url.origin !== "https://t.me" ||
          url.pathname !== "/ForaDaPautaAcompanhaBot" ||
          !/^\?start=s_[A-Za-z0-9_-]{32}$/.test(url.search)) throw Error("Destino incorreto");
      window.location.assign(url.toString());
    } catch {
      setStatus("erro");
    }
  }

  if (status === "inscrito") return <p role="status">✓ Você já acompanha o Fora da Pauta pelo Telegram.</p>;
  return (
    <div>
      <button type="button" className={className} onClick={() => void abrirTelegram()}
        disabled={status === "abrindo"}>
        {status === "abrindo" ? "Abrindo Telegram..." : "Acompanhe pelo Telegram"}
        <span aria-hidden="true">→</span>
      </button>
      {status === "erro" ? <p role="alert">Não foi possível abrir o Telegram. Tente novamente.</p> : null}
    </div>
  );
}
