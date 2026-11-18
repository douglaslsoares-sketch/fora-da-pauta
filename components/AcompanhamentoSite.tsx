"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CandidateSelector } from "@/components/CandidateSelector";
import { CandidatePhoto } from "@/components/CandidatePhoto";

type Pessoa = { id: string; nomeUrna: string };
type Resultado = { ids?: string[]; erro?: string };

export function AcompanhamentoSite({ modo }: { modo: "escolher" | "lista" | "recado" }) {
  const [ids, setIds] = useState<string[]>([]);
  const [pessoas, setPessoas] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function consultar() {
    const resposta = await fetch("/api/site/acompanhamentos", { cache: "no-store" });
    const dados = await resposta.json() as Resultado;
    if (!resposta.ok) throw Error(dados.erro || "Não foi possível consultar a lista.");
    setIds(Array.isArray(dados.ids) ? dados.ids : []);
  }

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const resposta = await fetch("/api/site/acompanhamentos", { cache: "no-store" });
        const dados = await resposta.json() as Resultado;
        if (!resposta.ok) throw Error(dados.erro || "Não foi possível consultar a lista.");
        if (ativo) setIds(Array.isArray(dados.ids) ? dados.ids : []);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Falha na consulta.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!ids.length) return;
    let ativo = true;
    async function nomes() {
      try {
        const resposta = await fetch(`/api/site/candidaturas?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = await resposta.json() as { pessoas?: Pessoa[] };
        if (ativo && Array.isArray(dados.pessoas)) {
          setPessoas(atual => ({ ...atual, ...Object.fromEntries(dados.pessoas!.map(p => [p.id, p.nomeUrna])) }));
        }
      } catch { /* Nomes opcionais: a lista de IDs permanece disponível. */ }
    }
    void nomes();
    return () => { ativo = false; };
  }, [ids.join(",")]);

  async function alterar(method: "POST" | "DELETE", pessoa: Pessoa) {
    if (salvando) return;
    setSalvando(true);
    setErro("");
    setAviso("");
    try {
      const resposta = await fetch("/api/site/acompanhamentos", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pessoa.id }),
      });
      const dados = await resposta.json() as Resultado;
      if (!resposta.ok) throw Error(dados.erro || "Não foi possível salvar.");
      setPessoas(atuais => ({ ...atuais, [pessoa.id]: pessoa.nomeUrna }));
      await consultar();
      setAviso(method === "POST" ? "Político selecionado." : "Político removido.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return <section className="mx-auto w-full max-w-3xl px-5 py-8 text-black">
    <h1 className="mb-3 text-2xl font-bold">{modo === "escolher" ? "Escolher um político" : modo === "recado" ? "Escolha o destinatário" : "Políticos que eu acompanho"}</h1>
    {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
    {aviso && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{aviso}</p>}
    {carregando ? <p role="status">Carregando acompanhamentos...</p> : modo === "escolher" ? (
      <div aria-busy={salvando}>
        <CandidateSelector mode="follow" selectedIds={ids} onSelect={pessoa => alterar("POST", pessoa)} />
        {salvando && <p role="status" className="mt-3">Salvando escolha...</p>}
      </div>
    ) : ids.length ? <ul className="space-y-3">{ids.map(id => <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <CandidatePhoto id={id} name={pessoas[id] || "Político acompanhado"} />
      <div className="min-w-0 flex-1"><p className="font-semibold">{pessoas[id] || "Candidatura " + id}</p></div>
      {modo === "recado" ? <Link href={`/mandar-recado/politico/${encodeURIComponent(id)}`} className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white">Escolher</Link> : <button type="button" disabled={salvando} onClick={() => void alterar("DELETE", { id, nomeUrna: pessoas[id] || id })}
        className="rounded-lg border border-red-300 px-4 py-3 font-semibold text-red-700 disabled:opacity-50">Remover</button>}
    </li>)}</ul> : <p>Você não acompanha nenhum político.</p>}
    <div className="mt-8 flex justify-center"><Link href="/central" className="rounded-lg bg-red-600 px-8 py-3 font-bold text-white">Fechar</Link></div>
  </section>;
}
