"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export function FormularioAvaliacaoPoliticos() {
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [recebido, setRecebido] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (nota === null || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/politicos/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ nota, comentario: comentario.trim() }),
      });
      const dados = await resposta.json().catch(() => ({})) as { erro?: string };
      if (!resposta.ok) throw Error(dados.erro || "Falha no envio.");
      setRecebido(true);
      setComentario("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar.");
    } finally {
      setEnviando(false);
    }
  }

  if (recebido) return (
    <section className="rounded-2xl border border-emerald-500/50 bg-[#153849] p-6 text-center">
      <div aria-hidden="true" className="text-4xl text-[#ffd333]">✓</div>
      <h2 className="mt-3 text-2xl font-bold text-white">Avaliação recebida!</h2>
      <p className="mt-3 leading-7 text-slate-200">Obrigado por ajudar a melhorar o aplicativo Políticos.</p>
      <Link href="/politicos" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ffd333] px-6 font-bold text-[#071827]">Voltar ao menu</Link>
    </section>
  );

  return (
    <form onSubmit={enviar} className="space-y-6 rounded-2xl border border-[#36516a] bg-[#162d44] p-5 sm:p-7">
      <fieldset>
        <legend className="text-lg font-bold text-white">Como você avalia sua experiência?</legend>
        <p className="mt-2 text-sm leading-6 text-slate-300">Escolha uma nota de 1 a 5.</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Nota do aplicativo">
          {[1, 2, 3, 4, 5].map(valor => (
            <button key={valor} type="button" disabled={enviando}
              aria-pressed={nota === valor}
              onClick={() => setNota(valor)}
              className={`flex h-12 min-w-12 flex-1 items-center justify-center rounded-xl border text-lg font-bold transition-colors disabled:opacity-60 ${nota === valor ? "border-[#ffd333] bg-[#ffd333] text-[#061827]" : "border-[#63758c] bg-[#233950] text-white hover:border-[#ffd333]"}`}
            >{valor}</button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>1 = Precisa melhorar</span>
          <span>5 = Excelente</span>
        </div>
      </fieldset>

      <div>
        <label htmlFor="comentario-avaliacao" className="block text-lg font-bold text-white">O que podemos melhorar? <span className="text-sm font-normal text-slate-300">(opcional)</span></label>
        <textarea id="comentario-avaliacao" rows={5} maxLength={1200} disabled={enviando}
          value={comentario} onChange={evento => setComentario(evento.target.value)}
          placeholder="Conte o que foi fácil, difícil ou o que está faltando..."
          className="mt-3 w-full rounded-xl border border-[#7a8da1] bg-white px-4 py-3 text-base leading-6 text-slate-950 placeholder:text-slate-500 focus:outline-2 focus:outline-offset-2 focus:outline-[#ffd333] disabled:opacity-60"
        />
        <p className="mt-2 text-right text-xs text-slate-300">{comentario.length}/1.200</p>
      </div>

      <p className="text-sm leading-6 text-slate-300">
        Você não precisa informar nome, e-mail nem telefone. Sua nota e seu comentário serão usados apenas para melhorar o aplicativo. Evite incluir informações pessoais no texto.
      </p>

      {erro && <p role="alert" className="rounded-xl border border-red-500/50 bg-red-950/50 p-3 text-sm text-white">{erro}</p>}
      <button type="submit" disabled={nota === null || enviando}
        className="min-h-12 w-full rounded-xl bg-[#ffd333] px-6 py-3 text-lg font-bold text-[#071827] disabled:cursor-not-allowed disabled:opacity-45"
      >{enviando ? "Enviando avaliação..." : "Enviar avaliação"}</button>
    </form>
  );
}
