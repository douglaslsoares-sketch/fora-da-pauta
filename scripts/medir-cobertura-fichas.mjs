import { readFileSync, existsSync, readdirSync } from "node:fs";
const root = "data/eleicoes/gerado/";
const identities = JSON.parse(readFileSync(root + "identidades-politicas.json", "utf8"));
const links = JSON.parse(readFileSync(root + "vinculos-camara-identidades.json", "utf8"));
const known = new Set(identities.map(x => x.pessoaPoliticaId));
const allCandidacies = identities.flatMap(x => x.candidaturas ?? []);
const counts = { totalIdentidades: identities.length, totalCandidaturasEmIdentidades: allCandidacies.length,
  identidadesEmRevisao: identities.filter(x => x.situacaoIdentidade !== "CONFIRMADA").length,
  identidadesConfirmadas: identities.filter(x => x.situacaoIdentidade === "CONFIRMADA").length,
  vinculosCamara: links.length, vinculosOrfaos: links.filter(x => !known.has(x.pessoaPoliticaId)).length };
for (const folder of ["atuacao-candidatos", "atuacao-estadual-candidatos"]) {
  const dir = root + folder;
  const names = existsSync(dir) ? readdirSync(dir).filter(x => /^\d+\.json$/.test(x)) : [];
  let semRegistros = 0, semFonte = 0, totalRegistros = 0, invalidos = 0;
  for (const name of names) {
    try {
      const data = JSON.parse(readFileSync(dir + "/" + name, "utf8"));
      const records = [...(Array.isArray(data.votacoes) ? data.votacoes : []), ...(Array.isArray(data.proposicoes) ? data.proposicoes : [])];
      if (!records.length) semRegistros++;
      totalRegistros += records.length;
      semFonte += records.filter(x => !x.fonte?.url).length;
    } catch { invalidos++; }
  }
  counts[folder] = { fichasComArquivo: names.length, fichasSemAtuacaoRegistrada: semRegistros, registros: totalRegistros, registrosSemUrlFonte: semFonte, arquivosInvalidos: invalidos };
}
console.log(JSON.stringify({ tipo: "diagnostico-estrutural-nao-verifica-veracidade", counts }));
if (counts.vinculosOrfaos || counts["atuacao-candidatos"].arquivosInvalidos || counts["atuacao-estadual-candidatos"].arquivosInvalidos) process.exitCode = 1;
