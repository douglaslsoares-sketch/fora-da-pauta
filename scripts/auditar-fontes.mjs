#!/usr/bin/env node
// Auditoria do inventário: NÃO executa a coleta de notícias.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalogo = JSON.parse(await readFile(resolve(root, "data/fontes/inventario-varredura.json"), "utf8"));
if (!Array.isArray(catalogo.fontes) || !catalogo.fontes.length) throw Error("Inventário sem fontes");
const ids = new Set();
const agora = new Date().toISOString();
const fontes = catalogo.fontes.map((f) => {
  if (!f.id || !f.nome || !f.categoria || !f.situacao || ids.has(f.id)) throw Error("Fonte inválida ou duplicada");
  ids.add(f.id);
  const rotinaExiste = f.rotina ? existsSync(resolve(root, f.rotina)) : false;
  const temFonteEspecifica = typeof f.url === "string" && /^https:\/\//.test(f.url);
  return {
    id: f.id, nome: f.nome, categoria: f.categoria, situacaoDeclarada: f.situacao,
    url: f.url ?? null, rotina: f.rotina ?? null, rotinaExiste,
    consultaExecutadaNestaAuditoria: false,
    resultado: !temFonteEspecifica ? "fonte-individual-nao-cadastrada"
      : f.rotina && !rotinaExiste ? "rotina-nao-encontrada"
      : "execucao-da-coleta-nao-comprovada",
  };
});
const relatorio = {
  tipo: "auditoria-inventario-nao-e-varredura",
  geradoEm: agora,
  aviso: "Este relatório verifica apenas cadastro e arquivos de rotina. NÃO comprova consulta diária nem leitura de publicações.",
  totalEntradas: fontes.length,
  entradasSemUrlIndividual: fontes.filter(f => !f.url).length,
  entradasComRotinaExistente: fontes.filter(f => f.rotinaExiste).length,
  fontesConsultadasNestaAuditoria: 0,
  varreduraDiariaComprovada: false,
  fontes,
};
const destino = resolve(root, process.argv[2] || "relatorios/auditoria-fontes.json");
await mkdir(dirname(destino), { recursive: true });
await writeFile(destino, JSON.stringify(relatorio, null, 2) + "\n");
console.log(JSON.stringify({ geradoEm: agora, totalEntradas: fontes.length, fontesConsultadas: 0, varreduraDiariaComprovada: false, destino }));
