import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const roots = ["app", "components", "data", "lib"];
const matches = [];
const pattern = /candidaturaId|\/conheca-seu-candidato\/|\/historico\/|buscarIdentidadePoliticaPorCandidatura|buscarPessoaPoliticaConfirmadaPorCandidatura/g;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir,name);
    if (statSync(file).isDirectory()) { if (!["gerado","node_modules",".next"].includes(name)) walk(file); continue; }
    if (!/\.(tsx?|mjs|cjs)$/.test(name)) continue;
    const lines = readFileSync(file,"utf8").split("\n");
    const hits = [];
    for(let i=0;i<lines.length;i++) if(pattern.test(lines[i])) hits.push(i+1);
    if(hits.length) matches.push({arquivo:relative(".",file),linhas:hits.slice(0,30),ocorrencias:hits.length});
    pattern.lastIndex=0;
  }
}
roots.forEach(walk);
console.log(JSON.stringify({tipo:"inventario-dependencias-candidatura-nao-altera-site",arquivos:matches.length,dependencias:matches},null,2));
