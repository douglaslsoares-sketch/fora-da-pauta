// Exercita módulos reais de fila/editoria com SQL e Telegram simulados.
const assert = require("node:assert/strict");
const {test} = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const publicado = "2026-10-26T20:00:00Z";
const anterior = "2026-10-25T12:00:00Z";
const posterior = "2026-10-26T22:00:00Z";

function carregar(arquivo, deps, fetchFake) {
 const codigo=ts.transpileModule(
  fs.readFileSync(path.join(__dirname,"..",arquivo),"utf8"),
  {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}
 ).outputText;
 const mod={exports:{}};
 vm.runInNewContext(codigo,{
  module:mod,exports:mod.exports,Array,Set,Map,Date,URL,Buffer,AbortSignal,Error,
  process:{env:{TELEGRAM_BOT_TOKEN:"token-falso"}},
  require:nome=>{assert.ok(Object.hasOwn(deps,nome),nome);return deps[nome];},
  fetch:fetchFake,console:{warn(){},error(){}}
 },{timeout:2000});
 return mod.exports;
}

function cenario() {
 const inscritos=[
  {chat:"101",status:"ativo",criado:anterior,atualizado:anterior},
  {chat:"102",status:"ativo",criado:posterior,atualizado:posterior},
  {chat:"103",status:"cancelado",criado:anterior,atualizado:anterior},
  {chat:"104",status:"ativo",criado:anterior,atualizado:posterior}
 ];
 const fontes=new Set(),conhecidos=new Map(),fila=[],enviados=[];
 const idChave=(tipo,referencia)=>tipo+":"+referencia;
 let seq=0;
 const autorizado=aviso=>inscritos.some(p=>p.chat===aviso.chat&&p.status==="ativo");
 const sql=async (strings,...params)=>{
  const q=strings.join("?").replace(/\s+/g," ").trim();
  if(q.startsWith("SELECT pg_advisory_xact_lock"))return[];
  if(q.startsWith("INSERT INTO public.telegram_fontes_notificacao")){
   const k=idChave(params[0],params[1]);if(fontes.has(k))return[];
   fontes.add(k);conhecidos.set(k,new Set());return[{tipo:params[0]}];
  }
  if(q.startsWith("SELECT evento_id FROM public.telegram_eventos_conhecidos"))
   return[...(conhecidos.get(idChave(params[0],params[1]))||[])].map(evento_id=>({evento_id}));
  if(q.startsWith("INSERT INTO public.telegram_eventos_conhecidos")){
   conhecidos.get(idChave(params[0],params[1])).add(params[2]);return[];
  }
  if(q.startsWith("INSERT INTO public.telegram_fila_avisos")&&q.includes("FROM public.telegram_preferencias")){
   assert.ok(q.includes("created_at <= ?::timestamptz"));
   assert.ok(q.includes("updated_at <= ?::timestamptz"));
   const [tipo,referencia,id,texto,dataCriacao,dataAlteracao]=params;
   assert.equal(tipo,"edicoes");assert.equal(referencia,"");
   assert.equal(dataCriacao,dataAlteracao);
   const criados=[];
   for(const p of inscritos){
    if(p.status!=="ativo"||Date.parse(p.criado)>Date.parse(dataCriacao)||Date.parse(p.atualizado)>Date.parse(dataAlteracao))continue;
    if(fila.some(f=>f.chat===p.chat&&f.idEvento===id))continue;
    const aviso={id:String(++seq),chat:p.chat,tipo,referencia,idEvento:id,texto,status:"pendente",tentativas:0};
    fila.push(aviso);criados.push({id:aviso.id});
   }
   return criados;
  }
  if(q.startsWith("UPDATE public.telegram_fontes_notificacao"))return[];
  if(q.includes("PROCESSAMENTO_INTERROMPIDO"))return[];
  if(q.startsWith("UPDATE public.telegram_fila_avisos AS f")&&q.includes("ASSINATURA_INATIVA"))
   return fila.filter(f=>f.status==="pendente"&&!autorizado(f)).map(f=>{f.status="cancelado";return{id:f.id}});
  if(q.startsWith("WITH escolhido AS")){
   const f=fila.find(f=>f.status==="pendente"&&autorizado(f));
   if(!f)return[];
   f.status="processando";f.tentativas++;
   return[{id:f.id,chat_id:f.chat,texto:f.texto}];
  }
  if(q.startsWith("UPDATE public.telegram_fila_avisos")&&q.includes("status = 'enviado'")){
   const f=fila.find(f=>f.id===String(params[1]));assert.ok(f);
   f.status="enviado";return[];
  }
  throw Error("SQL inesperado: "+q.slice(0,200));
 };
 sql.begin=fn=>fn(sql);
 const novidades=carregar("lib/telegram/novidades.ts",{});
 const registrar=carregar("lib/telegram/registrar-novidades.ts",{
  "server-only":{},"../interesses/db":{sql},"./novidades":novidades
 }).registrarNovidadesNaFila;
 const processar=carregar("lib/telegram/processar-fila.ts",{
  "server-only":{},"../interesses/db":{sql}
 },async(uri,options)=>{
  assert.match(uri,/api.telegram.org/);
  const body=JSON.parse(options.body);enviados.push(body);
  return{status:200,json:async()=>({ok:true,result:{message_id:enviados.length}})};
 }).processarFilaTelegram;
 const edicao={
  id:"edicao:o-jogo-sendo-jogado:v1",
  texto:"Nova edição documentada. https://www.foradapauta.org/campanhas/o-jogo-sendo-jogado",
  publicadoEm:publicado
 };
 return {inscritos,fila,enviados,edicao,
  registrar: eventos=>registrar({tipo:"edicoes",referencia:"",eventos}),
  processar};
}

test("primeira edição aprovada avisa só assinante anterior, sem acompanhamento de candidato",async()=>{
 const c=cenario();
 // Catálogo vazio prepara o estado para a primeira publicação.
 const inicial=await c.registrar([]);
 assert.equal(inicial.inicializacao,true);
 assert.equal(inicial.avisosInseridos,0);
 const primeira=await c.registrar([c.edicao]);
 assert.equal(primeira.eventosNovos,1);
 assert.equal(primeira.avisosInseridos,1);
 assert.deepEqual(c.fila.map(x=>x.chat),["101"]);
 assert.equal((await c.processar()).enviados,1);
 assert.deepEqual(c.enviados.map(x=>x.chat_id),["101"]);
});

test("mesma publicação só avisa uma vez; cancelamento impede envio",async()=>{
 const c=cenario();
 await c.registrar([]);
 await c.registrar([c.edicao]);
 assert.equal((await c.registrar([c.edicao])).avisosInseridos,0);
 c.inscritos.find(x=>x.chat==="101").status="cancelado";
 assert.equal((await c.processar()).enviados,0);
 assert.equal(c.fila[0].status,"cancelado");
});

test("edição aprovada na primeira execução também respeita o momento da assinatura",async()=>{
 const c=cenario();
 const primeira=await c.registrar([c.edicao]);
 assert.equal(primeira.inicializacao,true);
 assert.equal(primeira.avisosInseridos,1);
 assert.equal((await c.processar()).enviados,1);
 assert.equal((await c.registrar([c.edicao])).avisosInseridos,0);
});
