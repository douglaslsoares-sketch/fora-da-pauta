const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function lerModulo(caminho, imports={}) {
  const codigo=ts.transpileModule(
    fs.readFileSync(path.join(__dirname,"..",caminho),"utf8"),
    {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}
  ).outputText;
  const mod={exports:{}};
  vm.runInNewContext(codigo,{
    module:mod,exports:mod.exports,URL,Date,Array,Set,Map,Error,
    require:(nome)=>{
      assert.ok(Object.hasOwn(imports,nome), "Importação inesperada: "+nome);
      return imports[nome];
    }
  },{timeout:2000});
  return mod.exports;
}
const preparar=lerModulo("lib/telegram/preparar-avisos-edicoes.ts").prepararAvisosEdicoes;
const exemplo=()=>({
  slug:"o-jogo-sendo-jogado",revisao:"v1",
  titulo:"O jogo sendo jogado",
  resumo:"Entenda como os acontecimentos foram apresentados.",
  endereco:"https://www.foradapauta.org/campanhas/o-jogo-sendo-jogado",
  publicadoEm:"2026-10-26T17:00:00-03:00",
  fontes:[{titulo:"Documento original",url:"https://www.camara.leg.br/noticias/111"}]
});

test("catálogo real permanece vazio até aprovação de edição",()=>{
  const fonte=fs.readFileSync(path.join(__dirname,"../data/edicoes/avisos-aprovados.ts"),"utf8");
  assert.match(fonte,/edicoesAprovadasParaAviso:[\s\S]*=\s*\[\s*\]/);
  assert.equal(preparar([],new Date("2026-10-26T23:00:00Z")).length,0);
});

test("exige data pública e fonte, sem avisar antes do horário",()=>{
  const antes=new Date("2026-10-26T19:59:00Z");
  assert.equal(preparar([exemplo()],antes).length,0);
  const depois=new Date("2026-10-26T21:00:00Z");
  const avisos=preparar([exemplo()],depois);
  assert.equal(avisos.length,1);
  assert.equal(avisos[0].id,"edicao:o-jogo-sendo-jogado:v1");
  assert.equal(avisos[0].publicadoEm,"2026-10-26T17:00:00-03:00");
  assert.match(avisos[0].texto,/https:\/\/www\.foradapauta\.org\/campanhas\/o-jogo-sendo-jogado/);
  assert.match(avisos[0].texto,/https:\/\/www\.camara\.leg\.br\/noticias\/111/);
});

test("rejeita edição sem fonte e endereço de site diferente",()=>{
  const a=exemplo();a.fontes=[];
  assert.throws(()=>preparar([a]),/informações inválidas/);
  const b=exemplo();b.endereco="https://evil.example/roubo";
  assert.throws(()=>preparar([b]),/Endereço da edição/);
});

test("rejeita revisão duplicada, data inválida e conteúdo não documentado",()=>{
  const a=exemplo();
  assert.throws(()=>preparar([a,a],new Date("2026-10-27T00:00:00Z")),/repetida/);
  const b=exemplo();b.publicadoEm="ontem";
  assert.throws(()=>preparar([b]),/informações inválidas/);
  const c=exemplo();c.fontes[0].url="http://www.camara.leg.br/noticias/111";
  assert.throws(()=>preparar([c]),/informações inválidas/);
});

test("serviço geral respeita inscrição anterior e não envia retrospectivamente",()=>{
  const codigo=fs.readFileSync(path.join(__dirname,"../lib/telegram/registrar-novidades.ts"),"utf8");
  assert.match(codigo,/tipo === "edicoes" && evento.id.startsWith\("edicao:"\)/);
  assert.match(codigo,/FROM public\.telegram_preferencias/);
  const trecho=codigo.split("FROM public.telegram_preferencias")[1];
  assert.match(trecho,/created_at <= \$\{evento\.publicadoEm\}::timestamptz/);
  assert.match(trecho,/updated_at <= \$\{evento\.publicadoEm\}::timestamptz/);
  assert.match(trecho,/cancelled_at IS NULL/);
  const cron=fs.readFileSync(path.join(__dirname,"../app/api/telegram/processar-fila/route.ts"),"utf8");
  assert.match(cron,/prepararAvisosEdicoes\(edicoesAprovadasParaAviso\)/);
  assert.match(cron,/referencia: ""/);
  assert.match(cron,/registrarNovidadesNaFila/);
});
