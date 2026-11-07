"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type SpeechResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechInstance = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: SpeechResult) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechConstructor = new () => SpeechInstance;

export default function Page() {
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
  const [reconhecedor, setReconhecedor] = useState<SpeechInstance | null>(null);
  function ouvir() {
    if (gravando && reconhecedor) { reconhecedor.stop(); setGravando(false); return; }
    const janela = window as Window & { SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor };
    const Classe = janela.SpeechRecognition ?? janela.webkitSpeechRecognition;
    if (!Classe) { setAviso("Seu navegador não oferece transcrição por voz. Você pode digitar sua pergunta."); return; }
    const voz = new Classe(); voz.lang = "pt-BR"; voz.continuous = false; voz.interimResults = false;
    voz.onresult = e => { const texto = Array.from(e.results).map(r => r[0]?.transcript ?? "").join(" "); setPergunta(p => [p, texto].filter(Boolean).join(" ").trim()); setAviso("Confira e corrija a transcrição antes de enviar."); };
    voz.onerror = () => { setGravando(false); setAviso("Não foi possível reconhecer a voz. Você pode digitar."); };
    voz.onend = () => setGravando(false);
    setReconhecedor(voz); setAviso(""); setGravando(true);
    try { voz.start(); } catch { setGravando(false); setAviso("Não foi possível iniciar o microfone."); }
  }
  function enviar() {
    if (!pergunta.trim()) { setAviso("Escreva ou dite sua dúvida antes de enviar."); return; }
    try {
      const anterior = JSON.parse(localStorage.getItem("fdp-perguntas-teste") ?? "[]") as string[];
      localStorage.setItem("fdp-perguntas-teste", JSON.stringify([...anterior.slice(-19), pergunta.trim()]));
      setPergunta(""); setAviso(""); setConfirmacaoTeste(true);
    } catch { setAviso("Não foi possível guardar a pergunta neste navegador."); }
  }
  const link = "flex min-h-14 items-center justify-center rounded-lg border border-black/20 bg-white px-5 py-3 text-center font-bold";
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl">
    {confirmacaoTeste ? <section aria-live="polite" className="rounded-xl border border-black/15 bg-[#fff9df] p-6">
      <h1 className="text-2xl font-extrabold">Pronto! Sua pergunta foi guardada para o teste.</h1>
      <p className="mt-3 font-semibold">Ela ainda não foi enviada ao Fora da Pauta.</p>
      <p className="mt-5">Sabe por que o Fora da Pauta existe?</p>
      <p className="mt-3">Porque ninguém deveria fazer escolhas que prejudicam a própria vida por falta de informação.</p>
      <p className="mt-3">É por isso que estamos aqui: para entender o que acontece, esclarecer as dúvidas e compartilhar esse conhecimento com todo mundo.</p>
      <p className="mt-3">Sua pergunta pode ajudar muita gente a entender também.</p>
      <p className="mt-3 font-semibold">Acompanhe as respostas e novidades pelo Telegram.</p>
      <p className="mt-4 font-extrabold">HÁ MAIS PARA ENTENDER.</p>
      <button type="button" onClick={() => setConfirmacaoTeste(false)} className="mt-6 min-h-12 rounded-lg bg-black px-5 text-white">Fazer outra pergunta</button>
    </section> : <>
    <h1 className="text-3xl font-extrabold">HÁ MAIS PARA ENTENDER.</h1>
    <h2 className="mt-7 text-2xl font-bold">O que você gostaria de entender?</h2>
    <p className="mt-3">A sua dúvida pode esclarecer muitas outras pessoas com a mesma dúvida.</p>
    <label htmlFor="duvida" className="mt-6 block font-semibold">Sua pergunta (você pode corrigir a transcrição)</label>
    <textarea id="duvida" rows={5} value={pergunta} onChange={e => setPergunta(e.target.value)} placeholder="Escreva sua dúvida aqui..." className="mt-2 w-full rounded-lg border border-black/30 p-4" />
    <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={ouvir} aria-pressed={gravando} className="min-h-14 rounded-lg bg-[#222] px-6 font-bold text-white">{gravando ? "■ Parar gravação" : "🎙 Ditar pergunta"}</button>
    <button type="button" onClick={enviar} className="min-h-14 rounded-lg bg-[#ffd700] px-8 font-bold text-black">Enviar</button></div>
    <p className="mt-3 text-sm text-black/65">Teste: a pergunta fica salva apenas neste navegador. O envio à equipe ainda não está ativado.</p>
    {aviso && <p role="status" className="mt-3 rounded-lg bg-black/5 p-4">{aviso}</p>}
    </>}
    <nav className="mt-9 grid gap-3" aria-label="Próximas opções">
      <Link className={link} href="/escolher-quem-acompanhar">Escolher político</Link>
      {temEscolhas
        ? <Link className={link} href="/minhas-escolhas">Minhas escolhas</Link>
        : <span aria-disabled="true" className={link+" cursor-not-allowed bg-[#eeeeee] text-black/40"}>Minhas escolhas</span>}
      <Link className={link} href="/qr-code-fora-da-pauta">QR Code</Link>
      <Link className={link} href="/camiseta">Camiseta</Link>
      <a className={link+" !border-[#25d366] !bg-[#25d366] !text-white"} href={"https://wa.me/?text="+encodeURIComponent("Conheça o Fora da Pauta. Acompanhe o que seu representante faz depois de eleito. https://www.foradapauta.org/")}>Compartilhar</a>
    </nav>
    {mostrarInstalacao ? <div className="mt-5 text-center"><Link href="/instalar" className="inline-block py-3 text-sm font-semibold text-black/65 underline underline-offset-4">Instalar o Fora da Pauta</Link></div> : null}
  </div></main>;
}