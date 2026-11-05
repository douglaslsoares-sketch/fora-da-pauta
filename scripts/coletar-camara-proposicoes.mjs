#!/usr/bin/env node
// Coleta pública experimental da API de proposições da Câmara.
// Não classifica relevância, não envia Telegram e não publica no site.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const endpoint = "https://dadosabertos.camara.leg.br/api/v2/proposicoes?ordem=DESC&ordenarPor=id&itens=100";
const inicio = new Date().toISOString();
const destino = resolve(process.argv[2] || "relatorios/coleta-camara-proposicoes.json");
const fixture = process.env.FDP_COLETA_FIXTURE;
const log = { fonte: "camara", endpoint, inicio, fim: null, status: "falha", modo: fixture ? "fixture-local-sem-consulta-externa" : "consulta-api", quantidade: 0, erro: null };
try {
  const response = await fetch(endpoint, { headers: { accept: "application/json", "user-agent": "ForaDaPauta/1.0 (coleta documental)" }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload.dados)) throw new Error("Formato inesperado: dados ausentes");
  const itens = payload.dados.map(p => ({
    id: p.id, siglaTipo: p.siglaTipo ?? null, numero: p.numero ?? null,
    ano: p.ano ?? null, ementa: p.ementa ?? null,
    dataApresentacao: p.dataApresentacao ?? null,
    urlFonte: p.uri ?? null,
  }));
  log.status = "sucesso";
  log.quantidade = itens.length;
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, JSON.stringify({ tipo: "amostra-de-coleta-nao-e-cobertura-integral", modo: log.modo, coletadoEm: new Date().toISOString(), fonte: "Câmara dos Deputados — Dados Abertos", endpoint, observacao: "Consulta limitada aos 100 registros retornados pelo endpoint; não comprova cobertura de todas as proposições ou de outras fontes.", itens }, null, 2) + "\n");
} catch (error) {
  log.erro = error instanceof Error ? error.message : "Erro desconhecido";
  process.exitCode = 1;
} finally {
  log.fim = new Date().toISOString();
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino.replace(/\.json$/, ".execucao.json"), JSON.stringify(log, null, 2) + "\n");
  console.log(JSON.stringify(log));
}
