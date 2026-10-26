const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = fs.readFileSync(path.join(__dirname, "../lib/telegram/preparar-avisos-atuacao.ts"),"utf8");
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleRef = {exports:{}};
vm.runInNewContext(compiled,{module:moduleRef,exports:moduleRef.exports,URL,Array,Error});
const {prepararAvisosAtuacao} = moduleRef.exports;

const base = {
  atualizadoEm: "2026-10-26T12:00:00Z", totalVotacoes:1, totalProposicoes:1,
  votacoes:[{
    votacaoId:"camara:123",
    data:"2026-10-20",voto:"Sim",
    descricao:"Votação de proposição em plenário.",
    fonte:{titulo:"Votação na Câmara",url:"https://www.camara.leg.br/evento/123"}
  }],
  proposicoes:[{
    proposicaoId:"camara:456", identificacao:"PL 10/2026",
    data:"2026-10-19",papel:"Autor",ementa:"Proposição sobre jornada de trabalho.",
    fonte:{titulo:"Ficha da proposição",url:"https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=456"}
  }]
};

test("inclui data, origem, voto e ressalva interpretativa",()=>{
 const avisos=prepararAvisosAtuacao(base,"100000000001");
 assert.equal(avisos.length,2);
 assert.equal(avisos[0].id,"votacao:camara:123");
 assert.match(avisos[0].texto,/Quando ocorreu: 2026-10-20/);
 assert.match(avisos[0].texto,/Voto registrado: Sim/);
 assert.match(avisos[0].texto,/https:\/\/www.camara.leg.br\/evento\/123/);
 assert.match(avisos[0].texto,/intenções/);
 assert.match(avisos[1].texto,/não significa, por si só/);
 assert.match(avisos[1].texto,/Ficha da proposição/);
 assert.match(avisos[1].texto,/www.camara.leg.br/);
 assert.ok(avisos.every(x=>Array.from(x.texto).length<4096));
});

test("não envia registro que perdeu sua fonte documentada",()=>{
 const adulterado=structuredClone(base);
 adulterado.votacoes[0].fonte.url="http://example.com";
 assert.throws(()=>prepararAvisosAtuacao(adulterado,"100000000001"),/Fonte institucional insegura/);
});

test("não produz avisos para candidatura inválida",()=>{
 assert.throws(()=>prepararAvisosAtuacao(base,"ABC"),/Identificador eleitoral/);
});

test("votação com voto individual vazio não atribui posição",()=>{
 const semVoto=structuredClone(base);
 semVoto.votacoes[0].voto="";
 const aviso=prepararAvisosAtuacao(semVoto,"100000000001")[0];
 assert.match(aviso.texto,/Voto individual não disponível/);
 assert.doesNotMatch(aviso.texto,/Voto registrado:\s*\./);
});

test("bloqueia domínio semelhante, mas não institucional",()=>{
 const falso=structuredClone(base);
 falso.votacoes[0].fonte.url="https://camara.leg.br.exemplo.org/noticia";
 assert.throws(()=>prepararAvisosAtuacao(falso,"100000000001"),/Fonte institucional insegura/);
});
test("bloqueia endereço de domínio institucional com porta alternativa",()=>{
 const falso=structuredClone(base);
 falso.votacoes[0].fonte.url="https://www.camara.leg.br:8443/noticia";
 assert.throws(()=>prepararAvisosAtuacao(falso,"100000000001"),/Fonte institucional insegura/);
});

test("registro parlamentar real do repositório produz aviso com a mesma fonte da ficha",()=>{
 const arquivo=path.join(__dirname,"../data/eleicoes/gerado/atuacao-candidatos/100002535230.json");
 const real=JSON.parse(fs.readFileSync(arquivo,"utf8"));
 assert.ok(real.votacoes.length>0 && real.proposicoes.length>0);
 const recorte={
  ...real,
  votacoes:real.votacoes.slice(0,1),
  proposicoes:real.proposicoes.slice(0,1)
 };
 const avisos=prepararAvisosAtuacao(recorte,real.candidaturaId);
 assert.equal(avisos.length,2);
 assert.ok(avisos[0].texto.includes(recorte.votacoes[0].fonte.url));
 assert.ok(avisos[1].texto.includes(recorte.proposicoes[0].fonte.url));
 assert.match(avisos[0].texto,/Quando ocorreu:/);
 assert.match(avisos[1].texto,/não significa, por si só/);
});
