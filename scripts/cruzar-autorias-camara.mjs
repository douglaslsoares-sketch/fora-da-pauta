#!/usr/bin/env node
// Cruza somente IDs oficiais da Câmara; não usa semelhança de nomes.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";

export function cruzarAutoria(registros, vinculos) {
  const indice = new Map();
  for (const v of vinculos) {
    const id = String(v.deputadoIdCamara ?? "");
    if (!/^\d+$/.test(id) || !v.pessoaPoliticaId) continue;
    const anteriores = indice.get(id) ?? [];
    anteriores.push(v);
    indice.set(id, anteriores);
  }
  return registros.map(registro => ({
    proposicaoId: registro.proposicaoId,
    urlFonteAutores: registro.urlFonteAutores,
    statusConsulta: registro.status,
    autores: (registro.autores ?? []).map(a => {
      const candidatos = a.idDeputadoCamara == null ? [] : indice.get(String(a.idDeputadoCamara)) ?? [];
      return {
        nomeFonte: a.nome, tipoFonte: a.tipo, uriFonte: a.uri,
        deputadoIdCamara: a.idDeputadoCamara,
        situacaoVinculo: candidatos.length === 1 ? "vinculo-unico-por-id-oficial" :
          candidatos.length > 1 ? "ambiguidade-no-cadastro" : "sem-vinculo-documental",
        pessoaPoliticaId: candidatos.length === 1 ? candidatos[0].pessoaPoliticaId : null,
        fonteVinculo: candidatos.length === 1 ? candidatos[0].fonte : null,
      };
    }),
  }));
}

if (process.argv[1] && import.meta.url === new URL("file://" + resolve(process.argv[1])).href) {
  const entrada = resolve(process.argv[2] ?? "relatorios/coleta-camara-autorias.json");
  const vinculosPath = resolve(process.argv[3] ?? "data/eleicoes/gerado/vinculos-camara-identidades.json");
  const saida = resolve(process.argv[4] ?? "relatorios/cruzamento-autorias-camara.json");
  const dados = JSON.parse(await readFile(entrada, "utf8"));
  const vinculos = JSON.parse(await readFile(vinculosPath, "utf8"));
  if (!Array.isArray(dados.registros) || !Array.isArray(vinculos)) throw Error("Formato inválido");
  const identidades = JSON.parse(await readFile(resolve("data/eleicoes/gerado/identidades-politicas.json"), "utf8"));
  if (!Array.isArray(identidades)) throw Error("Cadastro de identidades inválido");
  const idsExistentes = new Set(identidades.map(x => x.pessoaPoliticaId).filter(Boolean));
  const registros = cruzarAutoria(dados.registros, vinculos);
  const autores = registros.flatMap(r => r.autores);
  const resumo = {
    consultadas: registros.length,
    autoresEncontrados: autores.length,
    vinculosUnicos: autores.filter(a => a.situacaoVinculo === "vinculo-unico-por-id-oficial").length,
    ambiguos: autores.filter(a => a.situacaoVinculo === "ambiguidade-no-cadastro").length,
    semVinculo: autores.filter(a => a.situacaoVinculo === "sem-vinculo-documental").length,
    vinculosComIdentidadeExistente: autores.filter(a => a.pessoaPoliticaId && idsExistentes.has(a.pessoaPoliticaId)).length,
    vinculosComIdentidadeAusente: autores.filter(a => a.pessoaPoliticaId && !idsExistentes.has(a.pessoaPoliticaId)).length,
    semIdentificadorDeputado: autores.filter(a => a.deputadoIdCamara == null).length,
    comIdentificadorSemCadastro: autores.filter(a => a.deputadoIdCamara != null && a.situacaoVinculo === "sem-vinculo-documental").length,
    deputadosSemCadastro: [...new Map(autores.filter(a => a.deputadoIdCamara != null && a.situacaoVinculo === "sem-vinculo-documental").map(a => [String(a.deputadoIdCamara), { deputadoIdCamara: a.deputadoIdCamara, nomeInformadoPelaCamara: a.nomeFonte, fonteOficial: a.uriFonte }])).values()],
    tiposDeAutoria: Object.fromEntries([...new Set(autores.map(a => a.tipoFonte ?? "não informado"))].map(tipo => [tipo, autores.filter(a => (a.tipoFonte ?? "não informado") === tipo).length])),
  };
  await mkdir(dirname(saida), { recursive: true });
  await writeFile(saida, JSON.stringify({ tipo: "auditoria-sem-publicacao", geradoEm: new Date().toISOString(), resumo, registros }, null, 2) + "\n");
  console.log(JSON.stringify(resumo));
}
