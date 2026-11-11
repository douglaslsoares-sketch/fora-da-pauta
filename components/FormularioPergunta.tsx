"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

type ResultadoVoz = { isFinal: boolean; 0: { transcript: string } };
type EventoVoz = { resultIndex: number; results: ArrayLike<ResultadoVoz> };
type ReconhecedorVoz = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((evento: EventoVoz) => void) | null;
  onerror: ((evento: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type ConstrutorVoz = new () => ReconhecedorVoz;

export function FormularioPergunta() {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [consulta, setConsulta] = useState("");
  const [gravando, setGravando] = useState(false);
  const [usouVoz, setUsouVoz] = useState(false);
  const reconhecedor = useRef<ReconhecedorVoz | null>(null);

  useEffect(() => () => {
    if (reconhecedor.current) {
      reconhecedor.current.onend = null;
      reconhecedor.current.stop();
    }
  }, []);

  function alternarVoz() {
    if (gravando) {
      reconhecedor.current?.stop();
      setGravando(false);
      return;
    }
    const navegador = window as Window & {
      SpeechRecognition?: ConstrutorVoz;
      webkitSpeechRecognition?: ConstrutorVoz;
    };
    const Construtor = navegador.SpeechRecognition ?? navegador.webkitSpeechRecognition;
    if (!Construtor) {
      setErro("Este navegador não permite ditar a pergunta. Você pode escrevê-la no campo acima.");
      return;
    }
    setErro("");
    try {
      const instancia = new Construtor();
      instancia.lang = "pt-BR";
      instancia.continuous = true;
      instancia.interimResults = false;
      instancia.onresult = (evento) => {
        let transcricao = "";
        for (let i = evento.resultIndex; i < evento.results.length; i++) {
          if (evento.results[i].isFinal) transcricao += evento.results[i][0].transcript + " ";
        }
        if (transcricao.trim()) {
          setPergunta((anterior) => (anterior.trim() ? anterior.trim() + " " : "") + transcricao.trim());
          setUsouVoz(true);
        }
      };
      instancia.onerror = (evento) => {
        setGravando(false);
        setErro(evento.error === "not-allowed"
          ? "Permita o acesso ao microfone no navegador para falar sua pergunta."
          : "Não foi possível reconhecer a fala. Você pode tentar novamente ou escrever.");
      };
      instancia.onend = () => setGravando(false);
      reconhecedor.current = instancia;
      instancia.start();
      setGravando(true);
    } catch {
      setGravando(false);
      setErro("Não foi possível iniciar o microfone. Tente novamente ou escreva sua pergunta.");
    }
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!pergunta.trim() || enviando) return;
    if (gravando) {
      reconhecedor.current?.stop();
      setGravando(false);
    }
    setEnviando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          confirmedText: pergunta.trim(),
          inputType: usouVoz ? "voice" : "text",
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(typeof dados.error === "string" ? dados.error : "Não foi possível mandar sua pergunta.");
      setConsulta(typeof dados.trackingPath === "string" ? dados.trackingPath : "");
      setPergunta("");
      setUsouVoz(false);
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
          <label htmlFor="pergunta-publica" className="text-base font-medium">O que você gostaria de saber?</label>
          <textarea id="pergunta-publica" rows={5} maxLength={2000} required value={pergunta} onChange={(evento) => { setPergunta(evento.target.value); }} placeholder="Escreva sua pergunta aqui ou use o microfone..." className="w-full rounded-xl border border-black/25 bg-white p-4 text-base outline-offset-2" />
          <button type="button" onClick={alternarVoz} aria-pressed={gravando} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 py-3 font-semibold ${gravando ? "border-red-600 bg-red-50 text-red-700" : "border-black/25 bg-white text-black"}`}>
            <span aria-hidden="true">{gravando ? "●" : "🎙️"}</span>
            {gravando ? "Parar gravação" : "Gravar pergunta"}
          </button>
          <p role="status" className="text-sm text-black/65">
            {gravando ? "Microfone ligado. Fale sua pergunta e depois toque em Parar gravação." : "Ao falar, suas palavras aparecem no campo para você conferir antes de mandar. O áudio não é armazenado pelo site."}
          </p>
          {erro ? <p role="alert" className="text-sm text-red-700">{erro}</p> : null}
          <button type="submit" disabled={enviando || !pergunta.trim()} className="min-h-12 rounded-lg bg-[#f3c72d] px-5 py-3 font-semibold disabled:opacity-50">{enviando ? "Mandando..." : "Mandar"}</button>
        </form>
      )}
      <div className="mt-8 flex justify-center">
        <Link href="/central" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white"><span aria-hidden="true" className="mr-2">×</span> Fechar</Link>
      </div>
    </section>
  );
}
