"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CandidateSelector } from "@/components/CandidateSelector";
import { CandidateFollowLiveSearch } from "@/components/CandidateFollowLiveSearch";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";
import { CabecalhoPoliticos } from "@/components/CabecalhoPoliticos";

type Pessoa = {
  id: string;
  nomeUrna: string;
  cargoLabel?: string;
  uf?: string;
  siglaPartido?: string;
};
type Resultado = { ids?: string[]; erro?: string };

export function AcompanhamentoSite({ modo, voltarPara = "/central", incorporado = false, onPerfilChange }: { modo: "escolher" | "lista" | "recado"; voltarPara?: "/central" | "/politicos"; incorporado?: boolean; onPerfilChange?: (aberto: boolean) => void }) {
  const [aberto, setAberto] = useState<Pessoa | null>(null);
  const [pesquisaVersao, setPesquisaVersao] = useState(0);
  const [listaInicial, setListaInicial] = useState<string[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [pessoas, setPessoas] = useState<Record<string, Pessoa>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // A confirmação é temporária; o estado permanente permanece no cartão do resultado.
  useEffect(() => {
    if (!aviso) return;
    const temporizador = window.setTimeout(() => setAviso(""), 3500);
    return () => window.clearTimeout(temporizador);
  }, [aviso]);

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
        if (ativo) { const iniciais = Array.isArray(dados.ids) ? dados.ids : []; setIds(iniciais); setListaInicial(iniciais); }
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
          setPessoas(atual => ({ ...atual, ...Object.fromEntries(dados.pessoas!.map(p => [p.id, p])) }));
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
      setPessoas(atuais => ({ ...atuais, [pessoa.id]: { ...atuais[pessoa.id], ...pessoa } }));
      await consultar();
      setAviso(method === "POST"
        ? `Você começou a acompanhar ${pessoa.nomeUrna}.`
        : `Você deixou de acompanhar ${pessoa.nomeUrna}.`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  function cartao(pessoa: Pessoa) {
    const seguindo = ids.includes(pessoa.id);
    const id = encodeURIComponent(pessoa.id);
    return <article className="rounded-2xl border border-[#344760] p-4 text-center"><div className="flex flex-col items-center gap-2"><CandidatePhoto id={pessoa.id} name={pessoa.nomeUrna}/><h2 className="text-xl font-bold">{pessoa.nomeUrna}</h2><p className="text-sm text-slate-300">{[pessoa.cargoLabel,pessoa.siglaPartido,pessoa.uf].filter(Boolean).join(" · ")}</p></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm font-semibold"><button type="button" aria-pressed={seguindo} disabled={salvando || carregando} onClick={() => void alterar(seguindo ? "DELETE" : "POST", pessoa)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 ${seguindo ? "bg-green-700 text-white" : "bg-[#F4C64D] text-[#0C192B]"}`}>{seguindo ? <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg> : <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M19 8v8m-4-4h8"/></svg>}<span>{seguindo ? "Seguindo" : "Seguir"}</span></button><Link className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl bg-[#24364B] py-2" href={`/politicos/historico/${id}?origem=${modo === "lista" ? "acompanhados" : "escolher"}`}><span className="text-[#F4C64D]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 1 2.6 6.4M3 4v8h8M12 7v5l3 2"/></svg></span>Fiscalizar</Link><Link className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl bg-[#24364B] py-2" href={`/mandar-recado/politico/${id}`}><span className="text-[#F4C64D]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/><path d="M7 8h10M7 12h7"/></svg></span>Cobrar</Link></div></article>;
  }
  return <section className={incorporado ? "w-full text-white" : "mx-auto w-full max-w-3xl px-5 py-5 text-white"}>
    {!incorporado && (voltarPara === "/politicos"
      ? <CabecalhoPoliticos titulo={modo === "recado" ? "Escolha o destinatário" : ""} />
      : <CabecalhoInterno titulo={modo === "escolher" ? "Escolher um político" : modo === "recado" ? "Escolha o destinatário" : "Políticos que eu acompanho"} />)}
    {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
    {aviso && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{aviso}</p>}
    {carregando && !incorporado ? <p role="status">Carregando acompanhamentos...</p> : modo === "escolher" ? (
      <div aria-busy={salvando}>
        {aberto && voltarPara === "/politicos" && <>{cartao(aberto)}<button type="button" className="mx-auto mt-5 block min-h-11 text-[#F4C64D]" onClick={() => { setAberto(null); setPesquisaVersao(v => v + 1); setAviso(""); setErro(""); onPerfilChange?.(false); window.scrollTo(0, 0); }}>← Voltar</button></>}
        <div hidden={!!aberto}>
        {voltarPara === "/politicos" ? (
          <CandidateFollowLiveSearch
            key={pesquisaVersao}
            selectedIds={ids}
            compacto={incorporado}
            onOpen={pessoa => { setAberto(pessoa); onPerfilChange?.(true); window.scrollTo(0, 0); }}
            busy={salvando || carregando}
            onSelect={pessoa => void alterar("POST", pessoa)}
            onDeselect={pessoa => void alterar("DELETE", pessoa)}
          />
        ) : (
          <CandidateSelector mode="follow" selectedIds={ids} busy={salvando}
            onSelect={pessoa => void alterar("POST", pessoa)}
            onDeselect={pessoa => void alterar("DELETE", pessoa)} />
        )}
        </div>
        {salvando && <p role="status" className="mt-3">Salvando escolha...</p>}
      </div>
    ) : (modo === "lista" && voltarPara === "/politicos" ? listaInicial : ids).length ? (
      <ul className="space-y-3">
        {(modo === "lista" && voltarPara === "/politicos" ? listaInicial : ids).map(id => {
          const politico = pessoas[id];
          const nome = politico?.nomeUrna || "Candidatura " + id;
          if (modo === "lista" && voltarPara === "/politicos") {
            return <li key={id}>{cartao(politico || { id, nomeUrna: nome })}</li>;
          }
          return <li key={id} className="flex items-center gap-3 rounded-xl border border-[#344760] bg-[#24334b] p-4">
            <CandidatePhoto id={id} name={nome} />
            <div className="min-w-0 flex-1"><p className="font-semibold">{nome}</p></div>
            {modo === "recado"
              ? <Link href={`/mandar-recado/politico/${encodeURIComponent(id)}`} className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white">Escolher</Link>
              : <button type="button" disabled={salvando} onClick={() => void alterar("DELETE", { id, nomeUrna: nome })}
                  className="rounded-lg border border-red-400 px-4 py-3 font-semibold text-red-200 disabled:opacity-50">Remover</button>}
          </li>;
        })}
      </ul>
    ) : <p>Você não segue nenhum político.</p>}
    {!incorporado && <div className="mt-8 flex justify-center">
      {voltarPara === "/politicos" ? (
        <Link href="/politicos" className="inline-flex min-h-11 items-center gap-2 px-4 py-2 text-sm font-semibold text-[#ffd333] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd333]"><span aria-hidden="true">←</span> Voltar</Link>
      ) : (
        <Link href={voltarPara} className="rounded-lg bg-red-600 px-8 py-3 font-bold text-white"><span aria-hidden="true">x </span>Fechar</Link>
      )}
    </div>}
  </section>;
}
