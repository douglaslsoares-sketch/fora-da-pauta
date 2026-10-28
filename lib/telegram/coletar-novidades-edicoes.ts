import "server-only";

import { campaigns } from "@/data/campanhas";
import { avisosEdicoesAprovados } from "@/data/edicoes/avisos-aprovados";
import { prepararAvisosEdicoes } from "./preparar-avisos-edicoes";
import { registrarNovidadesNaFila } from "./registrar-novidades";

export async function coletarNovidadesEdicoes() {
  const eventos = prepararAvisosEdicoes(campaigns, avisosEdicoesAprovados);
  // Nunca toca o banco enquanto não houver edição explicitamente aprovada.
  if (eventos.length === 0) {
    return { eventosNovos: 0, avisosInseridos: 0, semAprovacaoEditorial: true };
  }
  return registrarNovidadesNaFila({
    tipo: "edicoes",
    referencia: "",
    eventos,
  });
}
