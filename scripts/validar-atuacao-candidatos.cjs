"use strict";

// Validador somente de leitura: não altera dados nem consulta APIs externas.
const fs = require("node:fs");
const path = require("node:path");

// Aceita YYYY-MM-DD e ISO 8601 com HH:mm, HH:mm:ss, frações e fuso.
// Confere também datas reais (inclusive ano bissexto) e horas válidas.
function dataValida(valor) {
  if (typeof valor !== "string") return false;
  const partes = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(valor);
  if (!partes) return false;

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  if (ano < 1 || mes < 1 || mes > 12) return false;
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasDoMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dia < 1 || dia > diasDoMes[mes - 1]) return false;

  if (partes[4] !== undefined) {
    if (Number(partes[4]) > 23 || Number(partes[5]) > 59) return false;
    if (partes[6] !== undefined && Number(partes[6]) > 59) return false;
  }
  const fuso = partes[7];
  if (fuso && fuso !== "Z") {
    const horas = Number(fuso.slice(1, 3));
    const minutos = Number(fuso.slice(4, 6));
    if (horas > 23 || minutos > 59) return false;
  }
  return true;
}

function validarArquivo(dados, nomeArquivo) {
  const erros = [];
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return ["Estrutura JSON inválida"];
  }
  const idEsperado = path.basename(nomeArquivo, ".json");
  if (dados.candidaturaId !== idEsperado || !/^\d+$/.test(idEsperado)) {
    erros.push("Identificador da candidatura não corresponde ao nome do arquivo");
  }
  if (!dataValida(dados.atualizadoEm)) {
    erros.push("Data de atualização inválida");
  }

  for (const [campo, total, id] of [
    ["votacoes", "totalVotacoes", "votacaoId"],
    ["proposicoes", "totalProposicoes", "proposicaoId"],
  ]) {
    if (!Array.isArray(dados[campo])) {
      erros.push(campo + " não é uma lista");
      continue;
    }
    if (dados[total] !== dados[campo].length) {
      erros.push(total + " não corresponde ao número de registros");
    }
    for (const [indice, item] of dados[campo].entries()) {
      const local = campo + "[" + indice + "]";
      if (!item || typeof item !== "object" || typeof item[id] !== "string" || !item[id]) {
        erros.push(local + ": identificador ausente");
        continue;
      }
      if (!dataValida(item.data)) {
        erros.push(local + ": data inválida (" + String(item.data) + ")");
      }
      if (campo === "votacoes" && item.dataHora && !dataValida(item.dataHora)) {
        erros.push(local + ": dataHora inválida");
      }
      if (!item.fonte || typeof item.fonte.url !== "string" || !/^https:\/\//.test(item.fonte.url)) {
        erros.push(local + ": fonte institucional sem URL HTTPS");
      }
    }
  }
  return erros;
}

function validarPasta(pasta) {
  if (!fs.existsSync(pasta)) return { arquivos: 0, registros: 0, erros: ["Pasta não encontrada: " + pasta] };
  const arquivos = fs.readdirSync(pasta).filter((nome) => /^\d+\.json$/.test(nome));
  const erros = [];
  let registros = 0;
  if (arquivos.length === 0) erros.push("Pasta sem arquivos de candidaturas: " + pasta);
  for (const nome of arquivos) {
    try {
      const dados = JSON.parse(fs.readFileSync(path.join(pasta, nome), "utf8"));
      registros += (Array.isArray(dados.votacoes) ? dados.votacoes.length : 0) +
        (Array.isArray(dados.proposicoes) ? dados.proposicoes.length : 0);
      for (const erro of validarArquivo(dados, nome)) erros.push(nome + ": " + erro);
    } catch (e) {
      erros.push(nome + ": JSON inválido: " + e.message);
    }
  }
  return { arquivos: arquivos.length, registros, erros };
}

function main() {
  const arg = process.argv.slice(2);
  if (arg.some((a) => !["--federal", "--estadual"].includes(a))) {
    throw new Error("Use --federal, --estadual ou nenhum argumento para validar ambos.");
  }
  const pastas = arg.includes("--federal") ? ["atuacao-candidatos"]
    : arg.includes("--estadual") ? ["atuacao-estadual-candidatos"]
    : ["atuacao-candidatos", "atuacao-estadual-candidatos"];
  const raiz = path.join(__dirname, "..", "data", "eleicoes", "gerado");
  let totalErros = 0;
  for (const nome of pastas) {
    const resultado = validarPasta(path.join(raiz, nome));
    console.log(nome + ": " + resultado.arquivos + " fichas, " + resultado.registros + " registros; erros: " + resultado.erros.length);
    for (const erro of resultado.erros.slice(0, 30)) console.error("  - " + erro);
    if (resultado.erros.length > 30) console.error("  ... mais " + (resultado.erros.length - 30) + " erros");
    totalErros += resultado.erros.length;
  }
  if (totalErros) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(e.message); process.exitCode = 1; }
}

module.exports = { dataValida, validarArquivo, validarPasta };
