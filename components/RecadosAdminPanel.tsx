"use client";
import { useEffect, useState } from "react";

type Recado = { id: string; destinatario: "projeto" | "comunidade"; texto: string; status: string; criado_em: string };
const estados = [
  { value: "recebido", label: "Recebido" },
  { value: "em_analise", label: "Em análise" },
  { value: "respondido", label: "Respondido" },
  { value: "arquivado", label: "Arquivado" },
];
export function RecadosAdminPanel() {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  async function carregar() {
    setCarregando(true); setErro("");
    try {
      const res = await fetch("/api/admin/recados", { cache: "no-store" });
      const dados = await res.json();
      if (!res.ok) throw Error(dados.erro || "Falha na consulta.");
      setRecados(dados.recados);
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao carregar."); }
    finally { setCarregando(false); }
  }
  useEffect(() => { void carregar(); }, []);
  async function atualizar(id: string, status: string) {
    setSalvando(id); setErro("");
    try {
      const res = await fetch("/api/admin/recados", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const dados = await res.json();
      if (!res.ok) throw Error(dados.erro || "Falha ao salvar.");
      setRecados(atuais => atuais.map(item => item.id === id ? { ...item, status } : item));
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao salvar."); }
    finally { setSalvando(null); }
  }
  return <section className="mt-7">
    <button onClick={() => void carregar()} className="rounded-lg border border-black/20 bg-white px-4 py-2 font-semibold">Atualizar lista</button>
    {carregando && <p className="mt-4">Carregando recados...</p>}
    {erro && <p role="alert" className="mt-4 rounded-lg bg-red-100 p-3 text-red-800">{erro}</p>}
    {!carregando && !erro && recados.length === 0 && <p className="mt-4">Nenhum recado recebido.</p>}
    <div className="mt-5 space-y-4">
      {recados.map(item => <article key={item.id} className="rounded-xl border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-black/60">
          <span className="font-bold">{item.destinatario === "projeto" ? "Para o Fora da Pauta" : "Para a comunidade"}</span>
          <time>{new Date(item.criado_em).toLocaleString("pt-BR")}</time>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words leading-6">{item.texto}</p>
        <p className="mt-4 break-all text-xs text-black/50">Protocolo: {item.id}</p>
        <label className="mt-4 block text-sm font-semibold" htmlFor={`estado-${item.id}`}>Situação</label>
        <select id={`estado-${item.id}`} value={item.status} disabled={salvando === item.id}
          onChange={e => void atualizar(item.id, e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/20 bg-white p-3 sm:w-auto">
          {estados.map(estado => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
        </select>
      </article>)}
    </div>
  </section>;
}
