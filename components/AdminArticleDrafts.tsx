"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Draft = { id: string; titulo: string; resumo: string; conteudo: string; fontes: string; status: string; updated_at: string };

export default function AdminArticleDrafts() {
  const [items, setItems] = useState<Draft[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [fontes, setFontes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ acao: string; registrado_em: string }[]>([]);
  const [historyError, setHistoryError] = useState("");
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
  function reset() { setId(null); setTitulo(""); setResumo(""); setConteudo(""); setFontes(""); setNotice(""); }
  function edit(item: Draft) {
    if (item.status !== "rascunho") return;
    setId(item.id); setTitulo(item.titulo); setResumo(item.resumo); setConteudo(item.conteudo); setFontes(item.fontes || ""); setNotice("");
    document.getElementById("editor-rascunho")?.scrollIntoView({ behavior: "smooth" });
  }
  async function showHistory(item: Draft) {
    if (historyId === item.id) { setHistoryId(null); return; }
    setHistoryId(item.id); setHistory([]); setHistoryError("");
    try {
      const response = await fetch(`/api/admin/artigos/historico?id=${encodeURIComponent(item.id)}`, { cache: "no-store", credentials: "same-origin" });
      const data = await response.json() as { historico?: { acao: string; registrado_em: string }[]; erro?: string };
      if (!response.ok) throw new Error(data.erro || "Falha ao consultar histórico.");
      setHistory(data.historico || []);
    } catch (error) { setHistoryError(error instanceof Error ? error.message : "Histórico indisponível."); }
  }
  async function changeStatus(item: Draft, status: "revisao" | "rascunho") {
    setNotice("");
    try {
      const response = await fetch("/api/admin/artigos/status", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, status }) });
      const data = await response.json() as { ok?: boolean; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Não foi possível alterar a situação.");
      setNotice(status === "revisao" ? "Artigo encaminhado para revisão. Não foi publicado." : "Artigo devolvido aos rascunhos.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Falha na alteração."); }
  }
  async function changePublication(item: Draft, action: "publicar" | "arquivar") {
    const confirmation = action === "publicar" ? "PUBLICAR ARTIGO" : "ARQUIVAR ARTIGO";
    if (!window.confirm(action === "publicar" ? `Publicar "${item.titulo}" no site público? Nenhuma notificação será enviada.` : `Retirar "${item.titulo}" da área pública?`)) return;
    setNotice("");
    try {
      const response = await fetch("/api/admin/artigos/publicacao", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action, confirmation }) });
      const data = await response.json() as { ok?: boolean; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Operação não concluída.");
      setNotice(action === "publicar" ? "Artigo publicado. Nenhuma notificação foi enviada." : "Artigo arquivado e retirado da lista pública.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Falha na operação."); }
  }
  async function save() {
    if (!titulo.trim() || saving) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/artigos", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titulo, resumo, conteudo, fontes }),
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
        <label className="mt-4 block text-sm font-semibold">Fontes e referências (uma por linha)
          <textarea value={fontes} onChange={e => setFontes(e.target.value)} rows={5} maxLength={20000} placeholder="Endereço da fonte e descrição do documento" className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
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
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => showHistory(item)} className="min-h-11 rounded-lg border border-black/25 px-5 py-2 font-semibold">{historyId === item.id ? "Ocultar histórico" : "Ver histórico"}</button>
                <Link href={`/admin/artigos/previa/${item.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-black/25 px-5 py-2 font-semibold">Visualizar prévia</Link>
                {item.status === "rascunho" && <>
                  <button type="button" onClick={() => edit(item)} className="min-h-11 rounded-lg bg-black px-5 py-2 font-semibold text-white">Continuar edição</button>
                  <button type="button" onClick={() => changeStatus(item, "revisao")} className="min-h-11 rounded-lg border border-black/25 px-5 py-2 font-semibold">Enviar para revisão</button>
                </>}
                {item.status === "revisao" && <>
                  <button type="button" onClick={() => changeStatus(item, "rascunho")} className="min-h-11 rounded-lg border border-black/25 px-5 py-2 font-semibold">Voltar a rascunho</button>
                  <button type="button" onClick={() => changePublication(item, "publicar")} className="min-h-11 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white">Publicar artigo</button>
                </>}
                {item.status === "publicado" && <>
                  <Link href={`/edicoes/${item.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-black/25 px-5 py-2 font-semibold">Abrir artigo público</Link>
                  <button type="button" onClick={() => changePublication(item, "arquivar")} className="min-h-11 rounded-lg bg-red-700 px-5 py-2 font-semibold text-white">Arquivar artigo</button>
                </>}
              </div>
              {historyId === item.id && <div className="mt-4 border-t border-black/10 pt-4 text-sm">
                <p className="font-semibold">Histórico editorial</p>
                {historyError ? <p className="mt-2 text-red-700">{historyError}</p> : history.length === 0 ? <p className="mt-2 text-black/60">Nenhuma mudança de situação registrada.</p> : <ul className="mt-2 space-y-2">{history.map((entry, i) => <li key={i}>{entry.acao} — {new Date(entry.registrado_em).toLocaleString("pt-BR")}</li>)}</ul>}
              </div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
