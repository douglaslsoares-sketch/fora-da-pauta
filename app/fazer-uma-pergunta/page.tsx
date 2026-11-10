"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SpeechResult = { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> };
type SpeechInstance = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: SpeechResult) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechConstructor = new () => SpeechInstance;

export default function Page() {
  const [politico,setPolitico] = useState("");
  useEffect(()=>{setPolitico(new URLSearchParams(window.location.search).get("politico")?.slice(0,120).trim() || "");},[]);
  const [pergunta, setPergunta] = useState("");
  const [temEscolhas, setTemEscolhas] = useState(false);
  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
  useEffect(() => {
    const chave = "fdp-pwa-instalada";
    const emAplicativo = () => window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & {standalone?: boolean}).standalone === true;
    const verificar = () => {
      if (emAplicativo()) {try {localStorage.setItem(chave,"1");} catch {} setMostrarInstalacao(false);return;}
      try {setMostrarInstalacao(localStorage.getItem(chave)!=="1");} catch {setMostrarInstalacao(true);}
    };
    const instalado = () => {try {localStorage.setItem(chave,"1");} catch {} setMostrarInstalacao(false);};
    verificar();
    window.addEventListener("appinstalled", instalado);
    window.addEventListener("focus", verificar);
    return () => {window.removeEventListener("appinstalled", instalado);window.removeEventListener("focus", verificar);};
  }, []);
  useEffect(() => {
    let ativo = true;
    const verificar = () => fetch("/api/telegram/sessao", {credentials:"same-origin",cache:"no-store"})
      .then(r => r.ok ? r.json() : null)
      .then(d => {if(ativo) setTemEscolhas(d?.ativo===true && Array.isArray(d?.ids) && d.ids.length>0);})
      .catch(() => {if(ativo) setTemEscolhas(false);});
    void verificar();
    window.addEventListener("focus", verificar);
    return () => {ativo=false;window.removeEventListener("focus",verificar);};
  }, []);
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [confirmacaoTeste, setConfirmacaoTeste] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [caminhoAcompanhamento, setCaminhoAcompanhamento] = useState<string | null>(null);
  const ditouRef = useRef(false);
  const reconhecedorRef = useRef<SpeechInstance | null>(null);
  const escutaAtivaRef = useRef(false);
  const ultimoResultadoRef = useRef(0);
  useEffect(() => () => { escutaAtivaRef.current = false; reconhecedorRef.current?.stop(); }, []);
  function ouvir() {
    if (escutaAtivaRef.current) {
      escutaAtivaRef.current = false;
      reconhecedorRef.current?.stop();
      setGravando(false);
      setAviso("Confira e corrija a transcrição antes de enviar.");
      return;
    }
    const janela = window as Window & { SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor };
    const Classe = janela.SpeechRecognition ?? janela.webkitSpeechRecognition;
    if (!Classe) { setAviso("Seu navegador não oferece transcrição por voz. Você pode digitar sua pergunta."); return; }
    const voz = new Classe();
    ditouRef.current = true;
    voz.lang = "pt-BR";
    voz.continuous = true;
    voz.interimResults = false;
    ultimoResultadoRef.current = 0;
    escutaAtivaRef.current = true;
    reconhecedorRef.current = voz;
    voz.onresult = e => {
      const partes: string[] = [];
      for (let i = Math.max(e.resultIndex, ultimoResultadoRef.current); i < e.results.length; i++) {
        if (e.results[i].isFinal) partes.push(e.results[i][0]?.transcript ?? "");
      }
      ultimoResultadoRef.current = e.results.length;
      const texto = partes.join(" ").trim();
      if (texto) setPergunta(p => [p, texto].filter(Boolean).join(" ").trim());
    };
    voz.onerror = () => {
      escutaAtivaRef.current = false;
      setGravando(false);
      setAviso("O reconhecimento de voz foi interrompido. Você pode tentar novamente ou digitar.");
    };
    voz.onend = () => {
      if (!escutaAtivaRef.current) { setGravando(false); return; }
      // Alguns navegadores encerram uma sessão de reconhecimento após uma pausa.
      // Recomeçamos enquanto a pessoa não tocar em "Parar gravação".
      ultimoResultadoRef.current = 0;
      try { voz.start(); } catch {
        escutaAtivaRef.current = false;
        setGravando(false);
        setAviso("O navegador interrompeu a escuta. Toque em Ditar pergunta para continuar.");
      }
    };
    setAviso("");
    setGravando(true);
    try { voz.start(); } catch {
      escutaAtivaRef.current = false;
      setGravando(false);
      setAviso("Não foi possível iniciar o microfone.");
    }
  }
  async function enviar() {
    const texto = politico ? `Pergunta sobre ${politico}: ${pergunta.trim()}` : pergunta.trim();
    if (!texto) { setAviso("Escreva ou dite sua dúvida antes de enviar."); return; }
    if (enviando) return;
    setEnviando(true);
    setAviso("");
    try {
      const resposta = await fetch("/api/perguntas", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedText: texto, inputType: ditouRef.current ? "voice" : "text" }),
      });
      const dados = await resposta.json() as { error?: string; trackingPath?: string };
      if (!resposta.ok || !dados.trackingPath || !dados.trackingPath.startsWith("/pergunta/")) {
        throw new Error(dados.error || "Não foi possível enviar sua pergunta. Tente novamente.");
      }
      escutaAtivaRef.current = false;
      reconhecedorRef.current?.stop();
      setGravando(false);
      setCaminhoAcompanhamento(dados.trackingPath);
      try {
        const chave = "fdp-minhas-perguntas-v1";
        const anterior: unknown = JSON.parse(localStorage.getItem(chave) || "[]");
        const itens = Array.isArray(anterior) ? anterior.filter((v): v is {path:string;pergunta:string;criadaEm:string} => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/")) : [];
        localStorage.setItem(chave, JSON.stringify([{path:dados.trackingPath,pergunta:texto,criadaEm:new Date().toISOString()},...itens.filter(v=>v.path!==dados.trackingPath)].slice(0,100)));
      } catch { /* O link individual continua disponível. */ }
      setConfirmacaoTeste(true);
    } catch (erro) {
      setAviso(erro instanceof Error ? erro.message : "Não foi possível enviar sua pergunta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }
  
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl">
    {confirmacaoTeste ? <section aria-live="polite" className="rounded-xl border border-black/15 bg-[#fff9df] p-6">
      <h1 className="text-2xl font-extrabold">Sua pergunta foi recebida!</h1>
      <Link href="/ha-mais-para-entender" className="mt-4 flex min-h-14 items-center justify-center rounded-lg bg-[#c62828] px-5 font-bold text-white">✕ Fechar e voltar ao menu</Link>
      <p className="mt-3 font-semibold">Ela foi registrada e poderá ser analisada antes de uma resposta pública.</p>
      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-4">{pergunta}</p>
      {caminhoAcompanhamento && <Link href={caminhoAcompanhamento} className="mt-4 inline-block font-bold underline underline-offset-4">Acompanhar minha pergunta</Link>}
      <p className="mt-5">Sabe por que o Fora da Pauta existe?</p>
      <p className="mt-3">Porque ninguém deveria fazer escolhas que prejudicam a própria vida por falta de informação.</p>
      <p className="mt-3">É por isso que estamos aqui: para entender o que acontece, esclarecer as dúvidas e compartilhar esse conhecimento com todo mundo.</p>
      <p className="mt-3">Sua pergunta pode ajudar muita gente a entender também.</p>
      <p className="mt-3 font-semibold">Acompanhe as respostas e novidades pelo Telegram.</p>
      <p className="mt-4 font-extrabold">HÁ MAIS PARA ENTENDER.</p>
      <button type="button" onClick={() => { setConfirmacaoTeste(false); setPergunta(""); setCaminhoAcompanhamento(null); ditouRef.current = false; }} className="mt-6 min-h-12 rounded-lg bg-black px-5 text-white">Fazer outra pergunta</button>
    </section> : <>
    
    <h2 className="text-3xl font-extrabold">{politico ? `O que você gostaria de perguntar sobre ${politico}?` : "O que você gostaria de saber?"}</h2>
    {politico && <p className="mt-3 rounded-lg bg-[#fff9df] p-4 text-sm">Sua pergunta será recebida pelo Fora da Pauta. Ela não será enviada automaticamente ao político. O encaminhamento dependerá de um canal oficial verificado.</p>}
    <p className="mt-3">A sua dúvida pode esclarecer muitas outras pessoas com a mesma dúvida.</p>
    <label htmlFor="duvida" className="mt-6 block font-semibold">Sua pergunta (você pode corrigir a transcrição)</label>
    <textarea id="duvida" rows={5} value={pergunta} onChange={e => setPergunta(e.target.value)} placeholder="Escreva sua dúvida aqui..." className="mt-2 w-full rounded-lg border border-black/30 p-4" />
    <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={ouvir} aria-pressed={gravando} className="min-h-14 rounded-lg bg-[#222] px-6 font-bold text-white">{gravando ? "■ Parar gravação" : "🎙 Ditar pergunta"}</button>
    <button type="button" onClick={() => void enviar()} disabled={enviando} className="min-h-14 rounded-lg bg-[#ffd700] px-8 font-bold text-black disabled:opacity-60">{enviando ? "Enviando..." : "Enviar"}</button></div>
    {gravando && <p role="status" aria-live="polite" className="mt-3 flex items-center gap-2 text-base font-semibold text-black"><span aria-hidden="true" className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-red-600" />Ouvindo sua pergunta...</p>}
    <p className="mt-3 text-sm text-black/65">A pergunta será enviada ao Fora da Pauta para análise. Confira o texto antes de enviar.</p>
    {aviso && <p role="status" className="mt-3 rounded-lg bg-black/5 p-4">{aviso}</p>}
    </>}

  </div></main>;
}