"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Pergunta = {path:string;pergunta:string;criadaEm:string};

export default function Page() {
  const [perguntas,setPerguntas] = useState<Pergunta[] | null>(null);
  const [aviso,setAviso] = useState("");
  useEffect(() => {
    const carregar = async () => {
    try {
      const resposta = await fetch("/api/perguntas/minhas", {credentials:"same-origin",cache:"no-store"});
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.vinculado && Array.isArray(dados.questions)) {\n          const remotas = dados.questions as Pergunta[];\n          let locais: Pergunta[] = [];\n          try {const guardadas: unknown = JSON.parse(localStorage.getItem("fdp-minhas-perguntas-v1") || "[]"); if (Array.isArray(guardadas)) locais = guardadas.filter((v): v is Pergunta => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/") && typeof v.pergunta === "string" && typeof v.criadaEm === "string");} catch {}\n          setPerguntas([...new Map([...locais,...remotas].map(q=>[q.path,q])).values()].sort((a,b)=>Date.parse(b.criadaEm)-Date.parse(a.criadaEm)));return;\n        }
        if (!dados.vinculado) setAviso("Para ver suas perguntas em outros aparelhos, entre com sua inscrição do Telegram. As perguntas guardadas neste navegador continuam abaixo.");
      }
    } catch {setAviso("Não foi possível consultar sua inscrição agora. Mostrando perguntas guardadas neste navegador.");}
    try {
      const dados: unknown = JSON.parse(localStorage.getItem("fdp-minhas-perguntas-v1") || "[]");
      setPerguntas(Array.isArray(dados) ? dados.filter((v): v is Pergunta => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/") && typeof v.pergunta === "string" && typeof v.criadaEm === "string") : []);
    } catch { setPerguntas([]); }
    };
    void carregar();
  }, []);
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Minhas perguntas</h1>
    <p className="mt-4 text-black/70">Acompanhe suas perguntas e consulte as respostas.</p>
    {aviso && <p className="mt-4 text-sm text-black/65">{aviso}</p>}
    {perguntas===null ? <p className="mt-8">Carregando...</p> : perguntas.length===0 ?
      <p className="mt-8">Ainda não foi possível recuperar perguntas nesta sessão. As perguntas já enviadas não precisam ser cadastradas novamente.</p> :
      <ul className="mt-7 grid gap-4">{perguntas.map(item=><li key={item.path} className="rounded-lg border border-black/20 p-5">
        <p className="font-bold">{item.pergunta}</p>
        <p className="mt-2 text-sm text-black/60">Enviada em {new Date(item.criadaEm).toLocaleString("pt-BR")}</p>
        <Link href={item.path} className="mt-4 inline-block font-bold underline underline-offset-4">Ver situação e resposta</Link>
      </li>)}</ul>}
  </div></main>;
}
