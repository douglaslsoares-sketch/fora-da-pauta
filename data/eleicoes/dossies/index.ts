import type { DossieCandidato } from "./modelo";
import { dossieFlavioBolsonaro } from "./280002551544";

const dossiesPorCandidaturaId:
  Record<string, DossieCandidato> = {
    [dossieFlavioBolsonaro.candidaturaId]:
      dossieFlavioBolsonaro,
  };

export function buscarDossiePorCandidaturaId(
  candidaturaId: string,
): DossieCandidato | null {
  return dossiesPorCandidaturaId[candidaturaId] ?? null;
}