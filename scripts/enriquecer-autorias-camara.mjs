#!/usr/bin/env node
// Enriquecimento documental de proposições com autoria informada pela Câmara.
// Não infere identidade, não publica no site e não envia notificações.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const entrada = resolve(process.argv[2] || "relatorios/coleta-camara-proposicoes.json");
const saida = resolve(process.argv[3] || "relatorios/coleta-camara-autorias.json");
const amostra = JSON.parse(await readFile(entrada, "utf8"));
if (!Array.isArray(amostra.itens)) throw Error("Entrada sem itens");
const limite = Math.min(100, Math.max(1, Number(process.env.FDP_LIMITE_AUTORIAS || 20)));
const fixture = process.env.FDP_AUTORIAS_FIXTURE;
const dadosTeste = fixture ? JSON.parse(await readFile(resolve(fixture), "utf8")) : null;
const registros = [];
for (const prop of amostra.itens.slice(0, limite)) {
  if (!Number.isSafeInteger(prop.id) || prop.id <= 0) throw Error("ID de proposição inválido");
  const url = `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${prop.id}/autores`;
  let autores = [], status = "falha", erro = null;
  try {
    let resposta;
    if (dadosTeste) {
      resposta = dadosTeste[String(prop.id)];
      if (!resposta) throw Error("Fixture sem proposição");
    } else {
      const http = await fetch(url, { headers: { accept: "application/json", "user-agent": "ForaDaPauta/1.0 (pesquisa documental)" }, signal: AbortSignal.timeout(20000) });
      if (!http.ok) throw Error(`HTTP ${http.status}`);
      resposta = await http.json();
    }
    if (!Array.isArray(resposta.dados)) throw Error("Resposta sem dados de autores");
    autores = resposta.dados.map(a => ({
      nome: a.nome ?? null, tipo: a.tipo ?? null, codTipo: a.codTipo ?? null,
      uri: a.uri ?? null, uriPartido: a.uriPartido ?? null,
      // Apenas vínculo explicitamente documentado pela fonte.
      idDeputadoCamara: typeof a.uri === "string" && /^https:\/\/dadosabertos\.camara\.leg\.br\/api\/v2\/deputados\/\d+$/.test(a.uri)
        ? Number(a.uri.split("/").at(-1)) : null,
    }));
    status = "sucesso";
  } catch (e) { erro = e instanceof Error ? e.message : String(e); }
  registros.push({ proposicaoId: prop.id, urlFonteProposicao: prop.urlFonte ?? null, urlFonteAutores: url, status, erro, autores });
}
const relatorio = {
  tipo: "autoria-documental-amostra-limitada", modo: fixture ? "fixture-local" : "consulta-api",
  consultadoEm: new Date().toISOString(), totalEntrada: amostra.itens.length, limite,
  processadas: registros.length, sucesso: registros.filter(r => r.status === "sucesso").length,
  falhas: registros.filter(r => r.status !== "sucesso").length,
  aviso: "Autoria da proposição não prova voto, apoio, posição política ou vínculo com pessoa cadastrada no Fora da Pauta.",
  registros,
};
await mkdir(dirname(saida), { recursive: true });
await writeFile(saida, JSON.stringify(relatorio, null, 2) + "\n");
console.log(JSON.stringify({ modo: relatorio.modo, processadas: relatorio.processadas, sucesso: relatorio.sucesso, falhas: relatorio.falhas }));
if (relatorio.falhas) process.exitCode = 1;
