"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Pergunta = {path:string;pergunta:string;criadaEm:string};

export default function Page() {
  const [perguntas,setPerguntas] = useState<Pergunta[] | null>(null);
  const [aviso,setAviso] = useState("");
  const [vinculado,setVinculado] = useState<boolean | null>(null);
  useEffect(() => {
    const carregar = async () => {
    try {
      const resposta = await fetch("/api/perguntas/minhas", {credentials:"same-origin",cache:"no-store"});
      if (resposta.ok) {
        const dados = await resposta.json();
        setVinculado(dados.vinculado === true);
        if (dados.vinculado && Array.isArray(dados.questions)) {
          const remotas = dados.questions as Pergunta[];
          let locais: Pergunta[] = [];
          try {const guardadas: unknown = JSON.parse(localStorage.getItem("fdp-minhas-perguntas-v1") || "[]"); if (Array.isArray(guardadas)) locais = guardadas.filter((v): v is Pergunta => typeof v === "object" && v !== null && typeof v.path === "string" && v.path.startsWith("/pergunta/") && typeof v.pergunta === "string" && typeof v.criadaEm === "string");} catch {}
          setPerguntas([...new Map([...locais,...remotas].map(q=>[q.path,q])).values()].sort((a,b)=>Date.parse(b.criadaEm)-Date.parse(a.criadaEm)));return;
        }
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
    {vinculado===false ? <p role="status" className="mt-4 text-sm text-black/65">Este navegador ainda não está vinculado à sua inscrição do Telegram. Isso não significa que você perdeu a inscrição ou as perguntas.</p> : vinculado===true ? <p role="status" className="mt-4 text-sm text-black/65">Inscrição do Telegram reconhecida neste navegador. Abaixo estão as perguntas recuperadas desta conta ou deste aparelho.</p> : null}
    {aviso && vinculado!==false && <p className="mt-4 text-sm text-black/65">{aviso}</p>}
    {perguntas===null ? <p className="mt-8">Carregando...</p> : perguntas.length===0 ?
      <p className="mt-8">Ainda não foi possível recuperar perguntas nesta sessão. As perguntas já enviadas não precisam ser cadastradas novamente.</p> :
      <ul className="mt-7 grid gap-4">{perguntas.map(item=><li key={item.path} className="rounded-lg border border-black/20 p-5">
        <p className="font-bold">{item.pergunta}</p>
        <p className="mt-2 text-sm text-black/60">Enviada em {new Date(item.criadaEm).toLocaleString("pt-BR")}</p>
        <Link href={item.path} className="mt-4 inline-block font-bold underline underline-offset-4">Ver situação e resposta</Link>
      </li>)}</ul>}
  </div></main>;
}
