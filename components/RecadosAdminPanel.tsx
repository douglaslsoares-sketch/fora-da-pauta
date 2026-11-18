"use client";
import { useEffect, useState } from "react";

type Recado = { id: string; destinatario: "projeto" | "comunidade"; texto: string; status: string; criado_em: string; resposta_rascunho: string | null; resposta_publicada: string | null; resposta_publicada_em: string | null };
const estados = [
  { value: "recebido", label: "Recebido" },
  { value: "em_analise", label: "Em análise" },
  { value: "arquivado", label: "Arquivado" },
];
export function RecadosAdminPanel() {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");
  async function carregar() {
    setCarregando(true); setErro("");
    try {
      const res = await fetch("/api/admin/recados", { cache: "no-store" });
      const dados = await res.json();
      if (!res.ok) throw Error(dados.erro || "Falha na consulta.");
      setRecados(dados.recados);
      setRascunhos(Object.fromEntries((dados.recados as Recado[]).map(item => [item.id, item.resposta_rascunho || ""])));
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
  async function salvarResposta(id: string) {
    setSalvando(id); setErro(""); setAviso("");
    try {
      const resposta_rascunho = rascunhos[id] || "";
      const res = await fetch("/api/admin/recados", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, resposta_rascunho }) });
      const dados = await res.json();
      if (!res.ok) throw Error(dados.erro || "Falha ao salvar a resposta.");
      setRecados(atuais => atuais.map(item => item.id === id ? { ...item, resposta_rascunho } : item));
      setAviso("Rascunho salvo. Nenhuma resposta foi enviada ou publicada.");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao salvar."); }
    finally { setSalvando(null); }
  }
  async function publicarResposta(id: string) {
    if (!window.confirm("Publicar a resposta salva para consulta pelo protocolo?")) return;
    setSalvando(id); setErro(""); setAviso("");
    try {
      const res = await fetch("/api/admin/recados", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, publicar_resposta: true }) });
      const dados = await res.json();
      if (!res.ok) throw Error(dados.erro || "Falha ao publicar.");
      await carregar();
      setAviso("Resposta publicada para consulta pelo protocolo. Nenhuma mensagem foi enviada.");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao publicar."); }
    finally { setSalvando(null); }
  }
  return <section className="mt-7">
    <button onClick={() => void carregar()} className="rounded-lg border border-black/20 bg-white px-4 py-2 font-semibold">Atualizar lista</button>
    {aviso && <p role="status" className="mt-4 rounded-lg bg-green-100 p-3 text-green-900">{aviso}</p>}
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
        <label className="mt-5 block text-sm font-semibold" htmlFor={`resposta-${item.id}`}>Escrever resposta</label>
        <textarea id={`resposta-${item.id}`} rows={4} maxLength={5000} value={rascunhos[item.id] || ""}
          onChange={e => setRascunhos(atuais => ({ ...atuais, [item.id]: e.target.value }))}
          placeholder="Escreva sua resposta aqui..." className="mt-2 w-full rounded-lg border border-black/20 bg-white p-3 text-base" />
        <p className="mt-1 text-xs text-black/60">Rascunho privado. Não será enviado nem publicado.</p>
        <button type="button" disabled={salvando === item.id || (rascunhos[item.id] || "") === (item.resposta_rascunho || "")}
          onClick={() => void salvarResposta(item.id)} className="mt-3 rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50">
          {salvando === item.id ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button type="button" disabled={salvando === item.id || !item.resposta_rascunho?.trim() || (rascunhos[item.id] || "") !== (item.resposta_rascunho || "")}
          onClick={() => void publicarResposta(item.id)} className="ml-2 mt-3 rounded-lg bg-green-700 px-5 py-3 font-bold text-white disabled:opacity-50">Publicar resposta</button>
        {item.resposta_publicada_em && <p className="mt-3 text-sm text-black/60">Resposta publicada em {new Date(item.resposta_publicada_em).toLocaleString("pt-BR")}</p>}
      </article>)}
    </div>
  </section>;
}
