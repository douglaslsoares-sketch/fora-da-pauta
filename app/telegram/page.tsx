"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
export default function TelegramPage(){
 const [inscrito,setInscrito]=useState<boolean|null>(null);
 useEffect(()=>{fetch("/api/telegram/sessao",{credentials:"same-origin",cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>setInscrito(d?.ativo===true)).catch(()=>setInscrito(false));},[]);
 return <main className="min-h-screen bg-white px-5 py-12 text-black"><div className="mx-auto max-w-2xl">
 <h1 className="text-3xl font-extrabold">TELEGRAM</h1>
 {inscrito===true?<><p className="mt-7 text-xl font-semibold">Obrigado por se inscrever!</p><p className="mt-4 text-lg">Agora volte para o Fora da Pauta para selecionar os políticos que você quer acompanhar.</p><Link href="/escolher-quem-acompanhar" className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-[#ffd700] px-5 text-center font-bold text-black">Clique aqui para continuar →</Link></>:
 <><p className="mt-7 text-lg">Para continuar, primeiro confirme sua inscrição no Telegram.</p><p className="mt-3">Depois, volte a esta página. A confirmação será verificada antes de escolher os políticos.</p><button onClick={()=>window.location.reload()} className="mt-7 min-h-14 rounded-lg bg-[#229ed9] px-6 font-bold text-white">Já confirmei. Verificar novamente</button></>}
 <BotaoFecharRodape/></div></main>;
}
