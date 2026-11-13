"use client";
import { useEffect, useState } from "react";

type Draft = { id: string; titulo: string; resumo: string; conteudo: string; status: string; updated_at: string };

export default function AdminArticleDrafts() {
  const [items, setItems] = useState<Draft[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  async function reload() {
    try {
      const response = await fetch("/api/admin/artigos", { cache: "no-store", credentials: "same-origin" });
      const data = await response.json() as { artigos?: Draft[]; erro?: string };
      if (!response.ok) throw new Error(data.erro || "Falha ao carregar rascunhos.");
      setItems(data.artigos || []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar rascunhos.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void reload(); }, []);
  function reset() { setId(null); setTitulo(""); setResumo(""); setConteudo(""); setNotice(""); }
  function edit(item: Draft) {
    if (item.status !== "rascunho") return;
    setId(item.id); setTitulo(item.titulo); setResumo(item.resumo); setConteudo(item.conteudo); setNotice("");
    document.getElementById("editor-rascunho")?.scrollIntoView({ behavior: "smooth" });
  }
  async function save() {
    if (!titulo.trim() || saving) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/artigos", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titulo, resumo, conteudo }),
      });
      const data = await response.json() as { ok?: boolean; id?: string; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Não foi possível salvar.");
      setId(data.id || null);
      setNotice("Rascunho salvo. O artigo não foi publicado.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  }
  return (
    <section className="mt-10 border-t border-black/15 pt-8">
      <h2 className="text-2xl font-bold">Rascunhos editoriais</h2>
      <p className="mt-3 text-sm leading-6 text-black/65">Escreva e salve seus textos. Os rascunhos ficam no banco de dados e não aparecem no site público.</p>
      <div id="editor-rascunho" className="mt-6 rounded-xl border border-black/10 bg-white p-5">
        <h3 className="text-lg font-semibold">{id ? "Editar rascunho" : "Novo artigo"}</h3>
        <label className="mt-4 block text-sm font-semibold">Título
          <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={200} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Resumo
          <textarea value={resumo} onChange={e => setResumo(e.target.value)} maxLength={1000} rows={3} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Texto
          <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={12} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={save} disabled={!titulo.trim() || saving} className="min-h-12 rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-40">{saving ? "Salvando…" : "Salvar rascunho"}</button>
          <button type="button" onClick={reset} className="min-h-12 rounded-lg border border-black/20 px-6 py-3 font-semibold">Novo rascunho</button>
        </div>
        {notice && <p role="status" className="mt-4 text-sm font-semibold">{notice}</p>}
      </div>
      <h3 className="mt-9 text-xl font-bold">Rascunhos salvos</h3>
      {loading ? <p className="mt-4">Carregando…</p> : items.length === 0 ? <p className="mt-4 text-sm text-black/60">Nenhum rascunho salvo ainda.</p> : (
        <div className="mt-4 space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-lg border border-black/10 bg-white p-5">
              <p className="font-semibold">{item.titulo}</p>
              <p className="mt-1 text-sm text-black/60">{item.resumo}</p>
              <p className="mt-2 text-xs text-black/50">Situação: {item.status}</p>
              {item.status === "rascunho" && <button type="button" onClick={() => edit(item)} className="mt-3 min-h-11 rounded-lg bg-black px-5 py-2 font-semibold text-white">Continuar edição</button>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
