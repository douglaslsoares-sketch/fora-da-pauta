"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
type Pessoa = { id: string; nomeUrna: string };
export default function Page(){
  const [pessoas,setPessoas]=useState<Pessoa[]>([]);
  const [status,setStatus]=useState("Consultando suas escolhas...");
  useEffect(()=>{let ativo=true;fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.json()).then(d=>{if(!ativo)return;if(d.ativo!==true){setStatus("Para consultar suas escolhas, confirme a inscrição no Telegram neste navegador.");return;}setPessoas(Array.isArray(d.pessoas)?d.pessoas:[]);setStatus("");}).catch(()=>{if(ativo)setStatus("Não foi possível consultar suas escolhas agora.");});return()=>{ativo=false};},[]);
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-extrabold">Minhas escolhas</h1>{status?<p role="status" className="mt-6">{status}</p>:pessoas.length?<ul className="mt-6 grid gap-3">{pessoas.map(p=><li key={p.id} className="rounded-lg border border-black/20 p-4 font-semibold">{p.nomeUrna}</li>)}</ul>:<p className="mt-6">Você ainda não escolheu nenhum político.</p>}<Link href="/escolher-quem-acompanhar" className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-[#ffd700] px-5 font-bold">Escolher político →</Link><BotaoFecharRodape/></div></main>;
}