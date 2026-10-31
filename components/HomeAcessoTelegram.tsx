"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Situacao = { ativo?: boolean; ids?: string[] };

const opcoes = [
  { titulo: "Acompanhar pessoas", descricao: "Escolha pessoas para acompanhar.", href: "/votou-fique-de-olho" },
  { titulo: "Minhas escolhas", descricao: "Veja ou remova pessoas acompanhadas.", href: "/votou-fique-de-olho?minhas=1", exigeEscolhas: true },
  { titulo: "Ver ficha política", descricao: "Pesquise e consulte uma ficha.", href: "/conheca-seu-candidato" },
  { titulo: "Edições já publicadas", descricao: "Leia ou ouça as edições.", href: "/edicoes", indisponivel: true },
];

export function HomeAcessoTelegram() {
  const [situacao, setSituacao] = useState<"inscrito" | "visitante">("visitante");
  const [quantidade, setQuantidade] = useState(0);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [simulacao, setSimulacao] = useState(false);

  useEffect(() => {
    setSimulacao(new URLSearchParams(window.location.search).get("simular") === "telegram");
  }, []);

  useEffect(() => {
    let montado = true;
    async function verificar() {
      try {
        const resposta = await fetch("/api/telegram/sessao", { cache: "no-store" });
        if (!resposta.ok) throw new Error("Consulta indisponível");
        const dados = (await resposta.json()) as Situacao;
        if (!montado) return;
        setSituacao(dados.ativo === true ? "inscrito" : "visitante");
        setQuantidade(dados.ativo === true && Array.isArray(dados.ids) ? dados.ids.length : 0);
      } catch {
        // Não presume que a pessoa está inscrita.
        if (montado) setSituacao("visitante");
      }
    }
    void verificar();
    window.addEventListener("focus", verificar);
    return () => { montado = false; window.removeEventListener("focus", verificar); };
  }, []);

  useEffect(() => {
    if (!simulacao && situacao === "inscrito" && window.location.hash === "#opcoes") {
      setMostrarMenu(true);
      window.requestAnimationFrame(() => {
        document.getElementById("opcoes")?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
  }, [situacao, simulacao]);

  if (simulacao && !mostrarMenu) {
    return (
      <div className="mt-10">
        <button type="button" onClick={() => setMostrarMenu(true)} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#FFD700] px-7 py-4 text-lg font-bold text-black hover:bg-[#f0ca00]">
          Acompanhe as novidades pelo Telegram <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  if (!simulacao && situacao === "visitante") {
    return (
      <div className="mt-10">
        <p className="mb-4 text-lg leading-relaxed text-white/85">
          Receba as novidades do Fora da Pauta e acompanhe as decisões políticas que afetam a sua vida.
        </p>
        <Link href="/votou-fique-de-olho" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#FFD700] px-7 py-4 text-lg font-bold text-black hover:bg-[#f0ca00]">
          Acompanhe as novidades pelo Telegram <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  if (!simulacao && !mostrarMenu) {
    return (
      <div className="mt-10">
        <button
          type="button"
          onClick={() => {
            setMostrarMenu(true);
            window.history.replaceState(null, "", "#opcoes");
          }}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#FFD700] px-7 py-4 text-lg font-bold text-black hover:bg-[#f0ca00]"
        >
          Continuar <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <section id="opcoes" aria-labelledby="titulo-opcoes" className="mt-12 scroll-mt-6 border-t border-white/25 pt-10">
      <h2 id="titulo-opcoes" className="text-3xl font-bold tracking-tight sm:text-4xl">
        O que você quer fazer agora?
      </h2>
      <p className="mt-3 text-base leading-7 text-white/70">
        {!simulacao && quantidade > 0
          ? `Você acompanha ${quantidade} ${quantidade === 1 ? "pessoa" : "pessoas"}.`
          : "Você já está de olho. Escolha por onde começar."}
      </p>
      <nav aria-label="Opções do Fora da Pauta" className="mt-7 grid max-w-[640px] gap-3">
        {opcoes.map((item) => {
          if (item.indisponivel || (item.exigeEscolhas && (simulacao || quantidade === 0))) {
            return (
              <div key={item.titulo} aria-disabled="true" className="cursor-not-allowed rounded-lg border border-white/15 bg-[#343434] px-5 py-4 text-white/45">
                <span className="text-lg font-bold">{item.titulo} · Indisponível</span>
                <span className="mt-1 block text-sm">{item.indisponivel ? "Disponível quando publicarmos as edições." : "Disponível quando você acompanhar alguém."}</span>
              </div>
            );
          }
          return (
            <Link key={item.titulo} href={item.href} className="block rounded-lg bg-[#FFD700] px-5 py-4 text-black hover:bg-[#ebc700]">
              <span className="text-lg font-bold">{item.titulo} <span aria-hidden="true">→</span></span>
              <span className="mt-1 block text-sm text-black/70">{item.descricao}</span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
