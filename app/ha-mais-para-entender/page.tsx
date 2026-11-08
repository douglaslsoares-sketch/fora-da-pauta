"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const botao = "flex min-h-14 items-center justify-center rounded-lg bg-white px-5 py-4 text-center font-bold text-black";
export default function Page() {
  const [temEscolhas, setTemEscolhas] = useState(false);
  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
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
  return <main className="min-h-screen bg-black px-5 py-10 text-white"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">HÁ MAIS PARA ENTENDER.</h1>
    <p className="mt-7 text-lg font-semibold">O que você gostaria de entender?</p>
    <nav className="mt-5 grid gap-3" aria-label="Opções do Fora da Pauta">
      <Link className={botao+" !bg-[#ffd700]"} href="/fazer-uma-pergunta">Fazer uma pergunta</Link>
      <Link className={botao} href="/escolher-quem-acompanhar">Escolher político</Link>
      {temEscolhas
        ? <Link className={botao} href="/minhas-escolhas">Minhas escolhas</Link>
        : <span aria-disabled="true" className={botao+" !bg-[#333] !text-white/50"}>Minhas escolhas</span>}
      <Link className={botao} href="/qr-code-fora-da-pauta">QR Code</Link>
      <Link className={botao} href="/camiseta">Camiseta</Link>
      <a className={botao+" !bg-[#25d366] !text-white"} href={"https://wa.me/?text="+encodeURIComponent("Você sabe o que os políticos estão fazendo?\n\nO Fora da Pauta acompanha o dia a dia da política e ajuda você a entender como as decisões afetam a nossa vida.\n\nHá mais para entender.\n\nhttps://foradapauta.org")}>Compartilhar</a>
    </nav>
    {mostrarInstalacao ? <div className="mt-5 text-center"><Link href="/instalar" className="inline-block py-3 text-sm font-semibold text-white/75 underline underline-offset-4">Instalar o Fora da Pauta</Link></div> : null}
  </div></main>;
}
