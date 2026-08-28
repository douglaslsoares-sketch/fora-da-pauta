import dados2022 from "./gerado/bens-2022.json";
import dados2026 from "./gerado/bens-2026.json";

export type BemDeclarado = {
  tipoCodigo: string;
  tipo: string;
  descricao: string;
  valor: number;
};

export type PatrimonioDeclarado = {
  candidaturaId: string;
  ano: number;
  totalDeclarado: number;
  quantidadeDeBens: number;
  bens: BemDeclarado[];
  fonte: string;
};

export const patrimoniosDeclarados2022 =
  dados2022 as PatrimonioDeclarado[];

export const patrimoniosDeclarados2026 =
  dados2026 as PatrimonioDeclarado[];

export function buscarPatrimonio2022PorCandidaturaId(
  candidaturaId: string,
) {
  return (
    patrimoniosDeclarados2022.find(
      (item) =>
        item.candidaturaId === candidaturaId,
    ) ?? null
  );
}

export function buscarPatrimonio2026PorCandidaturaId(
  candidaturaId: string,
) {
  return (
    patrimoniosDeclarados2026.find(
      (item) =>
        item.candidaturaId === candidaturaId,
    ) ?? null
  );
}