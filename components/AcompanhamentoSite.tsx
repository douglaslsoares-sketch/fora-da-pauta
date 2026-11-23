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

export function AcompanhamentoSite({ modo, voltarPara = "/central" }: { modo: "escolher" | "lista" | "recado"; voltarPara?: "/central" | "/politicos" }) {
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

  return <section className="mx-auto w-full max-w-3xl px-5 py-5 text-white">
    {voltarPara === "/politicos"
      ? <CabecalhoPoliticos titulo={modo === "escolher" ? "Escolher um político" : modo === "recado" ? "Escolha o destinatário" : "Políticos que eu acompanho"} />
      : <CabecalhoInterno titulo={modo === "escolher" ? "Escolher um político" : modo === "recado" ? "Escolha o destinatário" : "Políticos que eu acompanho"} />}
    {erro && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{erro}</p>}
    {aviso && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{aviso}</p>}
    {carregando ? <p role="status">Carregando acompanhamentos...</p> : modo === "escolher" ? (
      <div aria-busy={salvando}>
        {voltarPara === "/politicos" ? (
          <CandidateFollowLiveSearch
            selectedIds={ids}
            busy={salvando}
            onSelect={pessoa => void alterar("POST", pessoa)}
            onDeselect={pessoa => void alterar("DELETE", pessoa)}
          />
        ) : (
          <CandidateSelector mode="follow" selectedIds={ids} busy={salvando}
            onSelect={pessoa => void alterar("POST", pessoa)}
            onDeselect={pessoa => void alterar("DELETE", pessoa)} />
        )}
        {salvando && <p role="status" className="mt-3">Salvando escolha...</p>}
      </div>
    ) : ids.length ? (
      <ul className="space-y-3">
        {ids.map(id => {
          const politico = pessoas[id];
          const nome = politico?.nomeUrna || "Candidatura " + id;
          if (modo === "lista" && voltarPara === "/politicos") {
            return <li key={id} className="rounded-2xl border border-[#344760] bg-[#24334b] p-4">
              <div className="flex items-center gap-4">
                <CandidatePhoto id={id} name={nome} />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold leading-6 text-white">{nome}</p>
                  {(politico?.cargoLabel || politico?.uf) && (
                    <p className="mt-1 text-sm leading-6 text-slate-200">
                      {[politico.cargoLabel, politico.uf].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {politico?.siglaPartido && (
                    <p className="text-sm leading-6 text-slate-300">{politico.siglaPartido}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/15 pt-3">
                <Link
                  href={`/politicos/historico/${encodeURIComponent(id)}?origem=acompanhados`}
                  className="inline-flex min-h-11 items-center gap-2 py-2 text-sm font-semibold text-[#ffd333] underline-offset-4 hover:underline focus-visible:underline"
                  aria-label={`Ver histórico de ${nome}`}
                >
                  <span aria-hidden="true">◷</span> Ver histórico
                </Link>
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => void alterar("DELETE", { id, nomeUrna: nome })}
                  className="min-h-11 rounded-lg px-1 py-2 text-sm font-medium text-[#f1b6be] underline-offset-4 hover:underline focus-visible:underline disabled:opacity-50"
                  aria-label={`Deixar de acompanhar ${nome}`}
                >
                  Deixar de acompanhar
                </button>
              </div>
            </li>;
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
    ) : <p>Você não acompanha nenhum político.</p>}
    <div className="mt-8 flex justify-center"><Link href={voltarPara} className="rounded-lg bg-red-600 px-8 py-3 font-bold text-white"><span aria-hidden="true">x </span>Fechar</Link></div>
  </section>;
}
