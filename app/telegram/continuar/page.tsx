"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function Page(){
  const [status,setStatus]=useState<"verificando"|"confirmado"|"pendente">("verificando");
  async function verificar(){setStatus("verificando");try{const r=await fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"});const d=await r.json();setStatus(d.ativo===true?"confirmado":"pendente");}catch{setStatus("pendente");}}
  useEffect(()=>{void verificar();},[]);
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-xl"><h1 className="text-3xl font-extrabold">Obrigado por se inscrever!</h1><p className="mt-5 text-lg">Agora volte para o Fora da Pauta para selecionar os políticos que você quer acompanhar.</p>{status==="verificando"?<p className="mt-5">Verificando sua inscrição...</p>:status==="confirmado"?<Link href="/escolher-quem-acompanhar" className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-[#229ed9] px-5 text-center font-bold text-white">Clique aqui para continuar →</Link>:<div className="mt-6"><p role="status">Ainda não foi possível confirmar o vínculo com o Telegram neste navegador. Conclua a inscrição pelo bot e volte aqui.</p><button type="button" onClick={()=>void verificar()} className="mt-5 min-h-14 rounded-lg bg-black px-5 font-bold text-white">Verificar novamente</button></div>}</div></main>;
}