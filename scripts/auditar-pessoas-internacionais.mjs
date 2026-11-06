import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const data = JSON.parse(readFileSync("data/pessoas/pessoas-internacionais.json", "utf8"));
assert.ok(Array.isArray(data), "Cadastro internacional deve ser uma lista");
const ids = new Set();
const iso = /^\d{4}-\d{2}-\d{2}$/;
function fonte(f, local) {
  assert.ok(f && typeof f.titulo === "string" && f.titulo.trim(), local + ": título da fonte obrigatório");
  assert.ok(typeof f.url === "string" && /^https:\/\//.test(f.url), local + ": URL HTTPS obrigatória");
  assert.ok(iso.test(f.consultadoEm ?? "") && !Number.isNaN(Date.parse(f.consultadoEm)), local + ": data da consulta obrigatória");
}
for (const p of data) {
  assert.match(p.pessoaPoliticaId ?? "", /^politico-[a-z0-9-]{8,80}$/, "ID permanente inválido");
  assert.ok(!ids.has(p.pessoaPoliticaId), "Identidade duplicada: " + p.pessoaPoliticaId);
  ids.add(p.pessoaPoliticaId);
  assert.ok(p.nomePublico?.trim(), "Nome público obrigatório");
  assert.ok(["CONFIRMADA","EM_REVISAO"].includes(p.situacaoIdentidade), "Situação inválida");
  assert.ok(Array.isArray(p.paises) && p.paises.length && p.paises.every(c => /^[A-Z]{2}$/.test(c)), "País deve usar ISO de duas letras");
  assert.ok(Array.isArray(p.vinculos) && Array.isArray(p.acontecimentos), "Listas obrigatórias");
  fonte(p.fonteIdentidade, p.pessoaPoliticaId);
  for (const v of p.vinculos) {
    assert.ok(["cargo","partido","instituicao"].includes(v.tipo) && v.descricao?.trim() && /^[A-Z]{2}$/.test(v.pais), "Vínculo incompleto");
    fonte(v.fonte, "vínculo de " + p.nomePublico);
    if (v.inicio !== undefined) assert.ok(iso.test(v.inicio) && !Number.isNaN(Date.parse(v.inicio)), "Data de início inválida");
    if (v.fim !== undefined) assert.ok(iso.test(v.fim) && !Number.isNaN(Date.parse(v.fim)), "Data de fim inválida");
    if (v.inicio && v.fim) assert.ok(v.inicio <= v.fim, "Período invertido");
  }
  for (const e of p.acontecimentos) {
    assert.ok(iso.test(e.data ?? "") && e.titulo?.trim(), "Acontecimento incompleto");
    fonte(e.fonte, "acontecimento de " + p.nomePublico);
  }
}
console.log(JSON.stringify({ tipo:"auditoria-identidades-internacionais", cadastradas:data.length, confirmadas:data.filter(p=>p.situacaoIdentidade==="CONFIRMADA").length, emRevisao:data.filter(p=>p.situacaoIdentidade==="EM_REVISAO").length, aviso:"Estrutura e presença de fontes verificadas; a veracidade do conteúdo exige conferência documental." }));
