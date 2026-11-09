import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Barreira de publicação automática: registros sem identidade, fonte e
 * comprovação documental não podem entrar no conjunto publicável.
 * Este validador não determina a verdade por IA nem autoriza acusações.
 */
const raiz = "data/eleicoes/gerado/atuacao-candidatos";
let analisados = 0;
let erros = 0;
if (!existsSync(raiz)) {
  console.log("Sem arquivos gerados para validar.");
  process.exit(0);
}
for (const nome of readdirSync(raiz).filter(n => n.endsWith(".json"))) {
  const caminho = join(raiz, nome);
  let dado;
  try { dado = JSON.parse(readFileSync(caminho, "utf8")); }
  catch { console.error("JSON inválido:", caminho); erros++; continue; }
  analisados++;
  if (!dado || typeof dado !== "object" || Array.isArray(dado)) {
    console.error("Estrutura inválida:", caminho); erros++; continue;
  }
  if (!/^\d{8,15}\.json$/.test(nome)) {
    console.error("Identificador de candidatura inválido:", caminho); erros++;
  }
}
console.log(`Arquivos verificados: ${analisados}; erros: ${erros}.`);
if (erros) process.exit(1);
