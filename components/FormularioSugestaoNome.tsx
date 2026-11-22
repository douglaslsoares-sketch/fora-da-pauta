"use client";

import Link from "next/link";
import { useState } from "react";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";

export function FormularioSugestaoNome() {
  const [nome, setNome] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [aviso, setAviso] = useState("");
  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado || enviado) return;
    setOcupado(true); setAviso("");
    try {
      const r = await fetch("/api/participacao/nome", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, justificativa, website: "" }),
      });
      const data = await r.json() as { ok?: boolean; erro?: string };
      if (!r.ok || !data.ok) throw new Error(data.erro || "Não foi possível registrar sua sugestão.");
      setEnviado(true);
      setAviso("Sugestão recebida. Obrigado por ajudar a construir este espaço com a gente!");
    } catch (e) { setAviso(e instanceof Error ? e.message : "Não foi possível enviar sua sugestão."); }
    finally { setOcupado(false); }
  }
  return <main className="min-h-screen bg-[#141c2b] px-5 py-8 text-white">
    <section className="mx-auto max-w-2xl rounded-xl bg-[#24334b] px-6 py-9 sm:px-10">
      <CabecalhoInterno titulo="Seu nome para este projeto" />
      <p className="mt-3 leading-8 text-slate-100">Começamos como Fora da Pauta. Queremos compreender melhor as decisões que afetam nossa vida, fazer perguntas e compartilhar o que aprendemos.</p>
      <p className="mt-4 leading-8 text-slate-100">E queremos ouvir você: <strong className="text-[#f4c542]">que nome daria a um projeto assim?</strong></p>
      <p className="mt-4 text-sm leading-7 text-slate-300">Se tiver uma ideia, mande sua sugestão. Vamos ler as propostas, verificar sua viabilidade e conversar com as pessoas antes de qualquer mudança. Fora da Pauta continua sendo nosso nome por enquanto.</p>
      <form onSubmit={e => void enviar(e)} className="mt-7 space-y-5">
        <label className="block text-sm font-bold">Sua sugestão de nome
          <input required minLength={2} maxLength={60} disabled={enviado} value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Como você chamaria?" className="mt-2 block min-h-12 w-full rounded-lg border border-[#8797ab] bg-white px-4 py-3 text-base text-[#142038] placeholder:text-slate-500" />
        </label>
        <label className="block text-sm font-bold">Por que você escolheu esse nome? (opcional)
          <textarea rows={4} maxLength={400} disabled={enviado} value={justificativa} onChange={e => setJustificativa(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-[#8797ab] bg-white px-4 py-3 text-base text-[#142038]"/>
        </label>
        <div className="hidden" aria-hidden="true"><label>Site<input tabIndex={-1} autoComplete="off" name="website" /></label></div>
        <button disabled={ocupado || enviado || nome.trim().length < 2} className="min-h-12 rounded-lg bg-[#f4c542] px-7 py-3 font-bold text-[#142038] disabled:opacity-50">
          {ocupado ? "Enviando…" : enviado ? "Sugestão recebida" : "Enviar sugestão"}
        </button>
        {aviso && <p role="status" className="text-sm leading-6">{aviso}</p>}
      </form>
      <div className="mt-9 text-center"><Link href="/#menu" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-bold text-white">× Fechar</Link></div>
    </section>
  </main>;
}
