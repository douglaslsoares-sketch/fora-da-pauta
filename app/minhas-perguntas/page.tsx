"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Pergunta = {path:string;pergunta:string;criadaEm:string};

export default function Page() {
  const [perguntas,setPerguntas] = useState<Pergunta[] | null>(null);
  useEffect(() => {
    try {
      const dados: unknown = JSON.parse(localStorage.getItem("fdp-minhas-perguntas-v1") || "[]");
      setPerguntas(Array.isArray(dados) ? dados.filter((v): v is Pergunta => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/") && typeof v.pergunta === "string" && typeof v.criadaEm === "string") : []);
    } catch { setPerguntas([]); }
  }, []);
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Minhas perguntas</h1>
    <p className="mt-4 text-black/70">Acompanhe as perguntas enviadas neste navegador.</p>
    {perguntas===null ? <p className="mt-8">Carregando...</p> : perguntas.length===0 ?
      <p className="mt-8">Nenhuma pergunta encontrada neste navegador. Se você enviou uma pergunta em outro aparelho ou guia anônima, utilize o link de acompanhamento recebido após o envio.</p> :
      <ul className="mt-7 grid gap-4">{perguntas.map(item=><li key={item.path} className="rounded-lg border border-black/20 p-5">
        <p className="font-bold">{item.pergunta}</p>
        <p className="mt-2 text-sm text-black/60">Enviada em {new Date(item.criadaEm).toLocaleString("pt-BR")}</p>
        <Link href={item.path} className="mt-4 inline-block font-bold underline underline-offset-4">Ver situação e resposta</Link>
      </li>)}</ul>}
    <Link href="/ha-mais-para-entender" className="mt-10 flex min-h-14 items-center justify-center rounded-lg bg-black px-5 py-4 text-center font-bold text-white">HÁ MAIS PARA ENTENDER.</Link>
  </div></main>;
}
