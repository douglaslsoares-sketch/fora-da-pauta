import { readFileSync } from "node:fs";
const dir = "data/eleicoes/gerado/";
const candidates = JSON.parse(readFileSync(dir + "candidaturas-2026.json", "utf8"));
const identities = JSON.parse(readFileSync(dir + "identidades-politicas.json", "utf8"));
if (!Array.isArray(candidates) || !Array.isArray(identities)) throw Error("Formato inválido");
const byId = new Map();
for (const c of candidates) {
  const id = String(c.id);
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(c);
}
const fields = ["numero","partido","siglaPartido","situacaoTse","fonteOficial","ultimaVerificacao"];
const results = Object.fromEntries(fields.map(k => [k, { preenchidos: 0, ausentes: 0 }]));
let linked2026 = 0, withoutRecord = 0, multipleRecords = 0;
for (const i of identities) for (const c of i.candidaturas ?? []) {
  if (Number(c.eleicao) !== 2026) continue;
  linked2026++;
  const matches = byId.get(String(c.candidaturaId)) ?? [];
  if (!matches.length) withoutRecord++;
  if (matches.length > 1) multipleRecords++;
  const record = matches.length === 1 ? matches[0] : null;
  for (const field of fields) {
    if (record && record[field] !== null && record[field] !== undefined && String(record[field]).trim() !== "") results[field].preenchidos++;
    else results[field].ausentes++;
  }
}
console.log(JSON.stringify({ tipo: "verificacao-estrutural-candidaturas-2026", candidaturasNaBase: candidates.length, candidaturas2026Vinculadas: linked2026, semRegistroCorrespondente: withoutRecord, registrosDuplicados: multipleRecords, campos: results, aviso: "Preenchimento não equivale a veracidade nem validação da fonte." }));
if (withoutRecord || multipleRecords) process.exitCode = 1;
