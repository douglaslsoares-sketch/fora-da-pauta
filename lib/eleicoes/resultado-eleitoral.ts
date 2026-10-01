import type { Candidatura } from "../../data/eleicoes/tipos";

export type ClassificacaoResultado =
  | "eleito"
  | "nao-eleito"
  | "aguardando";

export function classificarResultadoEleitoral(
  resultado: Candidatura["resultadoEleitoral"],
): ClassificacaoResultado {
  if (
    !resultado ||
    !Number.isInteger(resultado.turno) ||
    resultado.turno < 1 ||
    !resultado.codigoTse.trim() ||
    resultado.codigoTse.trim() === "-1" ||
    !resultado.geradoEmTse.trim()
  ) {
    return "aguardando";
  }

  const descricao = resultado.situacaoTse
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  switch (descricao) {
    case "ELEITO":
    case "ELEITO POR QP":
    case "ELEITO POR MEDIA":
      return "eleito";
    case "NAO ELEITO":
      return "nao-eleito";
    default:
      return "aguardando";
  }
}