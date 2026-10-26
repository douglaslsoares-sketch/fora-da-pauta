const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const raw = fs.readFileSync(path.join(__dirname,"../lib/eleicoes/transparencia-ficha.ts"),"utf8");
const js = ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
vm.runInNewContext(js,{module:mod,exports:mod.exports,Date,Array,Error});
const {obterTransparenciaFicha} = mod.exports;

test("datas exibidas são dos arquivos e dos fatos, não do acesso à página",()=>{
 const atuacao={
  atualizadoEm:"2026-10-26T01:30:15",
  totalVotacoes:1,totalProposicoes:1,
  votacoes:[{data:"2026-10-14"}],
  proposicoes:[{data:"2026-09-18"}]
 };
 const dossie={atualizadoEm:"2026-10-20",eventos:[]};
 const result=obterTransparenciaFicha(atuacao,dossie);
 assert.equal(result.atuacao.geradoEm,"26/10/2026");
 assert.equal(result.atuacao.ultimoRegistroEm,"14/10/2026");
 assert.equal(result.dossie.revisadoEm,"20/10/2026");
 assert.equal(result.noticias.estado,"nao-integrado");
});

test("arquivos ausentes ou datas impossíveis não viram atualizações confirmadas",()=>{
 const nulo=obterTransparenciaFicha(null,null);
 assert.equal(nulo.atuacao.geradoEm,null);
 assert.equal(nulo.dossie.revisadoEm,null);
 const invalid=obterTransparenciaFicha({
  atualizadoEm:"2026-02-30",totalVotacoes:0,totalProposicoes:0,
  votacoes:[],proposicoes:[]
 },{atualizadoEm:"2026-13-05",eventos:[]});
 assert.equal(invalid.atuacao.estado,"data-invalida");
 assert.equal(invalid.dossie.estado,"data-invalida");
});
