"use client";
import { useState } from "react";
import type { TrechoLive } from "@/lib/editorial/roteiro-narracao-live";

export function PainelRoteiroLive({ trechos }: { trechos: TrechoLive[] }) {
  const [atual, setAtual] = useState(0);
  const [copiado, setCopiado] = useState<number | null>(null);
  const t = trechos[atual];
  async function copiar() {
    try {
      await navigator.clipboard.writeText(t.mensagem);
      setCopiado(atual);
    } catch {
      setCopiado(null);
      alert("Não foi possível copiar automaticamente. Selecione o texto e copie com Ctrl+C.");
    }
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-zinc-900">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider">Fora da Pauta · Uso privado</p>
      <h1 className="text-3xl font-bold">Roteiro de gravação — Voz 01</h1>
      <p className="mt-3">
        Este roteiro vem do rascunho da primeira edição. Nenhum trecho é enviado automaticamente
        ao Playground. Copie uma mensagem por vez e confirme a leitura antes de prosseguir.
        A gravação permanece em revisão, sem publicação.
      </p>
      <div className="my-6 rounded-md border border-zinc-300 p-5">
        <p className="font-semibold">Trecho {atual + 1} de {trechos.length}</p>
        <p className="mt-1 text-sm text-zinc-600">Mensagem com {t.caracteres} caracteres (limite conservador de 790).</p>
        <textarea readOnly aria-label="Mensagem para copiar no GPT-Live" value={t.mensagem}
          className="mt-4 h-64 w-full rounded border border-zinc-400 bg-white p-3 text-sm leading-relaxed" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={copiar} className="rounded bg-zinc-900 px-5 py-3 font-semibold text-white">
            {copiado === atual ? "Copiado! Copiar novamente" : "Copiar este trecho"}
          </button>
          <button disabled={atual === 0} onClick={() => {setAtual(i => i-1);setCopiado(null);}}
            className="rounded border border-zinc-500 px-4 py-3 disabled:opacity-40">Anterior</button>
          <button disabled={atual === trechos.length-1} onClick={() => {setAtual(i=>i+1);setCopiado(null);}}
            className="rounded border border-zinc-500 px-4 py-3 disabled:opacity-40">Próximo trecho</button>
        </div>
        <p className="mt-4 text-sm">Conclua e confira um trecho antes de copiar o próximo. Se a voz improvisar,
          repita o mesmo trecho. Não cole vários trechos de uma vez.</p>
      </div>
      <p className="text-sm text-zinc-600">O limite real do GPT-Live é contado em tokens, não caracteres.
        Se aparecer a mensagem de 500 tokens, reduza o trecho manualmente antes da leitura;
        não omita palavras do artigo. A qualidade e a fidelidade precisam ser verificadas na audição.</p>
    </main>
  );
}
