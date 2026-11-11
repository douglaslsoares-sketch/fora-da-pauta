"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function FormularioPergunta() {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [consulta, setConsulta] = useState("");

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!pergunta.trim() || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ confirmedText: pergunta.trim(), inputType: "text" }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(typeof dados.error === "string" ? dados.error : "Não foi possível mandar sua pergunta.");
      setConsulta(typeof dados.trackingPath === "string" ? dados.trackingPath : "");
      setPergunta("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível mandar sua pergunta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[580px] px-5 pb-16 pt-10 text-black">
      {consulta ? (
        <div role="status" className="rounded-xl border border-black/15 bg-white p-6 text-center">
          <p className="text-lg font-semibold">Sua pergunta foi recebida!</p>
          <p className="mt-3 text-sm leading-6">Guarde o link abaixo para acompanhar a resposta.</p>
          <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#f3c72d] px-5 py-3 font-semibold" href={consulta}>Acompanhar minha pergunta</Link>
          <button type="button" className="mt-5 block w-full text-sm underline" onClick={() => setConsulta("")}>Fazer outra pergunta</button>
        </div>
      ) : (
        <form onSubmit={(evento) => void enviar(evento)} className="flex flex-col gap-4">
          <label htmlFor="pergunta-publica" className="text-base font-medium">O que você quer saber?</label>
          <textarea id="pergunta-publica" rows={5} maxLength={2000} required value={pergunta} onChange={(evento) => setPergunta(evento.target.value)} placeholder="Escreva sua pergunta aqui..." className="w-full rounded-xl border border-black/25 bg-white p-4 text-base outline-offset-2" />
          {erro ? <p role="alert" className="text-sm text-red-700">{erro}</p> : null}
          <button type="submit" disabled={enviando || !pergunta.trim()} className="min-h-12 rounded-lg bg-[#f3c72d] px-5 py-3 font-semibold disabled:opacity-50">{enviando ? "Mandando..." : "Mandar pergunta"}</button>
        </form>
      )}
      <div className="mt-8 flex justify-center">
        <Link href="/central" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white"><span aria-hidden="true" className="mr-2">×</span> Fechar</Link>
      </div>
    </section>
  );
}
