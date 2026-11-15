"use client";

import { useState } from "react";

type Resultado = {
  ok?: boolean;
  etapas?: string[];
  observacao?: string;
  error?: string;
};

export default function AdminArticleDiagnostic() {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function executar() {
    if (executando) return;
    setExecutando(true);
    setResultado(null);
    try {
      const response = await fetch("/api/admin/artigos/diagnostico", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json() as Resultado;
      setResultado(data.ok ? data : { ok: false, error: data.error || "Teste indisponível." });
    } catch {
      setResultado({ ok: false, error: "Não foi possível executar a verificação." });
    } finally {
      setExecutando(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-black/10 bg-white p-5 sm:p-6" aria-label="Verificação técnica de artigos">
      <h2 className="text-xl font-semibold">Conferência automática dos artigos</h2>
      <p className="mt-2 text-sm leading-6 text-black/65">
        Confere rascunho, revisão, estado publicado, consulta de dados e arquivamento
        numa transação do banco isolado. Apaga o registro de teste ao terminar.
        Não publica no site oficial nem envia avisos.
      </p>
      <button type="button" disabled={executando} onClick={() => void executar()}
        className="mt-4 min-h-12 rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">
        {executando ? "Conferindo…" : "Executar conferência"}
      </button>
      {resultado && <div role="status" className="mt-4 text-sm leading-6">
        <p className="font-semibold">{resultado.ok ? "Conferência técnica concluída." : "Conferência não concluída."}</p>
        {resultado.etapas?.length ? (
          <ul className="mt-2 list-inside list-disc">
            {resultado.etapas.map(etapa => <li key={etapa}>{etapa}</li>)}
          </ul>
        ) : null}
        {resultado.error && <p>{resultado.error}</p>}
        {resultado.observacao && <p className="mt-2 text-black/60">{resultado.observacao}</p>}
      </div>}
    </section>
  );
}
