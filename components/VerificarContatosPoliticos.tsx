"use client";

import { useState } from "react";

type Candidato = { id: string; nomeUrna: string; nomeCompleto: string; cargo: string; cargoLabel: string; uf: string; siglaPartido: string };
type Resultado = {
  situacao: "encontrado" | "pendente" | "indisponivel" | "nao_aplicavel";
  casa?: string; nomeOficial?: string; emailInstitucional?: string;
  fonteUrl?: string | null; conferencia?: string; motivo?: string;
  envioHabilitado: false;
};
type Consulta = { candidatura: { id: string; nomeUrna: string; nomeCompleto: string; uf: string; cargo: string }; resultado: Resultado; consultadoEm: string };

export default function VerificarContatosPoliticos() {
  const [nome, setNome] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [consultando, setConsultando] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [erro, setErro] = useState("");
  const [erroContato, setErroContato] = useState<{ id: string; mensagem: string } | null>(null);
  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2 || buscando) return;
    setBuscando(true); setErro(""); setErroContato(null); setCandidatos([]); setConsulta(null);
    try {
      const r = await fetch("/api/candidatos/buscar?" + new URLSearchParams({ q: nome.trim(), pagina: "1" }), { cache: "no-store" });
      const data = await r.json() as { resultados?: Candidato[]; erro?: string };
      if (!r.ok) throw new Error(data.erro || "Busca indisponível.");
      setCandidatos((data.resultados || []).filter(p => p.cargo === "deputado-federal" || p.cargo === "senador").slice(0, 30));
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível buscar."); }
    finally { setBuscando(false); }
  }
  async function consultar(id: string) {
    if (consultando) return;
    setConsultando(id); setConsulta(null); setErroContato(null); setErro("");
    try {
      const r = await fetch("/api/admin/contatos-politicos?id=" + encodeURIComponent(id), { cache: "no-store" });
      const d = await r.json() as Consulta & { erro?: string };
      if (!r.ok) throw new Error(d.erro || "Consulta indisponível.");
      setConsulta(d);
    } catch (e) { setErroContato({ id, mensagem: e instanceof Error ? e.message : "Não foi possível consultar." }); }
    finally { setConsultando(""); }
  }
  return <section className="mt-6">
    <p className="text-sm leading-6 text-black/70">Busque uma candidatura e confronte os dados com os cadastros oficiais de parlamentares em exercício. A consulta é somente informativa: nenhum contato é aprovado ou mensagem enviada automaticamente.</p>
    <form onSubmit={e => void buscar(e)} className="mt-5 flex flex-wrap gap-3">
      <label className="min-w-56 flex-1 text-sm font-semibold">Nome do político
        <input value={nome} onChange={e => setNome(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-base text-black" placeholder="Digite o nome" minLength={2} required />
      </label>
      <button type="submit" disabled={buscando || nome.trim().length < 2} className="self-end rounded-lg bg-[#075cf0] px-6 py-3 font-semibold text-white disabled:opacity-50">{buscando ? "Buscando..." : "Buscar"}</button>
    </form>
    {erro && <p role="alert" className="mt-4 rounded-lg bg-red-100 p-3 text-red-900">{erro}</p>}
    {candidatos.length > 0 && <div className="mt-5 space-y-2">
      <h2 className="text-lg font-bold">Candidaturas encontradas</h2>
      {candidatos.map(p => <div key={p.id} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#344760] bg-[#24334b] p-4 text-white">
          <div><p className="font-bold">{p.nomeUrna}</p><p className="text-sm text-slate-200">{p.nomeCompleto} · {p.cargoLabel} · {p.uf} · {p.siglaPartido}</p></div>
          <button type="button" disabled={!!consultando} aria-expanded={consulta?.candidatura.id === p.id || consultando === p.id || erroContato?.id === p.id} aria-controls={"resultado-contato-" + p.id} onClick={() => void consultar(p.id)} className="rounded-lg bg-[#f4c542] px-4 py-2 font-semibold text-black disabled:opacity-50">{consultando === p.id ? "Consultando..." : "Conferir contato"}</button>
        </div>
        {consultando === p.id && <div id={"resultado-contato-" + p.id} role="status" aria-live="polite" className="mt-2 rounded-xl border border-[#344760] bg-white p-5 text-sm text-slate-700">
          Consultando o cadastro oficial de {p.nomeUrna}...
        </div>}
        {erroContato?.id === p.id && <div id={"resultado-contato-" + p.id} role="alert" className="mt-2 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-900">
          <p className="font-semibold">Não foi possível concluir a conferência.</p>
          <p className="mt-2">{erroContato.mensagem}</p>
          <p className="mt-2">Nenhum contato foi aprovado e nenhuma mensagem foi enviada.</p>
        </div>}
        {consulta?.candidatura.id === p.id && <div role="status" id={"resultado-contato-" + p.id} className="mt-2 rounded-xl border border-[#344760] bg-white p-5">
      <h2 className="text-xl font-bold">Resultado da conferência</h2>
      <p className="mt-2 font-semibold">{consulta.candidatura.nomeUrna} — {consulta.candidatura.uf}</p>
      <p className="mt-3 text-sm">{consulta.resultado.situacao === "encontrado" ? "Possível contato institucional identificado, sujeito a revisão humana." : "Contato ainda não confirmado."}</p>
      {consulta.resultado.situacao === "encontrado" ? <>
        <p className="mt-3 text-sm"><strong>Instituição:</strong> {consulta.resultado.casa}</p>
        <p className="mt-2 text-sm"><strong>Nome oficial:</strong> {consulta.resultado.nomeOficial}</p>
        <p className="mt-2 break-all text-sm"><strong>E-mail institucional:</strong> {consulta.resultado.emailInstitucional}</p>
        <p className="mt-3 text-sm">{consulta.resultado.conferencia}</p>
      </> : <p className="mt-3 text-sm">{consulta.resultado.motivo}</p>}
      {consulta.resultado.fonteUrl && <a href={consulta.resultado.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-blue-700 underline">Consultar fonte institucional</a>}
      <p className="mt-4 border-t pt-3 text-sm font-bold text-red-700">Envio bloqueado. Nenhuma mensagem foi enviada.</p>
      <p className="mt-2 text-xs text-black/60">Consulta realizada em {new Date(consulta.consultadoEm).toLocaleString("pt-BR")}.</p>
    </div>}
      </div>)}
    </div>}
  </section>;
}
