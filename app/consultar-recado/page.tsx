"use client";
import Link from "next/link";
import { useState } from "react";

type Resultado = { status: string; resposta: string | null; respondido_em: string | null };
export default function ConsultarRecado() {
  const [protocolo, setProtocolo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  async function consultar() {
    setErro(""); setResultado(null); setCarregando(true);
    try {
      const resposta = await fetch("/api/recados/consulta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ protocolo: protocolo.trim() }), cache: "no-store" });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Falha ao consultar.");
      setResultado(dados as Resultado);
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao consultar."); }
    finally { setCarregando(false); }
  }
  return <main className="min-h-screen bg-[#141c2b] px-5 py-8 text-white">
    <section className="mx-auto max-w-xl">
      <h1 className="text-center text-2xl font-bold">Consultar resposta</h1>
      <p className="mt-3 text-slate-300">Digite o protocolo recebido ao mandar seu recado. Guarde esse número em segurança: quem o possuir poderá consultar a resposta.</p>
      <label htmlFor="protocolo" className="mt-7 block font-semibold">Protocolo</label>
      <input id="protocolo" value={protocolo} onChange={e => setProtocolo(e.target.value)} autoComplete="off" placeholder="Cole seu protocolo aqui" className="mt-2 w-full rounded-lg border border-slate-500 bg-white p-3 text-black" />
      <button type="button" disabled={carregando || !protocolo.trim()} onClick={() => void consultar()} className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-bold disabled:opacity-50">{carregando ? "Consultando..." : "Consultar"}</button>
      {erro && <p role="alert" className="mt-5 text-red-200">{erro}</p>}
      {resultado && <div role="status" className="mt-6 rounded-xl border border-[#344760] bg-[#24334b] p-5">
        <h2 className="font-bold">Situação: {resultado.status === "respondido" ? "Respondido" : resultado.status === "em_analise" ? "Em análise" : resultado.status === "arquivado" ? "Arquivado" : "Recebido"}</h2>
        {resultado.resposta ? <><p className="mt-4 font-semibold">Resposta do Fora da Pauta</p><p className="mt-2 whitespace-pre-wrap break-words">{resultado.resposta}</p>{resultado.respondido_em && <p className="mt-3 text-xs text-slate-300">Publicada em {new Date(resultado.respondido_em).toLocaleString("pt-BR")}</p>}</> : <p className="mt-3 text-slate-300">Ainda não há resposta publicada para este protocolo.</p>}
      </div>}
      <div className="mt-8 text-center"><Link href="/mandar-recado" className="inline-block rounded-lg bg-red-600 px-9 py-3 font-bold"><span aria-hidden="true" className="mr-2">x</span>Fechar</Link></div>
    </section>
  </main>;
}
