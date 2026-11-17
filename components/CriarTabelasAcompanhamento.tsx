"use client";

import { useState } from "react";

export function CriarTabelasAcompanhamento() {
  const [estado, setEstado] = useState("");
  const [executando, setExecutando] = useState(false);
  async function criar() {
    if (!window.confirm("Criar as duas tabelas novas de acompanhamento no banco de dados? Nenhuma tabela do Telegram será apagada.")) return;
    setExecutando(true);
    setEstado("Executando migração...");
    try {
      const resposta = await fetch("/api/admin/criar-tabelas-acompanhamento", {
        method: "POST", headers: { "Content-Type": "application/json" },
      });
      const dados = await resposta.json() as { criado?: boolean; erro?: string };
      if (!resposta.ok || !dados.criado) throw new Error(dados.erro || "Migração não concluída.");
      setEstado("Tabelas criadas. Atualize esta página para verificar.");
    } catch (error) {
      setEstado(error instanceof Error ? error.message : "Falha ao criar as tabelas.");
    } finally {
      setExecutando(false);
    }
  }
  return <section className="mt-6">
    <button type="button" disabled={executando} onClick={() => void criar()}
      className="rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">
      {executando ? "Criando tabelas..." : "Criar tabelas de acompanhamento"}
    </button>
    {estado && <p role="status" className="mt-3">{estado}</p>}
  </section>;
}
