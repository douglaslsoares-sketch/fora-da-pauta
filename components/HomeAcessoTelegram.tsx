"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type Situacao = { ativo?: boolean; ids?: string[] };
type Opcao = { titulo: string; descricao: string; href: string; exigeEscolhas?: boolean; indisponivel?: boolean };
const opcoes: Opcao[] = [
  { titulo: "Acompanhar pessoas", descricao: "Escolha pessoas para acompanhar.", href: "/votou-fique-de-olho" },
  { titulo: "Minhas escolhas", descricao: "Veja ou remova pessoas acompanhadas.", href: "/votou-fique-de-olho?minhas=1", exigeEscolhas: true },
  { titulo: "Ver ficha política", descricao: "Pesquise e consulte uma ficha.", href: "/ficha-politica" },
  { titulo: "Edições já publicadas", descricao: "Leia ou ouça as edições.", href: "/edicoes" },
  { titulo: "Camiseta Fora da Pauta", descricao: "Ajude a financiar o projeto.", href: "/camiseta" },
];
function SeloTelegram() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-4 z-10 flex h-11 w-11 rotate-[-12deg] items-center justify-center rounded-full border-[3px] border-[#101010] bg-[#229ED9] shadow-md sm:h-11 sm:w-11">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white" aria-hidden="true">
        <path d="M21.94 4.66a1.16 1.16 0 0 0-1.35-.15L2.65 11.43a1.1 1.1 0 0 0 .08 2.07l4.7 1.52 1.78 5.18a.88.88 0 0 0 1.46.32l2.56-2.5 4.58 3.36a1.16 1.16 0 0 0 1.82-.69l2.67-14.87a1.15 1.15 0 0 0-.36-1.16ZM9.3 14.56l8.93-6.76-7.2 8.04-.3 2.28-1.43-3.56Z" />
      </svg>
    </span>
  );
}

export function HomeAcessoTelegram() {
  const [situacao, setSituacao] = useState<"verificando" | "inscrito" | "visitante">("verificando");
  const [quantidade, setQuantidade] = useState(0);
  const [simulacao, setSimulacao] = useState(false);
  const [mostrarMenuSimulado, setMostrarMenuSimulado] = useState(false);

  useEffect(() => {
    const simulando = new URLSearchParams(window.location.search).get("simular") === "telegram";
    setSimulacao(simulando);
    let ativo = true;
    async function verificar() {
      try {
        const resposta = await fetch("/api/telegram/sessao", { cache: "no-store", credentials: "same-origin" });
        if (!resposta.ok) throw new Error("Sessão indisponível");
        const dados = (await resposta.json()) as Situacao;
        if (!ativo) return;
        setSituacao(dados.ativo ? "inscrito" : "visitante");
        setQuantidade(dados.ativo && Array.isArray(dados.ids) ? dados.ids.length : 0);
      } catch {
        if (ativo) setSituacao("visitante");
      }
    }
    void verificar();
    window.addEventListener("focus", verificar);
    const aoRetomar = () => { if (document.visibilityState === "visible") void verificar(); };
    document.addEventListener("visibilitychange", aoRetomar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", verificar);
      document.removeEventListener("visibilitychange", aoRetomar);
    };
  }, []);

  const visitante = !simulacao && situacao === "visitante";
  const emVerificacao = !simulacao && situacao === "verificando";
  const menu = (simulacao && mostrarMenuSimulado) || (!simulacao && situacao === "inscrito");

  return (
    <div className={styles.container}>
      {(!menu || emVerificacao) ? (
        <>
          <header className={styles.header}>
            <Image src="/marca/fora-da-pauta-horizontal-branco.svg" alt="Fora da Pauta" width={2325} height={374} priority className={styles.logo} />
          </header>
          <section className={styles.hero} id="conteudo" aria-labelledby="home-titulo">
            <h1 id="home-titulo" className={styles.title}>Há mais para entender.</h1>
            <div className={styles.statement}>
              <p>Como o jogo é jogado.</p>
              <p>Decisões políticas que afetam a sua vida.</p>
            </div>
            {emVerificacao ? <p className="mt-10 text-white/70" role="status">Verificando inscrição...</p> : null}
            {visitante ? (
              <div className="mt-10">
                <Link href="/votou-fique-de-olho" className="relative inline-flex min-h-14 w-full max-w-[370px] items-center justify-center gap-2 rounded-lg bg-[#FFD700] px-5 py-4 pr-10 text-center text-base font-bold leading-snug text-black sm:w-auto sm:text-lg">
                  Acompanhe as novidades pelo Telegram <span aria-hidden="true">→</span><SeloTelegram />
                </Link>
              </div>
            ) : null}
            {simulacao && !mostrarMenuSimulado ? (
              <button type="button" onClick={() => setMostrarMenuSimulado(true)}
                className="relative mt-10 inline-flex min-h-14 w-full max-w-[370px] items-center justify-center rounded-lg bg-[#FFD700] px-5 py-4 pr-10 text-center text-base font-bold leading-snug text-black sm:w-auto sm:text-lg">
                Acompanhe as novidades pelo Telegram →<SeloTelegram />
              </button>
            ) : null}
          </section>
        </>
      ) : null}
      {menu ? (
        <header className={styles.header}>
          <Link href="/" aria-label="Fora da Pauta — página inicial">
            <Image src="/marca/fora-da-pauta-horizontal-branco.svg" alt="Fora da Pauta" width={2325} height={374} priority className={styles.logo} />
          </Link>
        </header>
      ) : null}
      {menu ? (
        <section id="opcoes" aria-labelledby="titulo-opcoes" className="my-auto w-full max-w-[680px] py-12" >
          {!simulacao && situacao === "inscrito" ? <p className="mb-5 text-sm font-medium text-white/65">✓ Você está inscrito no Telegram.</p> : null}
          <h1 id="titulo-opcoes" className="text-3xl font-bold tracking-tight sm:text-4xl">O que você quer fazer agora?</h1>
          <p className="mt-3 text-base leading-7 text-white/70">
            {!simulacao && quantidade > 0
              ? `Você acompanha ${quantidade} ${quantidade === 1 ? "pessoa" : "pessoas"}.`
              : "Você já está de olho. Escolha por onde começar."}
          </p>
          <nav aria-label="Opções do Fora da Pauta" className="mt-7 grid gap-3">
            {opcoes.map(item => {
              const desativado = Boolean(item.indisponivel || (item.exigeEscolhas && (simulacao || quantidade === 0)));
              return desativado ? (
                <div key={item.titulo} aria-disabled="true" className="rounded-lg border border-white/15 bg-[#343434] px-5 py-4 text-white/45">
                  <span className="text-lg font-bold">{item.titulo} · Indisponível</span>
                  <span className="mt-1 block text-sm">{item.indisponivel ? "Em breve. Sua compra ajudará a financiar o Fora da Pauta." : "Disponível quando você acompanhar alguém."}</span>
                </div>
              ) : (
                <Link key={item.titulo} href={item.href} className="block rounded-lg bg-[#FFD700] px-5 py-4 text-black hover:bg-[#ebc700]">
                  <span className="text-lg font-bold">{item.titulo} →</span>
                  <span className="mt-1 block text-sm text-black/70">{item.descricao}</span>
                </Link>
              );
            })}
          </nav>
        </section>
      ) : null}
    </div>
  );
}
