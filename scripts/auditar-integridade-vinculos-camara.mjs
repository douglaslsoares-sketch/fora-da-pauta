import { readFileSync } from "node:fs";
const base = "data/eleicoes/gerado/";
const identidades = JSON.parse(readFileSync(base + "identidades-politicas.json", "utf8"));
const vinculos = JSON.parse(readFileSync(base + "vinculos-camara-identidades.json", "utf8"));
if (!Array.isArray(identidades) || !Array.isArray(vinculos)) throw new Error("Formato de cadastro inválido");
const existentes = new Set(identidades.map(x => x.pessoaPoliticaId));
const inconsistentes = vinculos.filter(x => !existentes.has(x.pessoaPoliticaId));
const duplicados = [...Map.groupBy(vinculos, x => String(x.deputadoIdCamara)).entries()]
  .filter(([, itens]) => itens.length > 1)
  .map(([deputadoIdCamara, itens]) => ({ deputadoIdCamara, quantidade: itens.length }));
const duda = vinculos.find(x => String(x.deputadoIdCamara) === "220623");
const candidatos = identidades.filter(x => (x.candidaturas ?? []).some(c =>
  ["130001606697", "130002539728"].includes(String(c.candidaturaId))))
  .map(x => ({ pessoaPoliticaId: x.pessoaPoliticaId, situacao: x.situacaoIdentidade,
    candidaturas: x.candidaturas.map(c => ({ candidaturaId: c.candidaturaId, eleicao: c.eleicao })) }));
const resumo = { totalIdentidades: identidades.length, totalVinculos: vinculos.length,
  vinculosSemIdentidade: inconsistentes.length, idsCamaraDuplicados: duplicados.length,
  exemplosInconsistentes: inconsistentes.slice(0, 15).map(x => ({ deputadoIdCamara: x.deputadoIdCamara, pessoaPoliticaId: x.pessoaPoliticaId })),
  duplicados: duplicados.slice(0, 15), duda: { vinculoAtual: duda, candidatos } };
console.log(JSON.stringify(resumo));
if (inconsistentes.length || duplicados.length) {
  console.error("ATENÇÃO: inconsistências cadastrais encontradas. Não alterar identidades automaticamente.");
  process.exitCode = 1;
}
