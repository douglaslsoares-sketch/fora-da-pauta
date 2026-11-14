"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Fonte = { titulo: string; url: string };
type Mensagem = {
  role: "user" | "assistant";
  content: string;
  fontes?: Fonte[];
  aviso?: string;
};

const exemplos = [
  "Quem decide o orçamento federal?",
  "O que é uma emenda parlamentar?",
  "Como acompanhar o voto de um deputado?",
];

export default function PergunteAoOtto() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = pergunta.trim();
    if (!texto || enviando) return;
    const historico = mensagens.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setMensagens((anteriores) => [...anteriores, { role: "user", content: texto }]);
    setPergunta("");
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/otto", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto, historico }),
      });
      const dados = await resposta.json() as {
        resposta?: string;
        erro?: string;
        fontes?: Fonte[];
        aviso?: string;
      };
      if (!resposta.ok || !dados.resposta) {
        throw new Error(dados.erro || "Não foi possível responder.");
      }
      setMensagens((anteriores) => [...anteriores, {
        role: "assistant",
        content: dados.resposta!,
        fontes: dados.fontes ?? [],
        aviso: dados.aviso,
      }]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível responder.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6">
      <section className="mx-auto max-w-2xl">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#f2ca3b]">Fora da Pauta</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="text-4xl text-[#f2ca3b]">◉</span>
          <h1 className="text-3xl font-black sm:text-4xl">Pergunte ao Otto</h1>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-center leading-7 text-white/75">
          Cara, manda sua pergunta. Aqui a gente explica a política e as decisões que afetam sua vida, sem enrolação.
        </p>
        <p className="mt-4 text-center text-sm text-[#f2ca3b]">Um papo direto, sem enrolação — com compromisso com os fatos.</p>

        <section aria-label="Conversa com Otto" className="mt-8 space-y-4">
          {mensagens.length === 0 ? (
            <div className="rounded-xl border border-white/20 bg-white p-5 text-[#161616]">
              <p className="font-bold">Pode perguntar com suas palavras.</p>
              <p className="mt-2 leading-7 text-black/70">Comece por um destes assuntos ou escreva sua própria pergunta:</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {exemplos.map((exemplo) => (
                  <button key={exemplo} type="button" onClick={() => setPergunta(exemplo)}
                    className="rounded-lg border border-black/20 bg-[#f4f4f4] px-3 py-3 text-left text-sm font-semibold hover:bg-[#f2ca3b]">
                    {exemplo}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {mensagens.map((mensagem, indice) => (
            <article key={indice}
              className={mensagem.role === "user"
                ? "ml-8 rounded-xl border border-[#f2ca3b]/40 bg-[#292314] p-4"
                : "mr-3 rounded-xl bg-white p-5 text-[#161616] sm:mr-8"}>
              <p className="mb-2 text-xs font-black uppercase tracking-wider opacity-60">
                {mensagem.role === "user" ? "Você" : "Otto"}
              </p>
              <p className="whitespace-pre-wrap leading-7">{mensagem.content}</p>
              {mensagem.role === "assistant" ? (
                <>
                  {mensagem.aviso ? <p className="mt-4 border-t border-black/10 pt-3 text-sm text-black/60">{mensagem.aviso}</p> : null}
                  {mensagem.fontes?.length ? (
                    <div className="mt-3">
                      <p className="text-sm font-bold">Leitura e fontes para conferir</p>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {mensagem.fontes.map((fonte) => (
                          <li key={fonte.url}><Link href={fonte.url} className="underline underline-offset-2">{fonte.titulo}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}
            </article>
          ))}
        </section>

        <form onSubmit={(e) => void enviar(e)} className="mt-6 rounded-xl border border-white/20 bg-[#191919] p-4">
          <label htmlFor="pergunta-fodao" className="block text-sm font-bold">Sua pergunta</label>
          <textarea id="pergunta-fodao" rows={3} maxLength={1200} value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Pergunta aí, cara. O que você quer entender?" required
            className="mt-2 w-full resize-y rounded-lg bg-white p-3 text-base text-[#111] outline-offset-4"/>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-white/60">{pergunta.length}/1200</span>
            <button type="submit" disabled={enviando || !pergunta.trim()}
              className="min-h-12 rounded-lg bg-[#f2ca3b] px-6 font-bold text-black disabled:opacity-50">
              {enviando ? "Pensando..." : "Perguntar"}
            </button>
          </div>
          {enviando ? <p role="status" className="mt-3 text-sm">Preparando resposta...</p> : null}
          {erro ? <p role="alert" className="mt-3 text-sm text-[#ffb0a6]">{erro}</p> : null}
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-white/60">
          Versão experimental: respostas podem conter erros. Não informa notícias em tempo real.
          Evite incluir dados pessoais. As perguntas são enviadas a um serviço de inteligência artificial
          e não são guardadas como histórico público pelo Fora da Pauta.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/central" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-bold">
            × Fechar
          </Link>
        </div>
      </section>
    </main>
  );
}
