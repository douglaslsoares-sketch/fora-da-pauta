"use client";

import { useEffect, useState } from "react";

export default function AdminWhatsappAvisoManual() {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [link, setLink] = useState("");
  const [aviso, setAviso] = useState("");
  const [artigos, setArtigos] = useState<{ id: string; titulo: string }[]>([]);
  const [artigoId, setArtigoId] = useState("");
  const [erroArtigos, setErroArtigos] = useState("");
  useEffect(() => {
    let ativo = true;
    fetch("/api/admin/artigos", { credentials: "same-origin", cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Consulta indisponível.");
        return response.json();
      })
      .then(data => {
        if (!ativo) return;
        setArtigos((Array.isArray(data.artigos) ? data.artigos : [])
          .filter((item: { id?: unknown; titulo?: unknown; status?: unknown }) =>
            item.status === "publicado" && typeof item.id === "string" && /^[a-f0-9-]{36}$/i.test(item.id) && typeof item.titulo === "string")
          .map((item: { id: string; titulo: string }) => ({ id: item.id, titulo: item.titulo })));
      })
      .catch(() => { if (ativo) setErroArtigos("Não foi possível carregar os artigos publicados."); });
    return () => { ativo = false; };
  }, []);
  function selecionarArtigo(id: string) {
    setArtigoId(id);
    const artigo = artigos.find(item => item.id === id);
    if (artigo) {
      setTitulo(artigo.titulo);
      setLink("https://foradapauta.org/edicoes/" + artigo.id);
    } else {
      setTitulo("");
      setLink("");
    }
    setAviso("");
  }
  const urlValida = !link.trim() || (() => { try { const u = new URL(link.trim()); return u.protocol === "https:" && ["foradapauta.org", "www.foradapauta.org"].includes(u.hostname); } catch { return false; } })();
  const texto = [titulo.trim(), mensagem.trim(), link.trim()].filter(Boolean).join("\n\n");
  async function copiar() {
    try { await navigator.clipboard.writeText(texto); setAviso("Texto copiado. Abra o canal e publique manualmente, depois de conferir."); }
    catch { setAviso("Não foi possível copiar automaticamente. Selecione o texto da prévia e copie."); }
  }
  return <section className="mt-8 rounded-xl border border-black/10 bg-white p-6">
    <h2 className="text-xl font-bold">Preparar aviso para o WhatsApp</h2>
    <p className="mt-2 text-sm leading-6 text-black/65">Escreva o aviso, confira a prévia e copie. Esta ferramenta não publica nem envia mensagens.</p>
    <label htmlFor="aviso-artigo" className="mt-5 block text-sm font-semibold">Escolher artigo publicado (opcional)</label>
    <select id="aviso-artigo" value={artigoId} onChange={e => selecionarArtigo(e.target.value)} className="mt-2 w-full rounded-lg border border-black/20 bg-white p-3">
      <option value="">Escrever aviso sem selecionar artigo</option>
      {artigos.map(artigo => <option key={artigo.id} value={artigo.id}>{artigo.titulo}</option>)}
    </select>
    {erroArtigos && <p role="status" className="mt-2 text-sm text-black/60">{erroArtigos} Você ainda pode preencher o aviso manualmente.</p>}
    {!erroArtigos && artigos.length === 0 && <p className="mt-2 text-xs text-black/55">Nenhum artigo publicado disponível para seleção.</p>}
    <label htmlFor="aviso-titulo" className="mt-5 block text-sm font-semibold">Título</label>
    <input id="aviso-titulo" value={titulo} onChange={e => { setTitulo(e.target.value); setArtigoId(""); }} maxLength={140} placeholder="Título do aviso" className="mt-2 w-full rounded-lg border border-black/20 p-3" />
    <label htmlFor="aviso-texto" className="mt-4 block text-sm font-semibold">Mensagem</label>
    <textarea id="aviso-texto" value={mensagem} onChange={e => setMensagem(e.target.value)} maxLength={2000} rows={5} placeholder="Escreva a mensagem..." className="mt-2 w-full rounded-lg border border-black/20 p-3" />
    <label htmlFor="aviso-link" className="mt-4 block text-sm font-semibold">Link do artigo (opcional)</label>
    <input id="aviso-link" value={link} onChange={e => { setLink(e.target.value); setArtigoId(""); }} placeholder="https://foradapauta.org/..." className="mt-2 w-full rounded-lg border border-black/20 p-3" />
    {!urlValida && <p role="alert" className="mt-2 text-sm text-red-700">Use um endereço HTTPS do foradapauta.org ou deixe o campo vazio.</p>}
    <div className="mt-6 rounded-lg border border-black/10 bg-[#eeeee9] p-5">
      <h3 className="text-sm font-bold">Prévia da mensagem</h3>
      <p className="mt-3 whitespace-pre-wrap break-words leading-7">{texto || "Sua mensagem aparecerá aqui."}</p>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => void copiar()} disabled={!titulo.trim() || !mensagem.trim() || !urlValida} className="rounded-lg bg-[#1c3655] px-6 py-3 font-semibold text-white disabled:opacity-40">Copiar aviso</button>
      <a href="https://whatsapp.com/channel/0029VbDnV1V8aKvH9yaMRY13" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-black/20 px-5 py-3 font-semibold text-[#1c3655]">Abrir canal do WhatsApp</a>
    </div>
    {aviso && <p role="status" className="mt-3 text-sm text-black/70">{aviso}</p>}
    <p className="mt-4 text-xs leading-5 text-black/55">O texto não é salvo no servidor. A publicação depende de sua ação no WhatsApp.</p>
  </section>;
}
