import type { DossieCandidato } from "./modelo";
import { dossieFlavioBolsonaro } from "./280002551544";
import { dossieClarianaBarao } from "./280002552484";
import { dossieEdmilsonCosta } from "./280002551975";
import { dossieAugustoCury } from "./280002551547";
import { dossieHertzDias } from "./280002541457";

const dossiesPorCandidaturaId:
  Record<string, DossieCandidato> = {
    [dossieFlavioBolsonaro.candidaturaId]:
      dossieFlavioBolsonaro,
    [dossieClarianaBarao.candidaturaId]:
      dossieClarianaBarao,
    [dossieEdmilsonCosta.candidaturaId]:
      dossieEdmilsonCosta,
    [dossieAugustoCury.candidaturaId]:
      dossieAugustoCury,
    [dossieHertzDias.candidaturaId]:
      dossieHertzDias,
  };

export function buscarDossiePorCandidaturaId(
  candidaturaId: string,
): DossieCandidato | null {
  return dossiesPorCandidaturaId[candidaturaId] ?? null;
}