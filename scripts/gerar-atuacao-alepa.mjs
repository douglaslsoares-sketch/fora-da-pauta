import fs from "node:fs";
import path from "node:path";

function normalizar(valor) {
  return valor.replace(/^(?:DEP\.|DEPUTAD[OA])\s*/i, "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function slug(valor) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main() {
  const entrada = process.argv[2];
  if (!entrada) throw new Error("Informe o arquivo completo da coleta.");

  const coleta = JSON.parse(fs.readFileSync(entrada, "utf8"));
  if (
    coleta.fonte !== "https://www.alepa.pa.gov.br/Legislativo/Proposicoes" ||
    coleta.ano !== 2026 ||
    !Array.isArray(coleta.proposicoes) ||
    !Number.isInteger(coleta.total) ||
    coleta.total < 1 ||
    coleta.total !== coleta.proposicoes.length ||
    !Number.isFinite(Date.parse(coleta.verificadoEm))
  ) throw new Error("Coleta invalida ou incompleta.");

  const candidatos = JSON.parse(fs.readFileSync(
    "data/eleicoes/gerado/candidaturas-2026.json", "utf8"
  )).filter(c => c.uf === "PA" && c.eleicao === 2026);

  const vistos = new Set();
  const grupos = new Map();
  const pendencias = [];

  for (const item of coleta.proposicoes) {
    for (const campo of [
      "proposicaoId", "idOficial", "tipoOficial", "identificacao",
      "data", "autorOficial", "ementa", "url"
    ]) {
      if (typeof item[campo] !== "string" || !item[campo].trim()) {
        throw new Error("Campo ausente: " + campo);
      }
    }

    const url = new URL(item.url);
    const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(item.data) &&
      Number.isFinite(Date.parse(item.data + "T00:00:00Z")) &&
      new Date(item.data + "T00:00:00Z").toISOString().slice(0, 10) === item.data;

    if (
      url.origin !== "https://www.alepa.pa.gov.br" ||
      url.pathname !== "/Legislativo/DetalhesProposicao" ||
      !/^\d+$/.test(item.idOficial) ||
      url.searchParams.get("IdProposicao") !== item.idOficial ||
      url.searchParams.get("tipo") !== item.tipoOficial ||
      ["situacao", "decisao", "veto"].some(p => !url.searchParams.has(p)) ||
      item.proposicaoId !== `alepa:${slug(item.tipoOficial)}:${item.idOficial}` ||
      !/\/2026\b/.test(item.identificacao) ||
      !dataValida ||
      item.dataAnoDivergente !== !item.data.startsWith("2026-") ||
      vistos.has(item.proposicaoId)
    ) throw new Error("Registro invalido: " + item.proposicaoId);

    vistos.add(item.proposicaoId);

    if (item.dataAnoDivergente) {
      pendencias.push({ motivo: "Ano da data divergente", registro: item });
      continue;
    }

    if (!/^(?:DEP\.|DEPUTAD[OA])\s+/i.test(item.autorOficial)) {
      pendencias.push({ motivo: "Autoria institucional ou nao reconhecida", registro: item });
      continue;
    }

    const nome = normalizar(item.autorOficial);
    const correspondencias = candidatos.filter(c =>
      normalizar(c.nomeUrna) === nome ||
      normalizar(c.nomeCompleto) === nome
    );

    if (correspondencias.length !== 1) {
      pendencias.push({ motivo: "Autoria sem correspondencia unica", registro: item });
      continue;
    }

    const candidato = correspondencias[0];
    if (!/^\d+$/.test(candidato.id)) throw new Error("Candidatura invalida.");

    if (!grupos.has(candidato.id)) {
      grupos.set(candidato.id, { candidato, proposicoes: [] });
    }

    grupos.get(candidato.id).proposicoes.push({
      proposicaoId: item.proposicaoId,
      identificacao: item.identificacao,
      data: item.data,
      descricaoTipo: item.tipoOficial,
      ementa: item.ementa,
      papel: "Autoria indicada na lista oficial da ALEPA",
      fonte: {
        titulo: "ALEPA \u2014 proposi\u00e7\u00e3o legislativa",
        url: item.url,
      },
    });
  }

  if (!grupos.size) throw new Error("Nenhuma candidatura vinculada.");

  const preparados = [];
  let vinculados = 0;

  for (const [id, grupo] of grupos) {
    const arquivo = path.join(
      "data/eleicoes/gerado/atuacao-estadual-candidatos", `${id}.json`
    );
    const anterior = fs.existsSync(arquivo)
      ? JSON.parse(fs.readFileSync(arquivo, "utf8")) : null;

    if (anterior && (
      anterior.candidaturaId !== id ||
      !Array.isArray(anterior.votacoes) ||
      !Array.isArray(anterior.proposicoes) ||
      anterior.totalVotacoes !== anterior.votacoes.length ||
      anterior.totalProposicoes !== anterior.proposicoes.length
    )) throw new Error("Ficha anterior invalida: " + id);

    const porId = new Map();
    for (const p of anterior?.proposicoes || []) {
      if (!p.proposicaoId || porId.has(p.proposicaoId)) {
        throw new Error("Identificador anterior invalido ou repetido: " + id);
      }
      porId.set(p.proposicaoId, p);
    }
    for (const p of grupo.proposicoes) porId.set(p.proposicaoId, p);

    const proposicoes = [...porId.values()].sort((a, b) =>
      b.data.localeCompare(a.data) ||
      a.proposicaoId.localeCompare(b.proposicaoId)
    );
    const votacoes = anterior?.votacoes || [];
    const semMudanca = anterior &&
      JSON.stringify(anterior.proposicoes) === JSON.stringify(proposicoes);

    preparados.push({
      id,
      dados: {
        candidaturaId: id,
        atualizadoEm: semMudanca ? anterior.atualizadoEm : coleta.verificadoEm,
        totalVotacoes: votacoes.length,
        totalProposicoes: proposicoes.length,
        votacoes,
        proposicoes,
      },
      quantidade: grupo.proposicoes.length,
    });
    vinculados += grupo.proposicoes.length;
  }

  if (vinculados + pendencias.length !== coleta.total) {
    throw new Error("Conferencia dos totais falhou.");
  }

  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const pasta = path.join(path.dirname(path.resolve(entrada)), `fichas-preparadas-${marca}`);
  fs.mkdirSync(pasta);

  for (const item of preparados) {
    fs.writeFileSync(
      path.join(pasta, `${item.id}.json`),
      JSON.stringify(item.dados), "utf8"
    );
  }
  fs.writeFileSync(
    path.join(pasta, "_pendencias.json"),
    JSON.stringify(pendencias, null, 2), "utf8"
  );

  console.log("Candidaturas preparadas:", preparados.length);
  console.log("Registros vinculados:", vinculados);
  console.log("Registros separados para conferencia:", pendencias.length);
  console.log("Pasta de revisao:", pasta);
  console.log("Fichas do projeto preservadas.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}