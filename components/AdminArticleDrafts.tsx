"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PrivateVoiceTest from "@/components/PrivateVoiceTest";
import ArticleAudioApproval from "@/components/ArticleAudioApproval";

type Draft = { id: string; titulo: string; resumo: string; conteudo: string; fontes: string; audio_url?: string; capa_url?: string; slug?: string|null; status: string; updated_at: string };

type TextoInicial = Pick<Draft,"titulo"|"resumo"|"conteudo"|"fontes">;

export default function AdminArticleDrafts({modo="todos",textoInicial}:{modo?:"todos"|"novo"|"rascunhos"|"publicados";textoInicial?:TextoInicial}) {
  const [items, setItems] = useState<Draft[]>([]);
  const [filtro, setFiltro] = useState(modo==="publicados"?"publicado":"todos");
  const grupo = items.filter(item => (modo==="rascunhos"||modo==="todos") ? ["rascunho","revisao"].includes(item.status) : modo==="publicados" ? ["publicado","arquivado"].includes(item.status) : true);
  const visiveis = grupo.filter(item => filtro === "todos" || item.status === filtro);
  const quantidade = (status: string) => grupo.filter(item => item.status === status).length;
  const [id, setId] = useState<string | null>(null);
  const [aberto,setAberto]=useState(modo==="novo"||Boolean(textoInicial));
  const [listaAberta,setListaAberta]=useState(false);
  const [titulo, setTitulo] = useState(textoInicial?.titulo ?? "");
  const [resumo, setResumo] = useState(textoInicial?.resumo ?? "");
  const [conteudo, setConteudo] = useState(textoInicial?.conteudo ?? "");
  const [fontes, setFontes] = useState(textoInicial?.fontes ?? "");
  const [capa, setCapa] = useState("");
  const [slug,setSlug]=useState("");
  const [slugManual,setSlugManual]=useState(false);
  const [capaData,setCapaData]=useState<string|null>(null);
  const [capaNome,setCapaNome]=useState("");
  const [lendoCapa,setLendoCapa]=useState(false);
  const slugDoTitulo=(t:string)=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100).replace(/-$/,"");
  const endereco=slugManual?slug:slugDoTitulo(titulo);
  async function selecionarCapa(file:File|undefined){
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>2097152){setNotice("Selecione uma imagem JPEG, PNG ou WebP de até 2 MB.");return;}
    setLendoCapa(true);setNotice("");
    try{const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==="string"?resolve(reader.result):reject(new Error("Imagem inválida."));reader.onerror=()=>reject(new Error("Não foi possível ler a imagem."));reader.readAsDataURL(file);});setCapaData(data);setCapaNome(file.name);}
    catch(e){setNotice(e instanceof Error?e.message:"Não foi possível selecionar a imagem.");}finally{setLendoCapa(false);}
  }
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
  function reset() { setAberto(false); setId(null); setTitulo(""); setResumo(""); setConteudo(""); setFontes(""); setCapa("");setSlug("");setSlugManual(false);setCapaData(null);setCapaNome(""); setNotice(""); }
  function temAlteracoes(){const anterior=items.find(i=>i.id===id);return aberto&&(capaData!==null||[titulo,resumo,conteudo,fontes,capa,endereco].some((v,i)=>v!==([anterior?.titulo,anterior?.resumo,anterior?.conteudo,anterior?.fontes,anterior?.capa_url,anterior?.slug][i]??"")));}
  function confirmarTroca(){return !temAlteracoes()||window.confirm("Há alterações não salvas. Descartá-las?");}
  function novo(){if(saving||lendoCapa||!confirmarTroca())return;reset();setAberto(true);setListaAberta(false);}
  function edit(item: Draft) {
    if (item.status !== "rascunho" || saving || lendoCapa || !confirmarTroca()) return;
    setAberto(true);setListaAberta(false);
    setId(item.id); setTitulo(item.titulo); setResumo(item.resumo); setConteudo(item.conteudo); setFontes(item.fontes || ""); setCapa(item.capa_url || "");setSlug(item.slug||"");setSlugManual(Boolean(item.slug));setCapaData(null);setCapaNome(""); setNotice("");

  }
  useEffect(()=>{if(id&&(modo==="rascunhos"||modo==="todos"))document.getElementById("editor-rascunho")?.scrollIntoView({behavior:"smooth"})},[id,modo]);
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
      if (status==="revisao" && id===item.id) { reset(); setNotice("Artigo encaminhado para revisão. Não foi publicado."); }
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Falha na alteração."); }
  }
  async function changePublication(item: Draft) {
    const action = "publicar";
    const confirmation = "PUBLICAR ARTIGO";
    {
      const digitado = window.prompt(
        'Você está prestes a publicar "' + item.titulo + '" no site público. Após publicar, o conteúdo não poderá ser editado, excluído ou arquivado. Confira a prévia e as fontes. Nenhuma notificação será enviada. Para confirmar, digite PUBLICAR ARTIGO:'
      );
      if (digitado !== "PUBLICAR ARTIGO") {
        setNotice("Publicação cancelada. O artigo permanece em revisão.");
        return;
      }
    }
    setNotice("");
    try {
      const response = await fetch("/api/admin/artigos/publicacao", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action, confirmation }) });
      const data = await response.json() as { ok?: boolean; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Operação não concluída.");
      if(id===item.id)reset();
      setNotice("Artigo publicado. Nenhuma notificação foi enviada.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Falha na operação."); }
  }
  async function excluir(item: Draft) {
    if (saving || window.prompt('Excluir definitivamente o rascunho "'+item.titulo+'"? Digite EXCLUIR RASCUNHO:')!=="EXCLUIR RASCUNHO") return;
    setSaving(true);
    try {
      const r=await fetch("/api/admin/artigos",{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id,confirmacao:"EXCLUIR RASCUNHO"})});
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.erro||"Falha na exclusão.");
      if(id===item.id)reset();
      setNotice("Rascunho excluído.");await reload();
    }catch(e){setNotice(e instanceof Error?e.message:"Falha na exclusão.");}finally{setSaving(false);}
  }
  async function save() {
    if (!titulo.trim() || saving || lendoCapa) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/artigos", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titulo, resumo, conteudo, fontes, capa_url: capa, slug:endereco, capa_data:capaData }),
      });
      const data = await response.json() as { ok?: boolean; id?: string; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Não foi possível salvar.");
      setId(data.id || null);
      if(capaData&&data.id){setCapa("https://foradapauta.org/api/artigos/capa/"+data.id);setCapaData(null);setCapaNome("");}
      setSlug(endereco);setSlugManual(true);
      setNotice("Rascunho salvo. O artigo não foi publicado.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  }
  return (
    <section className="mt-10 border-t border-black/15 pt-8">
      {modo==="todos"&&<><h2 className="text-2xl font-bold">Redação e preparação</h2><p className="mt-3 text-sm leading-6 text-black/65">Escreva e salve seus textos. Os rascunhos ficam no banco de dados e não aparecem no site público.</p></>}
      {modo!=="publicados"&&<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={novo} disabled={saving} className="rounded-lg bg-[#0E1A29] px-5 py-3 font-semibold text-white">Novo</button><button type="button" onClick={()=>setListaAberta(v=>!v)} disabled={saving} className="rounded-lg border border-black/25 bg-white px-5 py-3 font-semibold">Abrir</button><button type="button" onClick={save} disabled={!aberto||!titulo.trim()||saving||lendoCapa} className="rounded-lg border border-black/25 bg-white px-5 py-3 font-semibold disabled:opacity-40">Salvar</button><button type="button" onClick={()=>{const item=items.find(i=>i.id===id);if(item)void excluir(item)}} disabled={!aberto||!id||saving} className="rounded-lg border border-black/25 bg-white px-5 py-3 font-semibold disabled:opacity-40">Excluir</button></div>}
      {modo!=="publicados"&&!aberto&&!listaAberta&&<p className="mt-6 rounded-lg border border-black/10 bg-white p-5">Clique em Novo para iniciar um editorial ou em Abrir para continuar um documento salvo.</p>}
      {notice&& !aberto&&<p role="status" className="mt-4 text-sm">{notice}</p>}
      {modo!=="publicados"&&aberto&&<div id="editor-rascunho" className="mt-6 rounded-xl border border-black/10 bg-white p-5">
        <h3 className="text-lg font-semibold">{id ? "Editar rascunho" : "Novo artigo"}</h3>
        {textoInicial && !id && titulo===textoInicial.titulo && <p className="mt-3 text-sm text-black/65">Texto preparado para o lançamento, ainda não salvo. Confira os campos e clique em Salvar rascunho para continuar.</p>}
        <label className="mt-4 block text-sm font-semibold">Título
          <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={200} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">URL do editorial
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-black/20 p-3"><span className="text-black/60">https://foradapauta.org/editoriais/</span><input aria-label="Endereço do editorial" value={endereco} onChange={e=>{setSlugManual(true);setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""));}} maxLength={100} placeholder="endereco-do-editorial" className="min-w-40 flex-1 outline-none"/></div>
          <p className="mt-1 text-xs font-normal text-black/60">O endereço será definitivo após a publicação.</p>
        </label>
        <label className="mt-4 block text-sm font-semibold">Imagem de capa
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving||lendoCapa} onChange={e=>{void selecionarCapa(e.target.files?.[0]);e.target.value="";}} className="mt-2 block w-full rounded-lg border border-black/20 p-3 file:mr-3 file:rounded file:border-0 file:bg-[#0E1A29] file:px-4 file:py-2 file:text-white"/>
          <p className="mt-1 text-xs font-normal text-black/60">JPEG, PNG ou WebP · até 2 MB. {lendoCapa?"Carregando imagem…":capaNome}</p>
        </label>
        {(capaData||capa)&&<div><img src={capaData||capa} alt="Prévia da capa" referrerPolicy="no-referrer" className="mt-3 max-h-64 max-w-full rounded-lg object-contain"/><button type="button" disabled={saving||lendoCapa} onClick={()=>{setCapa("");setCapaData(null);setCapaNome("");}} className="mt-2 text-sm font-semibold underline">Remover imagem</button></div>}
        <label className="mt-4 block text-sm font-semibold">Resumo
          <textarea value={resumo} onChange={e => setResumo(e.target.value)} maxLength={1000} rows={3} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Texto
          <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={12} className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Fontes e referências (uma por linha)
          <textarea value={fontes} onChange={e => setFontes(e.target.value)} rows={5} maxLength={20000} placeholder="Endereço da fonte e descrição do documento" className="mt-2 block w-full rounded-lg border border-black/20 p-3" />
        </label>
        {notice && <p role="status" className="mt-4 text-sm font-semibold">{notice}</p>}
        {id && <div className="mt-6 border-t border-black/10 pt-5">
          <h4 className="text-base font-bold">Narração do artigo — revisão privada</h4>
          <p className="mt-2 text-sm leading-6 text-black/65">A voz Marim lê a última versão salva do rascunho, não as alterações ainda não salvas. Gere, ouça e aprove o arquivo definitivo antes de encaminhar o artigo para revisão. A geração de teste não salva nem publica áudio.</p>
          <PrivateVoiceTest key={id} articleId={id} />
          <ArticleAudioApproval key={`definitivo-${id}`} articleId={id} />
          {items.find(i=>i.id===id)?.status==="rascunho"&&<button type="button" onClick={()=>{const item=items.find(i=>i.id===id);if(item&&!temAlteracoes())void changeStatus(item,"revisao");else setNotice("Salve as alterações antes de continuar.")}} className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-black/20 px-4 py-2 font-semibold">Enviar para revisão</button>}
          <Link href={`/admin/artigos/previa/${id}`} className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-black/20 px-4 py-2 font-semibold">Ver prévia completa</Link>
        </div>}
      </div>}
      {(modo==="publicados"||listaAberta)&&<>
      <div className="mt-9 flex flex-wrap items-end justify-between gap-4">
        <h3 className="text-xl font-bold">{(modo==="rascunhos"||modo==="todos")?"Artigos em preparação":modo==="publicados"?"Acervo de artigos":"Artigos cadastrados"}</h3>
        <label className="text-sm font-semibold">Mostrar
          <select value={filtro} onChange={e => setFiltro(e.target.value)} className="mt-2 block rounded-lg border border-black/20 bg-white px-4 py-3">
            <option value="todos">Todos ({grupo.length})</option>
            {modo!=="publicados"&&<option value="rascunho">Rascunhos ({quantidade("rascunho")})</option>}
            {modo!=="publicados"&&<option value="revisao">Em revisão ({quantidade("revisao")})</option>}
            {modo==="publicados"&&<option value="publicado">Publicados ({quantidade("publicado")})</option>}
            {modo==="publicados"&&<option value="arquivado">Arquivados ({quantidade("arquivado")})</option>}
          </select>
        </label>
      </div>
      {notice&&modo!=="todos"&&!(modo==="rascunhos"&&id)&&<p role="status" className="mt-4 text-sm font-semibold">{notice}</p>}
      {loading ? <p className="mt-4">Carregando…</p> : items.length === 0 ? <p className="mt-4 text-sm text-black/60">Nenhum artigo cadastrado ainda.</p> : visiveis.length === 0 ? <p className="mt-4 text-sm text-black/60">Nenhum artigo nesta situação.</p> : (
        <div className="mt-4 space-y-3">
          {visiveis.map(item => (
            <div key={item.id} className="rounded-lg border border-black/10 bg-white p-5">
              <p className="font-semibold">{item.titulo}</p>
              <p className="mt-1 text-sm text-black/60">{item.resumo}</p>
              <p className="mt-2 text-xs text-black/50">Situação: {item.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => showHistory(item)} className="min-h-11 rounded-lg border border-black/25 px-5 py-2 font-semibold">{historyId === item.id ? "Ocultar histórico" : "Ver histórico"}</button>
                <Link href={item.status==="publicado"||item.status==="arquivado"?`/admin/editoriais/${item.id}/comentarios`:`/admin/artigos/previa/${item.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-black/25 px-5 py-2 font-semibold">{item.status==="publicado"||item.status==="arquivado"?"Abrir editorial e comentários":"Visualizar prévia"}</Link>
                {item.status === "rascunho" && <>
                  <button type="button" onClick={() => edit(item)} className="min-h-11 rounded-lg bg-black px-5 py-2 font-semibold text-white">Abrir</button>
                </>}
                {item.status === "revisao" && <>
                  <button type="button" onClick={() => changeStatus(item, "rascunho")} className="min-h-11 rounded-lg border border-black/25 px-5 py-2 font-semibold">Voltar a rascunho</button>
                  <p className="w-full text-xs leading-5 text-black/60">Antes de publicar, confira a prévia e as fontes. A publicação exige confirmação por escrito.</p>
                  <button type="button" onClick={() => changePublication(item)} className="min-h-11 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white">Publicar artigo</button>
                </>}
                {item.status === "publicado" && <>
                  <Link href={`/editoriais/${item.slug||item.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-black/25 px-5 py-2 font-semibold">Abrir artigo público</Link>
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
      </>}
    </section>
  );
}
