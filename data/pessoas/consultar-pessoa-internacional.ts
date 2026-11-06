import "server-only";
import registros from "./pessoas-internacionais.json";
import type { PessoaPoliticaInternacional } from "./modelo-pessoa-politica";

/** Nenhuma identidade é criada por nome semelhante ou por país. */
export function consultarPessoaInternacionalConfirmada(id: string): PessoaPoliticaInternacional | null {
  const pessoas = registros as PessoaPoliticaInternacional[];
  const correspondencias = pessoas.filter(p => p.pessoaPoliticaId === id && p.situacaoIdentidade === "CONFIRMADA");
  return correspondencias.length === 1 ? correspondencias[0] : null;
}
