// Valida os artefatos que a ficha realmente le, sem publicar nem enviar avisos.
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, basename } from "node:path";

const raiz = process.cwd();
const pasta = join(raiz, "data", "eleicoes", "gerado", "atuacao-candidatos");
const arquivos = (await readdir(pasta)).filter(n => /^\\d{8,20}\\.json$/.test(n));
assert.ok(arquivos.length >= 100, `Quantidade de fichas insuficiente: ${arquivos.length}`);

let votacoes = 0;
let proposicoes = 0;
let arquivosComAtos = 0;
let atosSemVoto = 0;
let dataMaisRecente = "";
let fontesInvalidas = 0;
const idsComAtos = [];
const validarData = data => typeof data === "string" &&
  /^\\d{4}-\\d{2}-\\d{2}$/.test(data) &&
  !Number.isNaN(Date.parse(data + "T00:00:00Z"));
const validarFonte = fonte => {
  try {
    if (!fonte || typeof fonte.titulo !== "string" || !fonte.titulo.trim()) return false;
    const u = new URL(fonte.url);
    return u.protocol === "https:" && !u.username && !u.password &&
      (u.hostname.endsWith(".leg.br") || u.hostname.endsWith(".gov.br"));
  } catch {
    return false;
  }
};

for (const nome of arquivos) {
  const arquivo = join(pasta, nome);
  assert.ok((await stat(arquivo)).size > 40, `JSON vazio: ${nome}`);
  const dados = JSON.parse(await readFile(arquivo, "utf8"));
  assert.equal(dados.candidaturaId, basename(nome, ".json"), "Arquivo associado a candidatura incorreta");
  assert.match(dados.atualizadoEm, /^\\d{4}-\\d{2}-\\d{2}/);
  assert.ok(Array.isArray(dados.votacoes));
  assert.ok(Array.isArray(dados.proposicoes));
  assert.equal(dados.totalVotacoes, dados.votacoes.length);
  assert.equal(dados.totalProposicoes, dados.proposicoes.length);
  if (dados.votacoes.length + dados.proposicoes.length) {
    arquivosComAtos++;
    idsComAtos.push(dados.candidaturaId);
  }
  const ids = new Set();
  for (const v of dados.votacoes) {
    assert.equal(typeof v.votacaoId, "string");
    assert.ok(v.votacaoId.trim());
    assert.ok(!ids.has("v:" + v.votacaoId), `Votacao duplicada em ${nome}`);
    ids.add("v:" + v.votacaoId);
    assert.ok(validarData(v.data), `Data de votacao invalida em ${nome}`);
    if (!validarFonte(v.fonte)) fontesInvalidas++;
    if (!v.voto?.trim()) atosSemVoto++;
    votacoes++;
    if (v.data > dataMaisRecente) dataMaisRecente = v.data;
  }
  for (const p of dados.proposicoes) {
    assert.equal(typeof p.proposicaoId, "string");
    assert.ok(p.proposicaoId.trim());
    assert.ok(!ids.has("p:" + p.proposicaoId), `Proposicao duplicada em ${nome}`);
    ids.add("p:" + p.proposicaoId);
    assert.ok(validarData(p.data), `Data de proposicao invalida em ${nome}`);
    if (!validarFonte(p.fonte)) fontesInvalidas++;
    proposicoes++;
    if (p.data > dataMaisRecente) dataMaisRecente = p.data;
  }
}
assert.ok(arquivosComAtos >= 100, "Cobertura documental insuficiente.");
assert.ok(votacoes + proposicoes > 100, "Nenhum conjunto documental util foi gerado.");
assert.equal(fontesInvalidas, 0, "Há fontes sem HTTPS e domínio institucional.");
const metadata = JSON.parse(await readFile(join(pasta, "_metadata.json"), "utf8"));
assert.ok(metadata.verificadoEm, "Metadata sem data de verificacao");
console.log(JSON.stringify({
  validacao: "aprovada",
  candidaturasComArquivo: arquivos.length,
  candidaturasComAtos: arquivosComAtos,
  totalVotacoes: votacoes,
  totalProposicoes: proposicoes,
  votosSemPosicaoIndividual: atosSemVoto,
  registroMaisRecente: dataMaisRecente,
  fonteVerificadaEm: metadata.verificadoEm,
  exemplos: idsComAtos.slice(0, 3),
}, null, 2));
