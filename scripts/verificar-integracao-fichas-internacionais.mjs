import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const pessoas = JSON.parse(readFileSync("data/pessoas/pessoas-internacionais.json","utf8"));
const rota = readFileSync("app/pessoas/[id]/page.tsx","utf8");
const busca = readFileSync("app/api/pessoas/internacionais/route.ts","utf8");
const componente = readFileSync("components/CandidateSelector.tsx","utf8");
const resultados = readFileSync("components/ResultadosInternacionais.tsx","utf8");
assert.match(rota, /consultarPessoaInternacionalConfirmada/);
assert.match(rota, /FichaInternacional/);
assert.match(busca, /situacaoIdentidade === "CONFIRMADA"/);
assert.match(busca, /\/pessoas\//);
assert.match(componente, /ResultadosInternacionais/);
assert.match(componente, /apenasFicha \?/);
assert.match(resultados, /encodeURIComponent\(termo\)/);
for (const nome of ["Donald Trump","Benjamin Netanyahu"]) {
  const p = pessoas.find(x => x.nomePublico === nome);
  assert.ok(p && p.situacaoIdentidade === "CONFIRMADA", "Ficha inicial ausente: " + nome);
  assert.ok(p.vinculos.length > 0 && p.fonteIdentidade.url.startsWith("https://"));
}
console.log("Integração estática confirmada: endereço, busca de ficha, identidade confirmada e dois registros iniciais.");
console.log("Este teste não verifica navegação em navegador nem comprova veracidade documental.");
