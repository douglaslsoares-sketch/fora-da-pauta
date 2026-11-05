import { readFileSync } from "node:fs";
const ids = ["153423","220573","204472","220623","220559","204534","220557","204372","220687","88256","220560"];
const links = JSON.parse(readFileSync("data/eleicoes/gerado/vinculos-camara-identidades.json","utf8"));
const identities = JSON.parse(readFileSync("data/eleicoes/gerado/identidades-politicas.json","utf8"));
const known = new Set(identities.map(x => x.pessoaPoliticaId));
const duda = links.filter(x => String(x.deputadoIdCamara) === "220623").map(x => ({ deputadoIdCamara: x.deputadoIdCamara, pessoaPoliticaId: x.pessoaPoliticaId, nomeCivilCamara: x.nomeCivilCamara, identidadeExiste: known.has(x.pessoaPoliticaId) }));
const rows = ids.map(id => {
  const matches = links.filter(x => String(x.deputadoIdCamara) === id);
  return { id, matches: matches.length, linkedIdentityExists: matches.some(x => known.has(x.pessoaPoliticaId)) };
});
console.log(JSON.stringify({ identityCount: identities.length, linkCount: links.length, duda, rows }));
