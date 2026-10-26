const assert=require("node:assert/strict");
const {test}=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ts=require("typescript");
const arquivo=fs.readFileSync(path.join(__dirname,"../lib/telegram/novidades.ts"),"utf8");
const codigo=ts.transpileModule(arquivo,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
vm.runInNewContext(codigo,{module:mod,exports:mod.exports,Date,Array,Set,Map,Error},{timeout:2000});
const {atoOficialRecente}=mod.exports;
const hoje=new Date("2026-10-26T23:10:00Z");

test("ato com 14 dias entra; com 15 dias não vira notícia",()=>{
 assert.equal(atoOficialRecente("2026-10-26",hoje),true);
 assert.equal(atoOficialRecente("2026-10-12",hoje),true);
 assert.equal(atoOficialRecente("2026-10-11",hoje),false);
 assert.equal(atoOficialRecente("2024-05-01",hoje),false);
});

test("data ausente, impossível ou futura é bloqueada",()=>{
 for(const data of [undefined,"","2026-02-30","2026-13-01","2026-10-27","2026-10","ontem"]){
  assert.equal(atoOficialRecente(data,hoje),false,String(data));
 }
});

test("coleta preserva a data do ato; fila não anuncia histórico bruto",()=>{
 const preparacao=fs.readFileSync(path.join(__dirname,"../lib/telegram/preparar-avisos-atuacao.ts"),"utf8");
 assert.match(preparacao,/ocorridoEm: votacao\.data/);
 assert.match(preparacao,/ocorridoEm: proposicao\.data/);
 const registro=fs.readFileSync(path.join(__dirname,"../lib/telegram/registrar-novidades.ts"),"utf8");
 assert.match(registro,/evento\.id\.startsWith\("votacao:"\)/);
 assert.match(registro,/evento\.id\.startsWith\("proposicao:"\)/);
 assert.match(registro,/!atoOficialRecente\(evento\.ocorridoEm\)/);
 assert.match(registro,/porId\.get\(id\)!/);
});
