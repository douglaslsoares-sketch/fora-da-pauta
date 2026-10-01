import fs from "node:fs";
import path from "node:path";

function normalizar(nome) {
  return nome.replace(/^Deputad[oa]\s+/i, "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function main() {
  const entrada = process.argv[2];
  if (!entrada) throw new Error("Informe o arquivo da coleta.");

  const coleta = JSON.parse(fs.readFileSync(entrada, "utf8"));
  if (
    coleta.fonte !== "https://ple.cl.df.gov.br/pleservico/api/public" ||
    coleta.ano !== 2026 ||
    !Array.isArray(coleta.proposicoes) ||
    coleta.total !== coleta.proposicoes.length ||
    new Set(coleta.proposicoes.map(p => p.id)).size !== coleta.total
  ) throw new Error("Arquivo de coleta inválido.");

  const candidatos = JSON.parse(fs.readFileSync(
    "data/eleicoes/gerado/candidaturas-2026.json", "utf8"
  )).filter(c => c.uf === "DF" && c.eleicao === 2026);

  const porCandidato = new Map();
  const pendentes = new Set();

  for (const item of coleta.proposicoes) {
    if (
      !Number.isInteger(item.id) ||
      typeof item.autoria !== "string" ||
      typeof item.siglaNumeroAno !== "string" ||
      typeof item.ementa !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(item.dataLeitura)
    ) throw new Error(`Proposição inválida: ${item.id}`);

    const autores = [...new Set(
      item.autoria.split(",").map(a => a.trim()).filter(Boolean)
    )];

    for (const autor of autores) {
      if (!/^Deputad[oa]\s+/i.test(autor)) continue;

      const nome = normalizar(autor);
      const correspondencias = candidatos.filter(c =>
        normalizar(c.nomeUrna) === nome ||
        normalizar(c.nomeCompleto) === nome
      );

      if (correspondencias.length !== 1) {
        pendentes.add(autor);
        continue;
      }

      const candidato = correspondencias[0];
      if (!/^\d+$/.test(candidato.id)) {
        throw new Error("Identificador de candidatura inválido.");
      }

      if (!porCandidato.has(candidato.id)) {
        porCandidato.set(candidato.id, {
          candidato,
          proposicoes: new Map(),
        });
      }

      porCandidato.get(candidato.id).proposicoes.set(item.id, {
        proposicaoId: `cldf:${item.id}`,
        identificacao: item.siglaNumeroAno,
        data: item.dataLeitura,
        descricaoTipo: item.tipoProposicao,
        ementa: item.ementa,
        papel: "Autoria indicada na busca oficial da CLDF",
        fonte: {
          titulo: "CLDF — Processo Legislativo Eletrônico; consulte pela identificação",
          url: "https://ple.cl.df.gov.br/#/proposicao/buscar",
        },
      });
    }
  }

  if (porCandidato.size === 0) {
    throw new Error("Nenhuma candidatura vinculada; nada foi gravado.");
  }

  const pasta = "data/eleicoes/gerado/atuacao-estadual-candidatos";
  const preparados = [];

  for (const [id, registro] of porCandidato) {
    const destino = path.join(pasta, `${id}.json`);
    const anterior = fs.existsSync(destino)
      ? JSON.parse(fs.readFileSync(destino, "utf8")) : null;

    if (anterior && anterior.candidaturaId !== id) {
      throw new Error("Arquivo anterior com candidatura divergente.");
    }

    const novas = [...registro.proposicoes.values()];
    const outras = (anterior?.proposicoes || [])
      .filter(p => !p.proposicaoId.startsWith("cldf:"));

    const proposicoes = [...outras, ...novas].sort((a, b) =>
      b.data.localeCompare(a.data) ||
      a.proposicaoId.localeCompare(b.proposicaoId)
    );
    const votacoes = anterior?.votacoes || [];

    const dados = {
      candidaturaId: id,
      atualizadoEm: coleta.verificadoEm,
      totalVotacoes: votacoes.length,
      totalProposicoes: proposicoes.length,
      votacoes,
      proposicoes,
    };

    if (
      anterior &&
      JSON.stringify(anterior.votacoes) === JSON.stringify(votacoes) &&
      JSON.stringify(anterior.proposicoes) === JSON.stringify(proposicoes)
    ) dados.atualizadoEm = anterior.atualizadoEm;

    preparados.push({ destino, dados, registro, quantidade: novas.length });
  }

  for (const item of preparados) {
    const temporario = `${item.destino}.tmp`;
    fs.writeFileSync(temporario, JSON.stringify(item.dados), "utf8");
    fs.renameSync(temporario, item.destino);
    console.log(JSON.stringify({
      candidaturaId: item.dados.candidaturaId,
      nome: item.registro.candidato.nomeUrna,
      proposicoesClDF: item.quantidade,
    }));
  }

  console.log("Vínculos pendentes:", JSON.stringify([...pendentes]));
  console.log("Arquivos gerados:", preparados.length);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}