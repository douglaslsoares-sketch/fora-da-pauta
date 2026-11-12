"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownDocument } from "@/components/MarkdownDocument";

type Assunto = { titulo: string; markdown: string; texto: string };

const LIMITE = 3800;

function separarAssuntos(markdown: string): Assunto[] {
  const linhas = markdown.replace(/\r\n/g, "\n").split("\n");
  const secoes: string[][] = [];
  let atual: string[] = [];
  for (const linha of linhas) {
    if (/^#{1,3} /.test(linha) && atual.some((x) => x.trim() && !/^#{1,3} /.test(x))) {
      secoes.push(atual);
      atual = [];
    }
    atual.push(linha);
  }
  if (atual.some((x) => x.trim())) secoes.push(atual);
  const resultado: Assunto[] = [];
  for (const secao of secoes) {
    const blocos = secao.join("\n").split(/\n\s*\n/).filter((x) => x.trim());
    let partes: string[] = [];
    let tamanho = 0;
    for (const bloco of blocos) {
      const texto = bloco.replace(/^#{1,3} /gm, "").replace(/\*\*/g, "").trim();
      if (partes.length && tamanho + texto.length + 2 > LIMITE) {
        const md = partes.join("\n\n");
        resultado.push({ titulo: (md.match(/^#{1,3} (.+)/m)?.[1] || "Continuação"), markdown: md, texto: md.replace(/^#{1,3} /gm, "").replace(/\*\*/g, "") });
        partes = [];
        tamanho = 0;
      }
      partes.push(bloco);
      tamanho += texto.length + 2;
    }
    if (partes.length) {
      const md = partes.join("\n\n");
      resultado.push({ titulo: (md.match(/^#{1,3} (.+)/m)?.[1] || "Continuação do assunto"), markdown: md, texto: md.replace(/^#{1,3} /gm, "").replace(/\*\*/g, "") });
    }
  }
  return resultado;
}

export default function ExperimentoLeitura() {
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [indice, setIndice] = useState(0);
  const [preparando, setPreparando] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [erro, setErro] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  const geracao = useRef(0);

  function parar() {
    geracao.current++;
    audio.current?.pause();
    audio.current = null;
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setTocando(false);
    setPreparando(false);
  }
  useEffect(() => {
    fetch("/api/linha-editorial", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw Error("Não foi possível carregar o artigo original."); return r.text(); })
      .then((md) => setAssuntos(separarAssuntos(md)))
      .catch((e) => setErro(String(e)));
    return () => { geracao.current++; audio.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); };
  }, []);

  async function ouvir() {
    parar();
    const seq = ++geracao.current;
    const assunto = assuntos[indice];
    if (!assunto) return;
    setErro("");
    setPreparando(true);
    try {
      const resposta = await fetch("/api/audio/ler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: assunto.texto, voz: "marin", estrutura: [] }),
      });
      if (!resposta.ok) throw Error("Não foi possível preparar o áudio deste assunto.");
      const blob = await resposta.blob();
      if (seq !== geracao.current) return;
      url.current = URL.createObjectURL(blob);
      const player = new Audio(url.current);
      audio.current = player;
      player.onended = () => setTocando(false);
      await player.play();
      setTocando(true);
    } catch (e) { if (seq === geracao.current) setErro(String(e)); }
    finally { if (seq === geracao.current) setPreparando(false); }
  }
  function escolher(i: number) { parar(); setIndice(i); setErro(""); }

  return <main className="mx-auto min-h-screen max-w-3xl bg-white px-5 py-10 text-black">
    <p className="text-sm font-semibold uppercase tracking-wider">Fora da Pauta · Experiência de leitura</p>
    <h1 className="mt-3 text-3xl font-bold">Um assunto por vez</h1>
    <p className="mt-3 text-base leading-7">Teste experimental: o artigo original permanece intacto. Cada assunto é narrado em uma única geração com a voz Marin. Não há publicação de novos artigos.</p>
    <p className="mt-4 text-sm">Assunto {assuntos.length ? indice + 1 : 0} de {assuntos.length}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button className="rounded bg-yellow-400 px-5 py-3 font-semibold" disabled={!assuntos.length || preparando} onClick={ouvir}>{preparando ? "Preparando o áudio…" : "Ouvir este assunto"}</button>
      <button className="rounded border px-5 py-3" onClick={parar} disabled={!tocando && !preparando}>Parar</button>
    </div>
    {erro && <p role="alert" className="mt-3 text-red-700">{erro}</p>}
    <article className="mt-8 space-y-4">{assuntos[indice] && <MarkdownDocument markdown={assuntos[indice].markdown} />}</article>
    <div className="mt-10 flex flex-wrap gap-3">
      <button className="rounded border px-5 py-3 disabled:opacity-40" disabled={indice === 0} onClick={() => escolher(indice - 1)}>Assunto anterior</button>
      <button className="rounded bg-black px-5 py-3 text-white disabled:opacity-40" disabled={indice >= assuntos.length - 1} onClick={() => escolher(indice + 1)}>Próximo assunto</button>
    </div>
    <p className="mt-8 text-sm text-gray-600">Fonte: o texto integral da linha editorial já publicada. A divisão é experimental e não altera a versão original.</p>
  </main>;
}
