import { readFileSync } from "node:fs";
const root = "data/eleicoes/gerado/";
const identities = JSON.parse(readFileSync(root + "identidades-politicas.json", "utf8"));
const links = JSON.parse(readFileSync(root + "vinculos-camara-identidades.json", "utf8"));
const ids = new Set(identities.map(x => x.pessoaPoliticaId));
const candidates = identities.flatMap(x => (x.candidaturas ?? []).map(c => ({ ...c, pessoaPoliticaId: x.pessoaPoliticaId })));
const fields = ["candidaturaId","eleicao","nomeCompleto","nomeUrna","cargo","uf","numero","siglaPartido","situacaoTse"];
const coverage = Object.fromEntries(fields.map(k => [k, { preenchidos: candidates.filter(c => c[k] !== null && c[k] !== undefined && String(c[k]).trim() !== "").length, universo: candidates.length }]));
const seen = new Map();
for (const c of candidates) { const key = String(c.candidaturaId ?? ""); if (!key) continue; seen.set(key, (seen.get(key) ?? new Set()).add(c.pessoaPoliticaId)); }
const ambiguous = [...seen.entries()].filter(([,set]) => set.size > 1);
const orphan = links.filter(x => !ids.has(x.pessoaPoliticaId));
console.log(JSON.stringify({ tipo: "cobertura-campos-cadastro-nao-verifica-veracidade", identidades: identities.length, candidaturas: candidates.length, campos: coverage, candidaturaIdsComIdentidadesConflitantes: ambiguous.length, vinculosCamaraSemIdentidade: orphan.length, aviso: "Campos preenchidos não comprovam fontes, oito eixos, completude nem veracidade." }));
if (ambiguous.length || orphan.length) process.exitCode = 1;
