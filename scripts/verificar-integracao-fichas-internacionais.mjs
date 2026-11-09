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

import { readdirSync } from "node:fs";
import { join } from "node:path";
const arquivos = [];
function percorrer(diretorio) {
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) percorrer(caminho);
    else if (/\.(tsx|jsx|ts|js)$/.test(entrada.name)) arquivos.push(caminho);
  }
}
["app", "components"].forEach(percorrer);
const internos = [];
const revisar = [];
for (const arquivo of arquivos) {
  const texto = readFileSync(arquivo, "utf8");
  for (const achado of texto.matchAll(/<(?:Link|a)\b[^>]*>/gs)) {
    const tag = achado[0];
    if (!/target\s*=\s*["']_blank["']/.test(tag)) continue;
    const literal = tag.match(/href\s*=\s*["']([^"']+)["']/)?.[1];
    const template = tag.match(/href\s*=\s*\{\s*`([^`]*)`\s*\}/)?.[1];
    const expression = tag.match(/href\s*=\s*\{\s*([^}]+)\s*\}/)?.[1];
    const destino = literal ?? template;
    const internoDinamico = Boolean(template?.startsWith("/") && !template.startsWith("//"));
    const internoProvavel = !destino && Boolean(expression && /(?:^|\W)(?:router|pathname|internalHref|fichaHref|urlInterna)(?:\W|$)/.test(expression));
    const linha = texto.slice(0, achado.index).split("\n").length;
    const item = { arquivo, linha, destino: destino ?? "dinâmico" };
    if ((destino?.startsWith("/") && !destino.startsWith("//")) || internoDinamico || internoProvavel) internos.push(item);
    else revisar.push(item);
  }
}
console.log("Auditoria de navegação: " + arquivos.length + " arquivos examinados.");
console.log("Links internos explícitos abrindo outra aba:", JSON.stringify(internos));
console.log("Links externos ou dinâmicos para revisão:", JSON.stringify(revisar));
assert.equal(internos.length, 0, "Existem links internos explícitos que abrem nova aba.");
