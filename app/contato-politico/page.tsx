"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContatoPolitico() {
  const [dados,setDados]=useState({nome:"",cargo:"",uf:"",partido:""});
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setDados({nome:(p.get("nome")||"").slice(0,120),cargo:(p.get("cargo")||"").slice(0,100),uf:(p.get("uf")||"").slice(0,2),partido:(p.get("partido")||"").slice(0,30)});
  },[]);
  const busca=[dados.nome,dados.cargo,dados.uf,"contato gabinete site oficial"].filter(Boolean).join(" ");
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><section className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Entrar em contato</h1>
    {dados.nome?<><h2 className="mt-6 text-2xl font-bold">{dados.nome}</h2><p className="mt-2 text-black/70">{[dados.cargo,dados.uf,dados.partido].filter(Boolean).join(" · ")}</p></>:null}
    <p className="mt-7 leading-7">O Fora da Pauta ajuda você a encontrar o canal oficial para falar com este político. Ainda não temos um contato institucional verificado para exibir diretamente aqui.</p>
    <p className="mt-4 leading-7">Você pode procurar o gabinete ou a página institucional e conferir se o endereço pertence ao órgão público antes de enviar sua mensagem.</p>
    {dados.nome?<a href={"https://www.google.com/search?q="+encodeURIComponent(busca)} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-14 items-center justify-center rounded-lg bg-[#ffd700] px-5 py-3 text-center font-bold">Procurar contato oficial</a>:<p className="mt-5">Volte à lista e escolha o político com quem deseja falar.</p>}
    <p className="mt-4 text-sm text-black/60">Este botão abre uma pesquisa externa. Não envia mensagens nem garante que o contato encontrado seja oficial.</p>
    <div className="mt-10 flex justify-center"><Link href="/minhas-escolhas" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white">✕ Fechar</Link></div>
  </section></main>;
}
