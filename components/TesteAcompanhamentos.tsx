"use client";

import { useEffect, useState } from "react";

export function TesteAcompanhamentos() {
  const [ids, setIds] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [aviso, setAviso] = useState("Consultando...");
  const [ocupado, setOcupado] = useState(false);

  async function consultar() {
    setOcupado(true);
    try {
      const r = await fetch("/api/site/acompanhamentos", { cache: "no-store" });
      const data = await r.json() as { ids?: string[]; erro?: string };
      if (!r.ok) throw Error(data.erro || "Falha na consulta");
      setIds(Array.isArray(data.ids) ? data.ids : []);
      setAviso("Consulta concluída.");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "Falha na consulta.");
    } finally {
      setOcupado(false);
    }
  }

  useEffect(() => { void consultar(); }, []);

  async function alterar(method: "POST" | "DELETE", candidatura: string) {
    if (!candidatura.trim() || ocupado) return;
    setOcupado(true);
    setAviso("Salvando...");
    try {
      const r = await fetch("/api/site/acompanhamentos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidatura.trim() }),
      });
      const data = await r.json() as { erro?: string };
      if (!r.ok) throw Error(data.erro || "Falha ao salvar");
      if (method === "POST") setId("");
      const lista = await fetch("/api/site/acompanhamentos", { cache: "no-store" });
      const resultado = await lista.json() as { ids?: string[]; erro?: string };
      if (!lista.ok) throw Error(resultado.erro || "Falha ao atualizar lista");
      setIds(Array.isArray(resultado.ids) ? resultado.ids : []);
      setAviso(method === "POST" ? "Candidatura adicionada." : "Candidatura removida.");
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "Falha ao salvar.");
    } finally {
      setOcupado(false);
    }
  }

  return <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7">
    <h2 className="text-xl font-bold text-slate-900">Teste interno de acompanhamento</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">Área restrita à administração. Utilize apenas candidaturas de teste.</p>
    <p role="status" aria-live="polite" className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-slate-700">{aviso}</p>
    <div className="mt-5">
      <label htmlFor="id-candidatura" className="mb-2 block text-sm font-semibold text-slate-900">ID da candidatura</label>
      <input id="id-candidatura" value={id} onChange={e => setId(e.target.value)}
        inputMode="numeric" placeholder="Digite o ID da candidatura"
        className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
    </div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <button type="button" disabled={ocupado || !id.trim()} onClick={() => void alterar("POST", id)}
        className="min-h-12 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Adicionar</button>
      <button type="button" disabled={ocupado} onClick={() => void consultar()}
        className="min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 disabled:opacity-50">Atualizar lista</button>
    </div>
    <div className="mt-7 border-t border-slate-200 pt-5">
      <h3 className="text-base font-bold text-slate-900">Candidaturas acompanhadas</h3>
      {ids.length === 0 ? <p className="mt-3 text-sm text-slate-600">Nenhuma candidatura na lista.</p> :
        <ul className="mt-3 space-y-3">{ids.map(item => <li key={item} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <span className="break-all font-medium text-slate-900">{item}</span>
          <button type="button" disabled={ocupado} onClick={() => void alterar("DELETE", item)}
            className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Remover</button>
        </li>)}</ul>}
    </div>
  </section>;
}
