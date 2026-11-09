"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const botao = "flex min-h-14 items-center justify-center rounded-lg bg-white px-5 py-4 text-center font-bold text-black";
export default function Page() {
  const [sessaoAtiva, setSessaoAtiva] = useState<boolean | null>(null);
  const [temPerguntas, setTemPerguntas] = useState(false);
  useEffect(() => {
    const verificar = async () => {
      try {
        const resposta = await fetch("/api/perguntas/minhas", {credentials:"same-origin",cache:"no-store"});
        if (resposta.ok) {const dados = await resposta.json(); if (dados.vinculado) {setTemPerguntas(Array.isArray(dados.questions) && dados.questions.length>0);return;}}
      } catch {}
      try {
        const dados: unknown = JSON.parse(localStorage.getItem("fdp-minhas-perguntas-v1") || "[]");
        setTemPerguntas(Array.isArray(dados) && dados.some(v => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/")));
      } catch { setTemPerguntas(false); }
    };
    verificar();
    window.addEventListener("focus", verificar);
    return () => window.removeEventListener("focus", verificar);
  }, []);
  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
  useEffect(() => {
    let ativo = true;
    const verificar = () => fetch("/api/telegram/sessao", {credentials:"same-origin",cache:"no-store"})
      .then(r => r.ok ? r.json() : null)
      .then(d => {if(ativo) {setSessaoAtiva(d?.ativo===true);}})
      .catch(() => {if(ativo) {setSessaoAtiva(null);}});
    void verificar();
    window.addEventListener("focus", verificar);
    return () => {ativo=false;window.removeEventListener("focus",verificar);};
  }, []);
  useEffect(() => {
    const verificar = () => setMostrarInstalacao(
      !window.matchMedia("(display-mode: standalone)").matches &&
      (navigator as Navigator & { standalone?: boolean }).standalone !== true
    );
    verificar();
    window.addEventListener("focus", verificar);
    return () => window.removeEventListener("focus", verificar);
  }, []);
  return <main className="min-h-screen bg-black px-5 py-10 text-white"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">HÁ MAIS PARA ENTENDER.</h1>
    <p className="mt-7 text-lg font-semibold">O que você gostaria de entender?</p>
    <nav className="mt-5 grid gap-3" aria-label="Opções do Fora da Pauta">
      <Link className={botao+" !bg-[#ffd700]"} href="/fazer-uma-pergunta">Perguntar ao Fora da Pauta</Link>
      <Link className={botao} href="/minhas-perguntas">Minhas perguntas</Link>
      <Link className={botao} href="/escolher-quem-acompanhar">Escolher político</Link>
      <Link className={botao} href="/minhas-escolhas">Minhas escolhas</Link>
      <Link className={botao} href="/qr-code-fora-da-pauta">QR Code</Link>
      <Link className={botao} href="/camiseta">Camiseta</Link>
      <a className={botao+" !bg-[#25d366] !text-white"} href={"https://wa.me/?text="+encodeURIComponent("Você sabe o que os políticos estão fazendo?\n\nO Fora da Pauta acompanha o dia a dia da política e ajuda você a entender como as decisões afetam a nossa vida.\n\nHá mais para entender.\n\nhttps://foradapauta.org")}>Compartilhar</a>
    </nav>
    {sessaoAtiva===false ? <p role="status" className="mt-5 text-center text-sm text-white/75">Este navegador ainda não tem uma sessão Telegram confirmada neste endereço. Para recuperar suas escolhas aqui, será necessário vincular sua inscrição existente. Não é preciso selecionar novamente os políticos.</p> : null}
    {mostrarInstalacao ? <div className="mt-5 text-center"><Link href="/instalar" className="inline-block py-3 text-sm font-semibold text-white/75 underline underline-offset-4">Instalar o Fora da Pauta</Link></div> : null}
  </div></main>;
}
