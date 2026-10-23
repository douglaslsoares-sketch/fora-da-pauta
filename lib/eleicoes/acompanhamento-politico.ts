import "server-only";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { eleitos2026 } from "@/data/eleicoes/eleitos";
import type { Candidatura } from "@/data/eleicoes/tipos";

// A seleção acompanha pessoas que participaram das eleições, não só vencedores.
// A candidatura é o identificador público da fonte; a identidade política
// consolidada, quando confirmada, permanece vinculada no banco do Telegram.
export const candidaturasPorId = new Map(candidaturas.map(p => [p.id, p]));
export const idsAcompanhaveis = new Set(candidaturas.map(p => p.id));
export const idsEleitosEm2026 = new Set(eleitos2026.map(p => p.id));

export function situacaoEleitoral2026(pessoa: Candidatura): string {
  if (idsEleitosEm2026.has(pessoa.id)) return "Eleita em 2026";

  const resultado = pessoa.resultadoEleitoral?.situacaoTse ?? "";
  const texto = resultado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  if (/2\s*[º°O]?\s*TURNO|SEGUNDO TURNO/.test(texto)) return "Em disputa no 2º turno";
  if (/NAO ELEIT|NAO ELEITO|NAO ELEITA/.test(texto)) return "Não eleita em 2026";
  if (/SUPLENTE/.test(texto)) return "Suplente em 2026";

  // Não inferir derrota ou disputa a partir de ausência de resultado no arquivo.
  return "Resultado de 2026 ainda não confirmado";
}
