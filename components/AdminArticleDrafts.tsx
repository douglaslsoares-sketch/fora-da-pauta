"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Draft = { id: string; titulo: string; resumo: string; conteudo: string; fontes: string; audio_url?: string; capa_url?: string; slug?: string|null; status: string; updated_at: string };

type TextoInicial = Pick<Draft,"titulo"|"resumo"|"conteudo"|"fontes">;

export default function AdminArticleDrafts({modo="todos",textoInicial}:{modo?:"todos"|"novo"|"rascunhos"|"publicados";textoInicial?:TextoInicial}) {
  const [items, setItems] = useState<Draft[]>([]);
  const grupo = items.filter(item => (modo==="rascunhos"||modo==="todos") ? ["rascunho","revisao"].includes(item.status) : modo==="publicados" ? ["publicado","arquivado"].includes(item.status) : true);
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
  const [audio,setAudio]=useState<{existe:boolean;atual:boolean;gerado_em?:string}|null>(null);
  const [ouvindo,setOuvindo]=useState(false);
  const [gerando,setGerando]=useState(false);
  const [publicando,setPublicando]=useState(false);
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
  function reset() { setAudio(null);setOuvindo(false); setAberto(false); setId(null); setTitulo(""); setResumo(""); setConteudo(""); setFontes(""); setCapa("");setSlug("");setSlugManual(false);setCapaData(null);setCapaNome(""); setNotice(""); }
  function temAlteracoes(){const anterior=items.find(i=>i.id===id);return aberto&&(capaData!==null||[titulo,resumo,conteudo,fontes,capa,endereco].some((v,i)=>v!==([anterior?.titulo,anterior?.resumo,anterior?.conteudo,anterior?.fontes,anterior?.capa_url,anterior?.slug][i]??"")));}
  function confirmarTroca(){return !temAlteracoes()||window.confirm("Há alterações não salvas. Descartá-las?");}
  function novo(){if(saving||gerando||publicando||lendoCapa||!confirmarTroca())return;reset();setAberto(true);setListaAberta(false);}
  function edit(item: Draft) {
    if (!["rascunho","revisao"].includes(item.status) || saving || gerando || publicando || lendoCapa || !confirmarTroca()) return;
    setAudio(null);setOuvindo(false);setAberto(true);setListaAberta(false);
    setId(item.id); setTitulo(item.titulo); setResumo(item.resumo); setConteudo(item.conteudo); setFontes(item.fontes || ""); setCapa(item.capa_url || "");setSlug(item.slug||"");setSlugManual(Boolean(item.slug));setCapaData(null);setCapaNome(""); setNotice("");

  }
  
  const atual=items.find(i=>i.id===id);
  const versao=atual?.updated_at;
  useEffect(()=>{
    let ativo=true;setAudio(null);setOuvindo(false);
    if(id)fetch("/api/admin/artigos/audio-completo?id="+encodeURIComponent(id),{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.erro);if(ativo)setAudio(d);}).catch(()=>{if(ativo)setNotice("Não foi possível consultar a narração.");});
    return()=>{ativo=false;};
  },[id,versao]);
  async function gerarAudio(){
    if(!id||temAlteracoes()||gerando||saving||publicando)return;
    if(!window.confirm("Gerar a narração da versão salva com a voz Marim? A operação pode ter custo."))return;
    setGerando(true);setOuvindo(false);setNotice("Gerando áudio…");
    try{const r=await fetch("/api/admin/artigos/audio-completo",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,acao:"gerar"})});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.erro||"Falha na geração.");const s=await fetch("/api/admin/artigos/audio-completo?id="+encodeURIComponent(id),{cache:"no-store"});const info=await s.json();if(!s.ok)throw Error(info.erro);setAudio(info);setNotice("Áudio gerado. Clique em Ouvir.");}catch(e){setNotice(e instanceof Error?e.message:"Falha na geração.");}finally{setGerando(false);}
  }
  async function changePublication(item: Draft) {
    if(id!==item.id||temAlteracoes()||!audio?.atual||saving||gerando||publicando)return;
    const action = "publicar";
    const confirmation = "PUBLICAR ARTIGO";
    {
      const digitado = window.prompt(
        'Você está prestes a publicar "' + item.titulo + '" no site público. Após publicar, o conteúdo não poderá ser editado, excluído ou arquivado. Confira a prévia e as fontes. Nenhuma notificação será enviada. Para confirmar, digite PUBLICAR ARTIGO:'
      );
      if (digitado !== "PUBLICAR ARTIGO") {
        setNotice("Publicação cancelada. O editorial permanece salvo.");
        return;
      }
    }
    setNotice("");setPublicando(true);
    try {
      const response = await fetch("/api/admin/artigos/publicacao", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action, confirmation,versao:item.updated_at }) });
      const data = await response.json() as { ok?: boolean; erro?: string };
      if (!response.ok || !data.ok) throw new Error(data.erro || "Operação não concluída.");
      if(id===item.id)reset();
      setNotice("Artigo publicado. Nenhuma notificação foi enviada.");
      await reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Falha na operação."); }finally{setPublicando(false);}
  }
  async function excluir(item: Draft) {
    if (saving || gerando || publicando || id!==item.id || window.prompt('Excluir definitivamente o rascunho "'+item.titulo+'"? Digite EXCLUIR RASCUNHO:')!=="EXCLUIR RASCUNHO") return;
    setSaving(true);
    try {
      const r=await fetch("/api/admin/artigos",{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id,confirmacao:"EXCLUIR RASCUNHO"})});
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.erro||"Falha na exclusão.");
      if(id===item.id)reset();
      setNotice("Rascunho excluído.");await reload();
    }catch(e){setNotice(e instanceof Error?e.message:"Falha na exclusão.");}finally{setSaving(false);}
  }
  async function save() {
    if (!titulo.trim() || saving || lendoCapa || gerando || publicando) return;
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
  const ocupado=saving||gerando||publicando||lendoCapa;
  const salvo=!!id&&!!atual&&!temAlteracoes();
  const podePublicar=salvo&&audio?.atual&&!!capa&&!!conteudo.trim()&&!!fontes.trim()&&!!endereco;
  const btn="rounded-lg border border-black/25 bg-white px-3 py-3 text-sm font-semibold whitespace-nowrap disabled:opacity-40";
  return (
    <section className="mt-10 border-t border-black/15 pt-8">
      {modo==="todos"&&<><h2 className="text-2xl font-bold">Redação e preparação</h2><p className="mt-3 text-sm leading-6 text-black/65">Escreva e salve seus textos. Os rascunhos ficam no banco de dados e não aparecem no site público.</p></>}
      {modo!=="publicados"&&<div className="sticky top-0 z-10 bg-[#eeeee9] py-3">
        <div className="flex flex-wrap gap-2">
        <button type="button" onClick={novo} disabled={ocupado} className={btn}>Novo</button>
        <button type="button" onClick={()=>setListaAberta(v=>!v)} disabled={ocupado} className={btn}>Abrir</button>
        <button type="button" onClick={save} disabled={!aberto||!titulo.trim()||ocupado} className={btn}>Salvar</button>
        <button type="button" onClick={()=>{if(atual)void excluir(atual)}} disabled={!aberto||!atual||ocupado} className={btn}>Excluir</button>
        <button type="button" onClick={gerarAudio} disabled={!salvo||!conteudo.trim()||ocupado} className={btn}>{gerando?"Gerando…":"Gerar áudio"}</button>
        <button type="button" onClick={()=>setOuvindo(v=>!v)} disabled={!salvo||!audio?.atual||ocupado} className={btn}>Ouvir</button>
        <button type="button" onClick={()=>window.open("/admin/artigos/previa/"+id,"_blank","noopener,noreferrer")} disabled={!salvo||ocupado} className={btn}>Visualizar</button>
        <button type="button" onClick={()=>{if(atual)void changePublication(atual)}} disabled={!podePublicar||ocupado} className={btn+" !bg-[#0E1A29] !text-white"}>{publicando?"Publicando…":"Publicar"}</button>
        </div>
        {aberto&&<p className="mt-2 text-xs text-black/65">{!salvo?"Salve o editorial para gerar o áudio ou visualizar.":audio?.atual?"Áudio atualizado.":audio?.existe?"Áudio desatualizado. Gere novamente.":"Áudio ainda não gerado."}</p>}
        {notice&&<p role="status" className="mt-2 text-sm font-semibold">{notice}</p>}
        {ouvindo&&salvo&&audio?.atual&&<audio autoPlay controls preload="none" className="mt-2 w-full" src={"/api/artigos/audio/"+id+"?v="+encodeURIComponent(audio.gerado_em||"")}/>}
      </div>}
      {modo!=="publicados"&&!aberto&&!listaAberta&&<p className="mt-6 rounded-lg border border-black/10 bg-white p-5">Clique em Novo para iniciar um editorial ou em Abrir para continuar um documento salvo.</p>}
      {notice&&modo==="publicados"&&<p role="status" className="mt-4 text-sm">{notice}</p>}
      {modo!=="publicados"&&aberto&&<div id="editor-rascunho" className="mt-6 rounded-xl border border-black/10 bg-white p-5">
        <h3 className="text-lg font-semibold">{id ? "Editorial aberto" : "Novo editorial"}</h3>
        <fieldset disabled={ocupado}>
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
        </fieldset>
      </div>}
      {(modo==="publicados"||listaAberta)&&<div className="mt-6 space-y-3">
        <h3 className="text-xl font-bold">{modo==="publicados"?"Acervo de editoriais":"Abrir editorial"}</h3>
        {loading?<p>Carregando…</p>:!grupo.length?<p>Nenhum editorial disponível.</p>:grupo.map(item=><div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4"><div><p className="font-semibold">{item.titulo}</p><p className="text-xs text-black/60">{item.resumo}</p></div>{modo==="publicados"?<Link className={btn} href={`/admin/editoriais/${item.id}/comentarios`}>Abrir</Link>:<button type="button" className={btn} disabled={ocupado} onClick={()=>edit(item)}>Abrir</button>}</div>)}
      </div>}
    </section>
  );
}
